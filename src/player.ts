/**
 * Grapple Engine - Player Module
 *
 * Defines how players make choices.
 * Supports CPU (random) and future human input.
 */

import { roll } from './dice';
import { StrategySet, DEFAULT_STRATEGY_SET } from './strategy';

/**
 * Pick a random choice from a set of options
 * Uses the dice module's rng (respects seeding)
 */
export function randomChoice(options: string[]): string {
    const index = roll(options.length) - 1;  // roll returns 1-N, we need 0-(N-1)
    return options[index];
}

/**
 * CPU player: picks a random strategy from the set
 */
export function cpuChooseStrategy(set: StrategySet = DEFAULT_STRATEGY_SET): string {
    return randomChoice(set.choices);
}

/**
 * Future: human player input
 * For now, just a placeholder that throws
 */
export function humanChooseStrategy(_set: StrategySet = DEFAULT_STRATEGY_SET): string {
    throw new Error('Human input not yet implemented');
}
