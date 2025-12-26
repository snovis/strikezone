/**
 * Strategy test harness
 *
 * Usage:
 *   npm run test:strategy -- --matchups 1000
 *   npm run test:strategy -- --matchups 1000 --seed test123
 *   npm run test:strategy -- --set elements
 *
 * Options:
 *   --matchups N    Number of matchups to simulate (default: 100)
 *   --seed S        Set random seed for reproducibility
 *   --set NAME      Strategy set: baseball (default), elements
 */

import { setSeed } from './dice';
import { DEFAULT_STRATEGY_SET, BASEBALL_STRATEGY_SET, resolve, showRules, StrategySet } from './strategy';
import { cpuChooseStrategy } from './player';

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

// Get strategy set by name
function getStrategySet(name: string): StrategySet {
    switch (name) {
        case 'baseball':
            return BASEBALL_STRATEGY_SET;
        case 'elements':
        case 'default':
            return DEFAULT_STRATEGY_SET;
        default:
            console.log(`Unknown set "${name}", using baseball`);
            return BASEBALL_STRATEGY_SET;
    }
}

// Show all matchups in the strategy set
function showMatchupTable(set: StrategySet): void {
    console.log('\nMatchup Table (row vs column):');
    console.log('');

    // Header
    const header = '        ' + set.choices.map(c => c.padStart(8)).join('');
    console.log(header);
    console.log('        ' + '-'.repeat(set.choices.length * 8));

    // Rows
    for (const a of set.choices) {
        const cells = set.choices.map(b => {
            const result = resolve(a, b, set);
            if (result === 'win') return 'WIN'.padStart(8);
            if (result === 'lose') return 'lose'.padStart(8);
            return 'tie'.padStart(8);
        });
        console.log(a.padStart(8) + cells.join(''));
    }
}

// Run simulation with two CPU players
function runSimulation(matchups: number, set: StrategySet): void {
    const results = { win: 0, lose: 0, tie: 0 };
    const choiceCounts: Record<string, { a: number; b: number }> = {};

    // Initialize counts
    for (const choice of set.choices) {
        choiceCounts[choice] = { a: 0, b: 0 };
    }

    // Run matchups
    for (let i = 0; i < matchups; i++) {
        const a = cpuChooseStrategy(set);
        const b = cpuChooseStrategy(set);
        const result = resolve(a, b, set);

        results[result]++;
        choiceCounts[a].a++;
        choiceCounts[b].b++;
    }

    // Display results
    console.log(`\nSimulation Results (${matchups} matchups):\n`);

    console.log('Outcomes (from player A perspective):');
    console.log(`  Win:  ${results.win.toString().padStart(6)} (${(results.win / matchups * 100).toFixed(2)}%)`);
    console.log(`  Lose: ${results.lose.toString().padStart(6)} (${(results.lose / matchups * 100).toFixed(2)}%)`);
    console.log(`  Tie:  ${results.tie.toString().padStart(6)} (${(results.tie / matchups * 100).toFixed(2)}%)`);

    console.log('\nExpected: 33.33% Win, 33.33% Lose, 33.33% Tie');

    console.log('\nChoice Distribution:');
    const expectedPct = (100 / set.choices.length).toFixed(2);
    console.log(`  (Expected: ${expectedPct}% each)\n`);

    for (const choice of set.choices) {
        const aCount = choiceCounts[choice].a;
        const bCount = choiceCounts[choice].b;
        const aPct = (aCount / matchups * 100).toFixed(2);
        const bPct = (bCount / matchups * 100).toFixed(2);
        console.log(`  ${choice.padEnd(10)} A: ${aPct.padStart(6)}%   B: ${bPct.padStart(6)}%`);
    }
}

// Main
const { matchups, seed, setName } = parseArgs();
const set = getStrategySet(setName);

console.log('Strategy Test Harness');
console.log('=====================');

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
