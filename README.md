# MindGame

A living, breathing open-world game where AI-driven characters lead their own lives, remember you, and evolve over time.

## The Vision

The game is centered around a single town — your home base. You know the people here, and they know you. A guild hall in town posts quests for you to take. Some are local — resolve a dispute, help a neighbor, investigate something strange. Others send you and your party out into the wider world on journeys that take long stretches of time.

When you return from those longer quests, the town has moved on without you. The mage you once traveled with has made new friends. The singer got married and has kids. Some NPCs have grown richer, others poorer. Some have died, and the townspeople talk about them. Children you once knew have grown up and can now join your party.

Characters remember you. Help someone out and they'll greet you warmly years later. Wrong someone and they won't forget. Every interaction leaves a mark — on you and on them.

## Core Concepts

### Agents with Souls

Every character in the game is an AI agent built on a lightweight framework:

- **Soul file** — A core identity document with randomly seeded attributes (personality, values, tendencies) that defines who the character fundamentally is.
- **Memories** — As agents interact with the world and with you, they accumulate memory files that persist and can be referenced in future encounters. These memories give characters continuity and depth.
- **Skills as tools** — Characters have skill-based tool configurations that define how they can interact with the environment. A sorcerer who learns a fire spell gains a new way to affect the world. A doctor can heal. A singer can persuade. Skills gate what actions are available to both agents and players.

### One Town, One Home

- **The town** — A single village serves as the heart of the game. You build relationships here, watch it change, and always come back to it.
- **The guild hall** — A central quest board offers missions. Some quests keep you in town. Others send you far away for long stretches of time.
- **NPC life progression** — While you're away, characters age, form relationships, have families, change economic status, and die. The world simulates forward.
- **Quests drive time** — Longer quests create the passage of time, giving the town room to evolve between your returns.

### Relationships and Recurrence

- **Recruitment** — Some characters can be recruited into your party. Party members have classes and evolving skill sets.
- **Diverging paths** — Party members who leave or NPCs you've met continue living their lives independently. When you encounter them again, they've grown and changed.
- **Persistent reputation** — Your history with every character is remembered. Relationships are earned, damaged, and rebuilt over time.

## Status

Early concept phase. Everything above is directional — implementation details are still being explored.
