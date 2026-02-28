# TODO-03 · Design the Memory File Format

**Phase:** 2 — Memory Layer
**Status:** `open`
**Depends on:** TODO-01 (soul schema, specifically `event_ref` naming conventions)
**Depended on by:** TODO-04, TODO-06b, TODO-08, TODO-11

---

## Goal

Define how NPC memories are stored and structured. Every significant experience — a kindness, a betrayal, a death, a rumor — becomes a file. These files are the raw material that drives personality drift, reputation scoring, and dialogue.

---

## Output

- `docs/memory-schema.md` — full schema specification
- `docs/templates/memory.md` — blank annotated memory template
- `world/town/npcs/example_npc/memories/` — at least 3 example memory files demonstrating different types

---

## Details

### File Location & Naming

```
world/town/npcs/<npc_id>/memories/<in_world_date>_<slug>.md
```

**Naming rules:**
- `in_world_date` format: `YYYY-MM-DD` using the in-world calendar (see TODO-05)
- `slug` is a short kebab-case description of the event: `player-helped-harvest`, `heard-about-ashfall-fire`, `mira-got-married`
- Files are **append-only** — memories are never deleted, only marked `faded: true`

---

### YAML Frontmatter

```yaml
date: string           # in-world date this memory was formed
type: enum             # interaction | observation | rumor | secondhand
subject: string        # who this memory is about: "player" or an npc_id
emotional_valence: enum  # positive | neutral | negative
weight: float          # 0.0–1.0 — how much this memory matters to the NPC
source: enum           # direct | rumor
faded: boolean         # set to true when memory is too old/low-weight to surface actively
fade_date: string | null  # in-world date when this memory was marked faded
```

---

### Memory Body

The body of the file is a **short narrative paragraph written in the NPC's first-person voice**:

- Reflects the NPC's `core.temperament` and `lived.current_state` at the time of the event
- 2–5 sentences max
- Written as internal thought, not a log entry
- Should feel emotionally honest — not neutral documentation

**Example (direct interaction, negative):**
> *The stranger — the one they call a hero — asked me for help finding Aldric's son. I told them what I knew. They thanked me with a coin and walked away. I saw the way they looked at the boy when they found him. There was something cold in it that I can't shake.*

**Example (rumor, uncertain):**
> *Tomás at the mill says the traveler burned half the village in the Ashfall valley to drive out the bandits. Could be exaggeration. Tomás has always been dramatic. But people don't usually make that face when they're exaggerating.*

---

### Memory Types

| Type | Description | Default Weight |
|---|---|---|
| `interaction` | NPC directly interacted with the player or another NPC | 0.5–0.9 |
| `observation` | NPC witnessed something without being directly involved | 0.3–0.6 |
| `rumor` | NPC heard about something from another character | 0.1–0.4 |
| `secondhand` | NPC was told about something by a trusted source — higher weight than pure rumor | 0.3–0.6 |

---

### Memory Degradation

- After `N` simulation steps without reinforcement, low-weight memories (`weight < 0.3`) are candidates for fading
- Fading sets `faded: true` and `fade_date` — the memory still exists on disk but is excluded from active context loading
- High-weight memories (`weight > 0.7`) never fade — they are defining experiences
- Memories can be **reactivated**: if a new event references the same subject, a faded memory can have `faded` set back to `false` and `weight` bumped slightly

---

### Rumor Propagation

When memory writer (TODO-04) creates a memory for an NPC, it also creates lower-weight `source: rumor` memories for witnesses. Define:
- Default rumor weight = `weight * 0.4` of the original event
- Rumors degrade faster than direct memories
- Rumor body should reflect the NPC's uncertainty: *"I only heard this second-hand..."*

---

## Acceptance Criteria

- [ ] `docs/memory-schema.md` defines all fields, types, valid values, and fade rules
- [ ] `docs/templates/memory.md` is a blank, annotated, copy-pasteable template
- [ ] At least 3 example memory files exist, covering: a direct interaction, an observation, and a rumor
- [ ] Examples demonstrate different voices (the memory should feel like it comes from the NPC, not a neutral narrator)
- [ ] `event_ref` format used in `soul.md` wounds/growth (TODO-01) is consistent with the filename convention defined here
- [ ] Schema is clear enough that an agent can implement `write_memory.ts` (TODO-04) without ambiguity
