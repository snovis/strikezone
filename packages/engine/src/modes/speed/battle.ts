/**
 * Strikezone Engine - Speed Mode Battle Roll System
 */

import type { Tier } from '../../core/types';
import { roll2d6, sum, isSnakeEyes, isBoxcars, getTier } from '../../core/dice';

export interface BattleResult {
    pitcherDice: [number, number];
    batterDice: [number, number];
    pitcherTotal: number;
    batterTotal: number;
    winner: 'pitcher' | 'batter';
    winnerTier: Tier;
    pitcherSnakeEyes: boolean;
    batterSnakeEyes: boolean;
}

/**
 * Resolve a battle roll between pitcher and batter
 *
 * Both roll 2d6, apply modifiers, higher total wins.
 * Winner's total determines tier.
 *
 * Special cases:
 * - Snake eyes (1,1) = auto-lose, opponent gets STRONG tier
 * - Boxcars (6,6) = auto-win (if no snake eyes)
 * - Ties = reroll (this function handles internally)
 */
export function resolveBattle(
    pitcherMod: number,
    batterMod: number
): BattleResult {
    let pitcherDice: [number, number];
    let batterDice: [number, number];
    let pitcherTotal: number;
    let batterTotal: number;
    let pitcherSnakeEyes = false;
    let batterSnakeEyes = false;
    let winner: 'pitcher' | 'batter';
    let winnerTier: Tier;

    // Keep rolling until we have a decisive result (no ties)
    while (true) {
        pitcherDice = roll2d6();
        batterDice = roll2d6();

        pitcherSnakeEyes = isSnakeEyes(pitcherDice);
        batterSnakeEyes = isSnakeEyes(batterDice);

        // Calculate totals with modifiers
        pitcherTotal = sum(pitcherDice) + pitcherMod;
        batterTotal = sum(batterDice) + batterMod;

        // Snake eyes = auto-lose, opponent gets STRONG
        if (batterSnakeEyes && !pitcherSnakeEyes) {
            winner = 'pitcher';
            winnerTier = 'strong';
            break;
        }
        if (pitcherSnakeEyes && !batterSnakeEyes) {
            winner = 'batter';
            winnerTier = 'strong';
            break;
        }
        // Both snake eyes - reroll
        if (batterSnakeEyes && pitcherSnakeEyes) {
            continue;
        }

        // Boxcars = auto-win (if no opposing snake eyes, already handled)
        if (isBoxcars(pitcherDice) && !isBoxcars(batterDice)) {
            winner = 'pitcher';
            winnerTier = getTier(pitcherTotal);
            break;
        }
        if (isBoxcars(batterDice) && !isBoxcars(pitcherDice)) {
            winner = 'batter';
            winnerTier = getTier(batterTotal);
            break;
        }

        // Normal comparison - ties reroll
        if (pitcherTotal !== batterTotal) {
            winner = pitcherTotal > batterTotal ? 'pitcher' : 'batter';
            const winnerTotal = winner === 'pitcher' ? pitcherTotal : batterTotal;
            winnerTier = getTier(winnerTotal);
            break;
        }
        // Tie - continue loop to reroll
    }

    return {
        pitcherDice,
        batterDice,
        pitcherTotal,
        batterTotal,
        winner,
        winnerTier,
        pitcherSnakeEyes,
        batterSnakeEyes
    };
}

export interface ChallengeResult {
    pitcherDice: [number, number];
    batterDice: [number, number];
    pitcherWins: boolean;
}

/**
 * Battle roll for baserunning challenges (stretch, advancement, DP)
 *
 * No modifiers, tie goes to runner (batter side).
 * Snake eyes = auto fail, Boxcars = auto win.
 */
export function challengeRoll(pitcherMod: number = 0): ChallengeResult {
    const pitcherDice = roll2d6();
    const batterDice = roll2d6();

    // Snake eyes = auto fail
    if (isSnakeEyes(pitcherDice)) {
        return { pitcherDice, batterDice, pitcherWins: false };
    }
    if (isSnakeEyes(batterDice)) {
        return { pitcherDice, batterDice, pitcherWins: true };
    }

    // Boxcars = auto win
    if (isBoxcars(pitcherDice)) {
        return { pitcherDice, batterDice, pitcherWins: true };
    }
    if (isBoxcars(batterDice)) {
        return { pitcherDice, batterDice, pitcherWins: false };
    }

    const pitcherTotal = sum(pitcherDice) + pitcherMod;
    const batterTotal = sum(batterDice);

    // Tie goes to runner (batter)
    return {
        pitcherDice,
        batterDice,
        pitcherWins: pitcherTotal > batterTotal
    };
}
