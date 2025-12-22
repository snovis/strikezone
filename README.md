# Strikezone

Multi-platform baseball simulation engine.

## Architecture

```
strikezone/
├── packages/
│   ├── engine/      # Core game logic (TypeScript)
│   ├── web/         # React web app
│   ├── tabletop/    # Printable game materials
│   ├── playdate/    # Playdate handheld (Lua) - STUB
│   └── ios/         # iOS native (Swift) - STUB
└── package.json     # Workspace root
```

## Game Modes

### Speed Mode
Fast-paced tabletop play. One decision per at-bat, ~30 seconds per at-bat.

- Pitcher picks: Approach (Fastball/Curveball/Changeup) + Location (arrow)
- Batter picks: Approach (Power/Control/Contact) + Location (arrow)
- RPS matchup + location comparison = modifiers
- Battle roll (2d6 each, higher wins)
- Winner rolls on their result table

### Classic Mode
Pitch-by-pitch simulation. Count builds over 5-15 pitches per at-bat.

- Each pitch is a decision point
- Count tension (0-0 through 3-2)
- Hold-up rolls on ball zone swings
- "Seeing it" bonuses for patient at-bats

## Getting Started

```bash
# Install dependencies
npm install

# Run web app
npm run dev

# Build engine
npm run build --workspace=@strikezone/engine
```

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| `@strikezone/engine` | Core game logic | Ready |
| `@strikezone/web` | React web app | Ready |
| `@strikezone/tabletop` | Printable docs | Ready |
| `@strikezone/playdate` | Playdate port | Stub |
| `@strikezone/ios` | iOS native | Stub |

## Engine Usage

```typescript
import { speed, clearBases, advanceRunnersOnHit } from '@strikezone/engine';

// Resolve an at-bat
const pitcher = { approach: 'fastball', location: 'up' };
const batter = { approach: 'power', location: 'up' };
const result = speed.resolveAtBat(pitcher, batter);

console.log(result.finalOutcome); // '2B', 'K', 'OUT', etc.

// Apply to game state
if (speed.isHit(result.finalOutcome)) {
    const hitType = speed.parseHitType(result.finalOutcome);
    const advancement = advanceRunnersOnHit(bases, hitType, result.winnerTier);
    // advancement.bases, advancement.runs
}
```

## Credits

Evolved from "Cheddar Bob" tabletop baseball dice game.
Engine designed for balance: .318 AVG, .361 OBP, .534 SLG, 3.5% HR, 19% K.
