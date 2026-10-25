// Checks ../../firestore.rules in the Firestore emulator: run `npm install` once, then `npm test`.
import { readFileSync } from 'node:fs';
import test, { after, beforeEach } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch, Timestamp } from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'demo-pmlm',
  firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const parent = (uid, email = uid + '@example.com') => env.authenticatedContext(uid, { email, firebase: { sign_in_provider: 'password' } }).firestore();
const device = uid => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const nobody = () => env.unauthenticatedContext().firestore();
const minutes = m => Timestamp.fromMillis(Date.now() + m * 60000);

async function makeFamily(db, uid) {
  const b = writeBatch(db);
  b.set(doc(db, 'families', uid), { createdBy: uid, shared: '{}', updatedAt: 1 }, { merge: true });
  b.set(doc(db, `families/${uid}/parents/${uid}`), { email: uid + '@example.com', joinedAt: 1 });
  b.set(doc(db, 'users', uid), { fid: uid, role: 'parent' });
  await b.commit();
}
const putCode = (code, data) => env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'codes', code), data));
async function linkDevice(uid, fid, code) {
  const db = device(uid), b = writeBatch(db);
  b.set(doc(db, `families/${fid}/devices/${uid}`), { name: 'Tablet', code, linkedAt: 1, lastSeen: 1 });
  b.set(doc(db, 'users', uid), { fid, role: 'device' });
  await b.commit();
  return db;
}

test('a parent can create their own family, nobody else can', async () => {
  await assertSucceeds(makeFamily(parent('dad'), 'dad'));
  await assertFails(setDoc(doc(parent('eve'), 'families', 'someone'), { createdBy: 'eve' }));
  await assertFails(setDoc(doc(device('kid1'), 'families', 'kid1'), { createdBy: 'kid1' }));
  await assertFails(setDoc(doc(nobody(), 'families', 'x'), {}));
});

test('families cannot see or change each other', async () => {
  const dad = parent('dad');
  await makeFamily(dad, 'dad');
  await assertSucceeds(setDoc(doc(dad, 'families/dad/players/p1'), { data: '{}', updatedAt: 1 }));
  const eve = parent('eve');
  await makeFamily(eve, 'eve');
  await assertFails(getDoc(doc(eve, 'families/dad')));
  await assertFails(getDoc(doc(eve, 'families/dad/players/p1')));
  await assertFails(getDocs(collection(eve, 'families/dad/players')));
  await assertFails(setDoc(doc(eve, 'families/dad/players/p2'), { data: '{}' }));
  await assertFails(getDoc(doc(eve, 'users/dad')));
  await assertFails(getDoc(doc(nobody(), 'families/dad/players/p1')));
});

test('only that family\'s parents make codes, with limited expiry', async () => {
  const dad = parent('dad');
  await makeFamily(dad, 'dad');
  await assertSucceeds(setDoc(doc(dad, 'codes/AAAA1111'), { fid: 'dad', role: 'device', expires: minutes(15), createdBy: 'dad' }));
  await assertFails(setDoc(doc(dad, 'codes/AAAA2222'), { fid: 'dad', role: 'admin', expires: minutes(15), createdBy: 'dad' }));
  await assertFails(setDoc(doc(dad, 'codes/AAAA3333'), { fid: 'dad', role: 'device', expires: minutes(60 * 24 * 5), createdBy: 'dad' }));
  await assertFails(setDoc(doc(dad, 'codes/AAAA1111'), { fid: 'dad', role: 'device', expires: minutes(15), createdBy: 'dad' }), 'overwriting a code');
  const eve = parent('eve');
  await makeFamily(eve, 'eve');
  await assertFails(setDoc(doc(eve, 'codes/BBBB1111'), { fid: 'dad', role: 'device', expires: minutes(15), createdBy: 'eve' }));
  await assertFails(deleteDoc(doc(eve, 'codes/AAAA1111')));
  await assertSucceeds(deleteDoc(doc(dad, 'codes/AAAA1111')));
});

test('codes can be read one at a time but never listed', async () => {
  await makeFamily(parent('dad'), 'dad');
  await putCode('CCCC1111', { fid: 'dad', role: 'device', expires: minutes(15) });
  await assertSucceeds(getDoc(doc(device('kid1'), 'codes/CCCC1111')));
  await assertFails(getDocs(collection(device('kid1'), 'codes')));
  await assertFails(getDoc(doc(nobody(), 'codes/CCCC1111')));
});

