# MindGame — Agent TODO Breakdown

Each section below is a self-contained task designed to be handed to an independent agent.
Tasks are ordered by dependency. Earlier tasks produce artifacts that later tasks consume.

---

## PHASE 1 — NPC Identity Layer (`soul.md`)

### TODO-01 · Design the `soul.md` Schema

**Goal:** Define the canonical structure of an NPC's soul file.

**Output:** A `docs/soul-schema.md` document + a starter `soul.md` template.

**Details:**

The soul is a **two-layer document**. Both layers live in the same file.

#### Layer 1 — Core Identity (`core:`) · *Immutable*
This is what the NPC was born with — the bedrock self. It sets the gravitational center that mutable traits orbit around.
- `core.temperament` — e.g. `warm`, `suspicious`, `melancholic`, `bold`
- `core.values[]` — deepest held beliefs, ordered by priority (e.g. `[family, honesty, survival]`)
- `core.moral_grain` — their default ethical lean: `selfless | pragmatic | selfish | ruthless`
- `core.quirks[]` — fixed personality flavor that never changes ("hums while working," "mistrusts magic")
- `core.backstory` — 1–2 paragraphs of origin narrative, written in-world
- These fields **never change**. They are the attractor that pulls the NPC back toward who they fundamentally are.

#### Layer 2 — Lived Character (`lived:`) · *Mutable*
These traits drift over time as a result of life experiences, losses, relationships, and world events.
- `lived.traits{}` — a scored map of traits (e.g. `trust: 0.7`, `bitterness: 0.2`, `hope: 0.6`). Values range 0.0–1.0.
- Each trait also stores its `seed` value (what it started as) so drift can always be measured against origin
- `lived.tendencies[]` — behavioral expressions that can shift (e.g. "avoids conflict" might become "picks fights" after sustained trauma)
- `lived.wounds[]` — significant emotional injuries that are actively shaping behavior: `{ event_ref, trait_affected, drift_amount, since_date }`
- `lived.growth[]` — positive transformations, symmetrical to wounds: `{ event_ref, trait_affected, drift_amount, since_date }`
- `lived.current_state` — a short free-text summary of where this NPC is emotionally right now, updated each simulation step

#### Drift Rules
- Mutable traits can drift by at most `±0.1` per simulation step — change is gradual, never sudden
- The core acts as an **attractor**: if the pressure causing drift is removed, traits slowly recover toward their `seed` value at a rate of `+0.02` per step
- A core value of `family` means grief from a family death causes dramatically larger `bitterness` drift than the same event would for an NPC whose core doesn't prioritize family
- Catastrophic, sustained trauma (multiple high-weight negative memories over many months) can push a trait to an extreme — but the NPC will always retain the *flavor* of their core self, just expressed differently
- Also define YAML frontmatter fields for world state: `id`, `name`, `age`, `occupation`, `home`, `economic_status`, `relationship_status`, `faction`, `alive`

---

### TODO-02 · Generate Starter NPCs

**Goal:** Seed the town with an initial cast of characters, each with their own `soul.md`.

**Output:** `world/town/npcs/<npc_id>/soul.md` for ~10–15 starting NPCs.

**Details:**
- Create archetypes: innkeeper, blacksmith, mage, healer, singer, merchant, guard captain, child, elder, guild master, farmer, priest, traveling stranger
- Use the schema from TODO-01 to generate each soul
- Ensure diversity in economic status, age, values, and personality
- At least 2 NPCs should start as recruitable party members
- At least 1 NPC should be elderly enough to plausibly die during a medium-length quest
- At least 1 child NPC should be young enough to grow into a recruitable adult over time

---

## PHASE 2 — Memory Layer

### TODO-03 · Design the Memory File Format

**Goal:** Define how NPC memories are stored and structured.

**Output:** `docs/memory-schema.md` + example memory files.

