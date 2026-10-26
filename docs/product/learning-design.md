# Learning design

**Who this is for:** teachers, schools and partners who want to judge the teaching, the owner, and content authors who write new skills.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

This page explains **how the game teaches and why**. For the exact behaviour of each feature, see [product-spec.md](product-spec.md). For the format content authors write in, see `src/CONTRACT.md` in the repository.

## 1. Curriculum coverage

The game follows the **Cambridge curriculum**: Primary Stages 1–6 (Grades 1–6) and Lower Secondary Stages 7–9 (Grades 7–9).

- **48 units and 201 skills** across the 9 grades. Each grade has 5 or 6 units.
- A **skill** is one small thing a child can learn and show, like "Teen numbers" or "Area of a triangle".
- A **unit** is a group of related skills, like "Numbers to 20". Units appear in teaching order.
- Strands: number and calculation, fractions (later with decimals, percentages and ratio), shape and measure, and data and chance at every stage; algebra from Grade 6 on.

The full list of units and skills by grade, as children see them, is in the [curriculum map](curriculum-map.md).

**Language and level.** Grade N is aimed at about age N + 5 (Grade 1 is about 6, Grade 9 about 14). Wording is British and Cambridge style ("maths", "colour", "centimetres"). Lessons are written for a child who finds maths hard: short sentences, friendly, never babyish for older grades. Grades 1–3 use very simple words, small numbers and many pictures. The money symbol is chosen by the parent, so money questions match the family's country.

## 2. Lesson cards

Every skill starts with a short lesson of **3 to 5 cards**:

1. **The idea**, in one or two sentences.
2. **A picture** that shows it, for example base-ten blocks, a number line, a fraction bar, a clock or a bar model. The game draws 26 kinds of teaching pictures.
3. **A tip or trick** to remember.
4. **A worked example** on the last card, with numbered steps.

Every card has a read-aloud button. The child can go back and forth. The lesson ends with **Try it**: two easy questions, so the child's first try at the skill is a quick win.

Lessons are optional. A child can practise straight away and come back to the lesson later.

## 3. Three question levels

Each skill makes fresh questions at three levels. Questions are generated each time, so a child rarely sees the same one twice.

| Level | What it is |
|---|---|
| 1 | The idea with small, friendly numbers and plenty of pictures |
| 2 | Typical practice |
| 3 | The **full Cambridge stage expectation** for that skill |

The level moves **per skill and per child**. 3 right first time in a row moves up a level; 2 misses in a row moves down. Boss battles use one level above the child's current level for each skill. "Find my level" uses level 2.

Answers are checked fairly. Equivalent fractions are accepted unless the question asks for simplest form; then the child is told "Right value! Now write it in its simplest form." Numbers can be typed with or without commas. Some questions accept a small rounding tolerance.

## 4. Mastery

**A skill is mastered when the child gets at least 8 of their last 10 answers right first time, on at least 2 different days.**

- "Right first time" means no wrong try and no hint.
- "2 different days" means one good session is not enough. The child has to show the skill again after sleeping on it.
- Mastery is shown on the skill card as 10 dots plus "day 1 of 2".
- A mastered skill not practised for 7 days is marked ↻ and suggested first, to keep it fresh.

**Why this rule.**

- **Retrieval practice:** pulling an answer out of memory makes it stick better than re-reading. The game asks; it does not show.
- **Spacing:** practice spread over days lasts longer than practice crammed into one session. The 2-day rule builds this in. Each practice round also mixes in one question from an older skill and earlier mistakes.
- **Honest progress:** stars and percentages mean something to parents and teachers because they depend on unaided answers on more than one day.

Stars before mastery reward progress inside one round (1 star at 60% first-time, 2 stars at 80%) so children see movement before mastery.

## 5. The hint ladder

When a child answers wrong, help grows one step at a time, and the child gets to finish the thinking themselves:

