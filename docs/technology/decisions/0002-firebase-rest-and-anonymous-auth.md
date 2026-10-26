# 0002. Firebase SDK for family accounts, REST with its own anonymous account for the extras

**Who this is for:** engineers working on `Sync` or `Online`, or adding a new online feature.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

**Status:** Accepted

## Context

- Families want one child's progress on several devices, and parents want to see it from their own login. There is no server of our own, so the database must enforce access by itself.
- Children must never need a password or an email address.
- The friends-and-family test needed anonymous stats, feedback, a leaderboard, reminder subscriptions and invites on every device, including devices with no family account.
- Those extras must never break or change the family login, and must never block play.

## Decision

- **Firebase** (Authentication and Cloud Firestore) is the only backend. Access is enforced by `firestore.rules`.
- **Family accounts (`Sync`)** use the Firebase compat SDK, loaded from gstatic only when a family account is used. Parents sign in with email/password or Google. A child's device signs in **anonymously** and joins a family with a short-lived code.
- **Extras (`Online`)** use the Auth and Firestore **REST** APIs with `fetch`, with a **separate anonymous account** whose refresh token is kept in `pmlm.anon`. A network failure never makes a new account.
- Each extra can be switched off for everyone in `PMLM_FEATURES`.

## Consequences

- Children's devices never handle a password; a parent can unlink a device at any time.
- The SDK gives live listeners and offline write queues for family sync. (inferred: why `Sync` uses the SDK rather than REST.)
- The extras need no SDK download on devices without a family account, and stay out of `Sync`'s sign-in state. (inferred: why `Online` uses REST.)
- One device can have two anonymous accounts (one for the family, one for the extras). The extras account cannot read family data; a rules test checks this.
- Anyone with the public web config can make an anonymous account, so rules must validate every write (see [security.md](../security.md)).
- Rules are published by hand in the console, so code and live rules can drift.
- The claude.ai artifact can't load the SDK (its CSP blocks gstatic), so it uses a different store ([0005](0005-artifact-copy-uses-db-capability.md)).
