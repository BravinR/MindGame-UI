# TODO-07 · Town State Snapshot

**Phase:** 3 — World Time Simulation
**Status:** `open`
**Depends on:** TODO-06 (advance_world updates NPC data), TODO-06b (soul drift updates lived state)
**Depended on by:** TODO-09 (dialogue uses state), TODO-11 (NPC loader injects state into prompts)

---

## Goal

Maintain a single, queryable snapshot of the current world state. This file is the player's "return to town" context — the ground truth of what has changed while they were away, rendered in a form that can be injected directly into LLM prompts.

---

## Output

`world/town/state.md` — auto-generated and overwritten by the simulation engine after each `advance_world` run.

Also: a generation script `engine/build_state.ts` that assembles this file from the NPC folder contents.

---

## Details

### When It's Built

`build_state.ts` is called at the end of every `advance_world.ts` run. It reads all NPC soul files, the obituaries log, the event log, and the latest changelog, then writes a fresh `state.md`.

The file is always a complete, current snapshot — not append-only. Previous versions are overwritten.

---

### File Structure

```markdown
# Town State — <current_in_world_date>

## Current Date
<human-readable in-world date: "Year 3, Month 7 (Goldfall), Day 4">

## Living Residents

| Name | Age | Occupation | Home | Economic Status | Relationship Status | Recruitable |
|------|-----|-----------|------|----------------|---------------------|-------------|
| Mira Blackwood | 34 | Innkeeper | The Hearth & Hammer Inn | comfortable | married to Aldric | no |
| ... | | | | | | |

## Emotional Currents

A brief paragraph per NPC (drawn from `lived.current_state`) summarizing who they are emotionally right now.
This is narrative context, not a data table.

> **Mira Blackwood:** Still grieving the loss of her father last winter. She's warm as ever behind the bar, but 
> there's a tiredness in her eyes that wasn't there before. She's begun to lean more on Aldric.

> ...

## Recent Deaths

| Name | Age at Death | Date | Cause (broad) |
|------|-------------|------|--------------|
| Edrew the Elder | 81 | Year 3, Month 4 | Old age |

## What People Are Saying

A curated list of 3–7 rumors and notable events from the event log and changelogs since the last visit.
Written in an in-world voice — as if the player heard them in passing at the inn.

- *"They say Tomás finally got that new house he's been saving for. Good for him."*
- *"There's been talk of a strange light in the hills. The guard captain went to investigate."*
- *"Nessa's baby came early. She's calling him Brennan."*

## Relationships Changed

Notable relationship changes since last visit:
- Mira Blackwood and Aldric the Blacksmith: married (Year 3, Month 2)
- Gareth the Merchant and Serina the Healer: estranged (Year 3, Month 5, economic dispute)

## Who Can Now Join Your Party

NPCs who have become recruitable since the last visit:
- <name>, <age>, <occupation> — <one sentence about what changed>
```

---

### Editorial Voice

The "What People Are Saying" section should be written by an LLM using the event log entries as raw input:

```
You are a storyteller summarizing what has happened in a small town while the player was away.
The player has been gone for <N> months.

Raw events from the log:
<event_log entries since last visit>
Changelogs:
<changelog entries since last visit>

Write 4–6 short town rumors and observations in a warm, in-world voice.
Each should be 1–2 sentences. Write them as things the player might overhear at the inn.
Do not be exhaustive — pick the most interesting or emotionally resonant events.
```

---

### Token Budget

This file is injected as context into LLM prompts when the player returns to town. Keep it tight:
- NPC table: always included
- Emotional currents: summarized to 1–3 sentences per NPC, truncated for NPCs with low relationship score to player
- What people are saying: capped at 7 items
- Total target: under 2,000 tokens for the full file

---

## Acceptance Criteria

- [ ] `build_state.ts` reads all NPC soul files and generates a complete `state.md`
- [ ] File includes all living NPCs in the table with accurate current values
- [ ] `lived.current_state` values are surfaced in the Emotional Currents section
- [ ] Deaths since last visit are listed in Recent Deaths
- [ ] "What People Are Saying" section is LLM-generated from the event log
- [ ] Newly recruitable NPCs are called out
- [ ] File is under 2,000 tokens in typical scenarios
- [ ] `state.md` is deterministically regeneratable from the NPC folder contents
