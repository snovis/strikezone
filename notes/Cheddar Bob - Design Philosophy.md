---
title: Cheddar Bob - Design Philosophy
version: "1.0"
created: 2024-12-28
updated: 2024-12-28
tags:
  - games
  - cheddar-bob
  - design
  - game-design
  - grapple-engine
status: documentation
---

# The Grapple Engine: Design Philosophy

> *"Read your opponent. Roll your fate."*

## Core Concept: Two-Dimensional Non-Transitive Resolution

The Grapple Engine is a contested resolution system where **both players make meaningful decisions** and **both dice rolls matter**.

### The Two Dimensions

```
DIMENSION 1: Strategy (Pre-roll decision)
    Who reads whom? → Winner gets modifier

DIMENSION 2: Battle & Result (Post-roll outcome)
    How decisive? → Tier determines outcome severity
```

### Why "Grapple"?

Every contest is a **grapple** — neither player is passive. Unlike traditional RPG resolution (GM sets difficulty, player rolls), both sides:
1. Commit to a strategy
2. Roll dice
3. Influence the outcome

---

## The Non-Transitive Triangle

```
        🔨 POWER
        ↗     ↘
    🎯 FINESSE ← ⚖️ BALANCE
```

**Power beats Balance. Balance beats Finesse. Finesse beats Power.**

This creates a **rock-paper-scissors dynamic** where no single choice dominates. Victory comes from reading your opponent, not finding the optimal strategy.

### Why Non-Transitive?

- **No dominant strategy** — can't just "always pick Power"
- **Mind games matter** — what does your opponent expect?
- **Skill emerges** — better readers win over time
- **Every matchup is contestable** — underdog always has a path

---

## The Magic Number: 7-9

The tier system uses **2d6 probability distribution** strategically:

| Roll | Tier | Probability |
|------|------|-------------|
| 2-6 | Weak | ~42% |
| 7-9 | Solid | ~44% |
| 10-12 | Strong | ~17% |

**Why 7-9 is "magic":**
- 7 is the most likely roll on 2d6
- The Solid tier (7-9) is the "expected" outcome
- Strong (10+) feels earned — you had to roll well
- Weak (≤6) creates tension — you underperformed

---

## The 2D Result Table

The genius of the system: **two independent rolls create a matrix of outcomes**.

```
Battle Roll → Winner + Battle Tier
Result Roll → Outcome Tier

Cross-reference = Final Outcome
```

### Why Two Rolls?

1. **Battle determines WHO wins** — strategy + dice
2. **Result determines HOW MUCH** — pure dice drama

This separation means:
- Winning the battle doesn't guarantee success
- Even a weak battle win can yield a strong result
- Drama builds across two distinct moments

### The Batter Table (v1.1)

```
Result↓ Battle→  Weak(RF)   Solid(RC)   Strong(RA)
Weak             OUT        OUT         1B+
Solid            BB         1B+         2B+
Strong           1B         2B          HR
```

Reading: "I won the battle (Solid tier), then rolled Strong on result = 2B"

---

## Stronger = More Options

The tier system maps consistently across the entire design. **Stronger tiers open more options** — for the batter, for the hit, and for the runners.

### Battle Tier → Runner Movement

The column labels (RF, RC, RA) tell you how runners advance:

| Battle Tier | Label | Runner Movement | Philosophy |
|-------------|-------|-----------------|------------|
| **Weak** | RF (Runners Freeze) | Station-to-station | You barely won. Take what you get. |
| **Solid** | RC (Runner Challenge) | Can attempt extra base (roll-off) | Decent win. Aggressive runners can try. |
| **Strong** | RA (Runners Advance) | Automatic extra base | Dominant win. Everyone moves up. |

### Result Tier → Hit Quality

The row determines what kind of hit you got:

