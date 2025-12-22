# SCORECARD

## AT-BAT BOX
Each at-bat gets one box. Mark the outcome and base state.

```
┌─────────┐
│    ②    │  ← Bases: fill ①②③ if runner on
│  ③   ①  │
│    ◇    │  ← Home plate
│ ●●●○ K K│  ← Balls (●) Strikes (K)
│   2B    │  ← Outcome: 1B, 2B, 3B, HR, K, BB, F7, etc.
└─────────┘
```

### Base Notation
```
Empty bases:     Runner on 1st:    Bases loaded:
     ○                ○                 ●
   ○   ○            ○   ●             ●   ●
```

### Outcome Codes
| Code | Meaning |
|------|---------|
| 1B | Single |
| 2B | Double |
| 3B | Triple |
| HR | Home Run |
| K | Strikeout |
| Kꜱ | Strikeout swinging |
| Kʟ | Strikeout looking |
| BB | Walk |
| F7 | Fly out to LF |
| F8 | Fly out to CF |
| F9 | Fly out to RF |
| G3 | Ground out to 1B |
| G4 | Ground out to 2B |
| G5 | Ground out to 3B |
| G6 | Ground out to SS |
| DP | Double play |

---

## LINEUP CARD (per team)

```
╔═══════════════════════════════════════════════════════════════════╗
║  #  │ BATTER      │  1  │  2  │  3  │  4  │  5  │  6  │  7  │  8  │  9  ║
╠═════╪═════════════╪═════╪═════╪═════╪═════╪═════╪═════╪═════╪═════╪═════╣
║  1  │ ___________│     │     │     │     │     │     │     │     │     ║
║  2  │ ___________│     │     │     │     │     │     │     │     │     ║
║  3  │ ___________│     │     │     │     │     │     │     │     │     ║
║  4  │ ___________│     │     │     │     │     │     │     │     │     ║
║  5  │ ___________│     │     │     │     │     │     │     │     │     ║
║  6  │ ___________│     │     │     │     │     │     │     │     │     ║
║  7  │ ___________│     │     │     │     │     │     │     │     │     ║
║  8  │ ___________│     │     │     │     │     │     │     │     │     ║
║  9  │ ___________│     │     │     │     │     │     │     │     │     ║
╠═════╧═════════════╪═════╪═════╪═════╪═════╪═════╪═════╪═════╪═════╪═════╣
║         RUNS      │     │     │     │     │     │     │     │     │     ║
║         HITS      │     │     │     │     │     │     │     │     │     ║
╚═══════════════════╧═════╧═════╧═════╧═════╧═════╧═════╧═════╧═════╧═════╝
```

---

## COMPACT SINGLE-SHEET SCORECARD

For quick games, use this minimal format:

```
INNING:  1   2   3   4   5   6   7   8   9   R   H
VISITOR ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
        │   │   │   │   │   │   │   │   │   │   │   │
        └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
HOME    ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
        │   │   │   │   │   │   │   │   │   │   │   │
        └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘

COUNT TRACKER (current at-bat):
  Balls:   ○ ○ ○ ○
  Strikes: ○ ○ ○
  Outs:    ○ ○ ○

BASES:      ○
          ○   ○
```

---

## PITCH-BY-PITCH LOG (optional detail)

For those who want to track every pitch:

```
┌────┬──────┬─────┬──────┬────────┬─────────┬────────┐
│ #  │ Type │ Loc │ Exec │ Result │ Count   │ Notes  │
├────┼──────┼─────┼──────┼────────┼─────────┼────────┤
│ 1  │ FB   │ OUT │ SOLID│ Foul   │ 0-1     │        │
│ 2  │ CB   │ LOW │ MISS │ Ball   │ 1-1     │ Drift→B│
│ 3  │ CH   │ IN  │ PAINT│ Swing K│ 1-2     │        │
│ 4  │ FB   │ UP  │ SOLID│ 2B     │ —       │ RBI    │
└────┴──────┴─────┴──────┴────────┴─────────┴────────┘
```

---

## SEEING IT TOKEN

When batter earns "Seeing It" bonus:
- Place a token/coin on their card
- +1 to next at-bat's contact roll
- Remove after next at-bat (hit or out)