1. **Nudge** (💡): a gentle reminder of the method. Example: "Count on from the bigger number."
2. **Worked step** (👣): the first concrete step done for them, leaving the last step to the child.
3. **The answer and explanation** (🧩): the full solution in 1–3 short sentences.

Hints **never give away the final answer**. Every question must come with exactly two hints and an explanation; the content checker makes sure of that. Hints are free and can be asked for at any time. The messages say "Mistakes help your brain grow!", never "Wrong!".

## 6. The Fix-it queue

A question missed three times is not forgotten. It is saved (up to 30 per grade) and comes back:

- inside later practice rounds, as a "second chance"
- in a **Fix-it** round, up to 10 at a time

Getting it right first time removes it and earns coins. This turns mistakes into a to-do list instead of a failure, and makes children meet the exact question they found hard again, after a gap.

Parents see the number of mistakes to fix and the most recent ones in their report.

## 7. Wrong answers that teach: distractors

In multiple-choice questions, the wrong options (distractors) are built from **real mistakes**, not random numbers. Examples: forgetting to carry, adding instead of multiplying, or a place-value slip. A child who picks one gets the nudge and worked step for the method, which helps them see where their thinking went off track. The game doesn't yet give a different hint for each wrong option.

## 8. Placement

"Find my level" asks one question from every skill in the grade, without hints. Skills answered right get a star and start at level 2. This lets a strong child skip what they know and reach the boss battles sooner, and stops a child from being bored by work that is too easy. Placement does not count towards mastery: the child still has to show the skill over two days.

## 9. Motivation design

The game wraps practice in play, so children choose to come back.

| Need | How the game meets it |
|---|---|
| **Feeling competent** | Easy Try it after each lesson, levels that adapt, combos and "brain power", stars, then mastery |
| **Visible progress** | The map, the grade ring, the sticker album, levels and ranks |
| **A reason to come back tomorrow** | Daily goal and streak, the pet that grows, the daily chest, 3 new quests a day, optional reminders |
| **Something real at stake** | Wishes chosen with a parent, unlocked by mastery, not by time spent |
| **Challenge** | Boss battles, the 60-second challenge, the leaderboard |
| **Belonging** | The family team goal: siblings help each other fill one bar instead of competing |
| **Choice** | Four worlds, avatars and hats, any skill can be practised at any time |

**Design rules we follow:**

- **Reward learning, not just time.** Wishes, the album and grade progress depend on mastery. Points depend on first-time answers.
- **Never punish.** Mistakes cost nothing. Freezes protect a streak. The pet gets sleepy, never sad.
- **Short sessions.** A round is 10 questions, roughly 5 minutes. The daily goal can be 1 round.
- **Grown-ups in the loop.** Wishes and the team goal are set and granted by a real person.

## 10. Limits and risks

We are honest about what this design can and can't do.

- **Extrinsic rewards can crowd out interest.** Coins and prizes can make maths feel like a chore done for pay. We tie the biggest rewards to mastery and keep messages about growth, but we have not measured this yet.
- **Streaks can create pressure.** A child may feel anxious about losing one. Freezes, a gentle tone and a goal as low as 1 round help. Reminders stop after 14 days.
- **Leaderboards can discourage weaker children.** Weekly resets, a grade filter, several measures (including minutes and first-try %) and a "hidden" option soften this.
- **Practice is not teaching.** The lessons are short refreshers. A child who doesn't understand an idea at all needs a person.
- **Typed and multiple-choice answers only.** The game can't see a child's working, explain in words, or check reasoning and proofs.
- **Mastery is a proxy.** 8 of 10 on 2 days is a practical rule, not a proven threshold. Results have not been compared with school test scores.
- **Content correctness depends on review.** Automatic checks catch format problems only; the maths in each skill is checked by reading samples.

## Related documents

- [curriculum-map.md](curriculum-map.md): every unit and skill
- [product-spec.md](product-spec.md): exact feature behaviour
- [metrics.md](metrics.md): how we will measure learning and engagement
- [../design/design-principles.md](../design/design-principles.md) (planned): visual and interaction principles
