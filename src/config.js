// Firebase project used for family accounts (parent login and linked children's devices).
// These web settings are public by design; firestore.rules protects the data.
// Set to null to turn family accounts off.
const PMLM_FIREBASE = {
  apiKey: 'AIzaSyAPyBDEqkixMqNYeIut-ZtXCER4YG6reBQ',
  authDomain: 'playmorelearnmore.firebaseapp.com',
  projectId: 'playmorelearnmore',
  storageBucket: 'playmorelearnmore.firebasestorage.app',
  messagingSenderId: '891444609113',
  appId: '1:891444609113:web:642128505c6340720f3148',
  measurementId: 'G-51Y7VFGZGB',
};

// Which copy this is. `python3 build.py --preview` builds from config.preview.js instead, which says 'preview':
// that copy keeps its own storage on the device (keys start with pmlm-preview.) and uses the staging project.
const PMLM_ENV = 'live';
// Online extras for the family test (src/online.js). Set one to false to switch it off without a rollback.
const PMLM_FEATURES = { stats: true, feedback: true, leaderboard: true, reminders: true, invites: true, crowd: true };
// Public key for daily reminders (Web Push), written by tools/admin/setup-push.mjs. Empty: reminders stay hidden.
const PMLM_VAPID = 'BIzQyWxPqV1Cwj3PIbNEdwZyBNaF4RvJBa7qZxLoQMaMYcJlI2pNOy26ffZckF5GzjKDiG4D7YlIX9DB_-1A3A0';
// The game's own address. The old address (rendorf.github.io/play-more-learn-more) sends each device here with its
// progress (src/move.js), once this address serves move.json. Empty: no moving.
const PMLM_MOVE_TO = 'https://pmlm.uk/';
