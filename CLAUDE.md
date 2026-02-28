# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # Type-check only (tsc --noEmit), no test runner configured
npm run preview    # Preview production build
```

Requires `GEMINI_API_KEY` set in `.env.local`.

## Architecture

This is a single-page React + Three.js WebGL app ("Skyrim: Tundra Echoes") with no routing, no backend, and no state management library.

**Entry:** `index.html` → `src/main.tsx` → `src/App.tsx`

**`src/App.tsx`** is the entire application. It has three parts:
1. **`Overlay` component** — fixed HUD with title, controls hint, atmosphere description, era display.
2. **`InfoModal` component** — animated modal (Framer Motion `AnimatePresence`) with lore text and stat cards.
3. **`App` default export** — mounts a Three.js scene inside a `useEffect` on a `containerRef` div. All 3D scene logic lives here: scene setup, lighting, ground, character (Dragonborn), NPCs, trees, roads, Nordic buildings/towers, temples, keyboard input, and the animation loop.

**`src/sceneConfig.json`** is the single source of truth for all scene parameters:
- `theme` — UI text (title, subtitle, era, atmosphere)
- `infoModal` — modal text and stat cards
- `scene` — 3D parameters (citySize, buildingCount, treeCount, npcCount, sky/fog/ground colors, lighting)
- `worldState.landmarks` — typed landmark objects (`type: "temple"`) with position and color
- `worldState.roads` — road segment definitions (start/end vectors, width)
- `materials` — hex colors for character parts, buildings, and environment
- `vignette`, `particles` — CSS overlay parameters

**Icon mapping:** Lucide icons used in `InfoModal` stat cards are resolved at runtime via `IconMap` in `App.tsx`. When adding a new stat icon in `sceneConfig.json`, add the corresponding Lucide import and `IconMap` entry.

**Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin). Custom fonts (Cinzel, Inter, Playfair Display) and the `glass-panel` utility class are defined in `src/index.css`. The `@` alias resolves to the project root.

**Controls:** WASD + arrow keys. `A`/`D` rotate the warrior; `W`/`S` move forward/backward. The camera follows with `lerp`.

**To add world content:** edit `sceneConfig.json` — add entries to `worldState.landmarks` or `worldState.roads`. New landmark types require a corresponding `create*` function in `App.tsx` and a dispatch in the `landmarks.forEach` block.
