---
# ============================================================
# SOUL FILE — NPC Identity Document
# ============================================================
# Copy this template and fill in all fields for a new NPC.
# See docs/soul-schema.md for full field definitions and rules.
# ============================================================

# Unique kebab-case identifier. Must be globally unique.
# Example: "mira-blackwood"
id: ""

# Display name as it appears in-game.
# Example: "Mira Blackwood"
name: ""

# Current age in years. Incremented by the simulation engine.
age: 0

# Current role or trade.
# Example: "herbalist", "guard captain", "innkeeper"
occupation: ""

# Where they live. Location ID or short description.
# Example: "Willow Cottage, east quarter"
home: ""

# Economic standing. One of: destitute | poor | modest | comfortable | wealthy
economic_status: modest

# Free text describing relationship status.
# Examples: "single", "married to Aldric Blackwood", "widowed"
relationship_status: "single"

# Affiliated faction, or null if none.
# Example: "Merchant's Guild"
faction: null

# true if living, false if deceased.
alive: true

# In-world date of the most recent simulation step. Format: YYYY-MM-DD.
# Example: "0001-01-01"
last_simulated: "0001-01-01"
---

## Core

<!-- Core Identity — IMMUTABLE after creation.
     These fields define the NPC's bedrock self.
     They act as the attractor that pulls lived traits back toward center.
     See docs/soul-schema.md for valid values and full rules. -->

```core
# Base emotional character. Single-word descriptor.
# Suggested: warm, suspicious, melancholic, bold, jovial, anxious,
#            stoic, fiery, gentle, cunning
temperament: ""

# Deepest held beliefs, ordered by priority (index 0 = most important).
# 2–5 entries. These amplify drift when relevant experiences occur.
# Suggested: family, honesty, survival, justice, wealth, knowledge,
#            freedom, loyalty, faith, community, power, compassion,
#            tradition, independence, beauty
values:
  - ""
  - ""

# Default ethical lean.
# One of: selfless | pragmatic | selfish | ruthless
moral_grain: pragmatic

# Fixed personality flavor. 1–4 short behavioral descriptions.
# These never change and are always observable.
# Examples: "hums while working", "mistrusts magic", "always carries a wildflower"
quirks:
  - ""

# 1–2 paragraphs of origin narrative, written from a neutral observer's
# perspective. Establishes who this person was before the game begins.
backstory: |
  [Write the NPC's backstory here. Describe their origins, formative
  experiences, and how they came to be who they are. Write in-world,
  as if an observer is recounting their history. 1–2 paragraphs.]
```

## Lived

<!-- Lived Character — MUTABLE, updated by the Soul Drift Engine.
     These traits change over time based on life experiences.
     See docs/soul-schema.md for drift rules, threshold matrix, and examples. -->

```lived
# Scored trait map. Each trait has a seed (original, never changes) and
# current (present value after drift). Range: 0.0–1.0.
# All 10 standard traits are required. Additional traits may be added.
#
# Trait meanings (0.0 → 1.0):
#   trust:      distrustful → trusts freely
#   hope:       defeated → optimistic
#   bitterness: lets things go → deeply resentful
#   ambition:   content → driven
#   greed:      generous → acquisitive
#   empathy:    detached → deeply moved
#   courage:    risk-averse → brave
#   suspicion:  takes at face value → assumes hidden motives
#   loyalty:    shifts allegiance → fiercely devoted
#   resentment: forgives easily → nurses grievances
traits:
  trust:
    seed: 0.5
    current: 0.5
  hope:
    seed: 0.5
    current: 0.5
  bitterness:
    seed: 0.5
    current: 0.5
  ambition:
    seed: 0.5
    current: 0.5
  greed:
    seed: 0.5
    current: 0.5
  empathy:
    seed: 0.5
    current: 0.5
  courage:
    seed: 0.5
    current: 0.5
  suspicion:
    seed: 0.5
    current: 0.5
  loyalty:
    seed: 0.5
    current: 0.5
  resentment:
    seed: 0.5
    current: 0.5

# Behavioral expressions that reflect current trait scores.
# 2–5 short descriptions. Updated when trait thresholds are crossed.
# See the Tendency Threshold Matrix in docs/soul-schema.md.
# Examples: "warm to strangers", "avoids conflict", "fiercely protective of family"
tendencies:
  - ""
  - ""

# Significant emotional injuries actively shaping behavior.
# Empty list [] at creation. Populated by the Soul Drift Engine.
# Each entry:
#   event_ref:      memory filename, format: <YYYY-MM-DD>_<slug>.md
#   trait_affected:  which lived trait was pushed
#   drift_amount:    how much it shifted (negative = worsened)
#   since_date:      in-world date, format: YYYY-MM-DD
wounds: []

# Positive transformations. Same structure as wounds.
# Empty list [] at creation. Populated by the Soul Drift Engine.
growth: []

# 1–2 sentences describing the NPC's current emotional posture.
# Written from an outside observer's perspective.
# Updated every simulation step by the Soul Drift Engine.
current_state: |
  [Describe the NPC's current emotional posture here. Write as an
  outside observer would describe them. Be specific to their actual
  trait values.]
```