**Details:**
- Each memory is a separate `.md` file at `world/town/npcs/<npc_id>/memories/<timestamp>_<slug>.md`
- Memory frontmatter: `date` (in-world), `type` (interaction | observation | rumor | secondhand), `subject` (player or another NPC id), `emotional_valence` (positive | neutral | negative), `weight` (0.0–1.0 — how much this memory matters to them)
- Memory body: a short narrative paragraph written from the NPC's first-person perspective
- Memories degrade over time — old, low-weight memories can be marked `faded: true` after enough in-world time passes
- Memories can be `source: rumor` if the NPC heard about an event rather than witnessed it — these carry lower weight

---

### TODO-04 · Player Interaction → Memory Writer

**Goal:** Build the system that converts a player interaction event into one or more NPC memory files.

**Output:** A script/module `engine/write_memory.ts` (or `.py`) that accepts an interaction payload and writes memory files.

**Details:**
- Input: `{ npc_id, player_action, context, in_world_date, witnesses[] }`
- Output: writes a memory file for the NPC who was directly involved
- Also writes a lower-weight `source: rumor` memory for each NPC in `witnesses[]`
- Use the NPC's `soul.md` to color the emotional valence — a greedy NPC might react negatively to a player who gave away wealth
- Log all written memories to `world/town/event_log.md` for world simulation reference

---

## PHASE 3 — World Time Simulation

### TODO-05 · Design the In-World Calendar System

**Goal:** Define how time works in MindGame.

**Output:** `docs/calendar.md`

**Details:**
- Design an in-world calendar (seasons, months, named days) that maps to real elapsed quest time
- Define time multiplier: e.g. 1 real-world play session ≈ 1 in-world month; a long expedition ≈ 3–12 in-world months
- Quest metadata should declare `duration_months: N` — this is what drives the world simulation step
- Document how aging, pregnancies, deaths, and economic changes are paced against this calendar

---

### TODO-06 · World Simulation Engine (`advance_world.ts`)

**Goal:** Build the engine that simulates the world forward when the player returns from a quest.

**Output:** `engine/advance_world.ts` (or `.py`)

**Details:**
- Input: `{ months_elapsed: N, event_log: [] }`
- For each NPC, apply time-progression rules based on their `soul.md` traits and current state:
  - **Aging**: increment `age`, check against life expectancy (weighted by health/class)
  - **Death**: if age or random illness trigger death, set `alive: false`, write a death memory file to all close NPCs, add to `world/town/obituaries.md`
  - **Economic drift**: shift `economic_status` up or down based on `occupation` + lived `traits.ambition/greed` + random events
  - **Relationships**: NPCs form/dissolve relationships with each other based on shared `core.values` and proximity
  - **Housing**: if `economic_status` improves significantly, NPC may move — update `home` field and write a memory about it
  - **Children**: track births and aging of children; at age 18 they become recruitable
  - **Skill growth**: NPCs slowly improve their professions over time
- After world events are applied, call the **Soul Drift Engine** (TODO-06b) to update `lived` traits
- Also call the **Environment Advance Engine** (TODO-13) to simulate town-level changes
- Write a `world/town/changelog_<date>.md` summarizing what changed this simulation step

---

### TODO-06b · Soul Drift Engine (`drift_soul.ts`)

**Goal:** Update each NPC's mutable `lived` traits based on the experiences they've had since the last simulation step.

**Output:** `engine/drift_soul.ts`

**Details:**
- Called by `advance_world.ts` after world events have been processed
- Input: NPC's `soul.md` + their memory files written since the last simulation step
- For each high-weight memory, evaluate which `lived.traits` it should affect and by how much:
  - e.g. a death of a loved one → `hope` drifts down, `bitterness` drifts up — scaled by how much `family` ranks in `core.values`
  - e.g. unexpected financial windfall → `trust` drifts up slightly if `core.moral_grain` is `selfless`; `greed` drifts up if `ruthless`
  - e.g. sustained positive experiences → `lived.tendencies` can shift ("avoids conflict" softens to "prefers peace" if no threats for 12+ months)
