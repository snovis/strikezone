/**
 * Grapple Engine - Result Module
 *
 * Resolves the RESULT phase:
 * 1. Winner rolls 2d6 for result
 * 2. Battle tier provides base offset (0, 1, or 2)
 * 3. Result tier provides additional offset (0, 1, or 2)
 * 4. Position (0-4) determines outcome from ladder
 *
 * Critical rolls override:
 *   Snake Eyes (2) = position 0 (worst for roller)
 *   Boxcars (12) = position 4 (best for roller)
 *
 * The beauty: winner can still give loser what they want if they roll poorly.
 */

import { sum2d6, roll2d6 } from './dice';
import { BattleTier, getTier, DEFAULT_TIER_CONFIG, TierConfig } from './battle';

/**
 * All possible outcomes
 */
export type Outcome =
    // Batter outcomes
    | 'out'    // Generic out
    | '1b'     // Single
    | '2b'     // Double
    | 'hr'     // Home run
    // Pitcher outcomes
    | 'bb'     // Walk (base on balls)
    | 'o-ra'   // Out, runners advance
    | 'o-rc'   // Out, runner challenge (runner may attempt advance)
    | 'o-rf'   // Out, runners freeze
    | 'dp';    // Double play

/**
 * Critical roll type
 */
export type CriticalRoll = 'snake-eyes' | 'boxcars' | null;

/**
 * A result set defines the 5-position outcome ladder (0-4)
 * Position = battleOffset + resultOffset
 */
export interface ResultSet {
    name: string;
    controller: 'batter' | 'pitcher';
    outcomes: [Outcome, Outcome, Outcome, Outcome, Outcome];  // positions 0-4
    labels: Record<Outcome, string>;  // human-readable labels
}

/**
 * Result of resolving an outcome
 */
export interface ResultResolution {
    // Inputs
    battleTier: BattleTier;
    resultRoll: number;
    resultDice: [number, number];

    // Calculation
    battleOffset: number;
    resultTier: BattleTier;
    resultOffset: number;
    position: number;

    // Output
    outcome: Outcome;
    critical: CriticalRoll;
}

/**
 * Convert a tier to its offset value
 */
export function tierToOffset(tier: BattleTier): number {
    switch (tier) {
        case 'weak': return 0;
        case 'solid': return 1;
        case 'strong': return 2;
    }
}

/**
 * Detect critical rolls
 */
export function detectCritical(roll: number): CriticalRoll {
    if (roll === 2) return 'snake-eyes';
    if (roll === 12) return 'boxcars';
    return null;
}

/**
 * Batter result set (when batter wins battle)
 *
 * Position 0: worst for batter (out — gave pitcher what they wanted)
 * Position 4: best for batter (home run)
 */
export const BATTER_RESULT_SET: ResultSet = {
    name: 'Batter Controls',
    controller: 'batter',
    outcomes: ['out', 'out', '1b', '2b', 'hr'],
    labels: {
        'out': 'Out',
        '1b': 'Single',
        '2b': 'Double',
        'hr': 'Home Run',
        'bb': 'Walk',
        'o-ra': 'Out (Runners Advance)',
        'o-rc': 'Out (Runner Challenge)',
        'o-rf': 'Out (Runners Freeze)',
        'dp': 'Double Play'
    }
};

/**
 * Pitcher result set (when pitcher wins battle)
 *
 * Position 0: worst for pitcher (walk — gave batter what they wanted)
 * Position 4: best for pitcher (double play)
 */
export const PITCHER_RESULT_SET: ResultSet = {
    name: 'Pitcher Controls',
    controller: 'pitcher',
    outcomes: ['bb', 'o-ra', 'o-rc', 'o-rf', 'dp'],
    labels: {
        'out': 'Out',
        '1b': 'Single',
        '2b': 'Double',
        'hr': 'Home Run',
        'bb': 'Walk',
        'o-ra': 'Out (Runners Advance)',
        'o-rc': 'Out (Runner Challenge)',
        'o-rf': 'Out (Runners Freeze)',
        'dp': 'Double Play'
    }
};

/**
 * Alternative pitcher set with 2 walk boxes (more pitcher-friendly)
 * Position 0-1: walks, Position 2-4: outs with increasing control
 */
export const PITCHER_2WALK_RESULT_SET: ResultSet = {
    name: 'Pitcher Controls (2 Walk)',
    controller: 'pitcher',
    outcomes: ['bb', 'bb', 'o-rc', 'o-rf', 'dp'],
    labels: PITCHER_RESULT_SET.labels
};

/**
 * Alternative pitcher set with 3 walk boxes (extreme — for testing)
 * Mirrors batter's 3 out boxes
 */
