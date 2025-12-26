# Claude Project Memory — Grapple Engine

## Project Overview

Building the **Grapple Engine** — a two-dimensional non-transitive resolution system for tabletop games. Originally derived from "Cheddar Bob" baseball simulation, now being rebuilt from first principles to understand and validate the core mechanics.

See `docs/grapple-engine.md` for the full design philosophy.
See `docs/tuning-analysis.md` for simulation results and tuning decisions.

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
   - `explainResult(a, b, set)` — human-readable explanation
   - `showRules(set)` — displays Sheldon-style explanations
   - Baseball set: power > balance, finesse > power, balance > finesse

3. **Stance module** (`src/stance.ts`)
   - Asymmetric commitment where player ROLES matter (reader vs actor)
   - `StanceSet` interface with `name`, `roles`, `axes`, `explanations`
   - `resolve(readerChoice, actorChoice, set)` — returns 'reader' | 'actor' | 'miss'
   - `explainResult(readerChoice, actorChoice, set)` — human-readable explanation
   - Baseball set: up/down (vertical), in/out (horizontal)
   - Match = reader anticipated (25%), Fooled = actor deceived (25%), Miss = neutral (50%)

4. **Commit module** (`src/commit.ts`)
   - Orchestrates COMMIT and REVEAL phases
   - `resolveCommit(player1, player2, strategySet, stanceSet, modifiers, verbose)`
   - Combines strategy + stance → per-player modifiers
   - `ModifierConfig` allows tuning modifier values
   - Default: strategy win=+1/lose=-1, stance reader=+1/actor=-1

5. **Battle module** (`src/battle.ts`)
   - `rollBattle(p1mod, p2mod, tierConfig, verbose)` — random simulation
   - `enumerateBattles(p1mod, p2mod, tierConfig)` — exact probabilities (1,296 combinations)
   - Tier based on WINNING ROLL VALUE (not margin):
     - Weak: roll ≤6, Solid: 7-9, Strong: 10+
   - "12 beats 11" = STRONG victory (epic battle of titans)
   - "4 beats 3" = WEAK victory (slapfight)

6. **Player module** (`src/player.ts`)
   - Separates player BEHAVIOR from game RULES
   - `randomChoice(options)` — pick randomly from array
   - `cpuChooseStrategy(set)` — CPU picks random strategy
   - `cpuChooseStance(set)` — CPU picks random stance

7. **Test harnesses**
   - `test-dice.ts` — roll dice, show histograms, test seeding
   - `test-strategy.ts` — simulate strategy matchups, verify 33/33/33
   - `test-stance.ts` — simulate stance matchups, verify 25/25/50
   - `test-commit.ts` — simulate full commit phase with modifiers
   - `test-battle.ts` — simulation, enumeration, and comparison modes

### Verified
- 1d6 produces flat ~16.67% distribution
- 2d6 produces bell curve, 7 at peak (~16.67%)
- Seeded rolls are reproducible
- Strategy: 33/33/33 win/lose/tie at N=10000
- Stance: 25/25/50 reader/actor/miss at N=1000
- Battle baseline: 44.4/44.4/11.3 P1/P2/tie, tiers 14.8/52/33.2 weak/solid/strong

## KEY DISCOVERY: Modifier Structure Matters

From battle enumeration (see `docs/tuning-analysis.md`):

**Same net advantage (+2), different tier distribution:**

| Scenario | Net Diff | P1 Win% | Weak% | Strong% |
|----------|----------|---------|-------|---------|
| +2/0 | +2 | 66.4 | 5.5 | **54.7** |
| +1/-1 | +2 | 66.4 | 13.7 | **36.5** |

**Why?** Tier is based on winning roll VALUE. +2/0 pushes P1 into 4-14 range (more 10+ rolls). +1/-1 keeps both players in normal range.

