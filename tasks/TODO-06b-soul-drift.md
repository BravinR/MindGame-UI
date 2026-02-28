# TODO-06b · Soul Drift Engine (`drift_soul.ts`)

**Phase:** 3 — World Time Simulation
**Status:** `open`
**Depends on:** TODO-01 (soul schema — lived layer), TODO-03 (memory schema), TODO-06 (called at end of advance_world)
**Depended on by:** TODO-07 (updated soul state feeds the world snapshot)

---

## Goal

Build the engine that updates each NPC's mutable `lived` traits based on the experiences they've accumulated since the last simulation step. This is what makes souls grow — or harden — over time.

---

## Output

`engine/drift_soul.ts`

---

## Design Principle

**Drift must always be legible.** Every change to a `lived` trait must reference at least one memory file as its cause. There is no invisible drift. If you can't cite a memory, the trait doesn't move.

---

## Details

### Input

```typescript
interface DriftInput {
  npc_id: string;
  since_date: string;   // in-world date of previous simulation step
  current_date: string; // in-world date of current simulation step
}
```

The function loads:
- The NPC's `soul.md` (both `core:` and `lived:` layers)
- All memory files in `memories/` with `date` between `since_date` and `current_date`
- Sorts memories by `weight` descending — high-weight memories have disproportionate influence

---

### Step 1 · Evaluate Each High-Weight Memory

For each memory with `weight >= 0.5` (in the date window):

1. Determine which `lived.traits` are relevant to this memory's subject and emotional content
2. Determine drift direction and magnitude using this matrix:

| Memory type | Valence | Core value match | Trait drift | Magnitude |
|---|---|---|---|---|
| Direct interaction | negative | subject is top value | bitterness ↑, hope ↓ | `0.08–0.10` |
| Direct interaction | negative | subject is not top value | bitterness ↑ | `0.02–0.05` |
| Direct interaction | positive | subject is top value | trust ↑, hope ↑ | `0.05–0.10` |
| Direct interaction | positive | subject is not top value | trust ↑ | `0.02–0.04` |
| Observation | negative | — | suspicion ↑ | `0.02–0.05` |
| Death of close person | negative | family in top 3 values | hope ↓, bitterness ↑ | `0.08–0.10` |
| Death of close person | negative | family not in values | grief trait ↑ | `0.03–0.06` |
| Economic windfall | positive | wealth in top 3 values | ambition ↑, greed ↑ | `0.04–0.07` |
| Economic windfall | positive | wealth not in values | trust ↑ | `0.02–0.03` |
| Rumor about player | any | — | apply at 40% of direct rate | — |

Extend this table as needed — document all rules clearly so any agent can follow them.

---

### Step 2 · Cap Drift

- Maximum drift per trait per simulation step: `±0.10` total (across all memories)
- If multiple memories push the same trait the same direction, sum their contributions up to the cap
- If memories push in opposing directions, net the contributions before capping

---

### Step 3 · Apply Attractor Pull

For each `lived` trait that was **not** affected by any memory this step:
- Move `current` toward `seed` by `+0.02` (if current < seed) or `-0.02` (if current > seed)
- This represents the NPC slowly returning to their natural self when not under active pressure

---

### Step 4 · Update Tendencies

If a trait crosses a threshold, consider updating `lived.tendencies[]`:

| Trait | Threshold | Old tendency | New tendency |
|---|---|---|---|
| `bitterness` | > 0.8 | "warm to strangers" | "cold to strangers" |
| `trust` | < 0.2 | "open with feelings" | "guards their words" |
| `hope` | < 0.2 | "looks forward to tomorrow" | "expects the worst" |
| `ambition` | > 0.85 | "content with simple life" | "always wants more" |

Define the full tendencies matrix in the schema. Tendency changes should be written to the soul.md `lived.tendencies[]` field and noted in the changelog.

---

### Step 5 · Write wounds[] and growth[]

For each trait that drifted from a memory:
- If drift is negative (trait worsened): add an entry to `lived.wounds[]`:
  ```yaml
  - event_ref: "0003-04-12_player-threatened-aldric.md"
    trait_affected: "trust"
    drift_amount: -0.07
    since_date: "0003-04-12"
  ```
- If drift is positive (trait improved): add an entry to `lived.growth[]` with the same structure

Do not duplicate: if an existing wound entry already references the same `event_ref` and trait, update it instead of adding a new entry.

---

### Step 6 · Update `lived.current_state`

Generate a new `lived.current_state` narrative summary using an LLM:

```
You are updating the emotional state description for <NPC name>, a <temperament> <occupation>.

Their core values are: <values[]>
Their current trait scores are: <lived.traits current values>
Recent experiences (most impactful first):
  <top 3 memories by weight, summarized>

Write 1–2 sentences describing their current emotional posture. 
Write it as an outside observer would describe them, not in first person.
Be specific to their actual trait values — do not be generic.
```

---

### Output

- Updated `soul.md` file with new `lived.traits`, `lived.tendencies`, `lived.wounds[]`, `lived.growth[]`, `lived.current_state`
- Does not touch `core:` section — ever

---

## Acceptance Criteria

- [ ] `drift_soul.ts` loads soul + memories correctly and applies drift rules for all memory types
- [ ] Drift is capped at ±0.10 per trait per step
- [ ] Attractor pull is applied to all untouched traits
- [ ] Tendency changes are applied when thresholds are crossed
- [ ] `wounds[]` and `growth[]` are correctly written with `event_ref` citations
- [ ] `lived.current_state` is updated with an LLM-generated summary
- [ ] `core:` section of soul.md is never modified
- [ ] At least one unit test: NPC experiences a death of a close person → verify bitterness increases, hope decreases proportional to `family` rank in values
