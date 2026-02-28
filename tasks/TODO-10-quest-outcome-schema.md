# TODO-10 · Quest Outcome Payload Schema

**Phase:** 5 — Integration & Tooling
**Status:** `open`
**Depends on:** TODO-05 (calendar, for in-world dates)
**Depended on by:** TODO-04 (memory writer), TODO-06 (world advance), TODO-08 (judgment system)

---

## Goal

Define the structured data that a completed quest produces. This payload is the bridge between what happened out in the world and all the systems that react to it — memories, soul drift, world simulation, and reputation. Getting this schema right is load-bearing for everything downstream.

---

## Output

`docs/quest-outcome-schema.md` — complete schema specification with TypeScript types and at least 2 complete worked examples.

---

## Details

### Top-Level Payload

```typescript
interface QuestOutcome {
  quest_id: string;              // unique identifier for this quest
  quest_name: string;            // human-readable name
  duration_months: number;       // how much in-world time elapsed
  start_date: string;            // in-world date quest began
  end_date: string;              // in-world date quest ended (start + duration)
  outcome: QuestOutcomeStatus;   // see below
  player_actions: PlayerAction[];
  moral_choices: MoralChoice[];
  npc_interactions: NpcInteraction[];
  witnesses: string[];           // npc_ids of NPCs who were present and aware
  party_members: string[];       // npc_ids who traveled with the player
  summary: string;               // 2–3 sentence human-readable quest summary
}

type QuestOutcomeStatus = "success" | "partial" | "failure" | "abandoned";
```

---

### Player Action

Each individual action the player took during the quest that has moral or social weight:

```typescript
interface PlayerAction {
  type: string;              // "helped" | "threatened" | "deceived" | "killed" | "sacrificed" | "abandoned" | custom
  description: string;       // 1–2 sentence description of what happened
  moral_weight: number;      // -1.0 (maximally cruel) to +1.0 (maximally noble); 0.0 = neutral
  target_npc_id: string | null;  // if this action was directed at a specific NPC
  location: string;          // where this happened (in-world place name)
  in_world_date: string;     // when this happened
  witnesses: string[];       // npc_ids who saw this specific action
  known_to_town: boolean;    // will this become a rumor back home?
}
```

**Moral weight guidance:**
| Weight | Example action |
|---|---|
| +1.0 | Sacrificed something personal to save an innocent |
| +0.6 | Helped someone at personal cost |
| +0.2 | Chose the honest path when deception was easier |
| 0.0 | Neutral action, no moral dimension |
| -0.2 | Lied to get what was needed |
| -0.6 | Threatened or coerced an innocent |
| -1.0 | Killed or destroyed something in cold blood |

---

### Moral Choice

High-stakes decision points where the player explicitly chose between paths:

```typescript
interface MoralChoice {
  choice_id: string;         // unique ID for this decision point
  description: string;       // what the choice was about
  options_available: string[]; // what the player could have done
  choice_made: string;       // what the player actually did
  moral_weight: number;      // same -1.0 to +1.0 scale
  affected_npcs: string[];   // npc_ids whose opinions are affected by this choice
  known_to_town: boolean;    // does this come back as a rumor?
}
```

---

### NPC Interaction

Specific interactions with named NPCs during the quest (distinct from general player actions):

```typescript
interface NpcInteraction {
  npc_id: string;
  type: "helped" | "wronged" | "deceived" | "recruited" | "abandoned" | "killed" | "befriended";
  description: string;
  moral_weight: number;
  in_world_date: string;
  memory_worthy: boolean;    // should this generate a memory file for this NPC?
}
```

---

### Worked Examples

Include **2 complete example payloads** in `docs/quest-outcome-schema.md`:

#### Example 1: The Noble Path
A quest where the player succeeded by honest means, helped innocents along the way, and returned a party member safely.

#### Example 2: The Burned Bridge
A quest where the player succeeded but employed threats and deception, left an NPC worse off than they found them, and the town will hear about it.

These examples should be rich enough that an agent implementing `write_memory.ts` or `judge_player.ts` could use them as test data.

---

### Validation Rules

Document these constraints so implementing agents can validate payloads:

- `moral_weight` must be in range `[-1.0, 1.0]`
- `end_date` must equal `start_date + duration_months` (in calendar math)
- `duration_months` must be `>= 0`
- Every `target_npc_id` and witness ID must correspond to an existing NPC file
- `party_members` may include NPCs who died during the quest (their `alive` flag will be updated by advance_world)

---

## Acceptance Criteria

- [ ] `docs/quest-outcome-schema.md` defines all types with field-level documentation
- [ ] TypeScript type definitions are included in the doc
- [ ] `moral_weight` scale is clearly documented with examples at multiple levels
- [ ] Two complete worked example payloads are included
- [ ] Validation rules are documented
- [ ] Schema is sufficient for `write_memory.ts`, `judge_player.ts`, and `advance_world.ts` to consume without additional clarification
