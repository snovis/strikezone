# Claude Project Memory — Cheddar Bob / Grapple Engine

## Project Overview

Building **Cheddar Bob** — a baseball tabletop game using the **Grapple Engine**, a two-dimensional non-transitive resolution system. Rebuilt from first principles to understand and validate the core mechanics.

**Current versions:**
- **v5.2** — Strategy only (RPS → +2 modifier)
- **v5.3** — Strategy + Stance (RPS + location commitment)

See `docs/grapple-engine.md` for design philosophy.
See `docs/tuning-analysis.md` for simulation results.

## Current State (as of 2024-12-26)

### COMPLETE: Full Game Simulation Working

The engine now simulates complete games. Playtest rules are ready for human testing.

### Completed Modules

1. **Dice module** (`src/dice.ts`)
   - `roll(sides)`, `roll1d6()`, `roll2d6()`, `sum2d6()`
   - `setSeed()` / `resetRandom()` — reproducible vs random

2. **Strategy module** (`src/strategy.ts`)
   - Symmetric RPS model: power > balance > finesse > power
   - `resolve(a, b, set)` → 'win' | 'lose' | 'tie'
   - Winner gets +2 modifier

3. **Stance module** (`src/stance.ts`)
   - Asymmetric reader/actor model
   - Axes: vertical (up/down), horizontal (in/out)
   - Match = batter +1, Fooled = pitcher +1, Miss = no modifier
   - Probabilities: 25% / 25% / 50%

4. **Commit module** (`src/commit.ts`)
   - Combines strategy + stance → per-player modifiers

5. **Battle module** (`src/battle.ts`)
   - Both roll 2d6 + modifiers, higher wins
   - Tier by WINNING ROLL VALUE: ≤6 weak, 7-9 solid, 10+ strong
   - `enumerateBattles()` for exact probability analysis

6. **Result module** (`src/result.ts`) ✨ NEW
   - Two-roll outcome system (battle tier + result tier)
   - Position = battleOffset + resultOffset (0-4)
   - Critical rolls: Snake Eyes (2) = worst, Boxcars (12) = best
   - Batter ladder: OUT → OUT → 1B → 2B → HR
   - Pitcher ladder: BB → O-RA → O-RC → O-RF → DP
   - Configurable result sets (1/2/3 walk variants for testing)

7. **Game module** (`src/game.ts`) ✨ NEW
   - Full at-bat simulation: strategy → stance → battle → result
   - Runner advancement, scoring, innings
   - `simulateGame()` — single game with optional verbose output
   - `runSimulation()` — aggregate stats across many games
   - Configurable: innings, strategy bonus, stance on/off, stance bonus

8. **Player module** (`src/player.ts`)
   - `cpuChooseStrategy()`, `cpuChooseStance()` — random CPU choices

### Playtest Rules ✨ NEW

- `docs/playtest-rules.html` — **Cheddar Bob v5.2** (strategy only)
- `docs/playtest-rules-v53.html` — **Cheddar Bob v5.3** (strategy + stance)

Both are print-friendly 1-pagers ready for human playtesting.

## Simulation Results

### v5.2 (Strategy Only, +2 on win)
```
Avg runs/game: 5.37 (2.68 per team)
AVG: .365  |  OBP: .394  |  HR: 4.9%
Ties: 15.1% (in 3-inning games)
```

### v5.3 (Strategy +2, Stance +1)
```
Avg runs/game: 5.74 (2.87 per team)
AVG: .378  |  OBP: .406  |  HR: 5.0%
Ties: 16.2% (in 3-inning games)
```

**Verdict:** Both balanced. Adding stance increases scoring ~7%, slightly favors batters.

## The Grapple Engine Core Loop

```
1. STRATEGY  — Both throw RPS. Winner gets +2.
2. STANCE    — Both pick location (UP/DOWN/IN/OUT). Match=batter+1, Fooled=pitcher+1.
3. BATTLE    — Both roll 2d6 + modifiers. Higher wins. Tier by winner's roll.
4. RESULT    — Winner rolls again. Cross-reference battle tier × result tier.
```

## Result Tables

