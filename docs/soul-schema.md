# Soul Schema Specification

**Version:** 1.0
**Status:** Canonical
**Defined by:** TODO-01
**Consumed by:** TODO-02, TODO-06b, TODO-08, TODO-11, TODO-13

---

## Overview

A soul file (`soul.md`) is the identity document for every character in MindGame. Each soul file is a Markdown document with structured YAML frontmatter and two narrative sections — **Core** (immutable) and **Lived** (mutable). Together, they define who a character is, who life has made them, and how they continue to change.

The soul schema also applies to the town itself (see TODO-13), which uses the same two-layer structure with domain-specific fields.

---

## File Location

```
world/town/npcs/<npc_id>/soul.md
```

Where `<npc_id>` is a unique kebab-case slug (e.g. `mira-blackwood`, `old-tomas`).

---

## Document Structure

A soul file has three parts, in order:

1. **YAML Frontmatter** — world-state metadata (between `---` fences)
2. **Core Identity section** — immutable personality bedrock (YAML block under `## Core`)
3. **Lived Character section** — mutable traits shaped by experience (YAML block under `## Lived`)

---

## Part 1 — YAML Frontmatter (World State)

These fields track the NPC's place in the world. They are updated by the simulation engine (`advance_world.ts`).

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique slug identifier. Must be kebab-case. e.g. `"mira-blackwood"` |
| `name` | `string` | yes | Display name. e.g. `"Mira Blackwood"` |
| `age` | `integer` | yes | Current age in years. Incremented by simulation. |
| `occupation` | `string` | yes | Current role or trade. e.g. `"herbalist"`, `"guard captain"` |
| `home` | `string` | yes | Where they live. Location ID or short description. e.g. `"Willow Cottage, east quarter"` |
| `economic_status` | `enum` | yes | One of: `destitute`, `poor`, `modest`, `comfortable`, `wealthy` |
| `relationship_status` | `string` | yes | Free text. e.g. `"married to Aldric"`, `"widowed"`, `"single"` |
| `faction` | `string \| null` | yes | Affiliated faction, or `null` if none. e.g. `"Merchant's Guild"` |
| `alive` | `boolean` | yes | `true` if living, `false` if deceased. |
| `last_simulated` | `string` | yes | In-world date of the most recent simulation step. Format: `YYYY-MM-DD`. e.g. `"0003-06-15"` |

### Frontmatter Example

```yaml
---
id: "mira-blackwood"
name: "Mira Blackwood"
age: 34
occupation: "herbalist"
home: "Willow Cottage, east quarter"
economic_status: modest
relationship_status: "married to Aldric Blackwood"
faction: null
alive: true
last_simulated: "0003-06-15"
---
```

---

## Part 2 — Core Identity (`## Core`)

The core is the immutable bedrock of the character. These fields are set at creation and **never change**. They define the gravitational center that all mutable traits orbit around.

The core section is written as a YAML code block under the `## Core` heading.

### Core Fields

| Field | Type | Required | Valid Values | Description |
|---|---|---|---|---|
| `temperament` | `string` | yes | Any single-word descriptor. Suggested: `warm`, `suspicious`, `melancholic`, `bold`, `jovial`, `anxious`, `stoic`, `fiery`, `gentle`, `cunning` | The NPC's base emotional character — the default lens through which they experience the world. |
| `values` | `string[]` | yes | Ordered list, 2–5 entries. Suggested: `family`, `honesty`, `survival`, `justice`, `wealth`, `knowledge`, `freedom`, `loyalty`, `faith`, `community`, `power`, `compassion`, `tradition`, `independence`, `beauty` | Deepest held beliefs, ordered by priority (index 0 = most important). These amplify or dampen drift when relevant experiences occur. |
| `moral_grain` | `enum` | yes | `selfless`, `pragmatic`, `selfish`, `ruthless` | The NPC's default ethical lean. Affects how they interpret and respond to moral situations. |
| `quirks` | `string[]` | yes | 1–4 short behavioral descriptions | Fixed personality flavor that never changes. Observable behaviors, habits, or attitudes. e.g. `"hums while working"`, `"mistrusts magic"`, `"always carries a wildflower"` |
| `backstory` | `string` | yes | 1–2 paragraphs, in-world perspective | Origin narrative written from a neutral observer's perspective. Establishes who this person was before the game begins. |

