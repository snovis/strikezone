# Cheddar Bob v4: Testing Methodology

## Overview

The game has evolved from pitch-by-pitch simulation to **situation management**. This is a fast 3-inning game (~5 minutes) that players could "bet" on. Balance testing should reflect this shift.

---

## Simulation Layers

Test in layers to isolate what each mechanic contributes to game balance.

### Layer 1: Core Mechanics Only

The foundation. No optional rules.

```
SELECT → REVEAL → BATTLE → RESULT → EXTRAS
```

**What we're testing:**
- RPS matchup balance (each approach wins ~1/3)
- Location/Setup modifier impact
- Tier distribution (weak/solid/strong)
- Battle win rates (pitcher vs batter)
- Result table outcomes

**What we're NOT testing yet:**
- Plus moves
- Steal attempts
- Player decision-making

**Expected baseline:**
| Metric | Target Range |
|--------|--------------|
| Batter wins battle | 45-50% |
| Tier: Weak | ~40% |
| Tier: Solid | ~35% |
| Tier: Strong | ~25% |

---

### Layer 2: Plus Moves

Add the betting mechanic. Test with different AI personalities.

**AI Personalities:**

| Personality | Behavior |
|-------------|----------|
| **Conservative** | Never uses plus moves |
| **Aggressive** | Always uses plus moves when available |
| **Situational** | Uses plus moves based on game state |

**Situational Logic Examples:**
- POWER+: When behind by 2+ runs in late innings
- CONTACT+: Runner on 3rd with <2 outs
- FB+/CB+: 2-strike counts, close game

**What we're measuring:**
- Does using plus moves improve win rate?
- By how much? (target: 5-10% swing, not dominant)
- Do aggressive vs conservative strategies have trade-offs?

---

### Layer 3: Steal Attempts

Test the high-stakes blind commit mechanic.

**Variables:**
- Pitch type distribution when runner on base
- Steal attempt frequency
- Success rate by pitch type (FB/-1, CH/0, CB/+1)

**Key question:** Does the steal mechanic create a real dilemma for pitchers?
- If pitcher always throws FB to kill steal → batter crushes it
- If pitcher throws CB for strikeout → runner steals easy
- Ideal: No dominant strategy

---

## Balance Targets

### Offensive Stats (per game, 3 innings)

| Metric | Target | Notes |
|--------|--------|-------|
| AVG | .250-.300 | Realistic but fun |
| OBP | .300-.350 | Walks + HBP matter |
| SLG | .400-.500 | Extra base hits exciting |
| K% | 15-25% | Not too swingy |
| BB% | 5-10% | Walks from plus moves mostly |
| HR% | 2-4% | Rare but exciting |

### Game Flow

| Metric | Target | Notes |
|--------|--------|-------|
| Runs per game (both teams) | 6-10 | Enough scoring to be exciting |
| Pitches per at-bat | N/A | We don't track pitches anymore |
| At-bats per inning | 4-5 | Keeps game moving |
| Game duration | ~5 min (3 inn) | Fast enough to "bet" on |

### Plus Move Value

| Scenario | Expected Impact |
|----------|-----------------|
| POWER+ win | +1 tier = ~15% better outcome |
| POWER+ lose | -1 tier or K = significant risk |
| Net value | Should be ~neutral or slight negative EV |

The goal: Plus moves are **situationally valuable**, not always-use or never-use.

---

## Simulation Architecture

### Phase 1: Core Simulator

```
scripts/v4-simulate.ts
```

**Features:**
- Implements v4 core mechanics exactly
- Random approach selection (uniform distribution)
- Random location/setup selection
- Tracks all metrics above
- JSON output for analysis

**Usage:**
```bash
npx tsx scripts/v4-simulate.ts --at-bats 1000
npx tsx scripts/v4-simulate.ts --games 100 --innings 3
```

### Phase 2: AI Personalities

```
scripts/v4-simulate.ts --ai conservative
scripts/v4-simulate.ts --ai aggressive
scripts/v4-simulate.ts --ai situational
```

**Compare:**
- Win rates by AI type
- Plus move usage frequency
- Outcome distributions

### Phase 3: Full Game Simulation

```
scripts/v4-game.ts --games 100 --innings 3 --json
```

**Track:**
- Final scores
- Win distribution (blowouts vs close games)
- Comeback frequency
- Extra innings rate

---

## Analysis Tools

### Statistical Output

```
scripts/analyze-v4.ts --file sim-results.json
```

**Reports:**
- Summary statistics (AVG, K%, etc.)
- Tier distribution charts
- Plus move impact analysis
- Matchup win rate matrix

### Comparison Mode

```
scripts/analyze-v4.ts --compare baseline.json plusmoves.json
```

Shows delta between simulation runs.

---

## Tuning Levers

If balance is off, these are the knobs to turn:

### Tier Thresholds
```
Current: ≤8 Weak | 9-10 Solid | 11+ Strong
```
- Lower thresholds = more strong tiers = more batter success
- Higher thresholds = more weak tiers = more pitcher success

### Result Tables

**Batter wins:**
| Roll | Weak | Solid | Strong |
|------|:----:|:-----:|:------:|
| ≤6 | OUT | 1B | 1B |
| 7-9 | 1B | 2B | 2B |
| 10+ | 1B+ | 2B+ | HR |

- Adjust roll thresholds (≤6 vs ≤5)
- Adjust outcomes (weak 7-9 = 1B vs OUT)

**Pitcher wins:**
| Roll | Weak | Solid | Strong |
|------|:----:|:-----:|:------:|
| ≤6 | GB | FO | LO |
| 7-9 | GB | FO | LO |
| 10+ | GB | K | K |

- Adjust K threshold (10+ vs 11+)
- Add more out variety

### Plus Move Effects

| Move | Current Effect | Tuning Options |
|------|----------------|----------------|
| POWER+ win | Tier +1 | Could be +2 to result instead |
| POWER+ lose | Tier -1 or K | Could just be -1 to result |
| CONTACT+ win | Walk on ≤4 | Adjust walk threshold |
| FB+/CB+ win | +2 to result | Adjust bonus amount |

### Steal Thresholds

```
Current: 7+ = safe, ≤6 = caught
```
- Lower threshold = more steals = more action
- Higher threshold = fewer steals = more conservative play

---

## Success Criteria

The game is balanced when:

1. **No dominant strategy** - Aggressive and conservative play both viable
2. **Meaningful choices** - Plus moves matter but don't decide everything
3. **Realistic feel** - Stats roughly match baseball expectations
4. **Exciting games** - Enough variance for comebacks, close games
5. **Fast resolution** - 3-inning game in ~5 minutes

---

## Next Steps

1. [ ] Build v4 core simulator (Layer 1)
2. [ ] Run baseline stats (1000+ at-bats)
3. [ ] Validate tier distribution and battle win rates
4. [ ] Add plus move AI personalities (Layer 2)
5. [ ] Compare outcomes across AI types
6. [ ] Add steal mechanics (Layer 3)
7. [ ] Full game simulation with scoring
8. [ ] Tune as needed based on results

---

*Cheddar Bob v4 - Testing Methodology v1.0*
