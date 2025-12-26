/**
 * Battle test harness
 *
 * Usage:
 *   npm run test:battle -- --battles 1000
 *   npm run test:battle -- --battles 10 --verbose
 *   npm run test:battle -- --battles 1000 --p1mod 2 --p2mod 0
 *   npm run test:battle -- --battles 1000 --seed test123
 *   npm run test:battle -- --enumerate
 *   npm run test:battle -- --enumerate --p1mod 2 --p2mod 0
 *   npm run test:battle -- --compare
 *
 * Options:
 *   --battles N     Number of battles to simulate (default: 100)
 *   --seed S        Set random seed for reproducibility
 *   --p1mod N       Player 1 modifier (default: 0)
 *   --p2mod N       Player 2 modifier (default: 0)
 *   --verbose       Show detailed output for each battle
 *   --enumerate     Run full enumeration (1,296 combinations) instead of simulation
 *   --compare       Compare multiple modifier configurations
 */

import { setSeed } from './dice';
import { rollBattle, showTierRules, enumerateBattles, showEnumerationResult, DEFAULT_TIER_CONFIG, BattleResult } from './battle';

// Parse command line arguments
function parseArgs(): {
    battles: number;
    seed: string | null;
    p1mod: number;
    p2mod: number;
    verbose: boolean;
    enumerate: boolean;
    compare: boolean;
} {
    const args = process.argv.slice(2);
    let battles = 100;
    let seed: string | null = null;
    let p1mod = 0;
    let p2mod = 0;
    let verbose = false;
    let enumerate = false;
    let compare = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--battles' && args[i + 1]) {
            battles = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--seed' && args[i + 1]) {
            seed = args[i + 1];
        }
        if (args[i] === '--p1mod' && args[i + 1]) {
            p1mod = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--p2mod' && args[i + 1]) {
            p2mod = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--verbose') {
            verbose = true;
        }
        if (args[i] === '--enumerate') {
            enumerate = true;
        }
        if (args[i] === '--compare') {
            compare = true;
        }
    }

    return { battles, seed, p1mod, p2mod, verbose, enumerate, compare };
}

// Run simulation
function runSimulation(
    battles: number,
    p1mod: number,
    p2mod: number,
    verbose: boolean
): void {
    // Track outcomes
    const wins = { player1: 0, player2: 0, tie: 0 };
    const tiers = { weak: 0, solid: 0, strong: 0 };
    const margins: Record<number, number> = {};

    // Track by winner
    const p1Tiers = { weak: 0, solid: 0, strong: 0 };
    const p2Tiers = { weak: 0, solid: 0, strong: 0 };

    for (let i = 0; i < battles; i++) {
        const result = rollBattle(p1mod, p2mod, DEFAULT_TIER_CONFIG, verbose);

        // Count winner
        wins[result.winner]++;

        // Count margin
        margins[result.margin] = (margins[result.margin] ?? 0) + 1;

        // Count tier by winner
        if (result.tier) {
            tiers[result.tier]++;
            if (result.winner === 'player1') {
                p1Tiers[result.tier]++;
            } else if (result.winner === 'player2') {
                p2Tiers[result.tier]++;
            }
        }
    }

    // Display results
    console.log(`\n${'='.repeat(50)}`);
    console.log(`BATTLE SIMULATION (${battles} battles)`);
    console.log(`Modifiers: P1=${p1mod >= 0 ? '+' : ''}${p1mod}, P2=${p2mod >= 0 ? '+' : ''}${p2mod}`);
    console.log('='.repeat(50));

    // Win rates
    const decisiveBattles = battles - wins.tie;
    console.log('\nWin Rates:');
    console.log(`  Player 1 (Batter): ${wins.player1.toString().padStart(5)} (${(wins.player1 / battles * 100).toFixed(1)}%)`);
    console.log(`  Player 2 (Pitcher): ${wins.player2.toString().padStart(5)} (${(wins.player2 / battles * 100).toFixed(1)}%)`);
    console.log(`  Tie:                ${wins.tie.toString().padStart(5)} (${(wins.tie / battles * 100).toFixed(1)}%)`);

    // Tier distribution (of decisive battles only)
    if (decisiveBattles > 0) {
        console.log('\nTier Distribution (decisive battles only):');
        console.log(`  Weak:   ${tiers.weak.toString().padStart(5)} (${(tiers.weak / decisiveBattles * 100).toFixed(1)}%)`);
        console.log(`  Solid:  ${tiers.solid.toString().padStart(5)} (${(tiers.solid / decisiveBattles * 100).toFixed(1)}%)`);
        console.log(`  Strong: ${tiers.strong.toString().padStart(5)} (${(tiers.strong / decisiveBattles * 100).toFixed(1)}%)`);

        // Breakdown by winner
        console.log('\nPlayer 1 wins by tier:');
        console.log(`  Weak: ${p1Tiers.weak}, Solid: ${p1Tiers.solid}, Strong: ${p1Tiers.strong}`);
        console.log('Player 2 wins by tier:');
        console.log(`  Weak: ${p2Tiers.weak}, Solid: ${p2Tiers.solid}, Strong: ${p2Tiers.strong}`);
    }

    // Margin distribution
    console.log('\nMargin Distribution:');
    const marginKeys = Object.keys(margins).map(Number).sort((a, b) => a - b);
    for (const m of marginKeys) {
        const count = margins[m];
        const pct = (count / battles * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(count / battles * 40));
        console.log(`  ${m.toString().padStart(2)}: ${pct.padStart(5)}% ${bar}`);
    }
}

