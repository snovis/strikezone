/**
 * Stance test harness
 *
 * Usage:
 *   npm run test:stance -- --matchups 1000
 *   npm run test:stance -- --matchups 1000 --seed test123
 *   npm run test:stance -- --set coin
 *
 * Options:
 *   --matchups N    Number of matchups to simulate (default: 100)
 *   --seed S        Set random seed for reproducibility
 *   --set NAME      Stance set: baseball (default), coin
 */

import { setSeed } from './dice';
import { BASEBALL_STANCE_SET, COIN_STANCE_SET, resolve, showRules, StanceSet, getAllChoices } from './stance';
import { cpuChooseStance } from './player';

// Parse command line arguments
function parseArgs(): { matchups: number; seed: string | null; setName: string } {
    const args = process.argv.slice(2);
    let matchups = 100;
    let seed: string | null = null;
    let setName = 'baseball';  // default to baseball

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--matchups' && args[i + 1]) {
            matchups = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--seed' && args[i + 1]) {
            seed = args[i + 1];
        }
        if (args[i] === '--set' && args[i + 1]) {
            setName = args[i + 1].toLowerCase();
        }
    }

    return { matchups, seed, setName };
}

// Get stance set by name
function getStanceSet(name: string): StanceSet {
    switch (name) {
        case 'baseball':
            return BASEBALL_STANCE_SET;
        case 'coin':
            return COIN_STANCE_SET;
        default:
            console.log(`Unknown set "${name}", using baseball`);
            return BASEBALL_STANCE_SET;
    }
}

// Show all matchups in the stance set
function showMatchupTable(set: StanceSet): void {
    const choices = getAllChoices(set);

    console.log(`\nMatchup Table (${set.roles[0]} vs ${set.roles[1]}):`);
    console.log('');

    // Header
    const header = '        ' + choices.map(c => c.padStart(8)).join('');
    console.log(header);
    console.log('        ' + '-'.repeat(choices.length * 8));

    // Rows (reader choices)
    for (const readerChoice of choices) {
        const cells = choices.map(actorChoice => {
            const result = resolve(readerChoice, actorChoice, set);
            if (result === 'reader') return 'READER'.padStart(8);
            if (result === 'actor') return 'actor'.padStart(8);
            return 'miss'.padStart(8);
        });
        console.log(readerChoice.padStart(8) + cells.join(''));
    }
}

// Run simulation with two CPU players
function runSimulation(matchups: number, set: StanceSet): void {
    const results = { reader: 0, actor: 0, miss: 0 };
    const choices = getAllChoices(set);
    const choiceCounts: Record<string, { reader: number; actor: number }> = {};

    // Initialize counts
    for (const choice of choices) {
        choiceCounts[choice] = { reader: 0, actor: 0 };
    }

    // Run matchups
    for (let i = 0; i < matchups; i++) {
        const readerChoice = cpuChooseStance(set);
        const actorChoice = cpuChooseStance(set);
        const result = resolve(readerChoice, actorChoice, set);

        results[result]++;
        choiceCounts[readerChoice].reader++;
        choiceCounts[actorChoice].actor++;
    }

    // Calculate expected distribution
    // With N choices across A axes:
    // - Match: 1/N (same choice)
    // - Fooled: depends on axis structure
    // - Miss: remaining
    const numChoices = choices.length;
    const numAxes = set.axes.length;

    // For each reader choice, actor has:
    // - 1/N chance to match (reader wins)
    // - 1/N chance to pick opposite on same axis (actor wins)
    // - (N-2)/N chance to pick from different axis (miss)
    const expectedMatch = (1 / numChoices) * 100;
    const expectedFooled = (1 / numChoices) * 100;  // one opposite per axis
    const expectedMiss = ((numChoices - 2) / numChoices) * 100;

    // Display results
    console.log(`\nSimulation Results (${matchups} matchups):\n`);

    console.log(`Outcomes:`);
    console.log(`  ${set.roles[0].padEnd(8)} (reader) advantage: ${results.reader.toString().padStart(6)} (${(results.reader / matchups * 100).toFixed(2)}%)`);
    console.log(`  ${set.roles[1].padEnd(8)} (actor) advantage:  ${results.actor.toString().padStart(6)} (${(results.actor / matchups * 100).toFixed(2)}%)`);
    console.log(`  Miss (neutral):             ${results.miss.toString().padStart(6)} (${(results.miss / matchups * 100).toFixed(2)}%)`);

    if (numAxes > 1) {
        console.log(`\nExpected (${numChoices} choices, ${numAxes} axes):`);
        console.log(`  Match:  ${expectedMatch.toFixed(2)}%`);
        console.log(`  Fooled: ${expectedFooled.toFixed(2)}%`);
        console.log(`  Miss:   ${expectedMiss.toFixed(2)}%`);
    } else {
        console.log(`\nExpected (single axis): 50% match, 50% fooled, 0% miss`);
    }

    console.log('\nChoice Distribution:');
    const expectedPct = (100 / numChoices).toFixed(2);
    console.log(`  (Expected: ${expectedPct}% each)\n`);

    for (const choice of choices) {
        const readerCount = choiceCounts[choice].reader;
        const actorCount = choiceCounts[choice].actor;
        const readerPct = (readerCount / matchups * 100).toFixed(2);
        const actorPct = (actorCount / matchups * 100).toFixed(2);
        console.log(`  ${choice.padEnd(10)} Reader: ${readerPct.padStart(6)}%   Actor: ${actorPct.padStart(6)}%`);
    }
}

// Main
const { matchups, seed, setName } = parseArgs();
const set = getStanceSet(setName);

console.log('Stance Test Harness');
console.log('===================');

if (seed) {
    setSeed(seed);
    console.log(`Seed: "${seed}"`);
} else {
    console.log('Seed: (random)');
}

// Show the rules with explanations
showRules(set);

showMatchupTable(set);
runSimulation(matchups, set);
