# TODO-05 · Design the In-World Calendar System

**Phase:** 3 — World Time Simulation
**Status:** `open`
**Depends on:** none
**Depended on by:** TODO-03 (memory file naming uses in-world dates), TODO-06 (advance_world uses calendar math), TODO-07 (state snapshot tracks current date)

---

## Goal

Define how time works in MindGame. The calendar is not cosmetic — it drives everything: how long an NPC has been alive, how much the world has changed, when memories were formed, and how urgently things need to update.

---

## Output

`docs/calendar.md` — complete calendar specification

---

## Details

### Design Requirements

The calendar must:
- Feel like it belongs in a living world (not just "Month 1, Month 2")
- Support in-world date strings that are human-readable and sortable
- Map clearly to a "months elapsed" integer for simulation math
- Define how real-world quest length translates into in-world time elapsed

---

### Suggested Structure (adapt as fits the world)

Design a calendar with:
- **4 seasons**, each with **3 months** = 12 months per year
- Named months that suggest the world's culture and climate
- **30-day months** for easy math, or define variable lengths with clear documentation
- Named days are optional but add flavor (e.g. "the seventh day of Ashmonth, Year 14")

The calendar should start at **Year 1** — the player's first day in town. Prior history is expressed as negative years or as backstory text, not simulated dates.

**Example structure (rename to fit the world's tone):**
```
Year structure:
  Season of Thaw   → Month 1 (Firstmelt), Month 2 (Greenrise), Month 3 (Bloomtide)
  Season of Heat   → Month 4 (Sundrift), Month 5 (Highburn), Month 6 (Ashmonth)
  Season of Harvest → Month 7 (Goldfall), Month 8 (Reapmoon), Month 9 (Lastlight)
  Season of Dark   → Month 10 (Deepcold), Month 11 (Ironwatch), Month 12 (Stillnight)
```

---

### Date Format

Define a canonical date string format used everywhere (memory files, event log, soul.md, state.md):

**Recommended:** `YYYY-MM-DD` mapped to in-world year, month, day
- e.g. `0001-04-07` = Year 1, Month 4 (Sundrift), Day 7
- Zero-padded for consistent sorting
- This format doubles as the memory file prefix (see TODO-03)

---

### Time Multiplier (Quest Duration → Months Elapsed)

Define the mapping between quest intensity and in-world time passed. This is declared in quest metadata as `duration_months: N`.

| Quest Type | Example | In-World Time |
|---|---|---|
| Local errand | Resolve a dispute in town | 0 months (same day) |
| Short local quest | Investigate something in the woods | 1 month |
| Regional quest | Travel to a nearby settlement | 2–3 months |
| Long expedition | Journey to a distant land | 6–12 months |
| Epic campaign | A campaign across multiple regions | 12–24 months |

Document these as **guidelines, not hard rules** — individual quest designers can set any value.

---

### Life Pacing Against the Calendar

Document how major life events are paced:

| Event | Trigger |
|---|---|
| NPC ages 1 year | Every 12 months elapsed |
| Elderly NPC death check | Every 6 months (random roll, weighted by age) |
| Pregnancy → birth | ~9 months after relationship milestone |
| Child → recruitable adult | At age 18 (tracked in soul.md `age` field) |
| Economic status shift | Check every 3 months |
| Relationship formation/dissolution | Check every 2 months |
| Memory fade check | Every 6 months for memories with `weight < 0.3` |
| Soul drift step | Once per advance_world call, regardless of months elapsed |

---

### Starter Date

Define the game's starting date: `Year 1, Month 1, Day 1` (or a later date if the town has history). This becomes the baseline from which all elapsed time is calculated.

---

## Acceptance Criteria

- [ ] `docs/calendar.md` defines the full year structure with named seasons and months
- [ ] A canonical date string format is defined and documented
- [ ] Quest duration guidelines are documented with examples for each tier
- [ ] Life pacing table documents when each major life event is checked
- [ ] The starting date of the game world is explicitly declared
- [ ] Calendar math is clearly defined: how to compute "months between date A and date B"
