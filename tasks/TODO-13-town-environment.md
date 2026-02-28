# TODO-13 · Town Environment as a Living Entity

**Phase:** 3 — World Time Simulation (addendum)
**Status:** `open`
**Depends on:** TODO-01 (soul schema — environment uses the same two-layer structure), TODO-03 (memory schema), TODO-05 (calendar)
**Depended on by:** TODO-06 (advance_world calls advance_environment), TODO-07 (state snapshot includes town condition), TODO-09 (dialogue references town state), TODO-11 (NPC loader handles town as an NPC), TODO-12 (file structure)

---

## Goal

Model the town itself as a first-class living entity — one that changes over time just as NPCs do, shapes NPC dialogue and behavior, and can be profoundly affected by both gradual drift and catastrophic events. The town's physical and social condition is always present in every interaction.

---

## Output

- `world/town/environment/town.md` — the town's soul file
- `engine/advance_environment.ts` — the environment simulation step
- `docs/environment-schema.md` — schema specification
- `docs/templates/environment.md` — blank template

---

## Design Principle

The town is treated like an NPC with `npc_id: "town"`. It has:
- A **core identity** — what kind of town it fundamentally is (trade hub, frontier outpost, agricultural village, etc.)
- **Lived state** — its current physical condition, prosperity, and social atmosphere, which drift over time
- **Memories** — significant events etched into its history (invasions, plagues, great harvests, famous visitors)

NPC dialogue naturally references the town's state. A prosperous, expanded town changes how the innkeeper talks. A town rebuilding from an invasion changes *everything*.

---

## Details

### `town.md` Structure

Follows the same two-layer soul schema (TODO-01), adapted for a place rather than a person:

#### Core Identity (`core:`) · *Immutable*

```yaml
core:
  archetype: "agricultural village"   # trade-hub | frontier-outpost | fishing-village | etc.
  founding_story: string              # 1–2 paragraphs of origin lore
  character: string                   # e.g. "tight-knit and suspicious of outsiders"
  geographic_traits: string[]         # e.g. ["river access", "forest border", "hill elevation"]
  cultural_values: string[]           # e.g. ["self-reliance", "hospitality", "tradition"]
```

#### Lived State (`lived:`) · *Mutable*

```yaml
lived:
  population: integer                 # tracked explicitly; changes with births, deaths, migration
  prosperity: float                   # 0.0–1.0; drives economic drift in NPCs nearby
  infrastructure:
    condition: enum                   # thriving | stable | declining | damaged | ruined
    notable_buildings: string[]       # current structures; gains/loses entries over time
    recent_construction: string[]     # new builds since last simulation step
  social_atmosphere: float            # 0.0 (fearful/oppressed) to 1.0 (joyful/united)
  safety: float                       # 0.0 (lawless) to 1.0 (well-protected)
  current_state: string               # narrative summary of town's current condition
  wounds: []                          # same structure as NPC wounds — scars from disasters
  growth: []                          # positive developments — same structure as NPC growth
```

---

### Gradual Environmental Drift (High Probability)

These happen almost every simulation step at low magnitude — the quiet accumulation of progress or decline:

| Event | Trigger | Effect |
|---|---|---|
| **Population growth** | Every 6 months, if `prosperity > 0.5` | `population += random(2, 8)` |
| **New building** | Every 12 months, if `prosperity > 0.6` | Add to `notable_buildings[]`, write environmental memory |
| **Town expansion** | Every 24 months, if population grown >20% | Update `current_state`, generate expansion memory, write rumors to nearby NPCs |
| **Prosperity drift** | Every 3 months | `±0.03` based on `NPC economic_status` average across residents |
| **Road improvement** | Every 18 months | Add to `infrastructure` description if `prosperity > 0.65` |
| **Population decline** | Every 6 months, if `prosperity < 0.35` | `population -= random(1, 5)` via migration |

---

### Catastrophic Events (Low Probability)

Rare, world-altering events that leave permanent marks. These are the moments that define the town for a generation:

