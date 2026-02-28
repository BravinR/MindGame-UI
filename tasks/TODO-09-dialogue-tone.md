# TODO-09 · Reputation → Dialogue Coloring

**Phase:** 4 — Reputation & Judgment Engine
**Status:** `open`
**Depends on:** TODO-08 (judgment system produces disposition), TODO-07 (state.md provides world context), TODO-11 (NPC context builder)
**Depended on by:** game dialogue system (not defined yet)

---

## Goal

Use an NPC's disposition toward the player to shape how they speak when the player approaches them. The same character should feel fundamentally different to talk to depending on how the relationship has developed — not just warmer or colder, but genuinely different in what they say and what they reveal.

---

## Output

- `engine/dialogue_tone.ts` — assembles the tone-aware dialogue prompt for a given NPC + player encounter
- `docs/dialogue-tone-matrix.md` — the full tone template system documented
- `content/dialogue-examples/` — at least 10 example dialogues showing different archetypes × dispositions

---

## Details

### Core Concept

Disposition sets the **register** — how guarded, how warm, how forthcoming. Soul sets the **voice** — how they actually express it. These two axes together mean:

- A `friendly` innkeeper sounds very different from a `friendly` merchant
- A `hostile` forgiving NPC is still more measured than a `hostile` grudge-holder
- The same NPC sounds different this visit than last visit if their traits have drifted

---

### Dialogue Prompt Assembly

`dialogue_tone.ts` assembles a prompt that gets passed to the game's dialogue LLM. It does not generate the dialogue itself — it constructs the context that makes generation accurate.

#### Input

```typescript
interface DialogueRequest {
  npc_id: string;
  player_approach_context: string;  // why the player is talking to them, briefly
  topic: string | null;             // what the player is asking about, if known
}
```

#### Output

A structured prompt block:

```typescript
interface DialogueToneContext {
  npc_summary: string;           // soul summary: name, occupation, temperament, core values
  current_state: string;         // lived.current_state
  disposition_toward_player: string;  // disposition label + internal_monologue excerpt
  key_memories_summary: string;  // top 2 relevant memories, paraphrased
  tone_instructions: string;     // derived from disposition × soul traits (see matrix below)
  memory_cues: string[];         // specific things to reference naturally in dialogue
  world_context: string;         // relevant snippet from state.md
}
```

---

### Tone Instruction Matrix

The `tone_instructions` field is derived from this matrix. It guides the LLM on register and behavior, not exact words:

| Disposition | General tone | Information sharing | Player references |
|---|---|---|---|
| `adoring` | Warm, eager, open | Shares freely, volunteers extras | References past help warmly and specifically |
| `friendly` | Welcoming, honest | Shares most things willingly | Acknowledges player positively, may bring up shared history |
| `neutral` | Polite, transactional | Answers what's asked, no more | Treats player like any customer/visitor |
| `wary` | Guarded, clipped | Minimal answers, watchful | Doesn't reference history unless pressed; watches reactions |
| `hostile` | Cold, dismissive | Refuses optional extras; may misdirect | May reference past hurt; cynical about player's motives |
| `hated` | Barely civil or openly contemptuous | Refuses to help; may lie | Directly or indirectly references the wrong done; no pretense |

**Apply soul modifier on top:**
- `core.temperament == "warm"` + `wary` → guarded with sadness, not bitterness ("I used to think better of you")
- `core.temperament == "suspicious"` + `friendly` → warm but still asks questions, never fully relaxed
- `lived.bitterness > 0.7` at any disposition → edge or weariness in every line

---

### Memory Cues

The `memory_cues` array prompts the LLM to reference specific past events naturally:

- Pull from the NPC's `key_memories` in their reputation file
- Format as: *"Reference, if natural, that you remember when the traveler [action]. You felt [valence]."*
- For rumor memories: *"You heard (but aren't sure) that the traveler [action]. You're uncertain."*
- Max 3 cues — don't crowd the prompt

---

### Example Dialogue Outputs

Create at least 10 example exchanges in `content/dialogue-examples/`, covering:

| NPC | Disposition | Scenario |
|---|---|---|
| Innkeeper (warm) | adoring | Player returns after 6 months |
| Innkeeper (warm) | hostile | Player wronged them before leaving |
| Guard Captain (pragmatic) | neutral | Player asks about a missing person |
| Guard Captain (pragmatic) | wary | Player has a reputation for burning bridges |
| Elder | friendly | Player asks about town history |
| Mage | friendly | Player asks to rejoin their party |
| Mage | wary | Player abandoned them mid-quest |
| Singer | adoring | Player helped them at personal cost |
| Farmer | neutral | Player asks about the roads |
| Priest | hostile | Player took the dark path on a moral choice |

Each example should include:
- The assembled `DialogueToneContext`
- The resulting dialogue (3–6 exchanges)
- Notes on what made it feel right

---

## Acceptance Criteria

- [ ] `dialogue_tone.ts` accepts a `DialogueRequest` and returns a `DialogueToneContext` object
- [ ] Tone instructions are correctly derived from disposition × soul traits
- [ ] Memory cues correctly pull from top reputation key memories
- [ ] Rumor memories are presented with uncertainty language
- [ ] `docs/dialogue-tone-matrix.md` documents all tone combinations
- [ ] 10 example dialogues exist in `content/dialogue-examples/`
- [ ] Examples demonstrate genuine tonal difference across all 6 disposition levels
