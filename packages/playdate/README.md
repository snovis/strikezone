# Strikezone for Playdate

Strikezone port for the [Playdate](https://play.date/) handheld gaming device.

## Status

**STUB** - Not yet implemented.

## Platform Notes

- Playdate uses Lua (not JavaScript/TypeScript)
- Engine logic will need to be ported from `@strikezone/engine`
- 400x240 1-bit display
- Crank input could be used for dice rolls!
- D-pad for selections

## Getting Started

1. Install [Playdate SDK](https://play.date/dev/)
2. Port engine logic to Lua
3. Create UI for 1-bit display

## Directory Structure (planned)

```
playdate/
├── source/
│   ├── main.lua        # Entry point
│   ├── engine/         # Ported game logic
│   │   ├── dice.lua
│   │   ├── matchup.lua
│   │   ├── battle.lua
│   │   └── results.lua
│   └── ui/             # Playdate UI
│       ├── game.lua
│       └── sprites/
└── pdxinfo            # Playdate metadata
```

## Crank Integration Ideas

- Crank wind-up → roll dice (release to roll)
- Visual dice spinner while cranking
- Satisfying "click" when roll completes
