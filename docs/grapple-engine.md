# THE GRAPPLE ENGINE
### *You can't grapple without them grabbing you back.*

---

## A Two-Dimensional Non-Transitive Resolution System

---

## Core Philosophy

Traditional turn-based systems treat conflict as **sequential action**: I act, you react, we resolve. One player is active, one is passive.

The Grapple Engine treats conflict as **simultaneous contest**: We both commit, we both reveal, we both struggle for control, and even then the outcome remains uncertain. Neither player is ever passive.

This creates **engaged uncertainty** at every moment—not through randomness alone, but through the interplay of choice, counter-choice, and contested resolution.

**You can't grapple without them grabbing you back.** The moment you engage, so do they. No one acts in isolation. No one waits their turn.

---

## The Two Dimensions of Non-Transitivity

**Non-transitive** means advantages don't transfer. In a cyclic dominance loop (A beats B, B beats C, C beats A), there is no "best" choice. Every option has a counter.

### Dimension 1: Horizontal (The Selection Loop)

Within any single phase, choices exist in a **cyclic dominance** relationship.

```
    A
   ↗ ↘
  C ← B
```

- A beats B
- B beats C  
- C beats A

**Advantages don't transfer across the loop.** There is no dominant choice. Players must read, predict, and adapt to their opponent—not simply optimize.

### Dimension 2: Vertical (The Phase Chain)

Across phases, **winning one contest does not guarantee winning the next.**

```
COMMIT → REVEAL → BATTLE → RESOLVE
   ↓        ↓        ↓         ↓
(choice) (edge)  (control) (outcome)
```

Each phase resets uncertainty. A strategic edge improves your odds in the battle. Winning the battle grants control of the result. But control doesn't guarantee your preferred outcome—the result roll still contains a spectrum of possibilities, some of which favor your opponent.

**Advantages don't transfer across phases.** You must earn your position at every step.

---

## The Core Loop

Every grapple follows four beats:

### 1. COMMIT
Both players secretly select an **approach**—a choice from a non-transitive set. This is the strategic layer. You're reading your opponent, making predictions, accepting risk.

> *Baseball: Pitch type (Fastball / Curveball / Changeup)*
> 
> *Fantasy: Combat stance (Aggressive / Defensive / Feint)*
> 
> *Heist: Approach (Force / Stealth / Deception)*

### 2. REVEAL
Simultaneously, both players reveal their selections. Compare to determine **modifiers**:

| Outcome | Effect |
|---------|--------|
| You counter them | You gain an edge (+1 or +2) |
| They counter you | They gain an edge |
| Neutral match | No modifier |

The non-transitive loop ensures no selection is universally safe.

### 3. BATTLE
Both players roll dice, applying any modifiers from the Reveal phase. This is the **contested moment**—the struggle for control.

The higher result wins control and establishes **battle strength**:

| Roll Result | Strength |
|-------------|----------|
| Low (≤6) | Weak |
| Middle (7-9) | Solid |
| High (10+) | Strong |

Ties can either favor the attacker, defender, or trigger a reroll—genre dependent.

### 4. RESOLVE
The player who won control rolls for the **outcome**. Their battle strength determines which outcome table or column they use.

**Critical insight:** Both players' desired outcomes exist on the table. 

- A **weak** control win often produces results favorable to the opponent
- A **strong** control win pushes toward the controller's ideal outcome
- But even strong wins have variance—nothing is guaranteed

---

## The Outcome Spectrum

This is where the vertical non-transitivity lives. Each grapple type has an outcome table with two gradients:

```
                    CONTROLLER'S STRENGTH
                 Weak    Solid    Strong
              ┌────────┬────────┬────────┐
   Weak       │  Their │  Their │  Your  │
   Result     │  favor │  favor │ slight │
              ├────────┼────────┼────────┤
   Solid      │  Their │  Your  │  Your  │
   Result     │  favor │ slight │  favor │
              ├────────┼────────┼────────┤
   Strong     │  Your  │  Your  │  Your  │
   Result     │ slight │  favor │ ideal  │
              └────────┴────────┴────────┘
```

Even when you control the outcome, the dice might betray you. Even when you lose control, hope remains. **Both players stay invested until the final result.**

---

## Critical Moments (Explosions)

Certain rolls transcend the normal spectrum:

- **Snake Eyes (1-1):** Critical failure. Worst possible result for the roller, regardless of context.
- **Boxcars (6-6):** Critical success. Best possible result, potentially ending the grapple immediately.

These create memorable moments and prevent the system from feeling purely mathematical.

---

## Nested Grapples

When an outcome creates a new choice point, a **nested grapple** can occur.

> *Baseball: Batter hits a single with a runner on first. Runner may attempt to stretch to third. New grapple: Runner vs. Defense.*
> 
> *Fantasy: Fighter lands a blow but enemy has a parry ability. New grapple: Follow-through vs. Deflection.*

This creates **branching tension**—the main grapple spawns child grapples, each with their own commit-reveal-battle-resolve loop.

---

## Design Dials

The engine can be tuned for different feels:

| Dial | Toward Chaos | Toward Strategy |
|------|--------------|-----------------|
| **Selection options** | 3 (tight RPS) | 5+ (complex reads) |
| **Modifier weight** | ±1 (subtle edge) | ±2 or more (decisive) |
| **Battle roll variance** | 2d6 (bell curve) | 1d20 (flat chaos) |
| **Outcome table spread** | Narrow (control matters) | Wide (always uncertain) |
| **Critical frequency** | 2 and 12 only | Expanded crit ranges |

---

## What Makes This Different

| Traditional Turn-Based | The Grapple Engine |
|------------------------|-------------------|
| Active/passive roles | Both players always active |
| "I attack, did I hit?" | "We clash, who controls the result?" |
| Optimization rewarded | Adaptation rewarded |
| Opponent waits | Opponent engages |
| One roll resolves | Phases build tension |
| Clear victor/loser each turn | Spectrum of outcomes |

---

## Origin

The Grapple Engine emerged from **Cheddar Bob**, a baseball simulation game. The insight: baseball's pitcher-batter confrontation isn't turn-based—it's **contested**. Both players commit simultaneously, both struggle for control, and even the "winner" doesn't fully control the outcome.

This wrestling-match dynamic, rather than the poker-table dynamic of traditional TTRPGs, creates a fundamentally different player experience: **engaged uncertainty** where neither player is ever passive, and advantages must be earned at every phase.

---

## Next Steps

To fully develop The Grapple Engine into a complete system:

1. **Approach Sets:** Genre-specific non-transitive triads (or larger loops)
2. **Grapple Types:** What kinds of conflicts use this system?
3. **Outcome Tables:** What results are possible for each grapple type?
4. **Advancement/Progression:** How do characters improve within this system?
5. **Asymmetric Roles:** Do different character types have different approaches available?

---

## The Name

Why "Grapple"?

- **You can't grapple without them grabbing you back** — captures the mutual engagement
- Evokes wrestling: two bodies intertwined, constantly shifting leverage
- Neither fully in control, both always active
- The moment you reach for them, they reach for you
- Works as a verb: "Let's grapple this out"

> *"Powered by the Grapple Engine."*
> 
> *"This is a grapple—commit your approach."*
> 
> *"You're locked up. Roll for control."*

---

*Version 0.1 — December 26, 2024*
*Developed from Cheddar Bob baseball simulation*
