# Grapple Engine — Tuning Analysis

This document captures simulation results, insights, and tuning decisions as we balance the engine.

---

## 2024-12-26: Battle Module Enumeration Results

### Baseline (No Modifiers)

```
Win Rates:  P1 44.4%, P2 44.4%, Ties 11.3%
Tier Dist:  Weak 14.8%, Solid 52.0%, Strong 33.2%
```

With roll-value-based tiers (≤6 weak, 7-9 solid, 10+ strong), winning rolls skew toward solid/strong because you can't win with a low roll if opponent rolled higher.

### Modifier Impact on Win Rate

| Scenario | P1 Win% | P2 Win% | Tie% |
|----------|---------|---------|------|
| Baseline (0/0) | 44.4 | 44.4 | 11.3 |
| P1 +1 (1/0) | 55.6 | 33.6 | 10.8 |
| P1 +2 (2/0) | 66.4 | 23.9 | 9.6 |
| P1 +3 (3/0) | 76.1 | 15.9 | 8.0 |

**Rule of thumb:** Each +1 modifier ≈ +10-11% win rate shift.

### KEY DISCOVERY: Same Net Advantage, Different Tier Distribution

| Scenario | Net Diff | P1 Win% | Weak% | Solid% | Strong% |
|----------|----------|---------|-------|--------|---------|
| +2/0 | +2 | 66.4 | 5.5 | 39.9 | **54.7** |
| +1/-1 | +2 | 66.4 | 13.7 | 49.9 | **36.5** |

**Same win rate. Completely different tier distribution.**

Why? Tier is based on the **winning roll value**, not the margin.
- **+2/0**: P1 rolls effective 4-14, pushing into strong territory
- **+1/-1**: Both players' rolls spread wider, winning rolls don't climb as high

### The "Wash" Effect

| Scenario | P1 Win% | Weak% | Solid% | Strong% |
|----------|---------|-------|--------|---------|
| Baseline (0/0) | 44.4 | 14.8 | 52.0 | 33.2 |
| Both +1 (1/1) | 44.4 | 6.1 | 42.6 | **51.3** |

Same win rate, but when both roll higher, **victories are more epic**.

---

## Tuning Decision Point (2024-12-26)

### The Question

Should commit phase modifiers be:
- **Positive-only** (+2/0 for winner, +0/0 for loser)
- **Symmetric** (+1/-1 for winner/loser)

### Trade-offs

| Approach | Win Rate Shift | Tier Distribution | Game Feel |
|----------|----------------|-------------------|-----------|
| Positive-only (+2/0) | Same | Skews toward STRONG | Epic victories, decisive outcomes |
| Symmetric (+1/-1) | Same | More balanced | Closer battles, more variance |

### Initial Leaning

**Symmetric (+1/-1)** — preserves more drama in tier outcomes. The commit phase affects WHO wins, but doesn't automatically push toward epic tiers. You still need to roll well to get the strong column.

### Open Questions

1. How does this interact with result tables? Does strong tier need to be rare?
2. What happens when commit phase produces +3/-3 swings?
3. Should strategy and stance have different modifier weights?

---

## Simulation Commands

```bash
# Baseline enumeration
npm run test:battle -- --enumerate

# Compare configurations
npm run test:battle -- --compare

# Custom modifiers
npm run test:battle -- --enumerate --p1mod 2 --p2mod -1

# Seeded simulation (for tracing specific battles)
npm run test:battle -- --battles 100 --seed test123 --verbose
```

---

## 2024-12-26: Commit → Battle Analysis

We built a full commit phase enumeration that links strategy + stance decisions to battle outcomes.

### The Modifier Landscape

The commit phase creates a **distribution of modifier states**, not a single value.

#### v5.2 (Strategy Only, +2 for winner)

| Commit Outcome | Bat Mod | Pit Mod | Net | Probability |
|----------------|---------|---------|-----|-------------|
| Batter wins RPS | +2 | +0 | +2 | 33.33% |
| Pitcher wins RPS | +0 | +2 | -2 | 33.33% |
| RPS tie | +0 | +0 | 0 | 33.33% |

#### v5.3 (Strategy +2, Stance +1)