export const PITCHER_3WALK_RESULT_SET: ResultSet = {
    name: 'Pitcher Controls (3 Walk)',
    controller: 'pitcher',
    outcomes: ['bb', 'bb', 'bb', 'o-rf', 'dp'],
    labels: PITCHER_RESULT_SET.labels
};

/**
 * Resolve the result phase
 *
 * @param battleTier - The tier from the battle phase (determines base offset)
 * @param resultDice - The 2d6 result roll (or will roll if not provided)
 * @param resultSet - Which result ladder to use (batter or pitcher)
 * @param tierConfig - Tier thresholds (default: ≤6 weak, 7-9 solid, 10+ strong)
 * @param verbose - Log details
 */
export function resolveResult(
    battleTier: BattleTier,
    resultDice: [number, number] | null = null,
    resultSet: ResultSet = BATTER_RESULT_SET,
    tierConfig: TierConfig = DEFAULT_TIER_CONFIG,
    verbose: boolean = false
): ResultResolution {
    const log = verbose ? console.log : () => {};

    // Roll if dice not provided
    const dice = resultDice ?? roll2d6();
    const resultRoll = sum2d6(dice);

    // Check for criticals first
    const critical = detectCritical(resultRoll);

    // Calculate position
    let position: number;
    let battleOffset: number;
    let resultTier: BattleTier;
    let resultOffset: number;

    if (critical === 'snake-eyes') {
        // Critical fail — worst outcome for roller
        position = 0;
        battleOffset = tierToOffset(battleTier);
        resultTier = 'weak';
        resultOffset = 0;
        log(`\n🐍 SNAKE EYES! Critical fail — position forced to 0`);
    } else if (critical === 'boxcars') {
        // Critical success — best outcome for roller
        position = 4;
        battleOffset = tierToOffset(battleTier);
        resultTier = 'strong';
        resultOffset = 2;
        log(`\n🎰 BOXCARS! Critical hit — position forced to 4`);
    } else {
        // Normal calculation
        battleOffset = tierToOffset(battleTier);
        resultTier = getTier(resultRoll, tierConfig);
        resultOffset = tierToOffset(resultTier);
        position = battleOffset + resultOffset;

        // Clamp to valid range (shouldn't happen with current math, but safety)
        position = Math.max(0, Math.min(4, position));
    }

    // Look up outcome
    const outcome = resultSet.outcomes[position];

    log(`\n--- RESULT PHASE (${resultSet.name}) ---`);
    log(`Result roll: [${dice[0]}+${dice[1]}] = ${resultRoll} → ${resultTier.toUpperCase()}`);
    log(`Battle offset: ${battleOffset} (${battleTier})`);
    log(`Result offset: ${resultOffset} (${resultTier})`);
    log(`Position: ${battleOffset} + ${resultOffset} = ${position}`);
    log(`Outcome: ${resultSet.labels[outcome]} (${outcome.toUpperCase()})`);

    return {
        battleTier,
        resultRoll,
        resultDice: dice,
        battleOffset,
        resultTier,
        resultOffset,
        position,
        outcome,
        critical
    };
}

/**
 * Show the result ladder for a result set
 */
export function showResultLadder(resultSet: ResultSet): void {
    console.log(`\n${resultSet.name} — Result Ladder`);
    console.log('='.repeat(resultSet.name.length + 17));
    console.log('\nPosition → Outcome');
    for (let i = 0; i <= 4; i++) {
        const outcome = resultSet.outcomes[i];
        const label = resultSet.labels[outcome];
        const note = i === 0 ? ' (worst)' : i === 4 ? ' (best)' : '';
        console.log(`  ${i}: ${outcome.toUpperCase().padEnd(5)} — ${label}${note}`);
    }
    console.log('');
}

/**
 * Show the 2D result table (battle tier × result tier)
 */
export function showResultTable(resultSet: ResultSet): void {
    console.log(`\n${resultSet.name} — Result Table`);
    console.log('='.repeat(resultSet.name.length + 16));

    const tiers: BattleTier[] = ['weak', 'solid', 'strong'];

    // Header
    console.log('\n         │ Weak(≤6) │ Solid(7-9) │ Strong(10+)');
    console.log('─────────┼──────────┼────────────┼────────────');

    // Rows (battle tier)
    for (const battleTier of tiers) {
        const battleOffset = tierToOffset(battleTier);
        const cells: string[] = [];

        for (const resultTier of tiers) {
            const resultOffset = tierToOffset(resultTier);
            const position = battleOffset + resultOffset;
            const outcome = resultSet.outcomes[position];
            cells.push(outcome.toUpperCase().padEnd(10));
        }

        const label = battleTier.charAt(0).toUpperCase() + battleTier.slice(1);
        console.log(`${label.padEnd(8)} │ ${cells.join(' │ ')}`);
    }

    console.log('\n🐍 Snake Eyes (2) → position 0');
    console.log('🎰 Boxcars (12) → position 4\n');
}

