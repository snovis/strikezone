# Cheddar Bob — Bush League v1.2

## 🔒 LOCKED-IN RULES (v1.2)

Playtested and refined. The boys who played high school baseball approved this version.

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

**BATTER WINS → Outcome Table (2D)**
```
         │ Weak(≤6) │ Solid(7-9) │ Strong(10+)
─────────┼──────────┼────────────┼────────────
Weak     │ OUT      │ BB         │ 1B
Solid    │ OUT      │ 1B         │ 2B
Strong   │ 1B       │ 2B         │ HR
```
**v1.1 change:** Weak/Solid = BB (playtest feedback — "I barely won but rolled well, I get on base")

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

### Why Weak/Solid = BB? (v1.1)

Playtest feedback: Winning the battle (even barely) and then rolling well (7-9) should get you on base. The 2D table rewards the result roll asymmetrically — Solid result on a Weak battle = walk, but Weak result on a Solid battle = out.

### Productive Outs (v1.2)

When the **batter wins the battle** but the outcome is **OUT**, runners still advance one base. You won the battle — you sacrificed yourself to move the runners. Like a groundout that advances the runner or a deep fly ball.

This applies only to batter-caused outs (from the batter result table), not pitcher-caused outs.

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

## Simulation Stats (v1.2)

| Metric | v1.0 | v1.1 | v1.2 |
|--------|------|------|------|
| Runs/Game | 6.0 | 6.5 | **6.9** |
| AVG | .351 | .354 | .353 |
| OBP | .405 | .422 | .420 |
| HR Rate | 7.0% | 7.4% | 7.0% |

**v1.1:** +8% scoring (Weak/Solid = BB)
**v1.2:** +8% more scoring (productive outs) — runners advance on batter outs

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
npm run test:game -- --bush-v11          # Bush League v1.1 (default now)
npm run test:game -- --compare-bush-v11  # Compare v1.0 vs v1.1

# Battle analysis
npm run test:battle -- --enumerate       # Exact probabilities
npm run test:battle -- --compare         # Compare configurations

# Result tables
npm run test:result -- --table           # Show 2D result tables
```

## Git Info

- Branch: `grapple-engine`
- Tags: `v1.1-bush-league`, `v1.2-bush-league`

---

## Design Philosophy

See `docs/grapple-engine.md` for the full philosophy.

**Key principles:**
1. **Every at-bat is contested** — neither player is passive
2. **Skill creates edge** — like poker, better reads win over time
3. **Dice add drama, not randomness** — modifiers shift probability curves
4. **R3 pressure rewards offense** — batter wins battle, batter gets the walk

## Playtest Insights (2024-12-27)

**The Magic Moment:**
> The boys made up stories as the game went along, describing the plays they imagined from the at-bat outcomes. The big moment? A 2-out grand slam to tie the game in the bottom of the 2nd — everyone yelled "Ooohhhh!!!!" when that happened. Even the spectators acted like they were watching a "real" game.
>
> And it was a real game. A real game of Cheddar Bob Bush League, the baseball simulator. Just not... a real game of baseball.

**Key learnings:**
1. **Simpler is better** — Bush League (strategy-only) plays fastest. Extra selection slows things down.
2. **1-2 inning games work great** — Ties go to extra innings.
3. **Stories emerge** — The dice and cards fade away. Players narrate the plays.
4. **Weak/Solid = BB felt right** — Unanimous feedback from playtesters.

---

## User Preferences

- Explain code clearly — user is learning TypeScript
- Hypothesis before experiment
- Test at multiple scales: 10, 100, 1000
- Commit frequently
- Lock in stable versions before experimenting
- **All rules cards and score sheets must include:** `© 2025 Rymare International LLC`