- Apply attractor pull: for each trait, move it `+0.02` toward its `seed` value if no memories this step reinforce the drift direction
- Write new `lived.wounds[]` or `lived.growth[]` entries citing the causal memory file
- Update `lived.current_state` with a short narrative summary of the NPC's emotional posture right now
- **Drift must always be legible**: every change to a `lived` trait must reference at least one memory file as its cause — no invisible drift

---

### TODO-07 · Town State Snapshot

**Goal:** Maintain a single queryable snapshot of the current world state.

**Output:** `world/town/state.md` (auto-updated by the simulation engine)

**Details:**
- Tracks current in-world date
- Lists all living NPCs with their current `occupation`, `home`, `economic_status`, `relationship_status`, `age`
- Lists recently deceased and when they died
- Includes the town's current `lived.current_state` summary from TODO-13 (physical condition, prosperity, social atmosphere)
- Lists current town events/rumors the player can learn about on return — including environmental events (expansions, disasters, recoveries)
- This file is the primary context document injected into prompts when the player arrives back in town

---

### TODO-13 · Town Environment as a Living Entity

**Goal:** Model the town itself as a first-class living entity with a soul file, memory files, and a simulation engine that drives both gradual growth and catastrophic events.

**Output:** `world/town/environment/town.md` + `engine/advance_environment.ts` + `docs/environment-schema.md`

**Details:**
- The town uses the same two-layer soul schema as NPCs (TODO-01): immutable `core` (archetype, founding character, geography) + mutable `lived` (population, prosperity, infrastructure condition, social atmosphere)
- **Gradual drift (high probability, every step):** population growth, new construction, town expansion, prosperity drift, road improvements, population decline from migration
- **Catastrophic events (low probability, per step):** plague (kills 20–60% of population), invasion/raid, great fire, flood, famine — each with base probability and condition modifiers (e.g. raid probability triples if `safety < 0.5`)
- Catastrophic events write high-weight memories to **all living NPCs** — shaped by each NPC's `core.values[]`
- Recovery arcs are tracked in `lived.growth[]` across multiple simulation steps
- Town's `lived.current_state` is LLM-updated each step — injected into every NPC dialogue context
- Town has its own `reputation/player.md` — player's conduct during events (defending the town, causing harm) shapes a soft disposition modifier applied to all NPCs

---

## PHASE 4 — Reputation & Judgment Engine

### TODO-08 · NPC Judgment System

**Goal:** Build the system by which NPCs evaluate the player's conduct and form opinions.

**Output:** `engine/judge_player.ts` + `docs/reputation-schema.md`

**Details:**
- Each NPC has a `reputation/<npc_id>.md` file tracking their opinion of the player
- Opinion is a composite score influenced by:
  - Direct memories of the player (weighted by `weight` and `emotional_valence`)
  - Secondhand rumors (weighted lower)
  - How well the player's actions align with the NPC's `values[]`
  - The NPC's `tendencies[]` — a grudge-holder weights negative memories more; a forgiving NPC decays negative memories faster
- `judge_player.ts` recomputes opinion scores after each quest and after world simulation
- Output: a `disposition` label (adoring | friendly | neutral | wary | hostile | hated) + a short internal monologue the NPC would have about the player

---

### TODO-09 · Reputation → Dialogue Coloring

**Goal:** Use NPC disposition to influence how they greet and speak to the player on return.

**Output:** `engine/dialogue_tone.ts` + example NPC dialogue samples per disposition level

**Details:**
- When the player approaches an NPC, their `disposition` label routes to a tone template
- Each soul's `tendencies[]` and `personality` traits further color the tone (a cynical NPC at "friendly" still isn't warm)
- Define 5–7 tone templates per archetype × disposition matrix
- NPCs should reference specific memories when relevant: *"I heard what you did in Ashfall. Didn't think you had it in you."*
- NPCs with `source: rumor` memories should express uncertainty: *"Word is you helped them, though I only heard it secondhand."*

