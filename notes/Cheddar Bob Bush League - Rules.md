---
title: Cheddar Bob Bush League - Rules
version: "1.1"
created: 2024-12-27
updated: 2024-12-27
tags:
  - games
  - cheddar-bob
  - rules
  - tabletop
  - baseball
status: production-ready
---

# Cheddar Bob: Bush League v1.1

> *No excuses. No equipment. Just hands and dice.*

A fast-playing baseball simulation using Rock-Paper-Scissors and 2d6. Each at-bat is a contested battle between batter and pitcher.

---

## Game Flow

```
SELECT → REVEAL → BATTLE → RESULT
```

1. **SELECT** — Both players secretly choose a strategy (RPS)
2. **REVEAL** — Throw hands simultaneously
3. **BATTLE** — Both roll 2d6 + modifiers. Higher wins.
4. **RESULT** — Winner rolls again to determine outcome

---

## Strategy Triangle

```
        🔨 POWER
        ↗     ↘
    🎯 FINESSE ← ⚖️ BALANCE
```

| Strategy | Beats | Loses To | Pitch Flavor |
|----------|-------|----------|--------------|
| 🔨 Power | Balance | Finesse | Fastball |
| ⚖️ Balance | Finesse | Power | Changeup |
| 🎯 Finesse | Power | Balance | Breaking Ball |

**Arrow points to loser.** Winner gets **+2** modifier. Tie = no modifier.

---

## The Magic Number: 7-9

Used for BOTH Battle roll AND Result roll:

| Roll | Tier | Offset |
|------|------|--------|
| ≤6 | Weak | 0 |
| 7-9 | Solid | 1 |
| 10+ | Strong | 2 |

---

## Result Tables

### Batter Wins → Outcome Table

| Result↓ Battle→ | Weak (RF) | Solid (RC) | Strong (RA) |
|-----------------|-----------|------------|-------------|
| **Weak (≤6)** | OUT | OUT | 1B+ |
| **Solid (7-9)** | BB | 1B+ | 2B+ |
| **Strong (10+)** | 1B | 2B | **HR** |

- 🐍 Snake Eyes (2) = OUT
- 🎰 Boxcars (12) = HR
- **+** = Runner may attempt to stretch

### Pitcher Wins → Outcome Table

| Result↓ Battle→ | Weak (≤6) | Solid (7-9) | Strong (10+) |
|-----------------|-----------|-------------|--------------|
| **Weak** | BB | O-RA | O-RC |
| **Solid** | O-RA | O-RC | O-RF |
| **Strong** | O-RC | O-RF | **DP** |

- 🐍 Snake Eyes (2) = BB
- 🎰 Boxcars (12) = DP

---

## Outcome Definitions

### Hits
| Code | Meaning | Runner Movement |
|------|---------|-----------------|
| 1B | Single | R1→2nd, R2→3rd, R3 scores |
| 2B | Double | R2+R3 score, R1→3rd |
| HR | Home Run | Everyone scores |
| BB | Walk | Forced runners advance only |

### Outs
| Code | Meaning | Runner Movement |
|------|---------|-----------------|
| OUT | Generic out | Runners freeze |
| O-RA | Out, Runners Advance | All runners advance one base |
| O-RC | Out, Runner Challenge | Runner MAY attempt advance (roll-off) |
| O-RF | Out, Runners Freeze | Runners hold position |
| DP | Double Play | 2 outs, lead runner erased |

---

## Runner Challenge (O-RC)

When O-RC occurs, the lead runner may choose to attempt advancement:

1. Both players roll 2d6 (no modifiers)
2. Higher roll wins (tie = re-roll)
3. **Runner wins** → Safe at next base
4. **Defense wins** → Runner is OUT

---

## Critical Rolls

### Battle Phase Criticals
| Roll | Batter Effect | Pitcher Effect |
|------|---------------|----------------|
| 🎰 Boxcars (12) | Auto HR | Auto DP |
| 🐍 Snake Eyes (2) | Auto OUT | Auto BB |

### Result Phase Criticals
- **Snake Eyes (2)** = Worst possible outcome for roller
- **Boxcars (12)** = Best possible outcome for roller

---

## Simulation Stats (v1.1)

| Metric | Value |
|--------|-------|
| Runs/Game | ~6.5 |
| AVG | .354 |
| OBP | .422 |
| HR Rate | 7.4% |

---

## Quick Reference

```
FLOW:     SELECT → REVEAL → BATTLE → RESULT
STRATEGY: 🔨>⚖️>🎯>🔨 | Winner +2
ZONES:    ≤6 Weak | 7-9 Solid | 10+ Strong
CRITS:    🐍=2 worst | 🎰=12 best
```

---

## What You Need

- 🎲 2 dice per player (or dice apps)
- ✋ Your hands (for RPS)
- 📝 Scorecard (optional)

---

## The Philosophy

> "Read your opponent. Roll your fate."

Your choices influence the odds. Smart choices make luck. The dice add drama, but skill creates edge — just like poker.

---

*© 2025 Rymare International LLC*
