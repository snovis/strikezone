# Strikezone for iOS

Native iOS app using Swift and SwiftUI.

## Status

**STUB** - Not yet implemented.

## Platform Notes

- Native Swift/SwiftUI implementation
- Engine logic ported from TypeScript to Swift
- Full iOS integration (Game Center, haptics, etc.)

## Approach Options

### Option A: Native Swift Port
- Port engine logic to Swift
- Pure native performance
- Full iOS feature access

### Option B: WebView Wrapper
- Embed `@strikezone/web` in WKWebView
- Faster to ship
- Limited native integration

### Option C: React Native
- Share code with web
- Bridge to native features
- Compromise between options

## Directory Structure (planned)

```
ios/
├── Strikezone/
│   ├── StrikezoneApp.swift    # App entry
│   ├── Engine/                 # Ported game logic
│   │   ├── Dice.swift
│   │   ├── Matchup.swift
│   │   ├── Battle.swift
│   │   └── Results.swift
│   ├── Views/
│   │   ├── GameView.swift
│   │   ├── DiamondView.swift
│   │   └── SelectionView.swift
│   └── Models/
│       └── GameState.swift
├── Strikezone.xcodeproj
└── StrikezoneTests/
```

## iOS-Specific Features

- Haptic feedback on dice rolls
- Game Center leaderboards
- iCloud save sync
- Widget for quick game status
- Apple Watch companion (stretch goal)
