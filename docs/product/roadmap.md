# Roadmap

**Who this is for:** the owner, new team members, and investors, partners and schools who want to know where the game is going.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

"Now" is what exists today. "Next" and "Later" are directions, not promises. Where a decision belongs to the owner and hasn't been made, it says TODO(owner) instead of a guess.

## Now: the friends-and-family test

**Goal:** learn whether children come back, whether they really master skills, and whether parents find it useful, before going wider.

What is live (details in [product-spec.md](product-spec.md)):

- **Content:** the full Cambridge curriculum for Grades 1–9: 48 units, 201 skills, each with a lesson and questions at three levels ([curriculum map](curriculum-map.md)).
- **Learning loop:** placement, lessons, 10-question practice rounds with a hint ladder, mastery over 2 days, Fix-it, boss battles, the 60-second challenge.
- **Motivation:** wishes and streak wishes, daily goal and streaks with freezes, chest, pet, sticker album, levels, coins and shop, daily quests, trophies, the family team goal, four worlds.
- **Family:** parent area with PIN and weekly report, optional family accounts that sync across devices, backup codes.
- **Test extras:** anonymous play stats with a private dashboard, 🚩 question reports and parent feedback, leaderboard with nicknames, optional daily reminders, invite a friend, Home Screen install.
- **Quality and safety:** automatic content checks, browser tests on Chrome and Safari engines, tests that saved progress is never lost, a separate preview copy for testing on real phones, feature switches to turn any online extra off without a new release.

What we are watching: see [metrics.md](metrics.md).

## Next: make the test answer its questions

Based on what the test needs and on known gaps. Order to be set by the owner. TODO(owner): prioritise.

**Privacy and trust (before inviting people beyond friends and family)**
- A published privacy notice for parents, and a consent step before data leaves the device.
- A way to delete a family's account and its stats on request.
- Decide whether stats should be off by default. See [privacy-and-safety.md](privacy-and-safety.md).

**Learning quality**
- Use 🚩 reports and "failed to load" notes to fix questions.
- Check that mastery predicts later success: does a mastered skill stay right when it comes back after 7 days?
- Hints for specific wrong choices in multiple-choice questions (today the same hints follow any wrong answer).

**Parents**
- A short weekly summary for parents (in the game or by email), built on the existing weekly report.
- A simple parent survey. TODO(owner): decide.

**Reach**
- Measure invite waves (`?src=` tags) and the invite-a-friend funnel; keep or drop rewards based on results.

**Languages**
- TODO(owner): decide whether to translate the game (for example the language of the test families), and which languages first.

## Later: possible directions

None of these is decided.

- **Schools and teachers.** A class view: assign this week's topic, see which pupils are stuck. Needs teacher accounts, school-level privacy work and a data protection assessment. TODO(owner): decide whether and when to run school pilots, and with which schools.
- **More curricula.** Other national curricula could reuse the engine with new content. TODO(owner): which markets.
- **Deeper teaching.** Short videos or interactive lessons for children who are stuck after the hint ladder.
- **Accessibility.** Fuller screen-reader support, dyslexia-friendly font option, more read-aloud voices.
- **Native apps.** Today the game is a web page that can sit on the Home Screen. App-store versions would change reach and reminders on iPhone. TODO(owner): decide whether needed.

## Strategy questions still open

These need the owner's decision. We don't guess them here.

- **Business model.** Free for families today. TODO(owner): free forever, paid tiers, school licences, sponsorship or grants?
- **Pricing.** TODO(owner): if paid, who pays (parents or schools) and how much?
- **Markets.** TODO(owner): which countries first; this also decides which privacy laws apply.
- **School pilots.** TODO(owner): whether, when, how many, and what success looks like.
- **Team and funding.** TODO(owner): who builds and maintains content and code beyond the test.
- **Brand and name.** TODO(owner): is "Play More Learn More" the final name?
- **Success threshold for the test.** TODO(owner): what results would make us go wider, change course or stop? See the proposed metrics in [metrics.md](metrics.md).

## Product questions to answer with the test

- Do children come back on their own, or only when reminded?
- Do wishes motivate children, or mainly parents?
- Is the daily goal of 1 round the right default?
- Does the leaderboard help or discourage children who are behind?
- Which grades and units do children get stuck on most?
- Do parents use family accounts, or are backup codes enough?

## Related documents

- [vision-and-users.md](vision-and-users.md): why the game exists and who it serves
- [product-spec.md](product-spec.md): what exists today
- [learning-design.md](learning-design.md): how it teaches
- [metrics.md](metrics.md): how we will judge it
- [privacy-and-safety.md](privacy-and-safety.md): data and safety
