/**
 * Grapple Engine - Strategy Module
 *
 * Defines non-transitive strategy relationships and resolves matchups.
 * Pure game rules — no player behavior.
 */

/**
 * A set of strategies with their relationships
 */
export interface StrategySet {
    choices: string[];
    beats: Record<string, string[]>;
}

/**
 * Result of comparing two strategies
 */
export type MatchupResult = 'win' | 'lose' | 'tie';

/**
 * Default 3-element set: fire > grass > water > fire
 */
export const DEFAULT_STRATEGY_SET: StrategySet = {
    choices: ['fire', 'grass', 'water'],
    beats: {
        fire: ['grass'],
        grass: ['water'],
        water: ['fire']
    }
};

/**
 * Baseball-themed set: Power > Finesse > Control > Power
 * (Batter perspective)
 */
export const BASEBALL_STRATEGY_SET: StrategySet = {
    choices: ['power', 'finesse', 'balance'],
    beats: {
        power: ['balance'],
        finesse: ['power'],
        balance: ['finesse']
    }
};

/**
 * Resolve a matchup between two strategies
 * @param a - First player's choice
 * @param b - Second player's choice
 * @param set - The strategy set defining relationships
 * @returns 'win' if a beats b, 'lose' if b beats a, 'tie' if same
 */
export function resolve(a: string, b: string, set: StrategySet = DEFAULT_STRATEGY_SET): MatchupResult {
    if (a === b) return 'tie';
    if (set.beats[a]?.includes(b)) return 'win';
    return 'lose';
}