| Event | Base Probability (per advance step) | Conditions | Effect |
|---|---|---|---|
| **Plague** | 0.5% per advance | None | Kills 20–60% of population; `social_atmosphere` → 0.1; `safety` → 0.2; writes mass death memories to all surviving NPCs; adds to obituaries; `infrastructure.condition` → damaged |
| **Invasion / Raid** | 1% per advance | `safety < 0.5` increases probability to 3% | Kills 5–30% of population; destroys some buildings; `infrastructure.condition` → damaged or ruined; all NPCs get high-weight fear memories |
| **Great Fire** | 0.8% per advance | None | Destroys notable buildings; `prosperity` drops sharply; recovery begins next step |
| **Flood / Natural Disaster** | 1.2% per advance | Geographic trait `"river access"` or `"low elevation"` increases to 2.5% | Damages infrastructure; population loss; recovery arc begins |
| **Famine** | 0.7% per advance | `prosperity < 0.3` | Population loss; `social_atmosphere` crashes; NPCs with `family` as top value are most affected |
| **Founding of a new district** | Gradual → milestone | Population > 300 + prosperity > 0.75 sustained | Major expansion; new building types available; town `archetype` may evolve |

**Important:** Catastrophic events must:
1. Write an environmental memory (`world/town/environment/memories/<date>_<slug>.md`)
2. Write high-weight memories to ALL living NPCs who were present — shaped by their `core.values[]`
3. Apply soul drift to all affected NPCs via `drift_soul.ts`
4. Be referenced in `state.md` under "What People Are Saying"
5. Leave a `lived.wounds[]` entry on `town.md` — disasters scar a place

---

### Recovery Arcs

Catastrophic events don't resolve immediately. Define multi-step recovery:

| Disaster | Recovery Time | Recovery Steps |
|---|---|---|
| Plague | 24–36 months | Population slowly climbs; `social_atmosphere` recovers at +0.05/step |
| Invasion | 12–24 months | Buildings rebuilt; `safety` recovers if guards remain; `fear` trait drifts down |
| Fire | 6–12 months | Buildings replaced; `prosperity` recovers if economy intact |
| Famine | 6–18 months | Population stabilizes; `social_atmosphere` recovers tied to `prosperity` |

Recovery is tracked by adding a recovery arc entry to `lived.growth[]` with a `target_date` — the simulation engine checks whether recovery is still in progress each step.

---

### `advance_environment.ts`

Called by `advance_world.ts` as part of each simulation step.

**Process:**
1. Roll for gradual drift events (population, prosperity, construction)
2. Roll for catastrophic events — check conditions; if triggered, execute the event
3. If a recovery arc is in progress, advance it
4. Update `lived.current_state` with LLM-generated narrative
5. Write environmental memories for notable events
6. Cascade to NPCs: write memories for any high-impact events

**Town's current state prompt:**
```
You are describing the current physical and social condition of a town.

Town type: <core.archetype>
Town character: <core.character>
Current condition: infrastructure <condition>, prosperity <X>, social atmosphere <Y>, safety <Z>
Population: <number>
Recent notable events: <list from memories this step>
Active recovery arcs: <list if any>

Write 2–3 sentences describing what the town feels like right now.
Write it as what a returning traveler would notice first — sensory, specific, honest.
```

---

### Town State in NPC Dialogue

The town's `lived.current_state` is included in every NPC's dialogue context (via TODO-09). This means:
- An innkeeper in a plague-recovering town speaks with grief baked in, without needing explicit scripting
- A guard captain in a town that was recently invaded is wary about strangers
- A farmer in a thriving, expanding town has a different energy than one in a declining village

This propagation is handled by `load_npc.ts` (TODO-11) — town state is always part of the world context injected into dialogue prompts.

---

### Town's Reputation File

The town also tracks the player's relationship with it — their actions shape how the town as a whole perceives them:
- Helping defend against invasion: `town.reputation/player.md` disposition moves toward `friendly`
- Burning buildings or causing harm: moves toward `hostile`
- This feeds into overall NPC disposition calculations as a soft modifier

---

## Acceptance Criteria

- [ ] `world/town/environment/town.md` is created with full core + lived schema
- [ ] `engine/advance_environment.ts` implements gradual drift rolls (all 6 gradual events)
- [ ] Catastrophic event rolls are implemented with correct base probabilities and condition modifiers
- [ ] At least 5 catastrophic event types are fully implemented
- [ ] Catastrophic events write memories to all living NPCs
- [ ] Recovery arcs are tracked and resolved correctly across simulation steps
- [ ] `lived.current_state` is LLM-updated each step
- [ ] Town state is consumed by `load_npc.ts` as world context for every NPC dialogue
- [ ] `docs/environment-schema.md` is complete and consistent with `docs/soul-schema.md`
- [ ] At least one integration test: trigger a plague, verify population drops, memories written to NPCs, recovery arc begins
