# Claude Project Memory — Cheddar Bob / Grapple Engine

## Project Overview

Building **Cheddar Bob** — a baseball tabletop game using the **Grapple Engine**, a two-dimensional non-transitive resolution system.

**Current versions:**
- **v5.2** — Strategy only (RPS → +2 modifier)
- **v5.3** — Strategy + Stance (RPS + location commitment)

See `docs/grapple-engine.md` for design philosophy.
See `docs/tuning-analysis.md` for simulation results and analysis.

## The Core Loop

```
COMMIT  →  SHOW  →  BATTLE  →  RESULT
  ↓         ↓         ↓          ↓
 Pick      Mods     Winner     Outcome

1. COMMIT  — Both secretly pick strategy (RPS) + stance (location).
2. SHOW    — Reveal choices. Calculate modifiers. RPS winner +2, stance winner +1.
3. BATTLE  — Both roll 2d6 + modifiers. Higher wins. Tier by winner's roll value.
4. RESULT  — Winner rolls again. Cross-reference battle tier × result tier.
```

Four phases. Four syllables. Every at-bat is **contested** — neither player is passive.

## Key Design Insight: The Poker Effect

The COMMIT/SHOW mechanism is what makes this a game, not just dice rolling.

**The mechanics are balanced** — batter and pitcher each win ~45% of battles.

**But skill creates edge** — like poker, better reads win over time:

| Skill Type | Fair Rate | With Skill | Edge Gained |
|------------|-----------|------------|-------------|
| RPS reading | 33% wins | 50% wins | +14% battle edge |
| Stance reading | 25% | 35% | +4% battle edge |

This doesn't unbalance the game — it rewards the better player while keeping every at-bat contested.

## The 2d6 Curve Shift

Modifiers slide the bell curve up. Each +1 moves the peak:

| Mod | Peak | Weak (≤6) | Solid (7-9) | Strong (10+) |
|-----|------|-----------|-------------|--------------|
| +0 | 7 | 41.7% | 41.7% | 16.7% |
| +1 | 8 | 27.8% | 44.4% | 27.8% |
| +2 | 9 | 16.7% | 41.7% | 41.7% |
| +3 | 10 | 8.3% | 33.3% | 58.3% |

Winning the SHOW phase = relocating your probability curve into Strong territory.

Run `npm run show:curve` to visualize.

## Stance Modifier Structure

Winner-only (+1/0) vs Symmetric (+1/-1):

| Mode | Strong Tier | Game Feel |
|------|-------------|-----------|
| Winner-only (+1/0) | 52.6% | More dramatic — HRs, Ks |
| Symmetric (+1/-1) | 49.3% | More grinding — tighter games |

**Current choice:** Winner-only (+1/0) for more exciting outcomes.

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

**Criticals:** Snake Eyes (2) = worst outcome, Boxcars (12) = best outcome

## Critical Battle Rolls (Override Normal Flow)

During the BATTLE phase, extreme dice rolls override normal resolution:

| Roll | Batter Effect | Pitcher Effect |
|------|---------------|----------------|
| **Boxcars (12)** | Auto HR | Auto DP (2 outs if runners, 1 otherwise) |
| **Snake Eyes (2)** | Auto Out | Auto Walk |

These create drama: "I rolled boxcars, automatic home run!" or "Snake eyes, walked him."

## R3 Pressure Mechanic (Optional)

When a runner occupies 3rd base, the pitcher gets careful. Batter's result ladder shifts:

```
Normal:       OUT → OUT → 1B → 2B → HR
R3 Pressure:  OUT → BB  → 1B → 2B → HR  (one out becomes walk)
```

**Impact:** +10% more scoring, walks quadruple (0.9% → 3.8% of runs).

Enable with `--r3pressure` flag.

## Running Tests

```bash
# Battle analysis
npm run test:battle -- --commit                 # Full commit→battle analysis
npm run test:battle -- --commit --no-stance     # Strategy only (v5.2)
npm run test:battle -- --commit --compare       # Compare configurations
npm run test:battle -- --skill                  # Skill advantage analysis
npm run test:battle -- --stance-compare         # +1/0 vs +1/-1 stance modes

# Visualizations
npm run show:curve                              # 2d6 distribution shift

# Game simulation
npm run test:game -- --games 1000               # Run 1000 games
npm run test:game -- --single --verbose         # Play-by-play of one game
npm run test:game -- --r3pressure               # Enable R3 pressure mechanic
npm run test:game -- --compare-r3               # Compare with/without R3 pressure

# Result tables
npm run test:result -- --table                  # Show 2D result tables
npm run test:result -- --enumerate              # Exact outcome probabilities
```

## File Structure

```
src/
├── dice.ts, strategy.ts, stance.ts, commit.ts  # Core mechanics
├── battle.ts, result.ts, game.ts, player.ts    # Game flow
├── test-*.ts                                   # Test harnesses
└── show-curve.ts                               # 2d6 visualization

docs/
├── grapple-engine.md                           # Design philosophy
├── tuning-analysis.md                          # All simulation data
├── playtest-rules.html                         # v5.2 rules (1-pager)
└── playtest-rules-v53.html                     # v5.3 rules (1-pager)
```

## Simulation Results (CPU vs CPU)

| Version | Runs/Game | AVG | OBP | HR Rate |
|---------|-----------|-----|-----|---------|
| v5.2 (Strategy +2) | 5.97 | .351 | .405 | 7.0% |
| v5.2 + R3 Pressure | 6.60 | .349 | .419 | 7.2% |

R3 Pressure adds ~10% more scoring via manufactured runs (walks quadruple).

## Next Steps

1. Playtest feedback from human testing
2. Bunt mechanic exploration (see tuning-analysis.md)
3. Option B for R3 pressure (6-position ladder, HR via boxcars only)
4. Player cards with stat modifiers

## User Preferences

- Explain code clearly — user is learning TypeScript
- Hypothesis before experiment
- Test at multiple scales: 10, 100, 1000
- Commit frequently

## Git Info

- Branch: `grapple-engine`
- Remote: `origin/grapple-engine`