### Core Rules

- Core fields are **write-once**. After initial creation, no system may modify them.
- The core acts as an **attractor** for lived traits (see Drift Rules below).
- Two NPCs with identical life events will respond differently based on their core — this is by design.

### Core Example

````yaml
```core
temperament: warm
values:
  - family
  - honesty
  - community
moral_grain: selfless
quirks:
  - "hums while working"
  - "leaves herbs drying on every windowsill"
  - "mistrusts anyone who won't make eye contact"
backstory: |
  Mira grew up in the east quarter, the daughter of a woodcutter and
  a midwife. She learned herb-craft from her mother and took over the
  cottage practice when her parents passed during the fever winter of
  Year Two. She married Aldric, the town carpenter, and they built a
  quiet life together. The townspeople trust her — she's delivered
  half their children and cured the other half's coughs.
```
````

---

## Part 3 — Lived Character (`## Lived`)

The lived layer contains traits that drift over time as a result of life experiences, losses, relationships, and world events. These fields are updated by the Soul Drift Engine (`drift_soul.ts`, TODO-06b).

The lived section is written as a YAML code block under the `## Lived` heading.

### Lived Fields

#### `traits` — Scored Trait Map

| Field | Type | Required | Description |
|---|---|---|---|
| `traits` | `map[string, TraitValue]` | yes | A map of trait names to their values. Each trait tracks both its original seed and current score. |

**TraitValue structure:**

| Sub-field | Type | Range | Description |
|---|---|---|---|
| `seed` | `float` | `0.0–1.0` | The original value assigned at creation. Never changes. Used as the attractor target. |
| `current` | `float` | `0.0–1.0` | The present value after drift. Updated by the Soul Drift Engine. |

**Required starting traits:**

Every NPC must have at least these 10 traits scored at creation. Additional traits may be added.

| Trait | Low (0.0) means | High (1.0) means |
|---|---|---|
| `trust` | Deeply distrustful of others | Trusts freely and openly |
| `hope` | Expects the worst, feels defeated | Optimistic, believes things will improve |
| `bitterness` | No grudges, lets things go | Deeply resentful, holds onto pain |
| `ambition` | Content with what they have | Driven to achieve, always wants more |
| `greed` | Generous, indifferent to wealth | Acquisitive, hoards resources |
| `empathy` | Detached from others' suffering | Deeply moved by others' pain |
| `courage` | Risk-averse, avoids danger | Brave, confronts threats head-on |
| `suspicion` | Takes people at face value | Assumes hidden motives |
| `loyalty` | Easily shifts allegiance | Fiercely devoted, hard to sway |
| `resentment` | Forgives easily | Nurses grievances, slow to forgive |

#### `tendencies` — Behavioral Expressions

| Field | Type | Required | Description |
|---|---|---|---|
| `tendencies` | `string[]` | yes | 2–5 short behavioral descriptions that reflect the NPC's current lived state. These can shift when trait thresholds are crossed (see Drift Rules). |

Tendencies are the *observable expression* of internal trait scores. They are what other characters and the player would notice about this person's behavior.

**Tendency Threshold Matrix:**

When a trait crosses one of these thresholds, the corresponding tendency should be updated:

| Trait | Threshold | Direction | Old Tendency (example) | New Tendency (example) |
|---|---|---|---|---|
| `bitterness` | `> 0.8` | crossed upward | "warm to strangers" | "cold to strangers" |
| `bitterness` | `< 0.3` | crossed downward | "cold to strangers" | "warm to strangers" |
| `trust` | `< 0.2` | crossed downward | "open with feelings" | "guards their words" |
| `trust` | `> 0.7` | crossed upward | "guards their words" | "open with feelings" |
| `hope` | `< 0.2` | crossed downward | "looks forward to tomorrow" | "expects the worst" |
| `hope` | `> 0.7` | crossed upward | "expects the worst" | "looks forward to tomorrow" |
| `ambition` | `> 0.85` | crossed upward | "content with simple life" | "always wants more" |
| `ambition` | `< 0.4` | crossed downward | "always wants more" | "content with simple life" |
| `courage` | `< 0.2` | crossed downward | "stands their ground" | "looks for the exit" |
| `courage` | `> 0.8` | crossed upward | "looks for the exit" | "stands their ground" |
| `suspicion` | `> 0.8` | crossed upward | "takes people at their word" | "questions every motive" |
| `suspicion` | `< 0.3` | crossed downward | "questions every motive" | "takes people at their word" |

