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
        'finesse>power': 'Offspeed and breaking pitches defeats swing for the fences. Choked up batter contacts raw power throw',
        'power>balance': 'Power fastball beats batter who is too slow to catch up. Power hitter, smashes garden variety fastball.',
        'balance>finesse': 'Batter can stay with breaking pitch and drive it.  Control pitcher beats contact hitter sitting on the curve.'
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
 * Explain why a matchup resulted the way it did
 * @returns Human-readable explanation of the result
 */
export function explainResult(a: string, b: string, set: StrategySet = DEFAULT_STRATEGY_SET): string {
    if (a === b) {
        return `${a} vs ${a} — tie (same choice)`;
    }
    if (set.beats[a]?.includes(b)) {
        const key = `${a}>${b}`;
        const why = set.explanations[key] ?? `${a} beats ${b}`;
        return `${a} beats ${b} — ${why}`;
    }
    // b beats a
    const key = `${b}>${a}`;
    const why = set.explanations[key] ?? `${b} beats ${a}`;
    return `${b} beats ${a} — ${why}`;
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