**Batter wins battle → rolls for:**
```
         │ Weak(≤6) │ Solid(7-9) │ Strong(10+)
─────────┼──────────┼────────────┼────────────
Weak     │ OUT      │ OUT        │ 1B
Solid    │ OUT      │ 1B         │ 2B
Strong   │ 1B       │ 2B         │ HR
```

**Pitcher wins battle → rolls for:**
```
         │ Weak(≤6) │ Solid(7-9) │ Strong(10+)
─────────┼──────────┼────────────┼────────────
Weak     │ BB       │ O-RA       │ O-RC
Solid    │ O-RA     │ O-RC       │ O-RF
Strong   │ O-RC     │ O-RF       │ DP
```

**Criticals override everything:**
- Snake Eyes (2) → position 0 (OUT for batter, BB for pitcher)
- Boxcars (12) → position 4 (HR for batter, DP for pitcher)

## File Structure

```
strikezone-grapple-engine/
├── src/
│   ├── dice.ts          # Core randomness
│   ├── strategy.ts      # Symmetric RPS rules
│   ├── stance.ts        # Asymmetric reader/actor rules
│   ├── commit.ts        # Combines commitments → modifiers
│   ├── battle.ts        # Dice + modifiers → winner + tier
│   ├── result.ts        # Winner + tier + roll → outcome ✨
│   ├── game.ts          # Full game simulation ✨
│   ├── player.ts        # CPU player behavior
│   ├── test-dice.ts
│   ├── test-strategy.ts
│   ├── test-stance.ts
│   ├── test-commit.ts
│   ├── test-battle.ts
│   ├── test-result.ts   # ✨
│   └── test-game.ts     # ✨
├── docs/
│   ├── grapple-engine.md
│   ├── tuning-analysis.md
│   ├── bush-league-quickref.html
│   ├── playtest-rules.html      # v5.2 ✨
│   ├── playtest-rules.md        # v5.2 ✨
│   ├── playtest-rules-v53.html  # v5.3 ✨
│   └── playtest-rules-v53.md    # v5.3 ✨
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Running Tests

```bash
# Result module
npm run test:result -- --table           # Show 2D result tables
npm run test:result -- --enumerate       # Exact outcome probabilities
npm run test:result -- --compare         # Compare pitcher walk variants

# Game simulation
npm run test:game -- --games 1000        # Run 1000 games
npm run test:game -- --single --verbose  # Play-by-play of one game
npm run test:game -- --compare           # Compare with/without stance
npm run test:game -- --stance            # Enable stance commitment
npm run test:game -- --innings 9         # 9-inning games

# Earlier modules
npm run test:dice -- --rolls 1000 --type 2d6 --histogram
npm run test:strategy -- --matchups 1000
npm run test:stance -- --matchups 1000
npm run test:battle -- --enumerate
npm run test:battle -- --compare
```

## Next Steps / Future Tuning

1. **Playtest feedback** — Son testing with friends over weekend
2. **Pitcher walk balance** — Should pitcher have 2 walk boxes instead of 1?
3. **Modifier tuning** — Is +2/+1 the right split? Try +1/+1 or +2/+2?
4. **O-RA / O-RC / O-RF mechanics** — Runner advancement on outs needs refinement
5. **Extra innings** — Handle ties in game simulation
6. **Player cards** — Add batter/pitcher stats that modify rolls

## Key Insights

### Small Samples Lie
At N=10, you see 20/10/70 instead of 25/25/50. Human playtests are small samples. The simulator reveals true probabilities.

### Modifier Structure Matters
Same net advantage (+2), different outcomes:
- +2/0 → more Strong tier wins (54.7%)
- +1/-1 → more Weak tier wins (36.5% strong)

Tier is based on winning roll VALUE, not margin.

### Winner Can Still Lose
The result tables have built-in drama:
- Batter wins battle but rolls Snake Eyes → OUT
- Pitcher wins battle but rolls poorly → walks the batter

## User Preferences

- Explain code clearly — user is learning TypeScript
- Show full console output in responses
- Go slow, understand each piece before moving on
- Commit frequently
- **Hypothesis before experiment**: Discuss expected outcomes before running tests
- **Test at multiple scales**: 10, 100, 1000 to see variance vs convergence

## Git Info

- Branch: `grapple-engine`
- Remote: `origin/grapple-engine`
- Latest commit: "Add result module and game simulation for Cheddar Bob v5.2/v5.3"