These are examples. The drift engine should map threshold crossings to tendencies contextually based on the NPC's existing tendencies list.

#### `wounds` — Emotional Injuries

| Field | Type | Required | Description |
|---|---|---|---|
| `wounds` | `Wound[]` | yes (may be empty `[]`) | Significant emotional injuries actively shaping behavior. |

**Wound structure:**

| Sub-field | Type | Description |
|---|---|---|
| `event_ref` | `string` | Filename of the causal memory. Format: `<YYYY-MM-DD>_<slug>.md`. e.g. `"0003-04-12_player-threatened-aldric.md"` |
| `trait_affected` | `string` | Which lived trait was pushed by this wound. e.g. `"trust"` |
| `drift_amount` | `float` | How much the trait shifted. Negative for worsening. e.g. `-0.07` |
| `since_date` | `string` | In-world date when this wound was inflicted. Format: `YYYY-MM-DD`. |

#### `growth` — Positive Transformations

| Field | Type | Required | Description |
|---|---|---|---|
| `growth` | `Growth[]` | yes (may be empty `[]`) | Positive transformations. Symmetrical structure to wounds. |

**Growth structure:**

| Sub-field | Type | Description |
|---|---|---|
| `event_ref` | `string` | Filename of the causal memory. Format: `<YYYY-MM-DD>_<slug>.md`. e.g. `"0003-02-10_player-saved-child.md"` |
| `trait_affected` | `string` | Which lived trait was pushed by this growth. e.g. `"hope"` |
| `drift_amount` | `float` | How much the trait shifted. Positive for improvement. e.g. `+0.05` |
| `since_date` | `string` | In-world date when this growth occurred. Format: `YYYY-MM-DD`. |

#### `current_state` — Emotional Posture

| Field | Type | Required | Description |
|---|---|---|---|
| `current_state` | `string` | yes | 1–2 sentences describing the NPC's current emotional posture, written from an outside observer's perspective. Updated every simulation step by the Soul Drift Engine using an LLM. |

### Lived Example

````yaml
```lived
traits:
  trust:
    seed: 0.7
    current: 0.5
  hope:
    seed: 0.8
    current: 0.65
  bitterness:
    seed: 0.1
    current: 0.3
  ambition:
    seed: 0.3
    current: 0.3
  greed:
    seed: 0.1
    current: 0.1
  empathy:
    seed: 0.9
    current: 0.85
  courage:
    seed: 0.5
    current: 0.45
  suspicion:
    seed: 0.3
    current: 0.5
  loyalty:
    seed: 0.8
    current: 0.8
  resentment:
    seed: 0.1
    current: 0.25

tendencies:
  - "still kind, but watches people more carefully than she used to"
  - "hesitates before trusting strangers"
  - "throws herself into work when anxious"
  - "fiercely protective of her family"

wounds:
  - event_ref: "0003-04-12_player-threatened-aldric.md"
    trait_affected: trust
    drift_amount: -0.10
    since_date: "0003-04-12"
  - event_ref: "0003-05-01_barn-fire-rumors.md"
    trait_affected: suspicion
    drift_amount: +0.08
    since_date: "0003-05-01"

growth:
  - event_ref: "0003-02-10_player-saved-child.md"
    trait_affected: hope
    drift_amount: +0.05
    since_date: "0003-02-10"

current_state: |
  Mira carries a quiet tension these days. She's still the first to
  help a neighbor, but there's a wariness behind her eyes that wasn't
  there before — especially around outsiders. The incident with Aldric
  shook her, and the fire rumors haven't helped. She keeps her children
  close and her door bolted at night.
```
````

---

## Drift Rules

These rules govern how `lived` fields change over time. They are implemented by the Soul Drift Engine (`drift_soul.ts`, TODO-06b).

### Rule 1 — Maximum Drift Per Step

Each `lived.trait` may drift by **at most `+-0.10`** per simulation step, regardless of how many memories drive it.

- If multiple memories push the same trait in the same direction, their contributions are summed up to the `+-0.10` cap.
- If memories push in opposing directions, contributions are netted before the cap is applied.
- `current` is clamped to the `[0.0, 1.0]` range after drift.

