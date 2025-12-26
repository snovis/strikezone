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
    name: string;
    choices: string[];
    beats: Record<string, string[]>;
    explanations: Record<string, string>;  // why A beats B: explanations["A>B"]
}

/**
 * Result of comparing two strategies
 */
export type MatchupResult = 'win' | 'lose' | 'tie';

/**
 * Default 3-element set: fire > grass > water > fire
 * Classic rock-paper-scissors structure for testing
 */
export const DEFAULT_STRATEGY_SET: StrategySet = {
    name: 'Elements',
    choices: ['fire', 'grass', 'water'],
    beats: {
        fire: ['grass'],
        grass: ['water'],
        water: ['fire']
    },
    explanations: {
        'fire>grass': 'Fire burns grass',
        'grass>water': 'Grass absorbs water',
        'water>fire': 'Water extinguishes fire'
    }
};

/**
 * Baseball-themed set for pitcher/batter confrontation
 *
 * From batter perspective:
 *   Power   = Swing hard, go for the fences
 *   Finesse = Contact hitting, precision placement
 *   Balance = Patient, wait for your pitch
 */
export const BASEBALL_STRATEGY_SET: StrategySet = {
    name: 'Baseball',
    choices: ['power', 'finesse', 'balance'],
    beats: {
        power: ['balance'],
        finesse: ['power'],
        balance: ['finesse']
    },
    explanations: {
        'finesse>power': 'Precision placement defeats brute force — a well-timed contact swing beats a wild power swing',
        'power>balance': 'Aggressive power overwhelms a cautious approach — sometimes you just have to crush it',
        'balance>finesse': 'Patient discipline neutralizes trickery — waiting for your pitch beats trying to be too clever'
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

/**
 * Display the rules and explanations for a strategy set
 * Like Sheldon explaining "Scissors decapitates lizard"
 */
export function showRules(set: StrategySet): void {
    console.log(`\n${set.name} Strategy Set`);
    console.log('='.repeat(set.name.length + 13));
    console.log(`\nChoices: ${set.choices.join(', ')}\n`);
    console.log('Rules:');

    for (const winner of set.choices) {
        const losers = set.beats[winner] ?? [];
        for (const loser of losers) {
            const key = `${winner}>${loser}`;
            const explanation = set.explanations[key] ?? '(no explanation)';
            console.log(`  ${winner.toUpperCase()} beats ${loser}: ${explanation}`);
        }
    }
    console.log('');
}
