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

## Future Analysis Needed

- [ ] Full commit phase enumeration (strategy × stance × battle)
- [ ] Impact of different tier thresholds
- [ ] Result table outcome distributions
- [ ] At-bat level statistics (runs, hits, outs)