| Commit Outcome | Bat | Pit | Net | Prob |
|----------------|-----|-----|-----|------|
| Bat wins RPS + Match | +3 | +0 | +3 | 8.33% |
| Bat wins RPS + Fooled | +2 | +1 | +1 | 8.33% |
| Bat wins RPS + Miss | +2 | +0 | +2 | 16.67% |
| Pit wins RPS + Match | +1 | +2 | -1 | 8.33% |
| Pit wins RPS + Fooled | +0 | +3 | -3 | 8.33% |
| Pit wins RPS + Miss | +0 | +2 | -2 | 16.67% |
| RPS tie + Match | +1 | +0 | +1 | 8.33% |
| RPS tie + Fooled | +0 | +1 | -1 | 8.33% |
| RPS tie + Miss | +0 | +0 | 0 | 16.67% |

### Weighted Battle Outcomes

When we weight each modifier state by its probability and combine with battle enumeration:

| Configuration | BatWin | PitWin | Tie | Weak | Solid | Strong |
|---------------|--------|--------|-----|------|-------|--------|
| v5.2 (Strat +1) | 44.5% | 44.5% | 11.0% | 11.3% | 49.0% | 39.7% |
| v5.2 (Strat +2) | 44.9% | 44.9% | 10.2% | 8.5% | 43.9% | 47.6% |
| v5.2 (Strat +3) | 45.4% | 45.4% | 9.1% | 6.6% | 36.6% | 56.9% |
| v5.3 (S+2, St+1) | 45.0% | 45.0% | 10.0% | 6.8% | 40.5% | 52.6% |
| v5.3 (S+1, St+1) | 44.6% | 44.6% | 10.8% | 9.1% | 46.2% | 44.7% |
| v5.3 (S+2, St+2) | 45.2% | 45.2% | 9.6% | 5.6% | 36.5% | 57.8% |

### Key Findings

1. **All configs are perfectly balanced** — Batter and pitcher always have equal win rates (~45%)
2. **Higher strategy bonus → more Strong tier wins** — The bonus pushes winning rolls into strong territory
3. **Adding stance shifts toward Strong** — Creates more extreme modifier combinations (+3/0, 0/+3)
4. **Ties decrease as bonuses increase** — Higher modifiers mean fewer dead-heat rolls

---

## 2024-12-26: Skill Advantage Analysis — "The Poker Effect"

The game mechanics are balanced, but **human decisions create skill edges** — just like poker.

### The Core Insight

The dice are fair. The mechanics are balanced. But the **decisions** (RPS choices, stance anticipation) create opportunity for skill expression.

If one player is better at reading the other:
- They win RPS more often than 33%
- As batter: they anticipate pitch location more often than 25%
- As pitcher: they deceive the batter more often than 25%

### RPS Reading Skill — Quantified

| Batter RPS Win% | Batter Battle Win | Pitcher Battle Win | Edge |
|-----------------|-------------------|--------------------|----- |
| 33.3% (fair) | 44.9% | 44.9% | 0% |
| 40.0% (slight read) | 47.7% | 42.1% | +5.7% |
| 45.0% (good read) | 49.9% | 39.9% | +9.9% |
| 50.0% (strong read) | 52.0% | 37.8% | +14.2% |
| 55.0% (dominant) | 54.1% | 35.7% | +18.4% |
| 60.0% (crushing) | 56.2% | 33.6% | +22.7% |

**A player who wins RPS 50% of the time (instead of 33%) gains ~14% battle edge.**

### Stance Reading Skill — Quantified (v5.3 only)

| Batter Read% | Pitcher Fool% | Batter Win | Pitcher Win | Edge |
|--------------|---------------|------------|-------------|------|
| 25% | 25% | 45.0% | 45.0% | 0% |
| 30% | 25% | 45.5% | 44.5% | +1.0% |
| 35% | 25% | 46.0% | 44.0% | +2.0% |
| 25% | 30% | 44.5% | 45.5% | -1.0% |
| 25% | 35% | 44.0% | 46.0% | -2.0% |
| 35% | 15% | 47.0% | 43.0% | +4.0% |
| 15% | 35% | 43.0% | 47.0% | -4.0% |

**Stance skill is worth ~4% edge at most — less than RPS skill (~14%).**

### Two Layers of Skill Expression

| Skill Layer | Value | How It Works |
|-------------|-------|--------------|
| **Strategy (RPS)** | High (~14% edge) | Reading patterns, setting up sequences, varying timing |
| **Stance (Location)** | Lower (~4% edge) | Anticipating pitch location, being unpredictable |

### Design Implication

This is exactly like poker:
- The cards (dice) are random and fair
- The decisions (RPS, stance) create the skill gap
- Over many hands (at-bats), the better player wins

The game rewards:
1. **Pattern recognition** — noticing opponent tendencies
2. **Deception** — varying your own choices to avoid being read
3. **Adaptation** — adjusting mid-game as you learn

---

## 2024-12-26: Stance Modifier Structure Comparison