**Example:** Two memories both push `trust` down by `-0.06` each. Net = `-0.12`, capped to `-0.10`. New `current = old_current - 0.10`.

### Rule 2 — Attractor Pull

For each `lived.trait` that was **not** affected by any memory during a simulation step:

- Move `current` toward `seed` by `0.02`.
- If `current < seed`: `current = min(current + 0.02, seed)`
- If `current > seed`: `current = max(current - 0.02, seed)`
- If `current == seed`: no change.

This represents the NPC slowly returning to their natural self when not under active pressure. The core identity is a gravitational center.

### Rule 3 — Values-Amplified Drift

When a memory's subject matter aligns with one of the NPC's `core.values[]`, the drift magnitude is amplified:

| Value rank in `core.values[]` | Drift multiplier |
|---|---|
| Index 0 (top value) | `x1.5` (then cap at `+-0.10`) |
| Index 1 | `x1.3` |
| Index 2 | `x1.1` |
| Index 3+ | `x1.0` (no amplification) |

**How to determine alignment:** The drift engine evaluates whether the memory's subject involves one of the NPC's core values. For example:
- A memory about a family member's death aligns with the `family` value.
- A memory about being lied to aligns with the `honesty` value.
- A memory about losing property aligns with the `wealth` value.

The multiplier is applied to the base drift amount *before* the per-step cap is enforced.

### Rule 4 — Causal Linkage

Every change to a `lived` trait **must** be causally linked to at least one memory file (see TODO-03). There is no invisible drift. If the drift engine cannot cite a memory, the trait does not move (except via attractor pull, Rule 2).

- When drift occurs, a `wounds[]` or `growth[]` entry is written with the `event_ref` pointing to the causal memory file.
- The `event_ref` format must match the memory file naming convention: `<YYYY-MM-DD>_<slug>.md`.

### Rule 5 — Tendency Updates

When a trait crosses a threshold defined in the Tendency Threshold Matrix (see Lived Fields above), the drift engine should update `lived.tendencies[]` to reflect the new behavioral expression. Tendency updates happen after drift is applied and are based on the new `current` value.

### Rule 6 — Catastrophic Drift

Sustained trauma — defined as 3+ high-weight (`>= 0.7`) negative memories targeting the same trait over 3+ consecutive simulation steps — may push a trait to an extreme. Even in this case:

- The per-step cap of `+-0.10` still applies (the extremity comes from sustained pressure, not a single large jump).
- The NPC retains the *flavor* of their core. A `warm` NPC pushed to extreme `bitterness` doesn't become generically cold — they become *someone warm who has been deeply hurt*. This nuance is expressed through `current_state` and `tendencies`, not through the trait scores alone.

### Rule 7 — Current State Update

After all drift is applied, `lived.current_state` is regenerated by an LLM using this prompt template:

```
You are updating the emotional state description for {name}, a {temperament} {occupation}.

Their core values are: {values[]}
Their current trait scores are: {lived.traits current values}
Recent experiences (most impactful first):
  {top 3 memories by weight, summarized}

Write 1–2 sentences describing their current emotional posture.
Write it as an outside observer would describe them, not in first person.
Be specific to their actual trait values — do not be generic.
```

---

## Memory Cross-Reference

The `event_ref` field in `wounds[]` and `growth[]` references memory files stored at:

```
world/town/npcs/<npc_id>/memories/<YYYY-MM-DD>_<slug>.md
```

This naming convention is defined by the Memory Schema (TODO-03). The `event_ref` value is the **filename only** (not the full path), e.g.:

- `"0003-04-12_player-threatened-aldric.md"` — references a memory dated Year 3, April 12
- `"0003-02-10_player-saved-child.md"` — references a memory dated Year 3, February 10

The date portion uses the in-world calendar format `YYYY-MM-DD` (see TODO-05).

---

## Complete Worked Example — Mira Blackwood

Below is a complete, valid `soul.md` for a fully realized NPC.

```markdown
---
id: "mira-blackwood"
name: "Mira Blackwood"
age: 34
occupation: "herbalist"
home: "Willow Cottage, east quarter"
economic_status: modest
relationship_status: "married to Aldric Blackwood"
faction: null
alive: true
last_simulated: "0003-06-15"
---

## Core

​```core
temperament: warm
values:
  - family
  - honesty
  - community