// Compare multiple configurations
function runComparison(): void {
    console.log('\n' + '='.repeat(60));
    console.log('MODIFIER CONFIGURATION COMPARISON (Enumeration)');
    console.log('='.repeat(60));

    // Define scenarios to compare
    const scenarios = [
        { label: 'Baseline (no modifiers)', p1: 0, p2: 0 },
        { label: 'P1 +1 advantage', p1: 1, p2: 0 },
        { label: 'P1 +2 advantage', p1: 2, p2: 0 },
        { label: 'P1 +3 advantage', p1: 3, p2: 0 },
        { label: 'Symmetric +1/-1', p1: 1, p2: -1 },
        { label: 'Symmetric +2/-2', p1: 2, p2: -2 },
        { label: 'Both +1 (wash)', p1: 1, p2: 1 },
    ];

    // Header
    console.log('\n' + 'Scenario'.padEnd(25) + 'P1 Win%'.padStart(10) + 'P2 Win%'.padStart(10) + 'Tie%'.padStart(8) + 'Weak%'.padStart(8) + 'Solid%'.padStart(8) + 'Strong%'.padStart(9));
    console.log('-'.repeat(78));

    for (const s of scenarios) {
        const result = enumerateBattles(s.p1, s.p2);
        console.log(
            s.label.padEnd(25) +
            result.player1WinPct.toFixed(1).padStart(10) +
            result.player2WinPct.toFixed(1).padStart(10) +
            result.tiePct.toFixed(1).padStart(8) +
            result.weakPct.toFixed(1).padStart(8) +
            result.solidPct.toFixed(1).padStart(8) +
            result.strongPct.toFixed(1).padStart(9)
        );
    }

    console.log('\nNote: Tier % is of decisive battles only');
}

// Main
const { battles, seed, p1mod, p2mod, verbose, enumerate, compare } = parseArgs();

console.log('Battle Phase Test Harness');
console.log('=========================');

showTierRules();

if (compare) {
    // Run comparison of multiple configurations
    runComparison();
} else if (enumerate) {
    // Run full enumeration for specific modifiers
    const result = enumerateBattles(p1mod, p2mod);
    const label = `Enumeration: P1=${p1mod >= 0 ? '+' : ''}${p1mod}, P2=${p2mod >= 0 ? '+' : ''}${p2mod}`;
    showEnumerationResult(result, label);
} else {
    // Run random simulation
    if (seed) {
        setSeed(seed);
        console.log(`Seed: "${seed}"`);
    } else {
        console.log('Seed: (random)');
    }
    runSimulation(battles, p1mod, p2mod, verbose);
}
