# TODO-02 · Generate Starter NPCs

**Phase:** 1 — NPC Identity Layer
**Status:** `open`
**Depends on:** TODO-01 (soul.md schema must be finalized first)
**Depended on by:** TODO-04, TODO-06, TODO-07, TODO-08

---

## Goal

Seed the town with an initial cast of ~10–15 characters, each living in their own `soul.md`. This is the human heart of MindGame — the people the player will know, love, wrong, and come back to.

---

## Output

One `soul.md` per NPC at:
```
world/town/npcs/<npc_id>/soul.md
```

Also create an empty `memories/` directory per NPC (ready for TODO-04 to populate).

---

## Details

### Required Archetypes

Create at least one NPC for each of these roles. Each should feel like a real person, not a type:

| Archetype | Notes |
|---|---|
| Innkeeper | Hub of town gossip. Sees everything. |
| Blacksmith | Practical, proud of craft. Quiet but observant. |
| Mage | Potential party recruit. Possibly arrogant or reclusive. |
| Healer | Community pillar. Morally complex — has seen too much death. |
| Singer / Bard | Connected to everyone. Emotionally sensitive. |
| Merchant | Economically ambitious. Values shift with fortunes. |
| Guard Captain | Rule-bound but not heartless. Notices the player's methods. |
| Child (young) | Should be young enough to grow into a recruitable adult over 2–3 quests. |
| Elder | Wise but fragile. Elderly enough to plausibly die during a medium-length quest. |
| Guild Master | Politically savvy. Assigns quests. Watches outcomes carefully. |
| Farmer | Simple life, deep roots. Hard to impress, hard to lose. |
| Priest / Monk | Spiritual. Judges moral weight of actions heavily. |
| Traveling Stranger | Mysterious past. Could become party member or antagonist. |

---

### Diversity Requirements

- Spread across all `economic_status` levels (at least one `destitute`, one `wealthy`)
- Age spread: at least one teenager, several adults, one elderly NPC
- Mix of `core.moral_grain` values — not everyone is `selfless`
- Mix of `core.values[]` priorities — some care about family, others about wealth, justice, or power
- At least **2 NPCs** flagged as recruitable party members from the start
- At least **1 child NPC** young enough to age into recruitability over in-world time

---

### Writing Voice

Each `soul.md` should feel like it was written *about* a real person:
- `core.backstory` should be 1–2 paragraphs of lived history, not a list of facts
- `lived.current_state` should read as an honest snapshot of where they are emotionally *right now*
- Wounds and growth (if any at game start) should already be seeded if the character's backstory warrants it

---

### Starting Trait Seeds

When you seed `lived.traits`, use `core.temperament` and `core.values[]` as your guide:
- A `warm` NPC with `family` as top value should start with high `trust` and `empathy`
- A `suspicious` NPC with `survival` as top value should start with low `trust`, high `suspicion`
- Set `current` equal to `seed` at game start — drift begins from the first simulation step

---

## Acceptance Criteria

- [ ] 10–15 fully realized `soul.md` files exist at the correct paths
- [ ] All files conform to the schema defined in TODO-01
- [ ] At least 2 NPCs are recruitable at game start
- [ ] At least 1 NPC is elderly (age 65+) with `economic_status` and health traits appropriate to their age
- [ ] At least 1 child NPC (age ~8–12) with a plausible path to adulthood
- [ ] No two NPCs feel like copies of each other — diversity in voice, values, and temperament is required
- [ ] Each NPC folder has an empty `memories/` subdirectory ready for population
