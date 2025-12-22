/**
 * Strikezone Engine - Dice Utilities
 *
 * Core 2d6 dice mechanics shared across all game modes.
 */

import type { Tier } from './types';

/**
 * Roll 2d6 and return the individual dice values
 */
export function roll2d6(): [number, number] {
    return [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
    ];
}

/**
 * Sum two dice
 */
export function sum(dice: [number, number]): number {
    return dice[0] + dice[1];
}

/**
 * Check for snake eyes (both dice = 1)
 * Critical failure in many contexts
 */
export function isSnakeEyes(dice: [number, number]): boolean {
    return dice[0] === 1 && dice[1] === 1;
}

/**
 * Check for boxcars (both dice = 6)
 * Critical success in many contexts
 */
export function isBoxcars(dice: [number, number]): boolean {
    return dice[0] === 6 && dice[1] === 6;
}

/**
 * Get tier from total
 *
 * Speed mode thresholds (v5): <=6 weak, 7-9 solid, 10+ strong
 * Classic mode uses different thresholds per context
 */
export function getTier(total: number): Tier {
    if (total <= 6) return 'weak';
    if (total <= 9) return 'solid';
    return 'strong';
}

/**
 * Classic mode contact tier thresholds
 * <=3 miss, 4-9 weak, 10+ strong
 */
export function getContactTier(total: number): 'miss' | 'weak' | 'strong' {
    if (total <= 3) return 'miss';
    if (total <= 9) return 'weak';
    return 'strong';
}

/**
 * Roll 2d6 and return full details
 */
export function roll2d6Detailed(): {
    dice: [number, number];
    total: number;
    isSnakeEyes: boolean;
    isBoxcars: boolean;
} {
    const dice = roll2d6();
    return {
        dice,
        total: sum(dice),
        isSnakeEyes: isSnakeEyes(dice),
        isBoxcars: isBoxcars(dice)
    };
}
