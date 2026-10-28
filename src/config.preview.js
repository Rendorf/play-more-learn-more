// Settings for the preview copy (`python3 build.py --preview`, published to rendorf.github.io/pmlm-preview).
// It uses a separate staging Firebase project and its own storage keys on the device, so trying a new version
// on a real phone can never touch a child's real progress, the live leaderboard or live stats.
// Paste the staging project's web config here (Firebase console → Project settings → Your apps).
const PMLM_FIREBASE = null;
const PMLM_ENV = 'preview';
const PMLM_FEATURES = { stats: true, feedback: true, leaderboard: true, reminders: true, invites: true, crowd: true };
// Public key for reminders on the staging project (tools/admin/setup-push.mjs --preview writes it)
const PMLM_VAPID = '';
// The preview never moves anywhere
const PMLM_MOVE_TO = '';
// The preview sends nothing to Google Analytics
const PMLM_GA = '';
