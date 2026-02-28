# TODO-08 · NPC Judgment System

**Phase:** 4 — Reputation & Judgment Engine
**Status:** `open`
**Depends on:** TODO-01 (soul schema — values, tendencies), TODO-03 (memory schema), TODO-10 (quest outcome payload)
**Depended on by:** TODO-09 (disposition drives dialogue tone), TODO-11 (reputation loaded for NPC context)

---

## Goal

Build the system by which NPCs evaluate the player's conduct and form opinions. An NPC's judgment of the player is not a single number — it's a soul-filtered reading of everything they've witnessed, been told, and felt.

---

## Output

- `engine/judge_player.ts`
- `docs/reputation-schema.md`

One reputation file per NPC at:
```
world/town/npcs/<npc_id>/reputation/player.md
```

---

## Details

### Reputation File Schema (`player.md`)

```yaml
npc_id: string
last_updated: string          # in-world date

# Composite opinion score: -1.0 (deepest contempt) to +1.0 (genuine devotion)
opinion_score: float

# Human-readable label derived from opinion_score
disposition: enum             # adoring | friendly | neutral | wary | hostile | hated

# Breakdown of contributing factors (for transparency/debugging)
score_breakdown:
  direct_memories: float      # weighted average of direct interaction memories
  rumors_heard: float         # weighted average of rumor/secondhand memories
  values_alignment: float     # how well player actions align with NPC's core.values[]
  memory_modifier: float      # grudge-holder amplification or forgiving decay effect

# The NPC's internal monologue about the player (LLM-generated)
internal_monologue: string

# Memory citations that most influenced this opinion (top 3)
key_memories:
  - event_ref: string
    valence: string
    weight: float
```

---

### Disposition Labels

| Score Range | Disposition | Behavioral Meaning |
|---|---|---|
| 0.75–1.0 | adoring | Actively helps the player; goes out of their way; remembers fondly |
| 0.4–0.74 | friendly | Warm greeting; willing to share information; small favors |
| -0.15–0.39 | neutral | No particular feeling; transactional; polite but not warm |
| -0.4–-0.16 | wary | Guarded; brief; watches the player carefully |
| -0.74–-0.41 | hostile | Cold; refuses optional help; may warn others |
| -1.0–-0.75 | hated | Refuses interaction; may actively work against the player |

---

### Scoring Algorithm

#### 1. Direct Memory Score

For all memories where `source: direct` and `subject: player`:
```
direct_score = sum(memory.weight * valence_to_float(memory.emotional_valence))
             / sum(memory.weight)

valence_to_float: positive → +1.0, neutral → 0.0, negative → -1.0
```

Memories marked `faded: true` contribute at 20% weight.

#### 2. Rumor Score

Same formula, but for memories where `source: rumor`. Cap rumor influence at 30% of total score.

#### 3. Values Alignment Score

For each player action in the quest outcome payload:
- Check if the action aligns with or violates the NPC's `core.values[]`
- Top-ranked values weight 3x more than bottom-ranked values
- `moral_weight` from the action payload scales the alignment score

```
values_score = sum(
  action.moral_weight * values_match_weight(action, npc.core.values)
) / total_actions
```

#### 4. Soul Modifier

Apply the NPC's tendency toward grudge-holding or forgiveness:

| Soul trait condition | Effect |
|---|---|
| `tendencies` contains "holds grudges" | Negative memories weighted `+40%` |
| `tendencies` contains "quick to forgive" | Negative memories decay `−20%` per simulation step |
| `core.moral_grain == "ruthless"` | Actions with `moral_weight < 0` don't register as bad |
| `core.moral_grain == "selfless"` | Actions with `moral_weight < -0.5` weighted `+50%` negative |

#### 5. Composite Score

```
opinion_score = clamp(
  (direct_score * 0.5) + (rumor_score * 0.2) + (values_score * 0.3) + soul_modifier,
  -1.0, 1.0
)
```

---

### Internal Monologue

After scoring, generate `internal_monologue` via LLM:

```
You are writing the private thoughts of <NPC name>, a <temperament> <occupation> who values <values[]>.
Their current emotional state: <lived.current_state>
Their opinion of the traveler is: <disposition> (score: <N>)

The memories most shaping their view:
<top 3 memories, summarized>

Write 2–4 sentences of internal monologue — what this NPC privately thinks about the traveler.
Be specific to the memories and values. Be honest about any conflict or ambivalence.
Do not be generic. Do not moralize.
```

---

### When to Recompute

`judge_player.ts` is called:
1. After every `write_memory.ts` call involving the player
2. After every `advance_world.ts` run (to apply decay/healing effects on old memories)

---

## Acceptance Criteria

- [ ] `judge_player.ts` correctly implements the 4-part scoring algorithm
- [ ] Soul modifiers (grudge-holding, forgiving) are applied correctly
- [ ] Disposition label is correctly derived from opinion score
- [ ] Internal monologue is generated and written to the reputation file
- [ ] Top 3 key memories are cited in `key_memories[]`
- [ ] Reputation file is written/updated at the correct path
- [ ] `docs/reputation-schema.md` fully documents all fields
- [ ] At least 2 unit tests: one NPC who should like the player, one who should distrust them, with expected scores
