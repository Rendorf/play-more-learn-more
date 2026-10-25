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

// ---------- Family test extras: stats, feedback, leaderboard, reminders, admins ----------
const admin = async uid => { await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'admins', uid), { ok: true })); return parent(uid); };
const defined = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
const event = extra => defined(Object.assign({ d: 'd123', p: 'p1', type: 'round', g: 3, sk: 'g3.add', mode: 'practice', n: 10, ok: 7, secs: 120, m: 1, v: '2026-10-25 10:00 UTC', day: '2026-10-25', dev: 'ios', t: 1, src: 'ff1' }, extra));
const board = (pid, owner, extra) => Object.assign({ pid, owner, nick: 'Swift Fox 27', av: '🦊', hat: '', g: 3, pts: 1200, min: 14, mst: 2, str: 3, frz: 1, day: '2026-10-25', q: 40, acc: 70, wk: '2026-W43', wpts: 300, wmin: 5, wq: 10, wmst: 1, v: 'x', t: 1 }, extra);
const sub = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', p256dh: 'BPk', auth: 'xyz' };
const pushDoc = (uid, extra) => Object.assign({ owner: uid, sub, tz: 'Asia/Baku', off: 240, hour: 17, kids: [{ av: '🦊', str: 2, last: '2026-10-25', wish: 10 }], t: 1 }, extra);

test('anonymous stats: signed-in devices add events, nobody but admins reads them', async () => {
  const kid = device('anon1');
  await assertSucceeds(setDoc(doc(kid, 'events/e1'), event()));
  await assertSucceeds(setDoc(doc(kid, 'events/e2'), event({ type: 'open', p: undefined, n: 2 })));
  await assertSucceeds(setDoc(doc(kid, 'events/e3'), event({ type: 'problem', msg: 'x'.repeat(500) })));
  await assertFails(setDoc(doc(nobody(), 'events/e4'), event()), 'not signed in');
  await assertFails(setDoc(doc(kid, 'events/e5'), event({ name: 'Sam' })), 'unknown field');
  await assertFails(setDoc(doc(kid, 'events/e6'), event({ type: 'hack' })), 'unknown type');
  await assertFails(setDoc(doc(kid, 'events/e7'), event({ msg: 'x'.repeat(501) })), 'message too long');
  await assertFails(setDoc(doc(kid, 'events/e8'), event({ g: 12 })), 'grade out of range');
  await assertFails(setDoc(doc(kid, 'events/e9'), event({ d: undefined })), 'device id missing');
  await assertFails(updateDoc(doc(kid, 'events/e1'), { n: 1 }), 'no changes afterwards');
  await assertFails(deleteDoc(doc(kid, 'events/e1')));
  await assertFails(getDoc(doc(kid, 'events/e1')));
  await assertFails(getDocs(collection(kid, 'events')));
  await assertFails(getDocs(collection(parent('dad'), 'events')), 'a parent who is not an admin');
  await assertSucceeds(getDocs(collection(await admin('owner'), 'events')));
});

test('feedback: create only, limited sizes, admins read', async () => {
  const kid = device('anon1');
  await assertSucceeds(setDoc(doc(kid, 'feedback/f1'), { d: 'd1', kind: 'question', reason: 'wrong', g: 3, sk: 'g3.add', lvl: 2, mode: 'practice', q: 'What is 2 + 2?', ans: '4', inp: '5', v: 'x', day: '2026-10-25', dev: 'android', t: 1 }));
  await assertSucceeds(setDoc(doc(kid, 'feedback/f2'), { d: 'd1', kind: 'general', text: 'They love the bosses!', name: 'A parent', t: 1 }));
  await assertFails(setDoc(doc(kid, 'feedback/f3'), { d: 'd1', kind: 'general', text: 'x'.repeat(1001) }), 'text too long');
  await assertFails(setDoc(doc(kid, 'feedback/f4'), { d: 'd1', kind: 'other', text: 'hi' }), 'unknown kind');
  await assertFails(setDoc(doc(kid, 'feedback/f5'), { d: 'd1', kind: 'general', text: 'hi', email: 'a@b.c' }), 'unknown field');
  await assertFails(setDoc(doc(nobody(), 'feedback/f6'), { d: 'd1', kind: 'general', text: 'hi' }));
  await assertFails(getDocs(collection(kid, 'feedback')));
  await assertSucceeds(getDocs(collection(await admin('owner'), 'feedback')));
});