moral_grain: selfless
quirks:
  - "hums while working"
  - "leaves herbs drying on every windowsill"
  - "mistrusts anyone who won't make eye contact"
backstory: |
  Mira grew up in the east quarter, the daughter of a woodcutter and
  a midwife. She learned herb-craft from her mother and took over the
  cottage practice when her parents passed during the fever winter of
  Year Two. She married Aldric, the town carpenter, and they built a
  quiet life together. The townspeople trust her — she's delivered
  half their children and cured the other half's coughs.
​```

## Lived

​```lived
traits:
  trust:
    seed: 0.7
    current: 0.5
  hope:
    seed: 0.8
    current: 0.65
  bitterness:
    seed: 0.1
    current: 0.3
  ambition:
    seed: 0.3
    current: 0.3
  greed:
    seed: 0.1
    current: 0.1
  empathy:
    seed: 0.9
    current: 0.85
  courage:
    seed: 0.5
    current: 0.45
  suspicion:
    seed: 0.3
    current: 0.5
  loyalty:
    seed: 0.8
    current: 0.8
  resentment:
    seed: 0.1
    current: 0.25

tendencies:
  - "still kind, but watches people more carefully than she used to"
  - "hesitates before trusting strangers"
  - "throws herself into work when anxious"
  - "fiercely protective of her family"

wounds:
  - event_ref: "0003-04-12_player-threatened-aldric.md"
    trait_affected: trust
    drift_amount: -0.10
    since_date: "0003-04-12"
  - event_ref: "0003-05-01_barn-fire-rumors.md"
    trait_affected: suspicion
    drift_amount: +0.08
    since_date: "0003-05-01"
  - event_ref: "0003-05-01_barn-fire-rumors.md"
    trait_affected: bitterness
    drift_amount: +0.05
    since_date: "0003-05-01"

growth:
  - event_ref: "0003-02-10_player-saved-child.md"
    trait_affected: hope
    drift_amount: +0.05
    since_date: "0003-02-10"
  - event_ref: "0003-02-10_player-saved-child.md"
    trait_affected: trust
    drift_amount: +0.04
    since_date: "0003-02-10"

current_state: |
  Mira carries a quiet tension these days. She's still the first to
  help a neighbor, but there's a wariness behind her eyes that wasn't
  there before — especially around outsiders. The incident with Aldric
  shook her, and the fire rumors haven't helped. She keeps her children
  close and her door bolted at night.
​```
```

### Mira's Drift History (Narrative)

This section explains how Mira arrived at her current trait values, demonstrating the drift rules in action.

**At creation (Year 1):** Mira's `lived.traits` all matched their `seed` values. She was a trusting (`0.7`), hopeful (`0.8`), empathetic (`0.9`) herbalist with very low bitterness (`0.1`) and suspicion (`0.3`).

**Year 3, February 10 — Player saved a child:**
The player rescued a child from a collapsed well. Mira witnessed it. This created a positive memory (`weight: 0.6`). Because `family` is Mira's top value, drift was amplified by `x1.5`:
- `hope`: base `+0.04` x `1.5` = `+0.06`, but recorded as `+0.05` after rounding
- `trust`: base `+0.03` x `1.5` = `+0.045`, recorded as `+0.04`

**Year 3, April 12 — Player threatened Aldric:**
The player intimidated Aldric during a dispute. Mira heard about it from Aldric himself. This created a high-weight negative memory (`weight: 0.8`). Because `family` is her top value and her husband was the target:
- `trust`: base `-0.08` x `1.5` = `-0.12`, capped to `-0.10`

This single event overwhelmed the earlier positive drift on `trust`, pushing it from `0.74` down to `0.50` (accounting for some attractor recovery in intervening steps).

**Year 3, May 1 — Barn fire rumors:**
Mira heard rumors that the player may have started a fire. This was a `source: rumor` memory (`weight: 0.4`), so drift was applied at 40% of direct rate:
- `suspicion`: `+0.08` (rumors about someone who already threatened her husband hit harder)
- `bitterness`: `+0.05`

**Intervening steps with no relevant memories:**
Between events, attractor pull slowly moved traits back toward seed. But the sustained negative experiences kept `trust` and `suspicion` far from their seeds, while `empathy` and `loyalty` — untouched by events — stayed close to seed.

---

## Schema Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | Initial | Full schema definition |
