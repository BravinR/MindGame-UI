# TODO-11 · NPC Loader / Context Builder

**Phase:** 5 — Integration & Tooling
**Status:** `open`
**Depends on:** TODO-01 (soul schema), TODO-03 (memory schema), TODO-07 (state snapshot), TODO-08 (reputation/judgment)
**Depended on by:** TODO-09 (dialogue tone uses this), any system that needs to prompt an NPC

---

## Goal

Build a utility that assembles a full, token-budgeted NPC context object from their folder — ready to be injected into an LLM prompt. Every system that needs to "think as" or "about" an NPC goes through this loader.

---

## Output

`engine/load_npc.ts`

---

## Details

### Input

```typescript
interface NpcLoadRequest {
  npc_id: string;
  purpose: "dialogue" | "judgment" | "drift" | "debug";  // shapes what gets prioritized
  player_approaching: boolean;    // if true, reputation/disposition is included
  topic_context: string | null;   // optional hint for memory relevance filtering
  token_budget: number;           // max tokens for the assembled context (default: 1500)
}
```

---

### What Gets Loaded

| Section | Always included? | Notes |
|---|---|---|
| Soul core summary | Yes | `core.temperament`, `core.values[]`, `core.moral_grain`, `core.quirks[]` |
| Soul world state | Yes | `name`, `age`, `occupation`, `home`, `economic_status`, `alive` |
| `lived.current_state` | Yes | Current emotional snapshot |
| `lived.traits` | Yes | Full trait map with current + seed values |
| Relevant memories | Yes (top N by priority) | Filtered and ranked — see below |
| Reputation / disposition | Only if `player_approaching: true` | Pulled from `reputation/player.md` |
| `lived.wounds[]` + `lived.growth[]` | Only for `purpose: "drift"` or `"debug"` | Too verbose for dialogue |
| Town state excerpt | Only for `purpose: "dialogue"` | Relevant snippet from `state.md` |

---

### Memory Prioritization

Memories are ranked by a composite priority score:

```
priority = (memory.weight * 0.5)
         + (recency_score * 0.3)     // 1.0 for this month, decaying to 0.0 over 24 months
         + (topic_relevance * 0.2)   // 1.0 if memory subject matches topic_context, else 0.0
```

- Sort all non-faded memories by priority descending
- Include memories until the token budget is hit
- Always include at least 1 memory if any exist, even if budget is tight
- Never include `faded: true` memories unless `purpose == "debug"`
- Rumor memories are included last (lowest priority class)

---

### Token Budget Management

1. Allocate fixed tokens to required sections first (soul core: ~200 tokens)
2. Fill remaining budget with memories in priority order
3. If over budget after mandatory sections, truncate `lived.traits` to top 5 by delta from seed (most changed traits are most relevant)
4. Log a warning if budget requires omitting more than 3 non-faded memories

---

### Output Format

```typescript
interface NpcContext {
  npc_id: string;
  soul_summary: string;           // prose paragraph synthesizing core + world state
  current_state: string;          // lived.current_state verbatim
  trait_snapshot: string;         // formatted trait list: "trust: 0.4 (↓ from 0.7)"
  memories: MemoryContext[];      // [{date, type, summary, weight}] — truncated narratives
  disposition_summary: string | null;  // "Disposition toward player: wary. Internal view: ..."
  world_context: string | null;   // relevant state.md snippet
  total_tokens_used: number;
}
```

---

### Soul Summary Generation

The `soul_summary` field is a prose paragraph (not raw YAML) that synthesizes the soul into something an LLM can reason about naturally:

```
You are summarizing an NPC for use in a language model prompt.

NPC data:
  Name: <name>
  Age: <age>, Occupation: <occupation>
  Temperament: <core.temperament>
  Values (in order): <core.values[]>
  Moral grain: <core.moral_grain>
  Quirks: <core.quirks[]>
  Current emotional state: <lived.current_state>
  Most changed traits: <top 3 by delta from seed>

Write a single dense paragraph (4–6 sentences) summarizing who this person is and how they're doing right now.
Write it as characterization, not a list. Use specific language.
```

---

### Environment NPC

The town environment (see TODO-13) is loaded the same way, using `npc_id: "town"`. It has no memory prioritization by topic — all recent environmental events are included. Its `soul_summary` is a description of the town's current physical and social condition.

---

## Acceptance Criteria

- [ ] `load_npc.ts` accepts `NpcLoadRequest` and returns `NpcContext`
- [ ] Memory prioritization uses the composite formula (weight + recency + topic relevance)
- [ ] Token budget is respected — never exceed the configured limit
- [ ] Soul summary is LLM-generated prose, not raw YAML
- [ ] Trait snapshot shows delta from seed (`↑` / `↓`) for changed traits
- [ ] Reputation/disposition is only included when `player_approaching: true`
- [ ] Works correctly with `npc_id: "town"` for the environment entity (TODO-13)
- [ ] At least one unit test verifying that token budget limits are enforced
