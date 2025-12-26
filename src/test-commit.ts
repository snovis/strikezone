/**
 * Commit test harness
 *
 * Usage:
 *   npm run test:commit -- --matchups 1000
 *   npm run test:commit -- --matchups 10 --verbose
 *   npm run test:commit -- --matchups 1000 --seed test123
 *
 * Options:
 *   --matchups N    Number of matchups to simulate (default: 100)
 *   --seed S        Set random seed for reproducibility
 *   --verbose       Show detailed output for each matchup
 */

import { setSeed } from './dice';
import { BASEBALL_STRATEGY_SET } from './strategy';
import { BASEBALL_STANCE_SET } from './stance';
import { resolveCommit, DEFAULT_MODIFIER_CONFIG, CommitResult } from './commit';
import { cpuChooseStrategy, cpuChooseStance } from './player';

// Parse command line arguments
function parseArgs(): { matchups: number; seed: string | null; verbose: boolean } {
    const args = process.argv.slice(2);
    let matchups = 100;
    let seed: string | null = null;
    let verbose = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--matchups' && args[i + 1]) {
            matchups = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--seed' && args[i + 1]) {
            seed = args[i + 1];
        }
        if (args[i] === '--verbose') {
            verbose = true;
        }
    }

    return { matchups, seed, verbose };
}

// Track modifier distribution
interface ModifierStats {
    counts: Record<number, number>;
    min: number;
    max: number;
    sum: number;
    count: number;
}

function initStats(): ModifierStats {
    return { counts: {}, min: Infinity, max: -Infinity, sum: 0, count: 0 };
}

function recordStat(stats: ModifierStats, value: number): void {
    stats.counts[value] = (stats.counts[value] ?? 0) + 1;
    stats.min = Math.min(stats.min, value);
    stats.max = Math.max(stats.max, value);
    stats.sum += value;
    stats.count++;
}

function showStats(label: string, stats: ModifierStats): void {
    console.log(`\n${label}:`);
    console.log(`  Range: ${stats.min} to ${stats.max}`);
    console.log(`  Average: ${(stats.sum / stats.count).toFixed(2)}`);
    console.log(`  Distribution:`);

    // Sort keys numerically
    const keys = Object.keys(stats.counts).map(Number).sort((a, b) => a - b);
    for (const key of keys) {
        const count = stats.counts[key];
        const pct = (count / stats.count * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(count / stats.count * 40));
        console.log(`    ${key >= 0 ? '+' : ''}${key}: ${pct.padStart(5)}% ${bar}`);
    }
}

// Run simulation
function runSimulation(matchups: number, verbose: boolean): void {
    const p1Stats = initStats();
    const p2Stats = initStats();
    const diffStats = initStats();

    // Track outcome combinations
    const combos: Record<string, number> = {};

    for (let i = 0; i < matchups; i++) {
        // Players make choices
        const player1 = {
            strategy: cpuChooseStrategy(BASEBALL_STRATEGY_SET),
            stance: cpuChooseStance(BASEBALL_STANCE_SET)
        };
        const player2 = {
            strategy: cpuChooseStrategy(BASEBALL_STRATEGY_SET),
            stance: cpuChooseStance(BASEBALL_STANCE_SET)
        };

        // Resolve
        const result = resolveCommit(
            player1,
            player2,
            BASEBALL_STRATEGY_SET,
            BASEBALL_STANCE_SET,
            DEFAULT_MODIFIER_CONFIG,
            verbose
        );

        // Record stats
        recordStat(p1Stats, result.player1TotalModifier);
        recordStat(p2Stats, result.player2TotalModifier);
        recordStat(diffStats, result.player1TotalModifier - result.player2TotalModifier);

        // Track combo
        const combo = `${result.strategy.result}/${result.stance.result}`;
        combos[combo] = (combos[combo] ?? 0) + 1;
    }

    // Show results
    console.log(`\n${'='.repeat(50)}`);
    console.log(`SIMULATION RESULTS (${matchups} matchups)`);
    console.log('='.repeat(50));

    showStats('Player 1 Modifier (Batter)', p1Stats);
    showStats('Player 2 Modifier (Pitcher)', p2Stats);
    showStats('Modifier Difference (P1 - P2)', diffStats);

    console.log('\nOutcome Combinations (Strategy/Stance):');
    const comboKeys = Object.keys(combos).sort();
    for (const key of comboKeys) {
        const count = combos[key];
        const pct = (count / matchups * 100).toFixed(1);
        console.log(`  ${key.padEnd(15)} ${pct.padStart(5)}%`);
    }
}

// Main
const { matchups, seed, verbose } = parseArgs();

console.log('Commit Phase Test Harness');
console.log('=========================');

if (seed) {
    setSeed(seed);
    console.log(`Seed: "${seed}"`);
} else {
    console.log('Seed: (random)');
}

console.log(`Matchups: ${matchups}`);
console.log(`Verbose: ${verbose}`);

runSimulation(matchups, verbose);