Comparing winner-only (+1/0) vs symmetric (+1/-1) stance modifiers.

### Modifier Landscapes

**Winner-only (+1/0)** — Max swing: +3 vs +0 (net +3)

| Commit Outcome | Bat | Pit | Net | Prob |
|----------------|-----|-----|-----|------|
| Bat wins RPS + Match | +3 | +0 | +3 | 8.33% |
| Bat wins RPS + Fooled | +2 | +1 | +1 | 8.33% |
| Bat wins RPS + Miss | +2 | +0 | +2 | 16.67% |
| Pit wins RPS + Match | +1 | +2 | -1 | 8.33% |
| Pit wins RPS + Fooled | +0 | +3 | -3 | 8.33% |
| Pit wins RPS + Miss | +0 | +2 | -2 | 16.67% |
| RPS tie + Match | +1 | +0 | +1 | 8.33% |
| RPS tie + Fooled | +0 | +1 | -1 | 8.33% |
| RPS tie + Miss | +0 | +0 | 0 | 16.67% |

**Symmetric (+1/-1)** — Max swing: +3 vs -1 (net +4)

| Commit Outcome | Bat | Pit | Net | Prob |
|----------------|-----|-----|-----|------|
| Bat wins RPS + Match | +3 | -1 | +4 | 8.33% |
| Bat wins RPS + Fooled | +1 | +1 | 0 | 8.33% |
| Bat wins RPS + Miss | +2 | +0 | +2 | 16.67% |
| Pit wins RPS + Match | +1 | +1 | 0 | 8.33% |
| Pit wins RPS + Fooled | -1 | +3 | -4 | 8.33% |
| Pit wins RPS + Miss | +0 | +2 | -2 | 16.67% |
| RPS tie + Match | +1 | -1 | +2 | 8.33% |
| RPS tie + Fooled | -1 | +1 | -2 | 8.33% |
| RPS tie + Miss | +0 | +0 | 0 | 16.67% |

### Battle Outcomes Comparison

| Stance Mode | BatWin | PitWin | Tie | Weak | Solid | Strong |
|-------------|--------|--------|-----|------|-------|--------|
| Winner-only (+1/0) | 45.0% | 45.0% | 10.0% | 6.8% | 40.5% | **52.6%** |
| Symmetric (+1/-1) | 45.2% | 45.2% | 9.6% | 8.2% | 42.6% | 49.3% |
| v5.2 (no stance) | 44.9% | 44.9% | 10.2% | 8.5% | 43.9% | 47.6% |

### The Surprising Finding

**Winner-only (+1/0) produces MORE Strong tier wins**, not fewer!

This seems counter-intuitive since symmetric has a bigger net swing (+4 vs +3). But tier is based on the **winning roll VALUE**, not the margin.

**Why winner-only has more Strong wins:**
- With +3/0: Winner rolls 2d6+3 (5-15), loser rolls 2d6+0 (2-12)
- When winner wins, their roll is often 10+ → Strong
- With +3/-1: Loser rolls 2d6-1 (1-11), so winner can win with a **lower roll**
- Lower winning rolls = more Weak/Solid tiers

### Design Implications

| Approach | Tier Effect | Game Feel |
|----------|-------------|-----------|
| **Winner-only (+1/0)** | More Strong (52.6%) | Bigger plays, more HRs, more Ks |
| **Symmetric (+1/-1)** | More balanced (49.3%) | Tighter games, more grinding |

**Recommendation:** Winner-only (+1/0) gives more dramatic moments. The current game.ts implementation already uses this model.

---

## 2024-12-26: 2d6 Curve Shift Analysis

Understanding how modifiers shift the probability distribution.

### The Bell Curve Slides Up

The 2d6 distribution is a bell curve peaking at 7. Adding a modifier simply slides the entire curve up by that amount — the shape stays identical.

```
2d6+0 (baseline):         Peak at 7 (Solid)
   2: ██             W
   3: ████           W
   4: ██████         W
   5: ████████       W
   6: ██████████     W
   7: ████████████   S  ← peak
   8: ██████████     S
   9: ████████       S
  10: ██████         ★
  11: ████           ★
  12: ██             ★

2d6+2 (strategy winner): Peak at 9 (Solid)
   4: ██             W
   5: ████           W
   6: ██████         W
   7: ████████       S
   8: ██████████     S
   9: ████████████   S  ← peak
  10: ██████████     ★
  11: ████████       ★
  12: ██████         ★
  13: ████           ★
  14: ██             ★

2d6+3 (max commit):      Peak at 10 (Strong!)
   5: ██             W
   6: ████           W
   7: ██████         S
   8: ████████       S
   9: ██████████     S
  10: ████████████   ★  ← peak
  11: ██████████     ★
  12: ████████       ★
  13: ██████         ★
  14: ████           ★
  15: ██             ★

Legend: W=Weak, S=Solid, ★=Strong
```

