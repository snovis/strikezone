# 🧀 Cheddar Bob / Pocket Pitcher

## Design Document v0.2

A turn-based strategy game recreating the tension of a pitcher-batter confrontation using 2d6 mechanics inspired by Apocalypse World's three-outcome system.

---

## Core Philosophy

Most dice systems are pass/fail. The three-outcome structure (miss / weak / strong) creates a spread of probable outcomes that better captures the drama of baseball. Everyone has a plan—the dice determine how well they execute it.

---

## Phase 1: Swing Contact Check

When the batter swings, roll 2d6 + modifiers.

### Thresholds

| Outcome | Roll | Probability | Real MLB |
|---------|------|-------------|----------|
| Miss | 2–5 | 27.78% | ~24% |
| Weak Contact | 6–8 | 44.44% | ~43% |
| Strong Contact | 9–12 | 27.78% | ~30% |

### Probability by Modifier

| Mod | Miss (2–5) | Weak (6–8) | Strong (9+) |
|-----|------------|------------|-------------|
| -3 | 72.22% | 22.22% | 5.56% |
| -2 | 58.33% | 30.56% | 11.11% |
| -1 | 41.67% | 38.89% | 19.44% |
| **+0** | **27.78%** | **44.44%** | **27.78%** |
| +1 | 16.67% | 44.44% | 38.89% |
| +2 | 8.33% | 38.89% | 52.78% |
| +3 | 2.78% | 27.78% | 69.44% |

### Batter Modifier Sources

**Bonuses (+)**
- Correct location guess: +1
- Correct pitch type guess: +1
- Pitch down the middle: +1
- Pitcher miss execution: +1

**Penalties (−)**
- Wrong location guess: −1
- Wrong pitch type guess: −1
- Swing at intentional ball: −1
- Pitcher strong execution: −1

---

## Phase 2: Contact Outcome Tables

### Weak Contact Table (2d6)

| Roll | Outcome |
|------|---------|
| 2–5 | Out (type TBD) |
| 6–8 | Foul Ball |
| 9–12 | Single |

### Strong Contact Table (2d6)

| Roll | Outcome |
|------|---------|
| 2–5 | Single |
| 6–8 | Double |
| 9–12 | Home Run |

---

## Pitcher Execution

When the pitcher throws, they roll 2d6 for execution. The result affects the batter differently based on pitch type and whether the batter swings or takes.

### Pitch Type Trade-offs

| Pitch Type | Easier to Execute? | Strike on Take? | Modifier to Batter? |
|------------|-------------------|-----------------|---------------------|
| Fastball | Yes (forgiving) | High | Low (−1 on Strong only) |
| Breaking Ball | No (risky) | Low | High (−1 on Weak, −2 on Strong) |

---

## Fastball Tables

### Fastball — If Batter Swings

| Roll | Result | Effect on Batter |
|------|--------|------------------|
| 2–5 | Miss location | Batter +1 |
| 6–8 | Weak execution | Batter +0 |
| 9–12 | Strong execution | Batter −1 |

### Fastball — If Batter Takes

| Roll | Middle | Corner | Ball Zone |
|------|--------|--------|-----------|
| 2–4 | Ball | Ball | Ball |
| 5–6 | Strike | Ball | Ball |
| 7–9 | Strike | Strike | Ball |
| 10–12 | Strike | Strike | Strike* |

*Edge case: perfectly painted fastball catches the corner for a called strike.

---

## Breaking Ball Tables

### Breaking Ball — If Batter Swings

| Roll | Result | Effect on Batter |
|------|--------|------------------|
| 2–5 | Miss location | Batter +1 |
| 6–8 | Weak execution | Batter −1 |
| 9–12 | Strong execution | Batter −2 |

### Breaking Ball — If Batter Takes

| Roll | Middle | Corner | Ball Zone |
|------|--------|--------|-----------|
| 2–6 | Ball | Ball | Ball |
| 7–9 | Strike | Ball | Ball |
| 10–12 | Strike | Strike | Ball |

Breaking ball in the ball zone is **never** a strike—it's a pure chase pitch.

---

## Strike Call Thresholds Summary

| Pitch Type | Middle | Corner | Ball Zone |
|------------|--------|--------|-----------|
| Fastball | 5+ | 7+ | 10+ |
| Breaking Ball | 7+ | 10+ | Never |

---

## Location Strategy

| Location | Strike Difficulty | Batter Modifier | Use Case |
|----------|-------------------|-----------------|----------|
| Middle | Easiest | +1 to batter on swing | Guaranteed strike zone |
| Corner | Standard | +0 to batter on swing | Execution determines outcome |
| Ball | Hardest | −1 to batter on swing | Trying to get batter to chase |

---

## Situational Plays

### 3-0 Count: Need a Strike
Throw fastball down the middle. You'll get your strike, but batter gets +1 if swinging. Accept the trade-off to avoid ball four.

### 0-2 Count: Waste Pitch
Throw breaking ball in ball zone. Never a strike, but if batter chases, he's at −2. Low risk way to try for the strikeout.

### Even Count: Battle
Fastball to corner is the "honest" pitch. Execution determines the outcome. Neither side has a clear advantage.

### Strikeout Pitch
Breaking ball to corner. Need to roll 10+ for a called strike, but if batter swings on weak or strong execution, he's in trouble.

---

## "Seeing It" Bonus

When batter correctly guesses pitch type AND location on a take:
- **+1 bonus carries to next pitch**
- Batter is "seeing" the pitcher
- Rewards patience and good reads
- Can stack with other modifiers on the next swing

---

## Protect Mechanic (TBD)

When behind in count (0-2, 1-2), batter can choose to **Protect**:
- Gives up power (outcomes shift toward contact/fouls)
- Higher chance to make contact and extend the at-bat
- Exact mechanics to be defined

---

## Stretch for Extra Base (TBD)

Batter can attempt to take an extra base:
- Pitcher rolls vs Batter rolls (straight 2d6 vs 2d6?)
- Pitcher wins: Batter out
- Batter wins: Batter gets the base
- Risk/reward tuning needed

---

## Open Design Questions

1. **Third pitch type** — Changeup/offspeed to complete the set of three?
2. **Out types** — How to determine ground out vs fly out vs line out?
3. **Protect mechanics** — How exactly do outcomes shift?
4. **Location granularity** — 4-zone (up/down/in/out) vs 9-box grid?
5. **"Seeing It" stacking** — Can bonuses accumulate across multiple takes?

---

## 2d6 Probability Reference

| Roll | Combinations | Probability |
|------|--------------|-------------|
| 2 | 1 | 2.78% |
| 3 | 2 | 5.56% |
| 4 | 3 | 8.33% |
| 5 | 4 | 11.11% |
| 6 | 5 | 13.89% |
| 7 | 6 | 16.67% |
| 8 | 5 | 13.89% |
| 9 | 4 | 11.11% |
| 10 | 3 | 8.33% |
| 11 | 2 | 5.56% |
| 12 | 1 | 2.78% |

The bell curve peaks at 7. Adding or removing a single number near the center (6, 7, 8) dramatically shifts probabilities.

---

*Cheddar Bob / Pocket Pitcher — Scott & Matt, December 2025*
