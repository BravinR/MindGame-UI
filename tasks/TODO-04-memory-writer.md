# TODO-04 · Player Interaction → Memory Writer

**Phase:** 2 — Memory Layer
**Status:** `open`
**Depends on:** TODO-01 (soul schema), TODO-03 (memory schema), TODO-10 (quest outcome payload)
**Depended on by:** TODO-06b (soul drift reads memories), TODO-08 (judgment reads memories)

---

## Goal

Build the module that converts a player interaction event into one or more NPC memory files. This is the write path — the moment experience becomes persistent record.

---

## Output

`engine/write_memory.ts` (TypeScript preferred; Python acceptable if the codebase isn't TypeScript)

---

## Details

### Input Payload

```typescript
interface InteractionEvent {
  npc_id: string;              // the NPC who directly experienced this
  player_action: {
    type: string;              // "helped" | "threatened" | "deceived" | "ignored" | "gifted" | custom
    description: string;       // 1–2 sentence human-readable description of what happened
    moral_weight: number;      // -1.0 (cruel) to +1.0 (noble)
  };
  context: string;             // brief situational context — where, when, what was at stake
  in_world_date: string;       // ISO-style in-world date: "Year 3, Month 4, Day 12"
  witnesses: string[];         // array of npc_ids who observed but weren't the primary subject
}
```

This input comes from the quest outcome payload (see TODO-10).

---

### Behavior

#### 1. Write the primary memory

For the NPC in `npc_id`:
- Load their `soul.md` (core + lived)
- Use `core.temperament`, `core.values[]`, and `lived.current_state` to determine `emotional_valence`
  - Same action can read as `positive` to one NPC and `negative` to another based on their values
  - e.g. a player who donated wealth: `positive` for a `selfless` NPC, `negative` for a `greedy` one
- Set `weight` proportional to `|moral_weight|` — neutral acts create light memories, strong moral acts create heavy ones
- Generate the memory body as a first-person narrative paragraph (via LLM call), constrained to the NPC's voice
- Write the file to `world/town/npcs/<npc_id>/memories/<in_world_date>_<slug>.md`

#### 2. Write witness memories

For each NPC in `witnesses[]`:
- Create a `source: rumor` memory with:
  - `weight = primary_weight * 0.4`
  - `type: observation` if they were physically present, `rumor` if proximity is implied
  - Body reflects their uncertainty: *"I saw..." vs "I heard..."*
- Load their soul to color the valence — same rules as above

#### 3. Log to event log

Append a summary entry to `world/town/event_log.md`:
```
[<in_world_date>] <npc_id> — <player_action.type>: <player_action.description> (moral_weight: <N>)
  witnesses: [<list>]
  memory files: [<list of created paths>]
```

---

### Naming Convention

Memory filename slug: lowercase kebab-case derived from `player_action.type` + `npc_id` context
- e.g. `0003-04-12_player-helped-harvest.md`
- e.g. `0003-04-12_player-threatened-aldric.md`

---

### LLM Prompt Guidance

The memory body should be generated with an LLM call using a prompt like:

```
You are writing a memory for <NPC name>, a <temperament> <occupation> who values <values[]>.
Their current emotional state is: <lived.current_state>

The following event just occurred: <player_action.description>
Context: <context>

Write a 2–5 sentence internal memory from <NPC name>'s first-person perspective.
Do not summarize. Write it as they would actually think it — in their voice, with their emotional filter.
Do not use the player's name; refer to them as "the traveler" or a physical description.
```

---

### Error Handling

- If `npc_id` does not have a `soul.md`, log an error and skip — do not create orphaned memory files
- If `in_world_date` is malformed, reject the payload and return a descriptive error
- Witnesses who don't have soul files should be silently skipped (they may be unnamed crowd members)

---

## Acceptance Criteria

- [ ] `write_memory.ts` accepts an `InteractionEvent` and produces correctly structured memory files
- [ ] Primary memory file passes schema validation (see TODO-03)
- [ ] Witness memories are created at reduced weight with appropriate `source: rumor` type
- [ ] Emotional valence is soul-aware — the same event produces different valence for NPCs with conflicting values
- [ ] Event log entry is appended to `world/town/event_log.md` after each call
- [ ] At least one unit test covering: a positive interaction, a negative interaction, and a multi-witness event
