# Cheddar Bob v1.0 — Grapple Engine

## 🔒 LOCKED-IN RULES (v1.0)

This is the stable, playtested version. Experiment on branches, not here.

### The Core Loop

```
COMMIT  →  SHOW  →  BATTLE  →  RESULT
  ↓         ↓         ↓          ↓
 Pick      Mods     Winner     Outcome

1. COMMIT  — Both secretly pick strategy (Power/Balance/Finesse)
2. SHOW    — Reveal choices. Strategy winner gets +2.
3. BATTLE  — Both roll 2d6 + modifiers. Higher wins. Tier by winner's roll.
4. RESULT  — Winner rolls again. Cross-reference battle tier × result tier.
```

### Strategy Triangle

```
        🔨 POWER
        ↗     ↘
    🎯 FINESSE ← ⚖️ BALANCE
```
Arrow points to loser. Winner gets **+2** modifier. Tie = no modifier.

### Tier Thresholds (The Magic Number: 7-9)

| Roll | Tier | Offset |
|------|------|--------|
| ≤6 | Weak | 0 |
| 7-9 | Solid | 1 |
| 10+ | Strong | 2 |

### Result Tables

**BATTER WINS → Outcome Table**
```
         │ Weak(≤6) │ Solid(7-9) │ Strong(10+)
─────────┼──────────┼────────────┼────────────
Weak     │ OUT      │ OUT^       │ 1B
Solid    │ OUT^     │ 1B         │ 2B
Strong   │ 1B       │ 2B         │ HR
```
**^** = BB with runner on 3rd (R3 Pressure)

**PITCHER WINS → Outcome Table**
```
         │ Weak(≤6) │ Solid(7-9) │ Strong(10+)
─────────┼──────────┼────────────┼────────────
Weak     │ BB       │ O-RA       │ O-RC
Solid    │ O-RA     │ O-RC       │ O-RF
Strong   │ O-RC     │ O-RF       │ DP
```

### Critical Rolls

**Battle phase criticals (override normal flow):**
| Roll | Batter | Pitcher |
|------|--------|---------|
| Boxcars (12) | Auto HR | Auto DP (2 outs if runners) |
| Snake Eyes (2) | Auto Out | Auto Walk |

**Result phase criticals:**
- Snake Eyes (2) = worst outcome for roller
- Boxcars (12) = best outcome for roller

### R3 Pressure (Built-in)

When runner on 3rd, batter's OUT^ cells become BB. Batter wins battle → pitcher can't afford strikes → walk.

### Runner Movement

| Outcome | Movement |
|---------|----------|
| 1B | R1→2nd, R2→3rd, R3 scores |
| 2B | R2+R3 score, R1→3rd |
| HR | Everyone scores |
| BB | Forced runners advance |
| O-RA | Out, runners advance one |
| O-RC | Out, runner may challenge (roll-off) |
| O-RF | Out, runners freeze |
| DP | 2 outs, lead runner erased |

---

## Simulation Stats (v1.0)

| Metric | Value |
|--------|-------|
| Runs/Game | ~6.0 |
| AVG | .351 |
| OBP | .405 |
| HR Rate | 7.0% |
| BB Rate | ~4% (with R3 pressure) |

---

## File Structure

```
src/
├── dice.ts          # Core randomness
├── strategy.ts      # Strategy triangle (Power/Balance/Finesse)
├── stance.ts        # Stance system (for v5.3+)
├── commit.ts        # Combines commitments → modifiers
├── battle.ts        # Dice + modifiers → winner + tier
├── result.ts        # Result tables and resolution
├── game.ts          # Full game simulation
├── player.ts        # CPU player behavior
└── test-*.ts        # Test harnesses

docs/
├── bush-league-quickref.html   # v1.0 rules card (Bush League)
├── cheddar-bob-v53-rules.html  # v5.3 rules card (with Stance)
├── tuning-analysis.md          # All simulation data
└── grapple-engine.md           # Design philosophy
```

## Running Tests

```bash
# Game simulation
npm run test:game -- --games 1000        # Run 1000 games
npm run test:game -- --single --verbose  # Play-by-play
npm run test:game -- --r3pressure        # Enable R3 pressure
npm run test:game -- --compare-r3        # Compare with/without R3

# Battle analysis
npm run test:battle -- --enumerate       # Exact probabilities
npm run test:battle -- --compare         # Compare configurations

# Result tables
npm run test:result -- --table           # Show 2D result tables
```

## Git Info

- Branch: `grapple-engine`
- Tag: `v1.0-cheddar-bob`

---

## Design Philosophy

See `docs/grapple-engine.md` for the full philosophy.

**Key principles:**
1. **Every at-bat is contested** — neither player is passive
2. **Skill creates edge** — like poker, better reads win over time
3. **Dice add drama, not randomness** — modifiers shift probability curves
4. **R3 pressure rewards offense** — batter wins battle, batter gets the walk

## User Preferences

- Explain code clearly — user is learning TypeScript
- Hypothesis before experiment
- Test at multiple scales: 10, 100, 1000
- Commit frequently
- Lock in stable versions before experimenting
