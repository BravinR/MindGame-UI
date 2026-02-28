# TODO-01 · Design the `soul.md` Schema

**Phase:** 1 — NPC Identity Layer
**Status:** `open`
**Depends on:** none
**Depended on by:** TODO-02, TODO-06b, TODO-08, TODO-11

---

## Goal

Define the canonical structure of an NPC's soul file — the document that gives every character their identity, personality, and the capacity to grow and change over time.

---

## Output

- `docs/soul-schema.md` — the full schema specification with field definitions, types, and rules
- `docs/templates/soul.md` — a blank, annotated starter template an agent can copy and fill in

---

## Details

The soul is a **two-layer document**. Both layers live in the same `soul.md` file.

---

### Layer 1 — Core Identity (`core:`) · *Immutable*

This is what the NPC was born with — the bedrock self. It sets the gravitational center that mutable traits orbit around. These fields **never change** after initial creation.

| Field | Type | Description |
|---|---|---|
| `core.temperament` | string | Base emotional character: `warm`, `suspicious`, `melancholic`, `bold`, `jovial`, `anxious`, etc. |
| `core.values[]` | string[] | Deepest held beliefs, ordered by priority. e.g. `[family, honesty, survival]` |
| `core.moral_grain` | enum | Ethical lean: `selfless \| pragmatic \| selfish \| ruthless` |
| `core.quirks[]` | string[] | Fixed personality flavor that never changes. e.g. `["hums while working", "mistrusts magic"]` |
| `core.backstory` | string | 1–2 paragraphs of origin narrative, written in-world from a neutral observer perspective |

**Rule:** These fields are the attractor that pulls the NPC back toward who they fundamentally are. They never change. They color how everything else is interpreted.

---

### Layer 2 — Lived Character (`lived:`) · *Mutable*

These traits drift over time as a result of life experiences, losses, relationships, and world events.

| Field | Type | Description |
|---|---|---|
| `lived.traits{}` | map[string]TraitValue | Scored trait map. Each trait has `current` (0.0–1.0) and `seed` (original value). e.g. `trust: { seed: 0.7, current: 0.5 }` |
| `lived.tendencies[]` | string[] | Behavioral expressions that can shift over time. e.g. `"avoids conflict"` → `"picks fights"` after sustained trauma |
| `lived.wounds[]` | Wound[] | Significant emotional injuries actively shaping behavior. Each wound: `{ event_ref, trait_affected, drift_amount, since_date }` |
| `lived.growth[]` | Growth[] | Positive transformations. Same structure as wounds. |
| `lived.current_state` | string | Short free-text summary of the NPC's current emotional posture. Updated each simulation step. |

**Suggested starting traits to score:**
`trust`, `hope`, `bitterness`, `ambition`, `greed`, `empathy`, `courage`, `suspicion`, `loyalty`, `resentment`

---

### World State Fields (YAML frontmatter)

These track the NPC's place in the world and are updated by the simulation engine:

```yaml
id: string              # unique slug, e.g. "mira_blackwood"
name: string
age: integer
occupation: string
home: string            # description or location ID
economic_status: enum   # destitute | poor | modest | comfortable | wealthy
relationship_status: string
faction: string | null
alive: boolean
last_simulated: string  # in-world date of last simulation step
```

---

### Drift Rules

- Mutable traits can drift by at most `±0.1` per simulation step — change is gradual, never sudden.
- The core acts as an **attractor**: if the pressure causing drift is removed, traits slowly recover toward their `seed` value at `+0.02` per step.
- A core `values[]` entry of `family` means grief from a family death causes dramatically larger `bitterness` drift than the same event would for an NPC whose core doesn't prioritize family.
- Catastrophic, sustained trauma (multiple high-weight negative memories over many months) can push a trait to an extreme — but the NPC will always retain the *flavor* of their core self, just expressed differently.
- Every change to a `lived` trait must be causally linked to at least one memory file (see TODO-03).

---

## Acceptance Criteria

- [ ] `docs/soul-schema.md` fully defines every field, its type, valid values, and mutation rules
- [ ] `docs/templates/soul.md` is a blank, annotated, copy-pasteable template
- [ ] Schema includes at least one complete worked example NPC (not blank)
- [ ] Drift rules are unambiguous enough for an agent to implement them in code without further clarification
- [ ] Schema is consistent with the memory format (TODO-03) — `event_ref` in wounds/growth must match memory file naming conventions
