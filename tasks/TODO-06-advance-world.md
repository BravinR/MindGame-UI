# TODO-06 · World Simulation Engine (`advance_world.ts`)

**Phase:** 3 — World Time Simulation
**Status:** `open`
**Depends on:** TODO-01 (soul schema), TODO-03 (memory schema), TODO-05 (calendar), TODO-10 (quest outcome payload)
**Depended on by:** TODO-06b (called at end of advance_world), TODO-07 (world snapshot updated after this runs)

---

## Goal

Build the engine that simulates the world forward whenever the player returns from a quest. This is the heartbeat of MindGame — the process that makes the world feel like it continued living without you.

---

## Output

`engine/advance_world.ts`

---

## Details

### Input

```typescript
interface WorldAdvanceInput {
  months_elapsed: number;     // from quest metadata: duration_months
  current_date: string;       // in-world date at quest start
  event_log_since: string;    // in-world date — only process events after this date
}
```

Derives the new current date from `current_date + months_elapsed` using the calendar (TODO-05).

---

### Process: For Each Living NPC

Run each step below for every NPC with `alive: true` in `world/town/npcs/`:

---

#### Step 1 · Aging

- Increment `age` by `floor(months_elapsed / 12)`
- If `months_elapsed` crosses a year boundary mid-quest, age is still incremented
- Update `last_simulated` date in soul.md frontmatter

---

#### Step 2 · Death Check

Run only for NPCs with `age >= 60`:

```
base_death_probability = (age - 60) * 0.005 per month
total_probability = base_death_probability * months_elapsed
roll random float 0.0–1.0; if < total_probability → NPC dies
```

Additionally, run illness/accident checks for all ages:
- Very low base rate (0.001/month), can be modified by occupation or lived traits

**On death:**
- Set `alive: false` in soul.md frontmatter
- Write a death-notification memory file to every NPC in the deceased's `lived` relationships
- Add an entry to `world/town/obituaries.md`:
  ```
  - <name>, <occupation>, died <in_world_date>, age <N>. <one sentence epitaph.>
  ```
- Add a changelog entry

---

#### Step 3 · Economic Drift

Every 3 in-world months (check `floor(months_elapsed / 3)` times):

```
drift_direction = weighted_random([
  "up"   → probability: lived.traits.ambition.current * 0.3,
  "down" → probability: random_hardship_chance (0.1 base),
  "same" → remaining probability
])
```

- Move `economic_status` one step up or down the ladder: `destitute → poor → modest → comfortable → wealthy`
- Log the change in the changelog

---

#### Step 4 · Housing Change

If `economic_status` improved by 2+ steps since last simulation:
- Update `home` to a better description
- Write a memory file to the NPC: *"I finally moved to a bigger place..."*
- Write a rumor memory to nearby NPCs

If `economic_status` declined by 2+ steps:
- Same process in reverse

---

#### Step 5 · Relationship Formation & Dissolution

Every 2 in-world months:

- NPCs with overlapping `core.values[]` who share `occupation` proximity have a chance to form a new relationship
- Existing relationships weaken if `economic_status` diverges significantly or if conflicting `moral_grain` creates tension
- New relationships: write a memory for both NPCs
- Dissolved relationships: write a memory for both NPCs, update `relationship_status` in soul.md

---

#### Step 6 · Child Aging → Recruitment

For each NPC with `age < 18`:
- Increment age as above
- If new age `>= 18`: flag as recruitable in soul.md (add `recruitable: true` to frontmatter)
- Write a changelog entry: *"<name> came of age this season."*

---

#### Step 7 · Skill Growth

For each profession month elapsed, bump a relevant `lived.traits` skill-adjacent trait by `+0.01`:
- Blacksmith → `ambition` (mastery)
- Healer → `empathy`
- Merchant → `greed` or `ambition` depending on `core.moral_grain`
- etc. — document the full mapping

Maximum skill trait value: `1.0`. Cannot exceed seed + 0.3 without specific narrative trigger.

---

#### Step 8 · Call Soul Drift Engine

After all world events are processed, call `drift_soul(npc_id)` for each NPC.
See TODO-06b for the full spec.

---

### Output

After processing all NPCs, write:

**`world/town/changelog_<new_date>.md`:**
```markdown
# World Changelog — <new_date>

## Deaths
- ...

## Economic Changes
- ...

## Housing
- ...

## Relationships
- ...

## Coming of Age
- ...
```

Then trigger a full refresh of `world/town/state.md` (see TODO-07).

---

## Acceptance Criteria

- [ ] `advance_world.ts` accepts the input payload and processes all living NPCs
- [ ] All 7 steps execute in the correct order
- [ ] Death check math is implemented correctly and tested
- [ ] Economic drift is capped at one step per check interval
- [ ] Housing updates write memory files for both the affected NPC and neighbors
- [ ] Changelog is written to the correct path after each run
- [ ] `drift_soul()` (TODO-06b) is called at the end of NPC processing
- [ ] At least one integration test: provide a 12-month elapsed input and verify aging, economic drift, and changelog output