test('a device joins with a valid code and can then use the family\'s players', async () => {
  const dad = parent('dad');
  await makeFamily(dad, 'dad');
  await setDoc(doc(dad, 'families/dad/players/p1'), { data: '{}', updatedAt: 1 });
  await putCode('DDDD1111', { fid: 'dad', role: 'device', expires: minutes(15) });
  await assertFails(getDoc(doc(device('kid1'), 'families/dad/players/p1')), 'before linking');
  const kid = await linkDevice('kid1', 'dad', 'DDDD1111');
  await assertSucceeds(getDoc(doc(kid, 'families/dad')));
  await assertSucceeds(getDocs(collection(kid, 'families/dad/players')));
  await assertSucceeds(setDoc(doc(kid, 'families/dad/players/p2'), { data: '{}', updatedAt: 2 }));
  await assertSucceeds(updateDoc(doc(kid, 'families/dad/devices/kid1'), { lastSeen: 2 }));
  await assertFails(updateDoc(doc(kid, 'families/dad/devices/kid1'), { code: 'OTHER123' }));
  await assertFails(getDocs(collection(kid, 'families/dad/parents')), 'devices do not see parents');
  await assertFails(getDocs(collection(kid, 'families/dad/devices')), 'devices do not list devices');
  await assertSucceeds(getDocs(collection(dad, 'families/dad/devices')));
  await assertSucceeds(getDocs(collection(dad, 'families/dad/parents')));
  await assertFails(getDocs(collection(parent('eve'), 'families/dad/devices')));
});

test('wrong, expired and wrong-role codes are refused', async () => {
  await makeFamily(parent('dad'), 'dad');
  await putCode('EXPD1111', { fid: 'dad', role: 'device', expires: minutes(-1) });
  await putCode('PRNT1111', { fid: 'dad', role: 'parent', expires: minutes(60) });
  await putCode('EVEE1111', { fid: 'eve', role: 'device', expires: minutes(15) });
  await assertFails(linkDevice('kid1', 'dad', 'NOPE1111'), 'unknown code');
  await assertFails(linkDevice('kid2', 'dad', 'EXPD1111'), 'expired code');
  await assertFails(linkDevice('kid3', 'dad', 'PRNT1111'), 'parent code used by a device');
  await assertFails(linkDevice('kid4', 'dad', 'EVEE1111'), 'another family\'s code');
  await putCode('DDDD2222', { fid: 'dad', role: 'device', expires: minutes(15) });
  await assertFails(setDoc(doc(device('kid5'), 'families/dad/devices/someoneElse'), { name: 'x', code: 'DDDD2222' }), 'joining as another device');
});

test('a second parent joins only with a parent invite code', async () => {
  await makeFamily(parent('dad'), 'dad');
  await putCode('PRNT2222', { fid: 'dad', role: 'parent', expires: minutes(60) });
  await putCode('DEVC2222', { fid: 'dad', role: 'device', expires: minutes(15) });
  await assertFails(setDoc(doc(parent('mom'), 'families/dad/parents/mom'), { email: 'mom@example.com', code: 'DEVC2222' }));
  await assertFails(setDoc(doc(device('kid1'), 'families/dad/parents/kid1'), { code: 'PRNT2222' }), 'anonymous cannot be a parent');
  await assertFails(setDoc(doc(parent('mom'), 'families/dad/parents/mom'), { email: 'mom@example.com' }), 'no code');
  const mom = parent('mom');
  await assertSucceeds(setDoc(doc(mom, 'families/dad/parents/mom'), { email: 'mom@example.com', code: 'PRNT2222' }));
  await assertSucceeds(getDocs(collection(mom, 'families/dad/players')));
  await assertSucceeds(getDocs(collection(mom, 'families/dad/parents')));
});

test('an unlinked device loses access', async () => {
  const dad = parent('dad');
  await makeFamily(dad, 'dad');
  await setDoc(doc(dad, 'families/dad/players/p1'), { data: '{}', updatedAt: 1 });
  await putCode('DDDD3333', { fid: 'dad', role: 'device', expires: minutes(15) });
  const kid = await linkDevice('kid1', 'dad', 'DDDD3333');
  await assertSucceeds(getDoc(doc(kid, 'families/dad/players/p1')));
  await assertSucceeds(deleteDoc(doc(dad, 'families/dad/devices/kid1')));
  await assertFails(getDoc(doc(kid, 'families/dad/players/p1')));
  await assertFails(setDoc(doc(kid, 'families/dad/players/p1'), { data: '{}' }));
});
