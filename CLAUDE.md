# Claude Project Memory — Grapple Engine

## Project Overview

Building the **Grapple Engine** — a two-dimensional non-transitive resolution system for tabletop games. Originally derived from "Cheddar Bob" baseball simulation, now being rebuilt from first principles to understand and validate the core mechanics.

See `docs/grapple-engine.md` for the full design philosophy.

## Why We Started Fresh

The original simulator (`strikezone-tabletop` branch) reported stats that didn't match playtest reality:
- Simulator: .377 AVG, ~5 runs/game
- Playtests: Very low scoring (1-0, 0-1 games)

Rather than debug complex legacy code, we're rebuilding from scratch — testing each layer before adding the next.

## Current State (as of 2024-12-26)

### Completed
1. **Dice module** (`src/dice.ts`)
   - `roll(sides)` — core roller, works with any die
   - `roll1d6()`, `roll2d6()`, `sum2d6()` — composable helpers
   - `setSeed()` / `resetRandom()` — toggle reproducible vs random

2. **Test harness** (`src/test-dice.ts`)
   - `--rolls N` — number of rolls
   - `--type 1d6|2d6` — dice type
   - `--histogram` — show distribution with expected vs actual %
   - `--seed VALUE` — reproducible rolls

### Verified
- 1d6 produces flat ~16.67% distribution
- 2d6 produces bell curve, 7 at peak (~16.67%)
- Seeded rolls are reproducible

## Next Steps

1. **Strategy selection** (COMMIT phase) — simulate fair random choices from non-transitive sets
2. **Modifiers** (REVEAL phase) — calculate advantage from matchups
3. **Battle roll** — who wins, at what tier (weak/solid/strong)
4. **Result tables** — map (winner, tier, roll) → outcome
5. **Full at-bat simulation** — chain it all together
6. **Game simulation** — innings, outs, scoring

## Key Design Decisions

- **TypeScript** for type safety
- **Composable dice**: `roll(sides)` as foundation
- **Seeded random** via `seedrandom` package for reproducible tests
- **Build incrementally** — test each layer before adding the next

## User Preferences

- Explain code clearly — user is learning TypeScript (comes from C background)
- Show full console output in responses (their environment hides tool results)
- Use `??` (nullish coalescing) not `||` for clearer intent
- Go slow, understand each piece before moving on
- Commit frequently

## File Structure

```
strikezone-grapple-engine/
├── src/
│   ├── dice.ts          # Core dice module
│   └── test-dice.ts     # Test harness
├── docs/
│   ├── grapple-engine.md    # Design philosophy
│   └── bush-league-quickref.html
├── dist/                # Compiled JS (generated)
├── package.json
├── tsconfig.json
└── CLAUDE.md            # This file
```

## Running Tests

```bash
npm run test:dice -- --rolls 10 --type 2d6
npm run test:dice -- --rolls 1000 --type 2d6 --histogram
npm run test:dice -- --rolls 5 --type 2d6 --seed test123
```

## Core Insight

The Grapple Engine has **vertical non-transitivity**: even when you WIN control, the result roll might still favor your opponent. Even when you LOSE control, the result table has outcomes that help you. Both players stay engaged until the final result.

This is what we need to validate through simulation.
