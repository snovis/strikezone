/**
 * Test harness for the Result module
 *
 * Usage:
 *   npm run test:result -- --table           Show 2D result tables
 *   npm run test:result -- --ladder          Show outcome ladders
 *   npm run test:result -- --enumerate       Enumerate all outcomes by tier
 *   npm run test:result -- --compare         Compare pitcher result sets
 *   npm run test:result -- --set pitcher     Use specific result set
 *   npm run test:result -- --battle-tier weak  Filter to specific battle tier
 *   npm run test:result -- --roll            Roll a single result (use with --verbose)
 *   npm run test:result -- --verbose         Show detailed output
 */

import { setSeed, resetRandom } from './dice';
import { BattleTier } from './battle';
import {
    BATTER_RESULT_SET,
    PITCHER_RESULT_SET,
    PITCHER_2WALK_RESULT_SET,
    PITCHER_3WALK_RESULT_SET,
    ResultSet,
    resolveResult,
    showResultLadder,
    showResultTable,
    showResultEnumeration,
    showResultSummary,
    enumerateResults,
    enumerateAllResults
} from './result';

// Parse command line arguments
const args = process.argv.slice(2);

function hasFlag(flag: string): boolean {
    return args.includes(`--${flag}`);
}

function getArg(flag: string): string | undefined {
    const index = args.indexOf(`--${flag}`);
    if (index !== -1 && index + 1 < args.length) {
        return args[index + 1];
    }
    return undefined;
}

// Get options
const showTable = hasFlag('table');
const showLadder = hasFlag('ladder');
const enumerate = hasFlag('enumerate');
const compare = hasFlag('compare');
const doRoll = hasFlag('roll');
const verbose = hasFlag('verbose');
const seed = getArg('seed');

// Get result set
const setName = getArg('set') ?? 'batter';
const resultSets: Record<string, ResultSet> = {
    'batter': BATTER_RESULT_SET,
    'pitcher': PITCHER_RESULT_SET,
    'pitcher-2walk': PITCHER_2WALK_RESULT_SET,
    'pitcher-3walk': PITCHER_3WALK_RESULT_SET
};

const resultSet = resultSets[setName];
if (!resultSet) {
    console.error(`Unknown result set: ${setName}`);
    console.error(`Available sets: ${Object.keys(resultSets).join(', ')}`);
    process.exit(1);
}

// Get battle tier filter
const tierArg = getArg('battle-tier');
const battleTierFilter: BattleTier | null = tierArg as BattleTier | null;

// Setup randomness
if (seed) {
    setSeed(seed);
    console.log(`Using seed: ${seed}`);
} else {
    resetRandom();
}

// Default action if nothing specified
const defaultAction = !showTable && !showLadder && !enumerate && !compare && !doRoll;

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║          GRAPPLE ENGINE — RESULT MODULE TEST             ║');
console.log('╚══════════════════════════════════════════════════════════╝');

if (defaultAction || showLadder) {
    showResultLadder(BATTER_RESULT_SET);
    showResultLadder(PITCHER_RESULT_SET);
}

if (showTable || defaultAction) {
    showResultTable(BATTER_RESULT_SET);
    showResultTable(PITCHER_RESULT_SET);
}

if (enumerate) {
    console.log('\n' + '='.repeat(60));
    console.log('ENUMERATION: Exact outcome probabilities');
    console.log('='.repeat(60));

    const tiers: BattleTier[] = battleTierFilter
        ? [battleTierFilter]
        : ['weak', 'solid', 'strong'];

    for (const tier of tiers) {
        const result = enumerateResults(tier, resultSet);
        showResultEnumeration(result);
    }

    showResultSummary(resultSet);
}

if (compare) {
    console.log('\n' + '='.repeat(60));
    console.log('COMPARISON: Pitcher result sets (1 walk vs 2 walk vs 3 walk)');
    console.log('='.repeat(60));

    const pitcherSets = [
        PITCHER_RESULT_SET,
        PITCHER_2WALK_RESULT_SET,
        PITCHER_3WALK_RESULT_SET
    ];

    for (const set of pitcherSets) {
        showResultLadder(set);
    }

    // Show walk percentages by battle tier
    console.log('\nWalk Probability by Battle Tier:');
    console.log('─'.repeat(50));
    console.log('             │ 1-Walk Set │ 2-Walk Set │ 3-Walk Set');
    console.log('─────────────┼────────────┼────────────┼────────────');

    const tiers: BattleTier[] = ['weak', 'solid', 'strong'];
    for (const tier of tiers) {
        const results = pitcherSets.map(set => enumerateResults(tier, set));
        const walkPcts = results.map(r => r.outcomePercentages['bb']);
        const cells = walkPcts.map(pct => `${pct.toFixed(1)}%`.padStart(10));

        const label = tier.charAt(0).toUpperCase() + tier.slice(1);
        console.log(`${label.padEnd(12)} │${cells.join(' │')}`);
    }

    // Calculate average walk rate (weighted by tier probability)
    // From battle.ts: weak ~14.8%, solid ~52%, strong ~33.2% of decisive battles
    console.log('\n─────────────┼────────────┼────────────┼────────────');

    const tierWeights = { weak: 0.148, solid: 0.52, strong: 0.332 };
    const avgWalks = pitcherSets.map(set => {
        let weighted = 0;
        for (const tier of tiers) {
            const result = enumerateResults(tier, set);
            weighted += result.outcomePercentages['bb'] * tierWeights[tier];
        }
        return weighted;
    });
    const avgCells = avgWalks.map(pct => `${pct.toFixed(1)}%`.padStart(10));
    console.log(`Avg (wtd)    │${avgCells.join(' │')}`);

    console.log('\nNote: Weighted average uses battle tier distribution from enumeration');
    console.log('      (weak 14.8%, solid 52%, strong 33.2%)');
}

if (doRoll) {
    console.log('\n' + '='.repeat(60));
    console.log('SINGLE RESULT ROLL');
    console.log('='.repeat(60));

    const tier: BattleTier = battleTierFilter ?? 'solid';
    console.log(`\nUsing result set: ${resultSet.name}`);
    console.log(`Battle tier: ${tier.toUpperCase()}`);

    const result = resolveResult(tier, null, resultSet, undefined, verbose);

    if (!verbose) {
        console.log(`\nResult roll: [${result.resultDice[0]}+${result.resultDice[1]}] = ${result.resultRoll}`);
        console.log(`Result tier: ${result.resultTier.toUpperCase()}`);
        console.log(`Position: ${result.battleOffset} + ${result.resultOffset} = ${result.position}`);
        console.log(`Outcome: ${resultSet.labels[result.outcome]} (${result.outcome.toUpperCase()})`);
        if (result.critical) {
            const emoji = result.critical === 'snake-eyes' ? '🐍' : '🎰';
            console.log(`Critical: ${emoji} ${result.critical.toUpperCase()}`);
        }
    }
}

// Show usage if nothing meaningful happened
if (args.length === 0) {
    console.log('\nUsage examples:');
    console.log('  npm run test:result -- --table              Show 2D result tables');
    console.log('  npm run test:result -- --enumerate          Enumerate all outcomes');
    console.log('  npm run test:result -- --enumerate --set pitcher');
    console.log('  npm run test:result -- --compare            Compare pitcher walk rates');
    console.log('  npm run test:result -- --roll --verbose     Roll single result with trace');
    console.log('  npm run test:result -- --roll --battle-tier strong');
    console.log('');
}
