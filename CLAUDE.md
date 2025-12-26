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
   - Symmetric, non-transitive relationships (RPS model)
   - `StrategySet` interface with `name`, `choices`, `beats`, `explanations`
   - `resolve(a, b, set)` — returns 'win' | 'lose' | 'tie'
   - `showRules(set)` — displays Sheldon-style explanations
   - Default set: fire > grass > water > fire
   - Baseball set: power > balance, finesse > power, balance > finesse

3. **Stance module** (`src/stance.ts`)
   - Asymmetric commitment where player ROLES matter (reader vs actor)
   - `StanceSet` interface with `name`, `roles`, `axes`, `explanations`
   - `resolve(readerChoice, actorChoice, set)` — returns 'reader' | 'actor' | 'miss'
   - `showRules(set)` — displays resolution rules
   - Baseball set: up/down (vertical), in/out (horizontal)
   - Match = reader anticipated (25%), Fooled = actor deceived (25%), Miss = neutral (50%)

4. **Player module** (`src/player.ts`)
   - Separates player BEHAVIOR from game RULES
   - `randomChoice(options)` — pick randomly from array
   - `cpuChooseStrategy(set)` — CPU picks random strategy
   - `cpuChooseStance(set)` — CPU picks random stance
   - Placeholder for future human input

5. **Test harnesses**
   - `test-dice.ts` — roll dice, show histograms, test seeding
   - `test-strategy.ts` — simulate strategy matchups, verify 33/33/33 distribution
   - `test-stance.ts` — simulate stance matchups, verify 25/25/50 distribution

### Verified
- 1d6 produces flat ~16.67% distribution
- 2d6 produces bell curve, 7 at peak (~16.67%)
- Seeded rolls are reproducible
- Strategy: 33/33/33 win/lose/tie at N=10000
- Stance: 25/25/50 reader/actor/miss at N=1000

### Key Insight: Small Samples Lie
At N=10, stance showed 20/10/70 instead of 25/25/50. Human playtests are small samples that become "lived experience" — we trust them more than math. The simulator helps us see past the noise.

## Architecture Decisions

**Separation of concerns:**
- `dice.ts` — randomness (no game logic)
- `strategy.ts` — symmetric game rules, RPS model (no player behavior, no randomness)
- `stance.ts` — asymmetric game rules, reader/actor model (no player behavior, no randomness)
- `player.ts` — player behavior (uses dice for CPU randomness)

**Why this matters:** Rule modules are pure — they just answer "given these choices, what's the outcome?" Player module decides HOW choices are made.

**Two commitment types:**
- **Strategy** (symmetric): What you pick matters, not who you are. Same choice = tie.
- **Stance** (asymmetric): Who you are (reader vs actor) matters. Same choice = reader wins.

## Next Steps

1. **Commit phase** — combine strategy + stance choices, resolve to modifiers
2. **Battle roll** — who wins, at what tier (weak/solid/strong)
3. **Result tables** — map (winner, tier, roll) → outcome
4. **Full at-bat simulation** — chain it all together

## The Two Commitment Layers

Both happen in the COMMIT phase. Both produce modifiers for BATTLE.

**Strategy (RPS model):**
- 3 choices: power, finesse, balance
- Symmetric — player order doesn't matter
- Same choice = tie (no modifier)
- Expected: 33% win, 33% lose, 33% tie

**Stance (Reader/Actor model):**
- 4 choices across 2 axes: up/down, in/out
- Asymmetric — reader vs actor roles matter
- Match = reader wins, Opposite = actor wins, Different axis = miss
- Expected: 25% reader, 25% actor, 50% miss

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
- **Before running tests**: Discuss expected outcomes first (hypothesis before experiment)
- **Test at multiple scales**: Run 10, 100, 1000 to see variance/convergence

## File Structure

```
strikezone-grapple-engine/
├── src/
│   ├── dice.ts          # Core randomness
│   ├── strategy.ts      # Symmetric rules (RPS model)
│   ├── stance.ts        # Asymmetric rules (reader/actor)
│   ├── player.ts        # Player behavior
│   ├── test-dice.ts     # Dice test harness
│   ├── test-strategy.ts # Strategy test harness
│   └── test-stance.ts   # Stance test harness
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

# Strategy tests (expect 33/33/33)
npm run test:strategy -- --matchups 1000
npm run test:strategy -- --matchups 10000 --seed test123
npm run test:strategy -- --set elements  # fire/grass/water

# Stance tests (expect 25/25/50)
npm run test:stance -- --matchups 1000
npm run test:stance -- --matchups 10000 --seed test123
npm run test:stance -- --set coin  # heads/tails (50/50/0)
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