| Result Tier | Outcomes | Stretch? | Philosophy |
|-------------|----------|----------|------------|
| **Weak** | OUT, BB, 1B | No stretch | Basic outcome. You got what you got. |
| **Solid** | OUT, 1B+, 2B | Singles can stretch | Better contact. Singles might become doubles. |
| **Strong** | 1B, 2B, HR | No indicator needed | Premium hit. HR speaks for itself. |

### The Stretch Indicator (+)

The `+` means the batter can attempt to stretch the hit to the next base (1B→2B, 2B→3B). Notice where they appear:

- **Strong battle column (RA)**: Even weak/solid results get stretch opportunities
- **Solid battle + Solid result**: The sweet spot — good contact, runners moving

Strong results (bottom row) don't need `+` because you already got the best possible outcome for that battle tier.

### Why This Works

One mechanic (tier) maps consistently to multiple game elements:
- **Battle tier** → Runner advancement (RF/RC/RA)
- **Result tier** → Hit quality (OUT/1B/2B/HR)
- **Combined** → Stretch opportunities (+)

This makes the rules easy to remember: **"Stronger = more options"** applies everywhere.

### The Tradeoff

This system doesn't perfectly simulate every baseball scenario. For example, a runner on 2nd doesn't always score on a single — sometimes they do (RA), sometimes they try (RC), sometimes they hold (RF).

But it's **close enough for a game**. Perfect simulation isn't the goal — creating those "Ooohhhh!!!" moments is.

---

## Design Principles

### 1. Every At-Bat is Contested

Neither player watches passively. Both commit, both roll, both influence outcomes.

### 2. Skill Creates Edge

Like poker, better reads win over time. The dice add variance, but **strategy shifts probability curves**.

### 3. Dice Add Drama, Not Randomness

Modifiers from strategy wins shift outcomes predictably. The randomness is **bounded** — you know the range of possibilities.

### 4. Simple Rules, Emergent Complexity

- 3 strategies (non-transitive triangle)
- 3 tiers (≤6, 7-9, 10+)
- 9-cell outcome table

Yet from this simplicity emerges:
- Bluffing and counter-bluffing
- Risk/reward calculations
- Clutch moments (R3 pressure)
- Dramatic swings (critical rolls)

---

## The "Ooohhhh" Moment

From playtest notes (December 2024):

> "The magic moment was in the second or third inning when the opposing team tied it up on a 2-out grand slam. Everyone yelled 'Ooohhhh!!!'"

This is what the engine is designed to create: **earned dramatic moments** where:
- The situation was tense (2 outs, bases loaded, down by runs)
- Both players made their choices
- The dice delivered (Strong battle + Strong result = HR)
- Everyone at the table felt it

---

## Comparison to Other Systems

### vs. Traditional RPG (D&D-style)
- **D&D:** GM sets DC, player rolls, binary pass/fail
- **Grapple:** Both roll, graduated outcomes, strategy layer

### vs. Opposed Rolls (Fate-style)
- **Fate:** Both roll, compare totals, success ladder
- **Grapple:** Adds non-transitive strategy before rolls

### vs. RPS (Rock Paper Scissors)
- **RPS:** Pure strategy, instant resolution
- **Grapple:** Strategy + dice + graduated outcomes

---

## Applications Beyond Baseball

The Grapple Engine is sport-agnostic. The same core could simulate:

- **Football:** Yardage instead of bases, drives instead of innings
- **Boxing/MMA:** Damage instead of advancement, rounds instead of innings
- **Any competitive contest:** Where both sides should have agency

The key insight: **any contest where both participants make choices and outcomes vary in severity** can use this engine.

---

## Summary

The Grapple Engine creates meaningful, dramatic contests through:

1. **Non-transitive strategy** — no dominant choice
2. **Contested rolls** — both players engaged
3. **Two-dimensional resolution** — battle tier × result tier
4. **Bounded randomness** — modifiers shift curves, don't eliminate skill

> *"Your choices influence the odds. Smart choices make luck."*

---

*© 2025 Rymare International LLC*