/**
 * Enumeration result for result phase analysis
 */
export interface ResultEnumeration {
    resultSet: string;
    battleTier: BattleTier;

    // Outcome counts (out of 36 possible 2d6 rolls)
    outcomeCounts: Record<Outcome, number>;
    outcomePercentages: Record<Outcome, number>;

    // Critical counts
    snakeEyes: number;  // always 1 out of 36
    boxcars: number;    // always 1 out of 36

    // Position distribution
    positionCounts: [number, number, number, number, number];
}

/**
 * Enumerate all possible result rolls for a given battle tier
 * Returns exact probabilities (36 combinations of 2d6)
 */
export function enumerateResults(
    battleTier: BattleTier,
    resultSet: ResultSet = BATTER_RESULT_SET,
    tierConfig: TierConfig = DEFAULT_TIER_CONFIG
): ResultEnumeration {
    const outcomeCounts: Record<Outcome, number> = {
        'out': 0, '1b': 0, '2b': 0, 'hr': 0,
        'bb': 0, 'o-ra': 0, 'o-rc': 0, 'o-rf': 0, 'dp': 0
    };
    const positionCounts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    let snakeEyes = 0;
    let boxcars = 0;

    // Enumerate all 36 combinations
    for (let d1 = 1; d1 <= 6; d1++) {
        for (let d2 = 1; d2 <= 6; d2++) {
            const result = resolveResult(
                battleTier,
                [d1, d2],
                resultSet,
                tierConfig,
                false
            );

            outcomeCounts[result.outcome]++;
            positionCounts[result.position]++;

            if (result.critical === 'snake-eyes') snakeEyes++;
            if (result.critical === 'boxcars') boxcars++;
        }
    }

    // Calculate percentages
    const outcomePercentages: Record<Outcome, number> = {} as Record<Outcome, number>;
    for (const [outcome, count] of Object.entries(outcomeCounts)) {
        outcomePercentages[outcome as Outcome] = (count / 36) * 100;
    }

    return {
        resultSet: resultSet.name,
        battleTier,
        outcomeCounts,
        outcomePercentages,
        snakeEyes,
        boxcars,
        positionCounts
    };
}

/**
 * Display enumeration results
 */
export function showResultEnumeration(result: ResultEnumeration): void {
    console.log(`\n${result.resultSet} — Battle Tier: ${result.battleTier.toUpperCase()}`);
    console.log('='.repeat(50));

    console.log('\nOutcome Distribution (36 combinations):');
    for (const [outcome, count] of Object.entries(result.outcomeCounts)) {
        if (count > 0) {
            const pct = result.outcomePercentages[outcome as Outcome];
            console.log(`  ${outcome.toUpperCase().padEnd(5)}: ${count.toString().padStart(2)} (${pct.toFixed(1)}%)`);
        }
    }

    console.log('\nPosition Distribution:');
    for (let i = 0; i <= 4; i++) {
        const count = result.positionCounts[i];
        const pct = (count / 36) * 100;
        console.log(`  Position ${i}: ${count.toString().padStart(2)} (${pct.toFixed(1)}%)`);
    }

    console.log(`\nCriticals: 🐍 ${result.snakeEyes} | 🎰 ${result.boxcars}`);
}

/**
 * Full enumeration across all battle tiers
 */
export function enumerateAllResults(
    resultSet: ResultSet = BATTER_RESULT_SET,
    tierConfig: TierConfig = DEFAULT_TIER_CONFIG
): ResultEnumeration[] {
    const tiers: BattleTier[] = ['weak', 'solid', 'strong'];
    return tiers.map(tier => enumerateResults(tier, resultSet, tierConfig));
}

/**
 * Show summary table of outcomes across all battle tiers
 */
export function showResultSummary(resultSet: ResultSet): void {
    const tiers: BattleTier[] = ['weak', 'solid', 'strong'];
    const results = enumerateAllResults(resultSet);

    console.log(`\n${resultSet.name} — Outcome Summary`);
    console.log('='.repeat(60));

    // Get all outcomes that appear in this set
    const relevantOutcomes = [...new Set(resultSet.outcomes)];

    // Header
    const header = '         │ ' + relevantOutcomes.map(o => o.toUpperCase().padEnd(7)).join(' │ ');
    console.log('\n' + header);
    console.log('─'.repeat(header.length));

    // Rows
    for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        const result = results[i];
        const cells = relevantOutcomes.map(outcome => {
            const pct = result.outcomePercentages[outcome];
            return pct > 0 ? `${pct.toFixed(1)}%`.padEnd(7) : '  -    ';
        });
        const label = tier.charAt(0).toUpperCase() + tier.slice(1);
        console.log(`${label.padEnd(8)} │ ${cells.join(' │ ')}`);
    }

    console.log('');
}
