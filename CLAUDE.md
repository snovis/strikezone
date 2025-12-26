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

### Completed Modules

1. **Dice module** (`src/dice.ts`)
   - `roll(sides)` — core roller, works with any die type
   - `roll1d6()`, `roll2d6()`, `sum2d6()` — composable helpers
   - `setSeed()` / `resetRandom()` — toggle reproducible vs random

2. **Strategy module** (`src/strategy.ts`)
   - Defines non-transitive relationships (who beats who)
   - `StrategySet` interface: `{ choices: string[], beats: Record<string, string[]> }`
   - `resolve(a, b, set)` — returns 'win' | 'lose' | 'tie'
   - Default set: fire > grass > water > fire
   - Baseball set: power > balance, finesse > power, balance > finesse

3. **Player module** (`src/player.ts`)
   - Separates player BEHAVIOR from game RULES
   - `randomChoice(options)` — pick randomly from array
   - `cpuChooseStrategy(set)` — CPU picks random strategy
   - Placeholder for future human input

4. **Test harnesses**
   - `test-dice.ts` — roll dice, show histograms, test seeding
   - `test-strategy.ts` — simulate matchups, verify distributions

### Verified
- 1d6 produces flat ~16.67% distribution
- 2d6 produces bell curve, 7 at peak (~16.67%)
- Seeded rolls are reproducible
- Strategy module ready for testing (not yet run)

## Architecture Decisions

**Separation of concerns:**
- `dice.ts` — randomness (no game logic)
- `strategy.ts` — game rules (no player behavior, no randomness)
- `player.ts` — player behavior (uses dice for CPU randomness)

**Why this matters:** Strategy module is pure — it just answers "given two choices, who wins?" Player module decides HOW choices are made.

## Next Steps

1. **Test strategy module** — verify 33/33/33 win/lose/tie distribution
2. **Location commitment** — second modifier layer (see below)
3. **Modifiers** (REVEAL phase) — calculate advantage from matchups
4. **Battle roll** — who wins, at what tier (weak/solid/strong)
5. **Result tables** — map (winner, tier, roll) → outcome
6. **Full at-bat simulation** — chain it all together

## Future: Location Commitment

A second modifier layer where **player order matters** (unlike strategy):
- 4 choices: up / down / left / right
- **Match exactly**: Player 1 (batter) wins — "I read you"
- **Same axis, opposite**: Player 2 (pitcher) wins — "I fooled you"
- **Different axis**: Neutral — no advantage

Key difference from strategy: **asymmetric** — who you are (batter vs pitcher) affects the outcome.

## Key TypeScript Concepts Learned

User comes from C background. Key concepts explained:

1. **`const` in loops** — each iteration creates new scope (JS quirk)
2. **`??` (nullish coalescing)** — fallback only for null/undefined, not falsy
3. **`?.` (optional chaining)** — stop and return undefined if null/undefined
4. **`Map<K, V>`** — typed key-value store, can use any type as key
5. **`Record<K, V>`** — syntax sugar for plain object with typed keys/values
6. **Generics `<T>`** — parameterized types (like C++ templates)
7. **`.includes()`** — array method to check if element exists

## User Preferences

- Explain code clearly — user is learning TypeScript
- Show full console output in responses (their environment hides tool results)
- Use `??` not `||` for clearer intent
- Go slow, understand each piece before moving on
- Commit frequently
- Clean separation of concerns (rules vs behavior)

## File Structure

```
strikezone-grapple-engine/
├── src/
│   ├── dice.ts          # Core randomness
│   ├── strategy.ts      # Game rules (pure)
│   ├── player.ts        # Player behavior
│   ├── test-dice.ts     # Dice test harness
│   └── test-strategy.ts # Strategy test harness
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
# Dice tests
npm run test:dice -- --rolls 10 --type 2d6
npm run test:dice -- --rolls 1000 --type 2d6 --histogram
npm run test:dice -- --rolls 5 --type 2d6 --seed test123

# Strategy tests
npm run test:strategy -- --matchups 1000
npm run test:strategy -- --matchups 10000 --seed test123
```

## The Grapple Engine Core Loop

From `docs/grapple-engine.md`:

1. **COMMIT** — Both players secretly select approach (non-transitive set)
2. **REVEAL** — Compare selections, determine modifiers
3. **BATTLE** — Both roll dice + modifiers, higher wins, determine tier
4. **RESOLVE** — Winner rolls on result table based on tier

**Vertical non-transitivity:** Even when you WIN control, the result might favor opponent. Even when you LOSE, the result table has outcomes that help you.

## Git Info

- Branch: `grapple-engine`
- Remote: `origin/grapple-engine`
- Based off: `main`