---

## PHASE 5 — Integration & Tooling

### TODO-10 · Quest Outcome Payload Schema

**Goal:** Define the structured data that a completed quest produces, which feeds into all the above systems.

**Output:** `docs/quest-outcome-schema.md`

**Details:**
- Fields: `quest_id`, `duration_months`, `player_actions[]`, `moral_choices[]`, `witnesses[]`, `npc_interactions[]`, `outcome` (success | partial | failure | abandoned)
- Each `player_action` has: `type`, `target_npc_id` (if any), `description`, `moral_weight` (-1.0 to 1.0)
- This payload is the input to: `write_memory.ts`, `judge_player.ts`, and `advance_world.ts`

---

### TODO-11 · NPC Loader / Context Builder

**Goal:** Build a utility that assembles a full NPC context object from their folder for use in LLM prompts.

**Output:** `engine/load_npc.ts`

**Details:**
- Reads `soul.md`, most recent N memories (sorted by weight desc), current `reputation/<npc_id>.md`, world `state.md`
- Returns a structured prompt context: soul summary + relevant memories + current disposition toward player
- Prioritize memories by: recency + weight + relevance to current situation
- Cap total token budget (configurable) — fade or omit lowest-weight memories when over budget

---

### TODO-12 · File Structure & Conventions Doc

**Goal:** Document the full file layout so all agents know where everything lives.

**Output:** `docs/file-structure.md`

**Details:**
```
world/
  town/
    state.md
    event_log.md
    obituaries.md
    changelog_<date>.md
    environment/
      town.md          ← town's soul file (TODO-13)
      history.md       ← long-form lore seed
      memories/
        <date>_<slug>.md
    npcs/
      <npc_id>/
        soul.md
        memories/
          <timestamp>_<slug>.md
        reputation/
          player.md
engine/
  write_memory.ts
  advance_world.ts
  advance_environment.ts   ← TODO-13
  drift_soul.ts
  build_state.ts
  judge_player.ts
  dialogue_tone.ts
  load_npc.ts
docs/
  soul-schema.md
  memory-schema.md
  environment-schema.md    ← TODO-13
  calendar.md
  quest-outcome-schema.md
  reputation-schema.md
  dialogue-tone-matrix.md
  file-structure.md
```

---

## Dependency Map

```
TODO-01 → TODO-02
TODO-03 → TODO-04
TODO-05 → TODO-06 → TODO-07
TODO-04 → TODO-06b (memories feed soul drift)
TODO-06 → TODO-06b (world events happen before soul drift is evaluated)
TODO-06b → TODO-07 (updated soul state feeds the world snapshot)
TODO-01, TODO-05 → TODO-13 (environment uses soul schema and calendar)
TODO-06 → TODO-13 (advance_world calls advance_environment)
TODO-13 → TODO-07 (town condition feeds the state snapshot)
TODO-13 → TODO-09 (town state injected into all NPC dialogue)
TODO-10 → TODO-04, TODO-06, TODO-08
TODO-08 → TODO-09
TODO-01, TODO-03, TODO-07, TODO-08, TODO-13 → TODO-11
All → TODO-12
```

---

## Design Note — Why Soul is Two Layers

Life experiences should shape who an NPC becomes — but not arbitrarily.
The two-layer model gives you both **continuity** and **growth**:

| Layer | Mutability | Purpose |
|---|---|---|
| `core` | Immutable | Who they *are* — the attractor, the lens, the bedrock self |
| `lived` | Mutable (slow drift) | Who life has *made* them — shaped by loss, love, wealth, hardship |

A naturally warm person who suffers great loss doesn't become cold — they become *guarded warmth*.
The core never changes. The expression of it does.
This means two NPCs with identical life events can respond very differently based on their core.