**Current leaning:** Symmetric (+1/-1) modifiers — preserves drama in tier outcomes. Commit phase decides WHO wins, dice decide HOW epic.

## Architecture Decisions

**Separation of concerns:**
- `dice.ts` — randomness (no game logic)
- `strategy.ts` — symmetric game rules, RPS model
- `stance.ts` — asymmetric game rules, reader/actor model
- `commit.ts` — combines strategy + stance into modifiers
- `battle.ts` — dice + modifiers → winner + tier
- `player.ts` — player behavior (uses dice for CPU randomness)

**Two commitment types:**
- **Strategy** (symmetric): What you pick matters, not who you are. Same choice = tie.
- **Stance** (asymmetric): Who you are (reader vs actor) matters. Same choice = reader wins.

**Roll-value tiers:** Tier based on winning roll, not margin. Rewards rolling well, not just winning by a lot.

## Next Steps

1. **Result tables** — map (winner, tier, roll) → outcome
2. **Full at-bat simulation** — chain commit → battle → result
3. **More tuning exploration** — different modifier configs, tier thresholds

## File Structure

```
strikezone-grapple-engine/
├── src/
│   ├── dice.ts          # Core randomness
│   ├── strategy.ts      # Symmetric rules (RPS model)
│   ├── stance.ts        # Asymmetric rules (reader/actor)
│   ├── commit.ts        # Combines commitments → modifiers
│   ├── battle.ts        # Dice + modifiers → winner + tier
│   ├── player.ts        # Player behavior
│   ├── test-dice.ts     # Dice test harness
│   ├── test-strategy.ts # Strategy test harness
│   ├── test-stance.ts   # Stance test harness
│   ├── test-commit.ts   # Commit test harness
│   └── test-battle.ts   # Battle test harness (enum + compare)
├── docs/
│   ├── grapple-engine.md    # Design philosophy
│   ├── tuning-analysis.md   # Simulation results & decisions
│   └── bush-league-quickref.html
├── dist/                # Compiled JS (generated)
├── package.json
├── tsconfig.json
└── CLAUDE.md            # This file
```

## Running Tests

```bash
# Dice tests
npm run test:dice -- --rolls 1000 --type 2d6 --histogram

# Strategy tests (expect 33/33/33)
npm run test:strategy -- --matchups 1000
npm run test:strategy -- --set elements  # fire/grass/water

# Stance tests (expect 25/25/50)
npm run test:stance -- --matchups 1000

# Commit tests (9 outcome combinations)
npm run test:commit -- --matchups 1000
npm run test:commit -- --matchups 1 --verbose  # trace single at-bat

# Battle tests
npm run test:battle -- --enumerate              # exact probabilities
npm run test:battle -- --compare                # compare modifier configs
npm run test:battle -- --enumerate --p1mod 2 --p2mod -1
npm run test:battle -- --battles 100 --seed test123 --verbose
```

## Key Insight: Small Samples Lie

At N=10, stance showed 20/10/70 instead of 25/25/50. Human playtests are small samples that become "lived experience" — we trust them more than math. The simulator helps us see past the noise.

**Always test at multiple scales:** 10, 100, 1000 to see variance vs convergence.

## User Preferences

- Explain code clearly — user is learning TypeScript
- Show full console output in responses
- Go slow, understand each piece before moving on
- Commit frequently
- **Before running tests**: Discuss expected outcomes first (hypothesis before experiment)
- **Test at multiple scales**: Run 10, 100, 1000 to see variance/convergence

## The Grapple Engine Core Loop

1. **COMMIT** — Both players secretly select strategy + stance
2. **REVEAL** — Compare selections, determine modifiers per player
3. **BATTLE** — Both roll 2d6 + modifiers, higher wins, determine tier by winning roll
4. **RESOLVE** — Winner rolls on result table based on tier (NOT YET BUILT)

## Git Info

- Branch: `grapple-engine`
- Remote: `origin/grapple-engine`
- Based off: `main`