test('leaderboard: each device writes only its own entries; everyone signed in reads', async () => {
  const a = device('devA'), b = device('devB');
  await assertSucceeds(setDoc(doc(a, 'leaderboard/p1_devA'), board('p1', 'devA')));
  await assertSucceeds(setDoc(doc(a, 'leaderboard/p1_devA'), board('p1', 'devA', { pts: 1500 })), 'update own');
  await assertSucceeds(setDoc(doc(a, 'leaderboard/p2_devA'), { pid: 'p2', owner: 'devA', hid: true, t: 2 }), 'a hidden player');
  await assertFails(setDoc(doc(b, 'leaderboard/p1_devA'), board('p1', 'devB')), 'another device\'s entry');
  await assertFails(setDoc(doc(b, 'leaderboard/p1_devA'), board('p1', 'devA')), 'pretending to be the owner');
  await assertFails(setDoc(doc(b, 'leaderboard/p9_devB'), board('p1', 'devB')), 'id must match the player');
  await assertFails(setDoc(doc(a, 'leaderboard/p3_devA'), board('p3', 'devA', { nick: 'x'.repeat(25) })), 'nickname too long');
  await assertFails(setDoc(doc(a, 'leaderboard/p3_devA'), board('p3', 'devA', { pts: -5 })), 'negative points');
  await assertFails(setDoc(doc(a, 'leaderboard/p3_devA'), board('p3', 'devA', { email: 'x' })), 'unknown field');
  await assertFails(setDoc(doc(nobody(), 'leaderboard/p4_x'), board('p4', 'x')));
  await assertSucceeds(getDocs(collection(b, 'leaderboard')));
  await assertFails(getDocs(collection(nobody(), 'leaderboard')));
  await assertFails(deleteDoc(doc(b, 'leaderboard/p1_devA')), 'another device cannot remove it');
  await assertSucceeds(deleteDoc(doc(await admin('owner'), 'leaderboard/p1_devA')), 'the owner can moderate');
  await assertSucceeds(deleteDoc(doc(a, 'leaderboard/p2_devA')));
});

test('reminders: a device manages only its own subscription', async () => {
  const a = device('devA'), b = device('devB');
  await assertSucceeds(setDoc(doc(a, 'push/devA'), pushDoc('devA')));
  await assertSucceeds(updateDoc(doc(a, 'push/devA'), { hour: 18 }));
  await assertSucceeds(getDoc(doc(a, 'push/devA')));
  await assertFails(getDoc(doc(b, 'push/devA')), 'another device');
  await assertFails(getDocs(collection(b, 'push')));
  await assertFails(setDoc(doc(b, 'push/devA'), pushDoc('devA')));
  await assertFails(setDoc(doc(b, 'push/devB'), pushDoc('devB', { hour: 25 })), 'hour out of range');
  await assertFails(setDoc(doc(b, 'push/devB'), pushDoc('devB', { sub: Object.assign({}, sub, { endpoint: 'http://evil.example/x' }) })), 'not https');
  await assertFails(setDoc(doc(b, 'push/devB'), pushDoc('devB', { name: 'Sam' })), 'unknown field');
  await assertSucceeds(getDocs(collection(await admin('owner'), 'push')));
  await assertSucceeds(deleteDoc(doc(a, 'push/devA')));
});

test('admins: written only in the console; an account sees only its own entry', async () => {
  await admin('owner');
  await assertSucceeds(getDoc(doc(parent('owner'), 'admins/owner')));
  await assertFails(getDoc(doc(parent('dad'), 'admins/owner')));
  await assertFails(setDoc(doc(parent('dad'), 'admins/dad'), { ok: true }), 'making yourself an admin');
  await assertFails(getDocs(collection(parent('owner'), 'admins')));
});

test('the extras cannot reach family data', async () => {
  const dad = parent('dad');
  await makeFamily(dad, 'dad');
  await setDoc(doc(dad, 'families/dad/players/p1'), { data: '{}', updatedAt: 1 });
  const owner = await admin('owner');
  await assertFails(getDoc(doc(owner, 'families/dad/players/p1')), 'an admin of the test data is not a family member');
  await assertFails(getDocs(collection(device('devA'), 'families/dad/players')));
});
