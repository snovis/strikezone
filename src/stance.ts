/**
 * Grapple Engine - Stance Module
 *
 * Defines asymmetric commitment relationships where player roles matter.
 * Reader tries to anticipate, Actor tries to deceive.
 *
 * Unlike Strategy (RPS), same choice = advantage (for reader).
 * Choices are grouped into axes (opposing pairs).
 */

/**
 * An axis represents an opposing pair of choices
 * e.g., { name: 'vertical', choices: ['up', 'down'] }
 */
export interface Axis {
    name: string;
    choices: [string, string];  // exactly two opposing choices
}

/**
 * A stance set defines the commitment space
 */
export interface StanceSet {
    name: string;
    roles: [string, string];  // [reader, actor] e.g., ['batter', 'pitcher']
    axes: Axis[];
    explanations: {
        match: string;    // why reader wins on match
        fooled: string;   // why actor wins on deception
        miss: string;     // what happens on miss
    };
}

/**
 * Result of comparing two stances
 * - reader: reader anticipated correctly (match)
 * - actor: actor deceived successfully (same axis, opposite choice)
 * - miss: different axes, no advantage
 */
export type StanceResult = 'reader' | 'actor' | 'miss';

/**
 * Baseball zone stance: batter reads pitch location
 */
export const BASEBALL_STANCE_SET: StanceSet = {
    name: 'Zone',
    roles: ['batter', 'pitcher'],
    axes: [
        { name: 'vertical', choices: ['up', 'down'] },
        { name: 'horizontal', choices: ['in', 'out'] }
    ],
    explanations: {
        match: 'Batter wins by anticipating the pitch location — sitting on it',
        fooled: 'Pitcher wins by deceiving the batter on the same plane',
        miss: 'Batter and pitcher on different planes — no advantage either way'
    }
};

/**
 * Simple coin flip stance: heads vs tails (single axis)
 */
export const COIN_STANCE_SET: StanceSet = {
    name: 'Coin',
    roles: ['caller', 'flipper'],
    axes: [
        { name: 'side', choices: ['heads', 'tails'] }
    ],
    explanations: {
        match: 'Caller guessed correctly',
        fooled: 'Caller guessed wrong',
        miss: '(impossible with single axis)'
    }
};

/**
 * Find which axis a choice belongs to
 * Returns the axis, or undefined if choice not found
 */
export function findAxis(choice: string, set: StanceSet): Axis | undefined {
    return set.axes.find(axis => axis.choices.includes(choice));
}

/**
 * Get all valid choices from a stance set
 */
export function getAllChoices(set: StanceSet): string[] {
    return set.axes.flatMap(axis => axis.choices);
}

/**
 * Resolve a stance matchup
 * @param readerChoice - What the reader (defender) committed to
 * @param actorChoice - What the actor (attacker) committed to
 * @param set - The stance set defining the axes
 * @returns 'reader' if match, 'actor' if fooled, 'miss' if different axes
 */
export function resolve(
    readerChoice: string,
    actorChoice: string,
    set: StanceSet = BASEBALL_STANCE_SET
): StanceResult {
    // Match — reader anticipated correctly
    if (readerChoice === actorChoice) {
        return 'reader';
    }

    // Find which axis each choice belongs to
    const readerAxis = findAxis(readerChoice, set);
    const actorAxis = findAxis(actorChoice, set);

    // Same axis, different choice — actor deceived successfully
    if (readerAxis && actorAxis && readerAxis.name === actorAxis.name) {
        return 'actor';
    }

    // Different axes — miss, no advantage
    return 'miss';
}

/**
 * Display the rules and explanations for a stance set
 */
export function showRules(set: StanceSet): void {
    console.log(`\n${set.name} Stance Set`);
    console.log('='.repeat(set.name.length + 11));

    console.log(`\nRoles: ${set.roles[0]} (reader) vs ${set.roles[1]} (actor)`);

    console.log('\nAxes:');
    for (const axis of set.axes) {
        console.log(`  ${axis.name}: ${axis.choices[0]} <-> ${axis.choices[1]}`);
    }

    console.log('\nResolution:');
    console.log(`  Match (same choice):     ${set.roles[0].toUpperCase()} advantage — ${set.explanations.match}`);
    console.log(`  Fooled (same axis, diff): ${set.roles[1].toUpperCase()} advantage — ${set.explanations.fooled}`);
    console.log(`  Miss (different axes):   Neutral — ${set.explanations.miss}`);
    console.log('');
}
