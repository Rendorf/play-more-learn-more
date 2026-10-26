# Play More Learn More documentation

Play More Learn More is a free, playful maths practice game for the Cambridge curriculum, Grades 1–9. This folder explains what it is, why it works the way it does, how it is built and how it looks.

**New here? Start with [overview.md](overview.md)** — two pages on the problem, the product, how children learn with it and where it is going.

## Who should read what

| You are… | Read first | Then |
|---|---|---|
| An investor, partner or school | [Overview](overview.md) | [Vision and users](product/vision-and-users.md), [Learning design](product/learning-design.md), [Curriculum map](product/curriculum-map.md), [Privacy and safety](product/privacy-and-safety.md) |
| A teacher checking coverage | [Curriculum map](product/curriculum-map.md) | [Learning design](product/learning-design.md) |
| A new product person | [Vision and users](product/vision-and-users.md) | [Product spec](product/product-spec.md), [Metrics](product/metrics.md), [Roadmap](product/roadmap.md) |
| A new engineer | [Architecture](technology/architecture.md) | [Data model](technology/data-model.md), [Testing](technology/testing.md), [Operations](technology/operations.md), then the root [README](../README.md) |
| A content author (maths) | [Content authoring](technology/content-authoring.md) | [`src/CONTRACT.md`](../src/CONTRACT.md), [Visuals catalog](design/visuals-catalog.md), [Voice and copy](design/voice-and-copy.md) |
| A new designer | [Design principles](design/design-principles.md) | [Design system](design/design-system.md), [UX flows](design/ux-flows.md), [Accessibility](design/accessibility.md) |

## Product
- [Vision and users](product/vision-and-users.md): the problem, who it is for, personas, what we deliberately don't do.
- [Product spec](product/product-spec.md): every feature as it works today.
- [Learning design](product/learning-design.md): lessons, levels, mastery, hints and Fix-it, and why.
- [Curriculum map](product/curriculum-map.md): every unit and skill by grade (generated).
- [Metrics](product/metrics.md): what we measure and how each number is defined.
- [Privacy and safety](product/privacy-and-safety.md): children's data, what is stored where, and the choices grown-ups have.
- [Roadmap](product/roadmap.md): now, next, later and open questions.

## Technology
- [Architecture](technology/architecture.md): how the source becomes one page, the runtime modules and the services around them.
- [Data model](technology/data-model.md): saved progress on the device and in Firestore, and the rules that keep it safe.
- [Sync and accounts](technology/sync-and-accounts.md): parents, linked devices, players and how conflicts resolve.
- [Security](technology/security.md): database rules, what is public by design, and secrets.
- [Content authoring](technology/content-authoring.md): adding or changing a skill.
- [Testing](technology/testing.md): every check that runs before a change reaches `main`.
- [Operations](technology/operations.md): releasing, preview, backups, reminders and rollback.
- [Decisions](technology/decisions/README.md): short records of the main architecture choices.

## Design
- [Design principles](design/design-principles.md): the rules the product follows, with examples.
- [Design system](design/design-system.md): tokens per world, keycap buttons, type, spacing and icons.
- [Worlds and motion](design/worlds-and-motion.md): the four worlds, effects, celebrations and sound.
- [Visuals catalog](design/visuals-catalog.md): the 26 teaching pictures.
- [UX flows](design/ux-flows.md): the key journeys for children and grown-ups.
- [Voice and copy](design/voice-and-copy.md): how the game talks to children and to grown-ups.
- [Accessibility](design/accessibility.md): what works today and the known gaps.

## Keeping the docs true
- Each doc says which `BUILD` it was last checked against. When a change alters behaviour, data or design, update the matching doc in the same pull request.
- `TODO(owner)` marks a decision only the owner can make (strategy, markets, targets). Nothing here is a legal statement.
- The repository is public: never put family details, children's names, account ids, keys or real usage numbers in these files.