### Tier Probabilities by Modifier

| Mod | Weak (≤6) | Solid (7-9) | Strong (10+) | Peak |
|-----|-----------|-------------|--------------|------|
| +0 | 41.7% | 41.7% | **16.7%** | 7 |
| +1 | 27.8% | 44.4% | **27.8%** | 8 |
| +2 | 16.7% | 41.7% | **41.7%** | 9 |
| +3 | 8.3% | 33.3% | **58.3%** | 10 |

### Why This Matters

- **Baseline (+0)**: Only 16.7% chance of Strong tier
- **Strategy winner (+2)**: 41.7% Strong — curve peak moves to edge of Strong zone
- **Full commit winner (+3)**: 58.3% Strong — majority of probability mass in Strong

This is why winning the commit phase is so impactful: you're physically relocating your probability distribution into better tier zones. The dice math doesn't change — you're just playing on a different part of the number line.

Run `npm run show:curve` to see the full visualization.

---

## Simulation Commands

```bash
# Baseline enumeration
npm run test:battle -- --enumerate

# Compare configurations
npm run test:battle -- --compare

# Custom modifiers
npm run test:battle -- --enumerate --p1mod 2 --p2mod -1

# Commit → Battle analysis (v5.3)
npm run test:battle -- --commit

# Commit → Battle analysis (v5.2, strategy only)
npm run test:battle -- --commit --no-stance

# Compare multiple commit configurations
npm run test:battle -- --commit --compare

# Skill advantage analysis ("poker effect")
npm run test:battle -- --skill

# Stance modifier comparison (+1/0 vs +1/-1)
npm run test:battle -- --stance-compare

# Seeded simulation (for tracing specific battles)
npm run test:battle -- --battles 100 --seed test123 --verbose
```

---

## 2024-12-26: Run Source Analysis — "The Crooked Number Problem"

### The Observation

Playtests consistently produce 1-2 runs per game, while simulation shows ~5.5 runs/game. Why the discrepancy?

### The Structural Asymmetry

The game has a fundamental asymmetry between pitcher and batter goals:

| Role | Goal | Difficulty |
|------|------|------------|
| **Pitcher** | Accumulate 3 outs | Can happen over any number of PAs |
| **Batter** | Score runs | Must chain 4+ successes before 3 outs |

**To score 1 run from singles alone:**
1. Batter 1: Win battle + get hit → runner on 1st
2. Batter 2: Win battle + get hit → runners on 1st & 2nd
3. Batter 3: Win battle + get hit → bases loaded
4. Batter 4: Win battle + get hit → 1 run scores

That's 4 battle wins (~50% each) AND 4 hits (~65% of wins) = incredibly unlikely consecutively.
Meanwhile, pitcher just needs 3 outs sprinkled anywhere.

### Where Runs Actually Come From

Simulation of 1000 games (3 innings each):

```
RUN SOURCES:
  HR:    44.6%  ← Nearly half!
  2B:    31.0%
  1B:    15.9%
  BB:     0.5%
  O-RA:   8.1%
```

**75% of runs come from extra-base hits (HR + 2B).**

