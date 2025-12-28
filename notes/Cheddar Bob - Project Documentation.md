---
title: Cheddar Bob - Project Documentation
version: "1.0"
created: 2024-12-28
updated: 2024-12-28
tags:
  - games
  - cheddar-bob
  - project
  - development
  - typescript
status: documentation
---

# Cheddar Bob: Project Documentation

## Repository Information

| Field | Value |
|-------|-------|
| **Project Name** | Cheddar Bob / Strikezone Grapple Engine |
| **Local Path** | `/Users/scottnovis/dev/strikezone-grapple-engine` |
| **Primary Branch** | `grapple-engine` |
| **Stable Tag** | `v1.0-cheddar-bob` |
| **Language** | TypeScript |
| **Runtime** | Node.js |

---

## Branch Structure

| Branch | Purpose |
|--------|---------|
| `main` | Default branch |
| `grapple-engine` | Primary development branch (v1.0 stable) |
| `v5.4-tier-delta` | Experimental: tier delta modifier (not adopted) |

---

## File Structure

```
strikezone-grapple-engine/
├── src/                    # TypeScript source
│   ├── dice.ts            # Core randomness (2d6, seeded random)
│   ├── strategy.ts        # Strategy triangle (Power/Balance/Finesse)
│   ├── stance.ts          # Stance system (v5.3+, not in Bush League)
│   ├── commit.ts          # Combines commitments → modifiers
│   ├── battle.ts          # Dice + modifiers → winner + tier
│   ├── result.ts          # Result tables and resolution
│   ├── game.ts            # Full game simulation
│   ├── player.ts          # CPU player behavior
│   ├── test-battle.ts     # Battle phase test harness
│   ├── test-result.ts     # Result table test harness
│   ├── test-stance.ts     # Stance system tests
│   ├── test-strategy.ts   # Strategy triangle tests
│   └── test-game.ts       # Game simulation test harness
│
├── docs/                   # Documentation and printables
│   ├── bush-league-quickref.html    # v1.1 rules card (Bush League)
│   ├── cheddar-bob-v53-rules.html   # v5.3 rules card (with Stance)
│   ├── tuning-analysis.md           # Simulation data and analysis
│   └── grapple-engine.md            # Design philosophy
│
├── notes/                  # Obsidian notecards
│   ├── Cheddar Bob Bush League - Rules.md
│   ├── Cheddar Bob - Design Philosophy.md
│   └── Cheddar Bob - Project Documentation.md
│
├── CLAUDE.md              # Project memory/context for AI assistant
├── package.json           # Node.js project config
└── tsconfig.json          # TypeScript config
```

---

## Core Modules

### dice.ts
- `roll2d6()` — Roll two 6-sided dice
- `setSeed(seed)` — Set deterministic seed for reproducible tests
- `resetRandom()` — Return to true randomness

### strategy.ts
- `StrategySet` interface — Defines strategy triangles
- `BASEBALL_STRATEGY_SET` — Power/Balance/Finesse with explanations
- `resolveStrategy()` — Determines winner and modifier

### battle.ts
- `resolveBattle()` — Core battle resolution
- `getTier()` — Convert roll to Weak/Solid/Strong
- Battle phase criticals (Boxcars/Snake Eyes)

### result.ts
- `ResultTable2D` interface — 2D outcome tables
- `BATTER_BUSH_LEAGUE_V11` — Bush League v1.1 batter table
- `resolveResult2D()` — 2D table lookup
- `BATTER_RESULT_SET` / `PITCHER_RESULT_SET` — Ladder-based tables

### game.ts
- `GameConfig` interface — All configuration options
- `simulateGame()` — Run single game with optional verbose output
- `runSimulation()` — Run N games and report statistics
- `simulateAtBat()` — Core at-bat resolution

---

## NPM Scripts

```bash
# Game simulation
npm run test:game                    # Run 100 games (default)
npm run test:game -- --games 1000    # Run 1000 games
npm run test:game -- --single --verbose  # Play-by-play single game
npm run test:game -- --innings 9     # 9-inning games
npm run test:game -- --r3pressure    # Enable R3 pressure mechanic
npm run test:game -- --bush-v11      # Bush League v1.1 (Weak/Solid=BB)
npm run test:game -- --compare-r3    # Compare with/without R3 pressure
npm run test:game -- --compare-bush-v11  # Compare v1.0 vs v1.1

# Component tests
npm run test:battle                  # Battle phase analysis
npm run test:battle -- --enumerate   # Exact probabilities
npm run test:result                  # Result table analysis
npm run test:result -- --table       # Show 2D result tables
npm run test:strategy                # Strategy resolution tests
npm run test:stance                  # Stance system tests

# Build
npm run build                        # Compile TypeScript
```

---

## Configuration Options (GameConfig)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `innings` | number | 3 | Innings per game |
| `strategySet` | StrategySet | BASEBALL | Strategy triangle to use |
| `strategyWinBonus` | number | 2 | Modifier for strategy winner |
| `useStance` | boolean | false | Enable stance (location) system |
| `stanceSet` | StanceSet | BASEBALL | Stance options |
| `stanceBonus` | number | 1 | Modifier for stance match |
| `useR3Pressure` | boolean | false | Batter-favorable on R3 |
| `useBushLeagueV11` | boolean | false | Use 2D table with Weak/Solid=BB |
| `verbose` | boolean | false | Show play-by-play output |

---

## Version History

### v1.0 — Cheddar Bob (December 2024)
- Stable, playtested version
- Core grapple engine with strategy triangle
- R3 pressure mechanic
- Ladder-based result resolution

### v1.1 — Bush League (December 2024)
- Simplified for casual/party play
- 2D result table (no ladder lookup)
- Weak/Solid batter result = BB (playtest feedback)
- Updated quickref with copyright

### Experimental (Not Adopted)
- **v5.4 Tier Delta** — Loser's tier affects result modifier
  - Result: +19% scoring, +42% HR rate (too swingy)
  - Branch: `v5.4-tier-delta`

---

## Simulation Stats (v1.1)

| Metric | v1.0 | v1.1 |
|--------|------|------|
| Runs/Game | ~6.0 | ~6.5 |
| AVG | .351 | .354 |
| OBP | .405 | .422 |
| HR Rate | 7.0% | 7.4% |

---

## Productization Status (December 2024)

Preparing for physical product release:
- Red dice with white pips
- Tins for packaging
- Branding and stickers
- Game packs for influencers
- Researching Kickstarter

---

## Related Notes

- [[Cheddar Bob Bush League - Rules]] — Complete rules reference
- [[Cheddar Bob - Design Philosophy]] — Grapple engine design philosophy

---

## Legal

**Copyright:** © 2025 Rymare International LLC

All rules cards and score sheets must include copyright notice.

---

*Last updated: December 28, 2024*
