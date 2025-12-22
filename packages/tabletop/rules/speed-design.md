# CHEDDAR BOB: SPEED EDITION v5

## Design Goals

- **At-bat resolution: < 1 minute**
- **Full 3-inning game: 15-20 minutes**
- **Head-to-head drama on every at-bat**
- **Physical satisfaction: magnetic click selectors + dice**

---

## FROZEN FOR PLAYTESTING (v5_final)

This version is frozen for playtesting. See simulation stats at bottom.

---

## CORE FLOW

```
1. SELECT    Both secretly pick Approach + Arrow
2. STEAL?    Runner commits blind (optional)
3. REVEAL    Show choices, calculate modifiers
4. BATTLE    Both roll 2d6 + modifiers, higher wins
5. RESULT    Winner rolls for outcome
```

---

## 1. SELECT

### Pitcher Picks

**Approach:**
| Pitch | Symbol | Plus Move |
|-------|--------|-----------|
| Fastball | ⚡ FB | FB+ available |
| Curveball | 🌀 CB | CB+ available |
| Changeup | 🔄 CH | None (safe) |

**Arrow (Location):**
```
       ↑ UP
   ← IN    OUT →
       ↓ DOWN
```

### Batter Picks

**Approach:**
| Approach | Symbol | Plus Move |
|----------|--------|-----------|
| Power | 💪 | POWER+ available |
| Control | 🎯 | None (safe) |
| Contact | ✋ | CONTACT+ available |

**Arrow (Guess):**
Same four arrows - batter is guessing where the pitch will be.

---

## 2. MODIFIERS

### RPS Matchup (+1/-1 to battle)

```
CB → Power → FB → Contact → CH → Control → CB
```

| Pitcher ↓ / Batter → | Power | Control | Contact |
|---------------------|:-----:|:-------:|:-------:|
| **Fastball** | B+1,P-1 | TIE | P+1,B-1 |
| **Curveball** | P+1,B-1 | B+1,P-1 | TIE |
| **Changeup** | TIE | P+1,B-1 | B+1,P-1 |

**Memory:** Power beats FB, Control beats CB, Contact beats CH

### Arrow Comparison (+1 to battle)

| Comparison | Result |
|------------|--------|
| **Match** (both ↑) | Batter +1 |
| **Opposite** (↑ vs ↓) | Pitcher +1 |
| **Perpendicular** (↑ vs ←) | TIE |

---

## 3. BATTLE ROLL

Both roll 2d6 + modifiers. **Higher wins. Ties reroll.**

### Tier Thresholds

Winner's modified total determines tier:

| Total | Tier |
|-------|------|
| ≤6 | Weak |
| 7-9 | Solid |
| 10+ | Strong |

### Snake Eyes / Boxcars in Battle

| Roll | Result |
|------|--------|
| Pitcher 🐍 | Batter auto STRONG tier |
| Batter 🐍 | Automatic K (skip result) |
| Pitcher 12 | Pitcher auto wins |
| Batter 12 | Batter auto wins |

---

## 4. RESULT TABLES

Winner rolls 2d6. **Tier determines column. No modifiers on result roll.**

### Batter Wins → Batter Rolls

| Roll | Weak | Solid | Strong |
|------|:----:|:-----:|:------:|
| ≤7 | OUT | OUT | 1B |
| 8-9 | OUT | 1B | 2B+ |
| 10+ | 1B | 2B+ | HR |

- **+ = Stretch opportunity** (battle roll)
- **🐍 = OUT** (critical failure)

### Pitcher Wins → Pitcher Rolls

| Roll | Weak | Solid | Strong |
|------|:----:|:-----:|:------:|
| ≤7 | BB | O+RA | K+RC |
| 8-9 | O+RA | K+RC | O-RF |
| 10+ | O+RC | O-RF | DP! |

**Legend:**
- **BB** = Walk
- **O** = Out / **K** = Strikeout
- **RA** = Runners Advance freely
- **RC** = Runners Challenge (battle roll, tie → runner)
- **RF** = Runners Frozen
- **DP!** = Guaranteed Double Play (if runner on 1st)
- **🐍 = HBP** (critical failure)

---

## 5. BASERUNNING

### Battle Rolls (tie → runner, 🐍 = auto fail, 12 = auto win)

**Steal:** Runner commits blind after SELECT, before REVEAL.
- FB: -1 to runner (quick delivery)
- CB: +1 to runner (slow delivery)

**Stretch:** Pure battle, no modifiers.

**Runner Challenge (RC):** Pure battle, no modifiers.

### Runner Advancement on Hits

| Hit | Weak/Solid | Strong |
|-----|------------|--------|
| 1B | R1→2nd, R2→3rd | Same |
| 2B | R1→3rd, R2 scores | R1 scores! |
| 3B/HR | All score | All score |

---

## 6. PLUS MOVES

Declared during SELECT, before REVEAL.

### POWER+ (Batter)
| Battle Result | Effect |
|---------------|--------|
| WIN | Tier +1 (already strong = +1 to result) |
| LOSE | Tier -1 (already weak = swinging K) |

### CONTACT+ (Batter)
| Battle Result | Effect |
|---------------|--------|
| WIN | Result ≤4 = walk, max hit = single |
| LOSE | Runners do NOT advance on out |

### FB+ / CB+ (Pitcher)
| Battle Result | Effect |
|---------------|--------|
| WIN | +2 to result roll |
| LOSE | Free base (walk) |

---

## SIMULATION STATS (v5_final)

5000 at-bat simulation:

| Stat | Value | MLB Reference |
|------|-------|---------------|
| AVG | .318 | ~.250 |
| OBP | .361 | ~.320 |
| SLG | .534 | ~.400 |
| HR% | 3.5% | 3.5% |
| K% | 19% | 22% |
| Battle | 49% B / 51% P | - |

**Design choice:** Higher offense than MLB for more action.
HR rate matches MLB. K rate close to MLB.

### Per-Game Stats (100 games, 3 innings)

| Stat | Value |
|------|-------|
| Runs/game | ~5 |
| Hits/game | ~9 |
| Extra innings | 15% |
| Walkoffs | 12% |

---

## DESIGN PRINCIPLES

1. **Symmetric tables** - Batter and pitcher tables mirror each other diagonally
2. **Who wants it, rolls it** - Player trying to accomplish something rolls
3. **Snake eyes = critical failure** - Drama moments
4. **Tier determines column** - No modifier stacking on result roll
5. **Ties reroll in battle** - More tension
6. **Tie goes to runner** - On all baserunning battles

---

## VERSION HISTORY

| Tag | Description |
|-----|-------------|
| v5_balanced | Conservative thresholds (≤8/9-10/11+), .233 AVG |
| v5_action | Action thresholds (≤6/7-9/10+), .316 AVG |
| **v5_final** | K+RC labels added, 19% K rate, frozen for playtest |

---

*Cheddar Bob: Speed Edition v5 - Frozen for Playtesting*
