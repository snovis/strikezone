# CHEDDAR BOB: SPEED EDITION v5
## Complete Rules, Lookups & Statistics

**Version:** v5_final (December 2024)
**Status:** Frozen for Playtesting

---

# TABLE OF CONTENTS

1. [Overview](#overview)
2. [Game Flow](#game-flow)
3. [Phase 1: Select](#phase-1-select)
4. [Phase 2: Steal (Optional)](#phase-2-steal-optional)
5. [Phase 3: Reveal & Modifiers](#phase-3-reveal--modifiers)
6. [Phase 4: Battle Roll](#phase-4-battle-roll)
7. [Phase 5: Result Roll](#phase-5-result-roll)
8. [Baserunning](#baserunning)
9. [Plus Moves](#plus-moves)
10. [Quick Reference Tables](#quick-reference-tables)
11. [Simulation Statistics](#simulation-statistics)
12. [Design Principles](#design-principles)
13. [Equipment & Setup](#equipment--setup)

---

# OVERVIEW

Cheddar Bob is a head-to-head baseball dice game where you play baseball *decisions*, not baseball *actions*. Each at-bat is a battle of wits and dice between pitcher and batter.

**Design Goals:**
- At-bat resolution: < 1 minute
- Full 3-inning game: 15-20 minutes
- Head-to-head drama on every at-bat
- Physical satisfaction: selectors + dice

**Core Philosophy:**
- Weak execution gives the opponent opportunities
- Strong execution limits opportunities
- The player trying to accomplish something rolls
- Snake eyes (🐍) = critical failure for whoever rolled

---

# GAME FLOW

```
┌─────────────────────────────────────────────────────┐
│  1. SELECT    Both secretly pick Approach + Arrow   │
│  2. STEAL?    Runner announces "going!" (optional)  │
│  3. REVEAL    Show choices, calculate modifiers     │
│  4. BATTLE    Both roll 2d6 + mods, higher wins     │
│  5. RESULT    Winner rolls for outcome              │
└─────────────────────────────────────────────────────┘
```

---

# PHASE 1: SELECT

Both players secretly select their choices simultaneously.

## Pitcher Selects

### Approach (Pitch Type)

| Pitch | Symbol | Description | Plus Move |
|-------|--------|-------------|-----------|
| Fastball | ⚡ FB | Heat / Velocity | FB+ available |
| Curveball | 🌀 CB | Breaking / Deception | CB+ available |
| Changeup | 🔄 CH | Offspeed / Timing | None (safe) |

### Location (Arrow)

```
         ↑ UP
     ← IN    OUT →
         ↓ DOWN
```

## Batter Selects

### Approach

| Approach | Symbol | Description | Plus Move |
|----------|--------|-------------|-----------|
| Power | 💪 | Swing for the fences | POWER+ available |
| Control | 🎯 | Controlled swing | None (safe) |
| Contact | ✋ | Just make contact | CONTACT+ available |

### Location (Arrow)

Same four arrows as pitcher. Batter is guessing where the pitch will be thrown.

```
         ↑ UP
     ← IN    OUT →
         ↓ DOWN
```

---

# PHASE 2: STEAL (Optional)

**High-stakes timing:** After SELECT, before REVEAL. Runner commits blind!

If a runner wants to steal, they announce "Going!" before the reveal.

## Steal Resolution

Both players roll 2d6. Runner gets pitch modifier:

| Pitch Thrown | Modifier | Reason |
|--------------|----------|--------|
| Fastball ⚡ | **-1** | Quick to the plate |
| Changeup 🔄 | 0 | Normal timing |
| Curveball 🌀 | **+1** | Slow delivery |

## Steal Outcomes

| Result | Outcome |
|--------|---------|
| Runner higher or tie | **SAFE** - Runner advances one base |
| Pitcher higher | **CAUGHT** - Runner out, at-bat continues |
| 🐍 Runner rolls snake eyes | **CAUGHT** - Critical failure |
| 🎲 Runner rolls 12 | **SAFE** - Auto success |
| 🐍 Pitcher rolls snake eyes | **EXTRA BASE** - Runner advances two! |
| 🎲 Pitcher rolls 12 | **CAUGHT** - Auto success |

**After steal resolves → Back to SELECT for a fresh at-bat.**

---

# PHASE 3: REVEAL & MODIFIERS

Both players reveal simultaneously. Calculate modifiers for the battle roll.

## RPS Matchup (Approach vs Approach)

```
CB → Power → FB → Contact → CH → Control → CB
```

| Pitcher ↓ / Batter → | Power | Control | Contact |
|---------------------|:-----:|:-------:|:-------:|
| **Fastball** | B+1, P-1 | TIE | P+1, B-1 |
| **Curveball** | P+1, B-1 | B+1, P-1 | TIE |
| **Changeup** | TIE | P+1, B-1 | B+1, P-1 |

**Memory Aid:**
- **Power** crushes Fastball
- **Control** handles Curveball
- **Contact** reads Changeup

## Arrow Comparison (Location)

Both players reveal their arrow. Compare instantly:

| Comparison | Result | Example |
|------------|--------|---------|
| **Match** | Batter +1 | Both ↑ |
| **Opposite** | Pitcher +1 | ↑ vs ↓, or ← vs → |
| **Perpendicular** | TIE | ↑ vs ←, or ↓ vs → |

*Batter guessed right? Batter +1. Pitcher fooled 'em? Pitcher +1.*

**Important:** All modifiers apply to BATTLE roll only. They do NOT carry to result roll.

---

# PHASE 4: BATTLE ROLL

Both players roll 2d6 and add their modifiers.

**Higher total wins. Ties reroll.**

## Determine Tier

The **winner's** modified total determines their tier:

| Winner's Total | Tier |
|----------------|------|
| ≤6 | **Weak** |
| 7-9 | **Solid** |
| 10+ | **Strong** |

## Snake Eyes & Boxcars in Battle

| Who Rolled | Result |
|------------|--------|
| Pitcher 🐍 (1-1) | Batter automatically gets **STRONG** tier |
| Batter 🐍 (1-1) | Automatic **K** (skip result roll) |
| Pitcher 🎲 (6-6) | Pitcher auto wins |
| Batter 🎲 (6-6) | Batter auto wins |

---

# PHASE 5: RESULT ROLL

The **winner** rolls 2d6 on their result table.

**No modifiers on result roll** - tier already determines your column.

## Batter Wins → Batter Rolls 2d6

| Roll | Weak | Solid | Strong |
|------|:----:|:-----:|:------:|
| ≤7 | **OUT** | OUT | 1B |
| 8-9 | OUT | 1B | 2B+ |
| 10+ | 1B | 2B+ | **HR** |

- **+ = Stretch opportunity** (battle roll for extra base)
- **🐍 Snake eyes = OUT** (critical failure)

## Pitcher Wins → Pitcher Rolls 2d6

| Roll | Weak | Solid | Strong |
|------|:----:|:-----:|:------:|
| ≤7 | **BB** | O+RA | K+RC |
| 8-9 | O+RA | K+RC | O-RF |
| 10+ | O+RC | O-RF | **DP!** |

### Legend

| Code | Meaning |
|------|---------|
| **BB** | Walk (batter reaches base) |
| **O** | Out (batter is out) |
| **K** | Strikeout (batter is out) |
| **RA** | Runners Advance freely |
| **RC** | Runners advance with Challenge (battle roll, tie → runner) |
| **RF** | Runners Frozen (no advancement) |
| **DP!** | Guaranteed Double Play (if runner on 1st) |

- **🐍 Snake eyes = HBP** (batter reaches, critical failure for pitcher)

---

# BASERUNNING

## Battle Rolls for Baserunning

All baserunning battles follow these rules:
- **Tie goes to the runner**
- **🐍 Snake eyes = auto fail** for whoever rolled it
- **🎲 Boxcars (12) = auto win** for whoever rolled it

## Stretch Attempt

When batter gets 1B+ or 2B+, they can try for the extra base.

**Battle Roll:** Both roll 2d6, no modifiers.

| Result | Outcome |
|--------|---------|
| Batter higher or tie | **SAFE** at extra base |
| Pitcher higher | **OUT** (caught stretching) |
| 🐍 Batter | **OUT** - Critical failure |
| 🎲 Batter rolls 12 | **SAFE** - Auto success |
| 🐍 Pitcher | **SAFE** - Critical failure |
| 🎲 Pitcher rolls 12 | **OUT** - Auto success |

## Runner Challenge (RC)

When pitcher gets O+RC or K+RC, runners can try to advance.

**Battle Roll:** Both roll 2d6, no modifiers. Tie goes to runner.

## Runner Advancement on Hits

| Hit Type | Tier | Runner on 1st | Runner on 2nd |
|----------|------|---------------|---------------|
| Single | Any | To 2nd | To 3rd |
| Double | Weak/Solid | To 3rd | Scores |
| Double | **Strong** | **Scores** | Scores |
| Triple | Any | Scores | Scores |
| HR | Any | Scores | Scores |

---

# PLUS MOVES

Declare plus moves during SELECT phase (before reveal). High risk, high reward!

## POWER+ (Batter)

*"Swinging for the fences"*

| Battle Result | Effect |
|---------------|--------|
| **WIN** | Tier +1 (weak→solid, solid→strong). Already strong? +1 to result roll |
| **LOSE** | Tier -1 (strong→solid, solid→weak). Already weak? **Swinging K** |

## CONTACT+ (Batter)

*"Just get on base"*

| Battle Result | Effect |
|---------------|--------|
| **WIN** | Result ≤4 = **WALK**. Max hit = single (no extra bases) |
| **LOSE** | Runners do NOT advance on the out |

## FASTBALL+ or CURVEBALL+ (Pitcher)

*"Going for the strikeout"*

| Battle Result | Effect |
|---------------|--------|
| **WIN** | +2 to result roll (pushes toward K zone) |
| **LOSE** | Batter gets **FREE BASE** (walk) |

*Changeup has no plus move - it's the safe middle option.*

---

# QUICK REFERENCE TABLES

## The Loop

```
CHOOSE → MODIFY → ROLL
```

Make decisions that influence your odds, then roll for the outcome.

## Complete Modifier Summary

| Source | Batter | Pitcher |
|--------|--------|---------|
| RPS Win | +1 | +1 |
| RPS Lose | -1 | -1 |
| Arrow Match | +1 | - |
| Arrow Opposite | - | +1 |
| Arrow Perpendicular | 0 | 0 |

## Tier Thresholds

| Battle Total | Tier |
|--------------|------|
| ≤6 | Weak |
| 7-9 | Solid |
| 10+ | Strong |

## RPS Quick Reference

| | Power | Control | Contact |
|---|:---:|:---:|:---:|
| **FB** | B | - | P |
| **CB** | P | B | - |
| **CH** | - | P | B |

*B = Batter wins (+1/-1), P = Pitcher wins (+1/-1), - = Tie*

---

# SIMULATION STATISTICS

## v5_final Balance (5000 At-Bats)

| Statistic | Game Value | MLB Reference |
|-----------|------------|---------------|
| **AVG** | .318 | ~.250 |
| **OBP** | .361 | ~.320 |
| **SLG** | .534 | ~.400 |
| **HR%** | 3.5% | 3.5% |
| **K%** | 19% | 22% |
| **Battle Split** | 49% B / 51% P | - |

**Design Choice:** Higher offense than MLB for more action. HR rate matches MLB exactly. K rate is close to MLB.

## Per-Game Statistics (100 games, 3 innings)

| Statistic | Value |
|-----------|-------|
| Runs/game (both teams) | ~7 |
| Runs/team | ~3.5 |
| Hits/game | ~11 |
| Extra innings | 15% |
| Walkoffs | 12% |
| Shutouts | ~35% |

## Tier Distribution

| Tier | Frequency |
|------|-----------|
| Weak | ~35% |
| Solid | ~40% |
| Strong | ~25% |

## Outcome Breakdown (Batter Wins Battle)

| Outcome | Frequency |
|---------|-----------|
| OUT | ~35% |
| 1B | ~40% |
| 2B+ | ~18% |
| HR | ~7% |

## Outcome Breakdown (Pitcher Wins Battle)

| Outcome | Frequency |
|---------|-----------|
| BB | ~10% |
| O+RA | ~25% |
| K+RC | ~25% |
| O+RC | ~15% |
| O-RF | ~15% |
| DP | ~10% |

---

# DESIGN PRINCIPLES

## 1. Symmetric Diagonal Tables

Both batter and pitcher tables mirror each other:
- **Best outcome** at Strong tier + high roll (HR / DP)
- **Worst outcome** at Weak tier + low roll (OUT / BB)

## 2. Who Wants It, Rolls It

The player trying to accomplish something is the one who rolls:
- Stretch attempt → Batter rolls
- DP attempt → Pitcher rolls
- Runner challenge → Batter rolls
- Snake eyes = critical failure for whoever rolled

## 3. Tier Determines Column, No Stacking

- RPS and Arrow modifiers apply to **BATTLE roll only**
- Result roll uses tier column with **no additional modifiers**
- Winning the battle IS the advantage - don't double-dip

## 4. Ties Reroll, Tie Goes to Runner

- Battle ties → Reroll (creates more tension)
- Baserunning battles → Tie goes to runner

## 5. Snake Eyes = Drama

- Automatic critical failure for whoever rolled
- Creates memorable moments
- Keeps both players engaged

## 6. Physical Satisfaction

- Simultaneous secret selection
- Magnetic click selectors
- Dice rolling for resolution
- "Fidget Spinner: The Game"

---

# EQUIPMENT & SETUP

## Required Equipment

- **4 dice** (2d6 per player, different colors recommended)
- **Approach selectors** (or cards/chips for FB/CB/CH and Power/Control/Contact)
- **Arrow selectors** (or cards for ↑↓←→)
- **Runner tokens** (4)
- **Out markers** (3)
- **Scoresheet**

## Game Length Options

| Format | Innings | Time |
|--------|---------|------|
| Quick | 3 | 15-20 min |
| Standard | 6 | 30-40 min |
| Full | 9 | 45-60 min |

## Lineup Suggestions

| Position | Default Approach | Role |
|----------|------------------|------|
| 1-2 | Control 🎯 | Table setters |
| 3-4 | Power 💪 | Run producers |
| 5-6 | Control 🎯 | Professional ABs |
| 7-9 | Contact ✋ | Get on base |

---

# VERSION HISTORY

| Tag | Date | Description |
|-----|------|-------------|
| v5_balanced | Dec 2024 | Conservative thresholds (≤8/9-10/11+), .233 AVG |
| v5_action | Dec 2024 | Action thresholds (≤6/7-9/10+), .316 AVG |
| **v5_final** | Dec 2024 | K+RC labels added, 19% K rate, **FROZEN FOR PLAYTEST** |

---

# CREDITS

**Design:** Scott Novis
**Development & Simulation:** Claude (Anthropic)
**Playtesting:** Scott Novis, Matt

---

*Cheddar Bob: Speed Edition v5_final*
*"Play Baseball Decisions"*
