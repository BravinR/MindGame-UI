# TODO-12 · File Structure & Conventions Doc

**Phase:** 5 — Integration & Tooling
**Status:** `open`
**Depends on:** all other tasks (this documents the full system)
**Depended on by:** every agent working on this project

---

## Goal

Produce a single authoritative reference for every file and directory in the MindGame project. Any agent starting a new task should be able to read this document and know exactly where things live, how things are named, and what the conventions are.

---

## Output

`docs/file-structure.md`

---

## Details

### Full Directory Layout

Document the complete project structure, with a one-line description for every file and directory:

```
world/
  town/
    state.md                  ← Current world snapshot (auto-generated, see TODO-07)
    event_log.md              ← Append-only log of all player-affecting events
    obituaries.md             ← Running record of all NPC deaths
    changelog_<date>.md       ← One file per simulation step (e.g. 0003-07-01.md)
    environment/
      town.md                 ← The town's soul file (see TODO-13)
      memories/               ← Town-level event memories (plagues, invasions, expansions)
        <date>_<slug>.md
      history.md              ← Long-form narrative history of the town (human-authored seed)
    npcs/
      <npc_id>/               ← One folder per NPC, named by their unique slug
        soul.md               ← Identity, lived traits, world state (see TODO-01)
        memories/             ← All memories this NPC has accumulated
          <date>_<slug>.md    ← e.g. 0003-04-12_player-helped-harvest.md
        reputation/
          player.md           ← NPC's current opinion of the player (see TODO-08)

engine/
  write_memory.ts             ← Converts interaction events → memory files (TODO-04)
  advance_world.ts            ← Simulates world forward after a quest (TODO-06)
  drift_soul.ts               ← Updates NPC lived traits from memories (TODO-06b)
  advance_environment.ts      ← Simulates town environment changes (TODO-13)
  build_state.ts              ← Generates world/town/state.md (TODO-07)
  judge_player.ts             ← Computes NPC opinion of player (TODO-08)
  dialogue_tone.ts            ← Assembles tone-aware dialogue context (TODO-09)
  load_npc.ts                 ← NPC context builder for LLM prompts (TODO-11)

docs/
  soul-schema.md              ← Full soul.md schema specification (TODO-01)
  memory-schema.md            ← Memory file schema specification (TODO-03)
  calendar.md                 ← In-world calendar and time multiplier rules (TODO-05)
  quest-outcome-schema.md     ← Quest payload spec (TODO-10)
  reputation-schema.md        ← Reputation file schema (TODO-08)
  dialogue-tone-matrix.md     ← Disposition × soul tone matrix (TODO-09)
  environment-schema.md       ← Town environment soul schema (TODO-13)
  file-structure.md           ← This file
  templates/
    soul.md                   ← Blank annotated soul template
    memory.md                 ← Blank annotated memory template
    environment.md            ← Blank annotated environment template

content/
  dialogue-examples/          ← Example NPC × disposition dialogues (TODO-09)

tasks/
  TODO-01-soul-schema.md
  TODO-02-starter-npcs.md
  ... (one file per task)
```

---

### Naming Conventions

Document each convention precisely:

#### NPC IDs
- Format: `firstname_lastname` in lowercase snake_case
- For NPCs with no last name: `firstname_occupation` (e.g. `edrew_elder`)
- Must be unique across all NPCs
- Used as the folder name and referenced in all cross-NPC links

#### Memory File Names
- Format: `<YYYY-MM-DD>_<action-slug>.md`
- Date uses in-world calendar zero-padded (e.g. `0003-04-12`)
- Slug is lowercase kebab-case, 2–5 words (e.g. `player-helped-harvest`, `heard-about-invasion`)

#### Changelog Files
- Format: `changelog_<YYYY-MM-DD>.md`
- One file per `advance_world` run; named for the new current date after the advance

#### Environment Event Files
- Same format as NPC memory files, stored under `world/town/environment/memories/`
- Subject field references the event type, not a person: `subject: "town_expansion"` or `subject: "plague"`

---

### Cross-Reference Conventions

When one file references another (e.g. `event_ref` in wounds/growth, `key_memories` in reputation):
- Always use the full relative path from the project root: `world/town/npcs/mira_blackwood/memories/0003-04-12_player-helped-harvest.md`
- Never use absolute paths — the repo must be portable

---

### Data Integrity Rules

Document the invariants every agent must maintain:

1. A memory file's `npc_id` folder must exist before the memory is written
2. `alive: false` NPCs must not receive new memory files (exception: death notification memories written on the day of death)
3. The `core:` section of `soul.md` must never be modified after initial creation
4. Every wound/growth entry's `event_ref` must point to an existing memory file
5. `state.md` is always fully regenerated — never manually edited
6. All in-world dates must be valid according to the calendar defined in TODO-05

---

## Acceptance Criteria

- [ ] `docs/file-structure.md` documents every directory and file type in the project
- [ ] Naming conventions are documented with examples for all file types
- [ ] Cross-reference format is clearly defined and consistent with all schema docs
- [ ] Data integrity rules are listed and unambiguous
- [ ] The document is self-sufficient — an agent with only this file and the schema docs has everything needed to work on any task
