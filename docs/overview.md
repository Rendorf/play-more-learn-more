# Play More Learn More: overview

**Who this is for:** investors, partners and schools meeting the project for the first time, and anyone new to the team. Two pages; every section links to the detail.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

## In one sentence

A free, playful maths practice game that follows the Cambridge curriculum skill by skill from Grade 1 to Grade 9, teaches before it tests, and only calls a skill "mastered" when the child has shown it on two different days.

**Try it:** https://rendorf.github.io/play-more-learn-more/ (any browser; add it to the Home Screen on a phone or tablet).

## The problem

Practice at home is often a fight. Worksheets are dull, most maths apps either drill without teaching or follow a different curriculum, and parents rarely know which topic their child is stuck on. Families and schools on the Cambridge curriculum have very few games that match it. More in [Vision and users](product/vision-and-users.md).

## What the child does

1. **Finds their level.** A short placement round skips what they already know.
2. **Learns.** Each skill opens with a 3–5 card picture lesson that ends in a worked example.
3. **Practises.** Rounds of 10 questions. A wrong answer gets a gentle hint, then a worked first step, then the answer and a short explanation, and the question goes to a **Fix-it** queue to try again later.
4. **Masters.** 8 of the last 10 answers right first time, on 2 different days. Mastered skills earn stars and stickers; a full unit opens a **boss battle**.
5. **Comes back.** A daily goal, streaks with freezes, a daily chest, a pet that grows, and real-life **wishes** set by a parent that unlock at 25, 50, 75 and 100% of the grade.

Full behaviour: [Product spec](product/product-spec.md). Why it is built this way: [Learning design](product/learning-design.md).

## Coverage

| | |
|---|---|
| Curriculum | Cambridge Primary Stages 1–6 and Lower Secondary Stages 7–9 |
| Content | 9 grades, 48 units, 201 skills, each with a lesson and questions at 3 levels |
| Teaching pictures | 26 kinds (number lines, base-ten blocks, fraction bars, clocks, angles, charts, 3D shapes and more) |
| Questions | Generated fresh each time, checked automatically against a content contract; wrong options come from real mistakes |

Every unit and skill: [Curriculum map](product/curriculum-map.md).

## Grown-ups

- A parent area behind a PIN: wishes, progress report, settings, the daily goal.
- Optional **family accounts**: parents log in, children's devices join with a short link code (children never see a password), and every child's progress is in one place.
- Optional daily reminders, a family team goal, and a leaderboard where children appear under a generated nickname unless a grown-up chooses otherwise.

## Safety and privacy by design

No ads, no chat between children, nothing to buy with real money (coins are earned by playing). Progress stays on the device unless a parent creates a family account. Play stats are anonymous (random ids, no names) and a parent can switch them off. Legal review and a published privacy notice are still to do. Details and open items: [Privacy and safety](product/privacy-and-safety.md).

## How it is built

One web page with no framework and no server of its own: it runs on phones, old tablets and computers, loads fast and keeps working without internet once open. Firebase (Google) stores family accounts and test stats; GitHub hosts the page and runs the hourly reminder job. Every change goes through automatic content checks, unit tests, database rule tests and browser tests on Chrome and Safari engines, including tests that saved progress is never lost. More in [Architecture](technology/architecture.md).

## Design

Four worlds (Space, Ocean, Jungle, Candy) with their own colours, backgrounds, effects and sounds; chunky "keycap" buttons sized for small fingers; lesson content written to be theme-neutral so any world fits. Rewards motivate but never block learning: every skill can be practised at any time. More in [Design principles](design/design-principles.md).

## Where it is now

A **friends-and-family test** is running: the full curriculum is live, with anonymous stats, feedback buttons, a leaderboard, reminders and invite-a-friend to learn whether children come back and really master skills. What comes next: [Roadmap](product/roadmap.md). What we measure: [Metrics](product/metrics.md).

## Open questions for partners

Business model, pricing, target markets, school pilots and funding are not decided yet (TODO(owner)). See the open questions in the [Roadmap](product/roadmap.md).