This matches real MLB! According to [Twins Daily analysis](https://twinsdaily.com/forums/topic/62605-percentage-of-runs-scored-via-the-home-run/), the 2023 Twins scored **47.3% of runs via home runs**. Our simulation's 44.6% is realistic.

### Why Playtests Feel Different

1. **Small sample size** — In 5-10 games, HR variance is huge
2. **"Crooked numbers" require luck** — Stringing singles rarely scores
3. **The HR shortcut** — When you don't hit HRs, runs dry up

A typical playtest inning looks like:
```
  2B → runner on 2nd
  1B → runners on 1st & 3rd
  OUT
  OUT
  O-RF → 3 outs, runners STRANDED
```

This is realistic baseball! The simulation's higher scoring comes from more samples averaging out the HR variance.

### Design Implications

**Current state is actually realistic** — the HR/run ratio matches MLB.

**But is it FUN?** Options to create more "manufactured runs":

1. **Runners pressure pitchers** — When runners on base, batter gets +1 modifier?
2. **Scoring from 2nd is easier** — 2B always scores R2, not just with strong tier?
3. **More O-RA outcomes** — Runners advance on more pitcher outs?
4. **Reduce HR frequency** — Shift outcomes toward singles, require more chaining?

### The Fundamental Question

Do we want:
- **Realistic baseball** — Low scoring, HR-dependent, lots of stranded runners
- **Arcade baseball** — More manufactured runs, base-to-base progression

This is a game feel decision, not a balance decision.

---

## 2024-12-26: Baserunner Pressure Mechanics — "R3 Pressure"

### The Real-World Insight

> "In 20 years of baseball I can tell you it sure feels like more passed balls happen with a runner on third."

Pitchers **do** behave differently with runners in scoring position. They're more careful, more likely to nibble corners, more walks. This creates "manufactured runs" opportunities.

### The Mechanic

When a runner occupies 3rd base, the **batter's result ladder becomes more favorable**:

```
Normal:       OUT → OUT → 1B → 2B → HR  (positions 0-4)
R3 Pressure:  OUT → BB  → 1B → 2B → HR  (one out becomes walk)
```

Pitcher gets careful, batter benefits.

### Simulation Results

| Metric | Baseline | R3 Pressure | Delta |
|--------|----------|-------------|-------|
| Runs/game | 5.97 | 6.60 | **+10.5%** |
| HR % of runs | 58.9% | 56.0% | -2.9% |
| BB % of runs | 0.9% | **3.8%** | +2.9% |
| OBP | .405 | .419 | +.014 |

### Analysis

The mechanic achieves its goal:
- **Walks quadruple** (0.9% → 3.8% of runs)
- **HR share decreases** — runs shift from home runs to manufactured runs
- **~10% more scoring** — the favorable ladder creates more rallies
- **OBP increases** — more baserunners getting on

### Implementation Note

There's a design choice here:

**Option A:** `OUT → BB → 1B → 2B → HR` (5 positions, one out → walk)
- HR still reachable via normal play (position 4)
- Boxcars = HR as usual

**Option B:** `OUT → BB → BB → 1B → 2B → HR` (6 positions, two outs → walks)
- HR **only** via boxcars (position 5 = HR, but max normal position is 4)
- More walks, but HRs become critical-only
- Models "pitcher so careful they'd rather walk than give up HR"

Currently implemented: **Option A** (the more conservative approach).

### Run Command

```bash
npm run test:game -- --compare-r3       # Compare with/without R3 pressure
npm run test:game -- --r3pressure       # Run single simulation with R3 pressure
```

---

## Ideas to Explore: Manufactured Runs

### BUNT Mechanic (Proposed)

A "sacrifice" play where batter trades at-bat outcome for runner advancement.

**Rules concept:**
- Batter must choose FINESSE (gives pitcher advance intel — they can counter with BALANCE for +2)
- After commitments revealed, before dice: batter may announce "BUNT"
- Bunt converts any batter win to: "Runners advance one base, batter out"
- Batter loss = automatic out (no walk chance from pitcher's weak roll)

**Design philosophy:**
- Creates tension: pitcher KNOWS it's finesse, but bunt negates their hit
- Strategic: sacrifice scoring position for guaranteed advancement
- Risk/reward: if pitcher wins battle, bunt doesn't help at all

**Trade-offs to test:**
- How valuable is the "advance runners" guarantee vs. normal outcome variance?
- Does FINESSE constraint offset the bunt benefit enough?
- Does this slow down the "fast" game too much?

**House rule version (no code):**
> Before dice are rolled, batter may announce "bunt." Converts any batter hit to "R1→R2, R2→R3, R3 scores, batter out." Batter loss = automatic out, no walk chance.

### Other R3 Pressure Variants

**Option B (6-position, HR via boxcars only):**
```
OUT → BB → BB → 1B → 2B → HR
```
- More dramatic: "pitcher so careful, HRs only come from lucky boxcars"
- Tested via `BATTER_R3_PRESSURE_6POS` in result.ts

**R2/R3 Pressure (graduated):**
- R2: One out → walk
- R3: Two outs → walks
- Bases loaded: Three outs → walks (no outs possible except DP!)

**Momentum modifier:**
- Each consecutive hit: batter gets +1 to next battle
- Reset on out
- Models "rally psychology"

---

## Future Analysis Needed

- [x] Full commit phase enumeration (strategy × stance × battle)
- [x] Skill advantage analysis (how human reads affect outcomes)
- [x] Run source analysis (where do runs come from)
- [x] R3 pressure mechanic (baserunner pressure)
- [ ] Impact of different tier thresholds
- [ ] Bunt mechanic testing
- [ ] Full game simulation with skill-adjusted players
