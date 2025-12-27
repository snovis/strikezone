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
 *   npm run test:battle -- --commit              # Full commit→battle analysis
 *   npm run test:battle -- --commit --no-stance  # Strategy only (v5.2)
 *   npm run test:battle -- --commit --strategy-bonus 1  # Test different bonuses
 *
 * Options:
 *   --battles N         Number of battles to simulate (default: 100)
 *   --seed S            Set random seed for reproducibility
 *   --p1mod N           Player 1 modifier (default: 0)
 *   --p2mod N           Player 2 modifier (default: 0)
 *   --verbose           Show detailed output for each battle
 *   --enumerate         Run full enumeration (1,296 combinations) instead of simulation
 *   --compare           Compare multiple modifier configurations
 *   --commit            Analyze commit→battle flow with probability weighting
 *   --no-stance         Disable stance (strategy only, like v5.2)
 *   --strategy-bonus N  Set strategy winner bonus (default: 2)
 *   --stance-bonus N    Set stance winner bonus (default: 1)
 *   --skill             Show how skill advantages affect outcomes ("poker effect")
 *   --stance-compare    Compare stance modifier structures (+1/0 vs +1/-1)
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
    commit: boolean;
    useStance: boolean;
    strategyBonus: number;
    stanceBonus: number;
    skill: boolean;
    stanceCompare: boolean;
} {
    const args = process.argv.slice(2);
    let battles = 100;
    let seed: string | null = null;
    let p1mod = 0;
    let p2mod = 0;
    let verbose = false;
    let enumerate = false;
    let compare = false;
    let commit = false;
    let useStance = true;
    let strategyBonus = 2;
    let stanceBonus = 1;
    let skill = false;
    let stanceCompare = false;

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
        if (args[i] === '--commit') {
            commit = true;
        }
        if (args[i] === '--no-stance') {
            useStance = false;
        }
        if (args[i] === '--strategy-bonus' && args[i + 1]) {
            strategyBonus = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--stance-bonus' && args[i + 1]) {
            stanceBonus = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--skill') {
            skill = true;
        }
        if (args[i] === '--stance-compare') {
            stanceCompare = true;
        }
    }

    return { battles, seed, p1mod, p2mod, verbose, enumerate, compare, commit, useStance, strategyBonus, stanceBonus, skill, stanceCompare };
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

/**
 * A single commit outcome state
 */
interface CommitState {
    label: string;
    strategyOutcome: 'batter' | 'pitcher' | 'tie';
    stanceOutcome: 'match' | 'fooled' | 'miss' | 'none';
    batterMod: number;
    pitcherMod: number;
    probability: number;
}

/**
 * Enumerate all possible commit outcomes and their probabilities
 *
 * @param symmetricStance - If true, stance loser gets -stanceBonus (more swing)
 *                          If false, stance loser gets 0 (winner-only bonus)
 */
function enumerateCommitStates(
    useStance: boolean,
    strategyBonus: number,
    stanceBonus: number,
    symmetricStance: boolean = false
): CommitState[] {
    const states: CommitState[] = [];

    // Strategy outcomes: 1/3 each
    const strategyOutcomes: Array<{ outcome: 'batter' | 'pitcher' | 'tie'; batterMod: number; pitcherMod: number; prob: number }> = [
        { outcome: 'batter', batterMod: strategyBonus, pitcherMod: 0, prob: 1/3 },
        { outcome: 'pitcher', batterMod: 0, pitcherMod: strategyBonus, prob: 1/3 },
        { outcome: 'tie', batterMod: 0, pitcherMod: 0, prob: 1/3 },
    ];

    // Stance outcomes: 25% match, 25% fooled, 50% miss (or none if disabled)
    // symmetricStance: loser gets -stanceBonus instead of 0
    const loserPenalty = symmetricStance ? -stanceBonus : 0;

    const stanceOutcomes: Array<{ outcome: 'match' | 'fooled' | 'miss' | 'none'; batterMod: number; pitcherMod: number; prob: number }> = useStance
        ? [
            { outcome: 'match', batterMod: stanceBonus, pitcherMod: loserPenalty, prob: 0.25 },
            { outcome: 'fooled', batterMod: loserPenalty, pitcherMod: stanceBonus, prob: 0.25 },
            { outcome: 'miss', batterMod: 0, pitcherMod: 0, prob: 0.50 },
        ]
        : [
            { outcome: 'none', batterMod: 0, pitcherMod: 0, prob: 1.0 },
        ];

    // Combine all possibilities
    for (const strat of strategyOutcomes) {
        for (const stance of stanceOutcomes) {
            const batterMod = strat.batterMod + stance.batterMod;
            const pitcherMod = strat.pitcherMod + stance.pitcherMod;
            const probability = strat.prob * stance.prob;

            // Create descriptive label
            const stratLabel = strat.outcome === 'batter' ? 'Bat wins RPS' :
                               strat.outcome === 'pitcher' ? 'Pit wins RPS' : 'RPS tie';
            const stanceLabel = stance.outcome === 'match' ? ' + Match' :
                                stance.outcome === 'fooled' ? ' + Fooled' :
                                stance.outcome === 'miss' ? ' + Miss' : '';

            states.push({
                label: stratLabel + stanceLabel,
                strategyOutcome: strat.outcome,
                stanceOutcome: stance.outcome,
                batterMod,
                pitcherMod,
                probability
            });
        }
    }

    return states;
}

/**
 * Weighted battle result combining multiple modifier states
 */
interface WeightedBattleResult {
    batterWinPct: number;
    pitcherWinPct: number;
    tiePct: number;
    weakPct: number;
    solidPct: number;
    strongPct: number;
    batterWeakPct: number;
    batterSolidPct: number;
    batterStrongPct: number;
    pitcherWeakPct: number;
    pitcherSolidPct: number;
    pitcherStrongPct: number;
}

/**
 * Run the full commit→battle analysis
 */
function runCommitAnalysis(
    useStance: boolean,
    strategyBonus: number,
    stanceBonus: number
): void {
    const states = enumerateCommitStates(useStance, strategyBonus, stanceBonus);

    // Header
    console.log('\n' + '='.repeat(70));
    console.log('COMMIT → BATTLE ANALYSIS');
    console.log('='.repeat(70));
    console.log(`\nConfiguration:`);
    console.log(`  Strategy bonus: +${strategyBonus} for winner`);
    if (useStance) {
        console.log(`  Stance bonus:   +${stanceBonus} for winner`);
        console.log(`  Mode: v5.3 (Strategy + Stance)`);
    } else {
        console.log(`  Stance: disabled`);
        console.log(`  Mode: v5.2 (Strategy only)`);
    }

    // Show the modifier landscape
    console.log('\n' + '-'.repeat(70));
    console.log('MODIFIER LANDSCAPE (all possible commit outcomes)');
    console.log('-'.repeat(70));
    console.log('\n' + 'Commit Outcome'.padEnd(25) + 'Bat'.padStart(5) + 'Pit'.padStart(5) + 'Net'.padStart(5) + 'Prob'.padStart(10));
    console.log('-'.repeat(50));

    for (const state of states) {
        const net = state.batterMod - state.pitcherMod;
        const netStr = net > 0 ? `+${net}` : net === 0 ? '0' : `${net}`;
        console.log(
            state.label.padEnd(25) +
            formatMod(state.batterMod).padStart(5) +
            formatMod(state.pitcherMod).padStart(5) +
            netStr.padStart(5) +
            `${(state.probability * 100).toFixed(2)}%`.padStart(10)
        );
    }

    // Now show battle outcomes for each state
    console.log('\n' + '-'.repeat(70));
    console.log('BATTLE OUTCOMES BY MODIFIER STATE');
    console.log('-'.repeat(70));
    console.log('\n' +
        'Mods (B/P)'.padEnd(12) +
        'Prob'.padStart(8) +
        'BatWin'.padStart(9) +
        'PitWin'.padStart(9) +
        'Tie'.padStart(7) +
        '│' +
        'Weak'.padStart(7) +
        'Solid'.padStart(8) +
        'Strong'.padStart(8)
    );
    console.log('-'.repeat(70));

    // Track weighted totals
    let totalBatterWin = 0;
    let totalPitcherWin = 0;
    let totalTie = 0;
    let totalWeak = 0;
    let totalSolid = 0;
    let totalStrong = 0;
    let totalBatterWeak = 0, totalBatterSolid = 0, totalBatterStrong = 0;
    let totalPitcherWeak = 0, totalPitcherSolid = 0, totalPitcherStrong = 0;

    for (const state of states) {
        // Get exact battle probabilities for this modifier pair
        const battle = enumerateBattles(state.batterMod, state.pitcherMod);

        // Weight by probability of this state occurring
        const weight = state.probability;
        totalBatterWin += battle.player1WinPct * weight;
        totalPitcherWin += battle.player2WinPct * weight;
        totalTie += battle.tiePct * weight;

        // Tier distribution (weighted by decisive battles in this state)
        const decisiveRate = (100 - battle.tiePct) / 100;
        totalWeak += battle.weakPct * decisiveRate * weight;
        totalSolid += battle.solidPct * decisiveRate * weight;
        totalStrong += battle.strongPct * decisiveRate * weight;

        // Track by winner
        const p1Rate = battle.player1WinPct / 100;
        const p2Rate = battle.player2WinPct / 100;
        totalBatterWeak += (battle.player1Tiers.weak / 1296 * 100) * weight;
        totalBatterSolid += (battle.player1Tiers.solid / 1296 * 100) * weight;
        totalBatterStrong += (battle.player1Tiers.strong / 1296 * 100) * weight;
        totalPitcherWeak += (battle.player2Tiers.weak / 1296 * 100) * weight;
        totalPitcherSolid += (battle.player2Tiers.solid / 1296 * 100) * weight;
        totalPitcherStrong += (battle.player2Tiers.strong / 1296 * 100) * weight;

        // Display row
        const modLabel = `(${formatMod(state.batterMod)}/${formatMod(state.pitcherMod)})`;
        console.log(
            modLabel.padEnd(12) +
            `${(state.probability * 100).toFixed(1)}%`.padStart(8) +
            `${battle.player1WinPct.toFixed(1)}%`.padStart(9) +
            `${battle.player2WinPct.toFixed(1)}%`.padStart(9) +
            `${battle.tiePct.toFixed(1)}%`.padStart(7) +
            '│' +
            `${battle.weakPct.toFixed(1)}%`.padStart(7) +
            `${battle.solidPct.toFixed(1)}%`.padStart(8) +
            `${battle.strongPct.toFixed(1)}%`.padStart(8)
        );
    }

    // Show weighted totals
    console.log('-'.repeat(70));
    console.log(
        'WEIGHTED'.padEnd(12) +
        '100.0%'.padStart(8) +
        `${totalBatterWin.toFixed(1)}%`.padStart(9) +
        `${totalPitcherWin.toFixed(1)}%`.padStart(9) +
        `${totalTie.toFixed(1)}%`.padStart(7) +
        '│' +
        `${totalWeak.toFixed(1)}%`.padStart(7) +
        `${totalSolid.toFixed(1)}%`.padStart(8) +
        `${totalStrong.toFixed(1)}%`.padStart(8)
    );

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('EXPECTED OUTCOMES (weighted by commit probabilities)');
    console.log('='.repeat(70));

    console.log('\nBattle Winner:');
    console.log(`  Batter wins:  ${totalBatterWin.toFixed(2)}%`);
    console.log(`  Pitcher wins: ${totalPitcherWin.toFixed(2)}%`);
    console.log(`  Ties:         ${totalTie.toFixed(2)}%`);

    // Normalize tier percentages to decisive battles
    const decisiveTotal = totalBatterWin + totalPitcherWin;
    const normWeak = totalWeak / (decisiveTotal / 100);
    const normSolid = totalSolid / (decisiveTotal / 100);
    const normStrong = totalStrong / (decisiveTotal / 100);

    console.log('\nTier Distribution (of decisive battles):');
    console.log(`  Weak:   ${normWeak.toFixed(2)}%`);
    console.log(`  Solid:  ${normSolid.toFixed(2)}%`);
    console.log(`  Strong: ${normStrong.toFixed(2)}%`);

    console.log('\nBatter wins by tier:');
    console.log(`  Weak: ${totalBatterWeak.toFixed(2)}%, Solid: ${totalBatterSolid.toFixed(2)}%, Strong: ${totalBatterStrong.toFixed(2)}%`);
    console.log('Pitcher wins by tier:');
    console.log(`  Weak: ${totalPitcherWeak.toFixed(2)}%, Solid: ${totalPitcherSolid.toFixed(2)}%, Strong: ${totalPitcherStrong.toFixed(2)}%`);
}

function formatMod(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
}

/**
 * Calculate weighted outcomes for a given config (returns summary stats)
 */
function calculateWeightedOutcomes(
    useStance: boolean,
    strategyBonus: number,
    stanceBonus: number,
    symmetricStance: boolean = false
): {
    batterWin: number;
    pitcherWin: number;
    tie: number;
    weak: number;
    solid: number;
    strong: number;
} {
    const states = enumerateCommitStates(useStance, strategyBonus, stanceBonus, symmetricStance);

    let totalBatterWin = 0;
    let totalPitcherWin = 0;
    let totalTie = 0;
    let totalWeak = 0;
    let totalSolid = 0;
    let totalStrong = 0;

    for (const state of states) {
        const battle = enumerateBattles(state.batterMod, state.pitcherMod);
        const weight = state.probability;

        totalBatterWin += battle.player1WinPct * weight;
        totalPitcherWin += battle.player2WinPct * weight;
        totalTie += battle.tiePct * weight;

        const decisiveRate = (100 - battle.tiePct) / 100;
        totalWeak += battle.weakPct * decisiveRate * weight;
        totalSolid += battle.solidPct * decisiveRate * weight;
        totalStrong += battle.strongPct * decisiveRate * weight;
    }

    // Normalize tier percentages
    const decisiveTotal = totalBatterWin + totalPitcherWin;
    return {
        batterWin: totalBatterWin,
        pitcherWin: totalPitcherWin,
        tie: totalTie,
        weak: totalWeak / (decisiveTotal / 100),
        solid: totalSolid / (decisiveTotal / 100),
        strong: totalStrong / (decisiveTotal / 100)
    };
}

/**
 * Enumerate commit states with SKILL ADVANTAGE
 *
 * In real play, a skilled player might:
 * - Win RPS more than 33.3% of the time (reading opponent's patterns)
 * - As batter: get "match" more than 25% (anticipating pitch location)
 * - As pitcher: get "fooled" more than 25% (being unpredictable)
 */
function enumerateCommitStatesWithSkill(
    useStance: boolean,
    strategyBonus: number,
    stanceBonus: number,
    batterRPSWinRate: number = 1/3,    // default: fair (33.3%)
    batterStanceReadRate: number = 0.25, // default: fair (25%)
    pitcherStanceDeceiveRate: number = 0.25 // default: fair (25%)
): CommitState[] {
    const states: CommitState[] = [];

    // Strategy outcomes with skill-adjusted probabilities
    // If batter wins more, pitcher wins less (zero-sum for wins, ties stay same)
    const pitcherRPSWinRate = 1/3 - (batterRPSWinRate - 1/3); // mirror the advantage
    const tieRate = 1 - batterRPSWinRate - pitcherRPSWinRate;

    const strategyOutcomes: Array<{ outcome: 'batter' | 'pitcher' | 'tie'; batterMod: number; pitcherMod: number; prob: number }> = [
        { outcome: 'batter', batterMod: strategyBonus, pitcherMod: 0, prob: batterRPSWinRate },
        { outcome: 'pitcher', batterMod: 0, pitcherMod: strategyBonus, prob: pitcherRPSWinRate },
        { outcome: 'tie', batterMod: 0, pitcherMod: 0, prob: tieRate },
    ];

    // Stance outcomes with skill-adjusted probabilities
    // Miss rate = 1 - match - fooled
    const missRate = 1 - batterStanceReadRate - pitcherStanceDeceiveRate;

    const stanceOutcomes: Array<{ outcome: 'match' | 'fooled' | 'miss' | 'none'; batterMod: number; pitcherMod: number; prob: number }> = useStance
        ? [
            { outcome: 'match', batterMod: stanceBonus, pitcherMod: 0, prob: batterStanceReadRate },
            { outcome: 'fooled', batterMod: 0, pitcherMod: stanceBonus, prob: pitcherStanceDeceiveRate },
            { outcome: 'miss', batterMod: 0, pitcherMod: 0, prob: missRate },
        ]
        : [
            { outcome: 'none', batterMod: 0, pitcherMod: 0, prob: 1.0 },
        ];

    // Combine all possibilities
    for (const strat of strategyOutcomes) {
        for (const stance of stanceOutcomes) {
            const batterMod = strat.batterMod + stance.batterMod;
            const pitcherMod = strat.pitcherMod + stance.pitcherMod;
            const probability = strat.prob * stance.prob;

            const stratLabel = strat.outcome === 'batter' ? 'Bat wins RPS' :
                               strat.outcome === 'pitcher' ? 'Pit wins RPS' : 'RPS tie';
            const stanceLabel = stance.outcome === 'match' ? ' + Match' :
                                stance.outcome === 'fooled' ? ' + Fooled' :
                                stance.outcome === 'miss' ? ' + Miss' : '';

            states.push({
                label: stratLabel + stanceLabel,
                strategyOutcome: strat.outcome,
                stanceOutcome: stance.outcome,
                batterMod,
                pitcherMod,
                probability
            });
        }
    }

    return states;
}

/**
 * Calculate weighted outcomes with skill advantage
 */
function calculateWeightedOutcomesWithSkill(
    useStance: boolean,
    strategyBonus: number,
    stanceBonus: number,
    batterRPSWinRate: number,
    batterStanceReadRate: number,
    pitcherStanceDeceiveRate: number
): {
    batterWin: number;
    pitcherWin: number;
    tie: number;
    weak: number;
    solid: number;
    strong: number;
} {
    const states = enumerateCommitStatesWithSkill(
        useStance, strategyBonus, stanceBonus,
        batterRPSWinRate, batterStanceReadRate, pitcherStanceDeceiveRate
    );

    let totalBatterWin = 0;
    let totalPitcherWin = 0;
    let totalTie = 0;
    let totalWeak = 0;
    let totalSolid = 0;
    let totalStrong = 0;

    for (const state of states) {
        const battle = enumerateBattles(state.batterMod, state.pitcherMod);
        const weight = state.probability;

        totalBatterWin += battle.player1WinPct * weight;
        totalPitcherWin += battle.player2WinPct * weight;
        totalTie += battle.tiePct * weight;

        const decisiveRate = (100 - battle.tiePct) / 100;
        totalWeak += battle.weakPct * decisiveRate * weight;
        totalSolid += battle.solidPct * decisiveRate * weight;
        totalStrong += battle.strongPct * decisiveRate * weight;
    }

    const decisiveTotal = totalBatterWin + totalPitcherWin;
    return {
        batterWin: totalBatterWin,
        pitcherWin: totalPitcherWin,
        tie: totalTie,
        weak: totalWeak / (decisiveTotal / 100),
        solid: totalSolid / (decisiveTotal / 100),
        strong: totalStrong / (decisiveTotal / 100)
    };
}

/**
 * Show how skill advantages affect outcomes
 */
function runSkillAnalysis(): void {
    console.log('\n' + '='.repeat(80));
    console.log('SKILL ADVANTAGE ANALYSIS — "The Poker Effect"');
    console.log('='.repeat(80));
    console.log('\nWhat happens when one player is better at reading the other?\n');

    // v5.2 config
    const strategyBonus = 2;
    const stanceBonus = 1;

    console.log('─'.repeat(80));
    console.log('v5.2 (Strategy Only) — Effect of RPS Skill');
    console.log('─'.repeat(80));
    console.log('\n' +
        'Batter RPS Win%'.padEnd(20) +
        'BatWin'.padStart(9) +
        'PitWin'.padStart(9) +
        'Edge'.padStart(8)
    );
    console.log('-'.repeat(46));

    const rpsRates = [0.333, 0.40, 0.45, 0.50, 0.55, 0.60];
    for (const rate of rpsRates) {
        const result = calculateWeightedOutcomesWithSkill(
            false, strategyBonus, stanceBonus,
            rate, 0.25, 0.25
        );
        const edge = result.batterWin - result.pitcherWin;
        const edgeStr = edge > 0 ? `+${edge.toFixed(1)}%` : `${edge.toFixed(1)}%`;
        console.log(
            `${(rate * 100).toFixed(1)}%`.padEnd(20) +
            `${result.batterWin.toFixed(1)}%`.padStart(9) +
            `${result.pitcherWin.toFixed(1)}%`.padStart(9) +
            edgeStr.padStart(8)
        );
    }

    console.log('\n' + '─'.repeat(80));
    console.log('v5.3 (Strategy + Stance) — Effect of RPS Skill');
    console.log('─'.repeat(80));
    console.log('\n' +
        'Batter RPS Win%'.padEnd(20) +
        'BatWin'.padStart(9) +
        'PitWin'.padStart(9) +
        'Edge'.padStart(8)
    );
    console.log('-'.repeat(46));

    for (const rate of rpsRates) {
        const result = calculateWeightedOutcomesWithSkill(
            true, strategyBonus, stanceBonus,
            rate, 0.25, 0.25
        );
        const edge = result.batterWin - result.pitcherWin;
        const edgeStr = edge > 0 ? `+${edge.toFixed(1)}%` : `${edge.toFixed(1)}%`;
        console.log(
            `${(rate * 100).toFixed(1)}%`.padEnd(20) +
            `${result.batterWin.toFixed(1)}%`.padStart(9) +
            `${result.pitcherWin.toFixed(1)}%`.padStart(9) +
            edgeStr.padStart(8)
        );
    }

    console.log('\n' + '─'.repeat(80));
    console.log('v5.3 — Effect of Stance Reading Skill (RPS at 33.3%)');
    console.log('─'.repeat(80));
    console.log('\n' +
        'Batter Read%'.padEnd(15) +
        'Pitcher Fool%'.padEnd(15) +
        'BatWin'.padStart(9) +
        'PitWin'.padStart(9) +
        'Edge'.padStart(8)
    );
    console.log('-'.repeat(56));

    // Batter gets better at reading
    const stanceEdges = [
        { read: 0.25, fool: 0.25, label: 'Fair (25/25)' },
        { read: 0.30, fool: 0.25, label: 'Batter +5%' },
        { read: 0.35, fool: 0.25, label: 'Batter +10%' },
        { read: 0.25, fool: 0.30, label: 'Pitcher +5%' },
        { read: 0.25, fool: 0.35, label: 'Pitcher +10%' },
        { read: 0.35, fool: 0.15, label: 'Batter dominates' },
        { read: 0.15, fool: 0.35, label: 'Pitcher dominates' },
    ];

    for (const s of stanceEdges) {
        const result = calculateWeightedOutcomesWithSkill(
            true, strategyBonus, stanceBonus,
            1/3, s.read, s.fool
        );
        const edge = result.batterWin - result.pitcherWin;
        const edgeStr = edge > 0 ? `+${edge.toFixed(1)}%` : `${edge.toFixed(1)}%`;
        console.log(
            `${(s.read * 100).toFixed(0)}%`.padEnd(15) +
            `${(s.fool * 100).toFixed(0)}%`.padEnd(15) +
            `${result.batterWin.toFixed(1)}%`.padStart(9) +
            `${result.pitcherWin.toFixed(1)}%`.padStart(9) +
            edgeStr.padStart(8)
        );
    }

    console.log('\n' + '─'.repeat(80));
    console.log('KEY INSIGHT: Skill translates to win rate advantage');
    console.log('─'.repeat(80));
    console.log('\n  • A player who wins RPS 50% of the time (vs 33%) gains ~7% battle edge');
    console.log('  • In v5.3, stance reading adds another skill dimension');
    console.log('  • Like poker: the randomness is fair, but skill creates edge over time');
}

/**
 * Compare stance modifier structures: +1/0 vs +1/-1
 */
function runStanceComparison(): void {
    console.log('\n' + '='.repeat(80));
    console.log('STANCE MODIFIER STRUCTURE COMPARISON');
    console.log('='.repeat(80));
    console.log('\nComparing: Winner-only (+1/0) vs Symmetric (+1/-1)\n');

    // Show modifier landscapes for both
    console.log('─'.repeat(80));
    console.log('MODIFIER LANDSCAPE: Winner-only stance (+1/0)');
    console.log('─'.repeat(80));
    console.log('Max swing: +3/0 (batter wins RPS + reads stance)');
    console.log('\n' + 'Commit Outcome'.padEnd(25) + 'Bat'.padStart(5) + 'Pit'.padStart(5) + 'Net'.padStart(5) + 'Prob'.padStart(10));
    console.log('-'.repeat(50));

    const statesPositive = enumerateCommitStates(true, 2, 1, false);
    for (const state of statesPositive) {
        const net = state.batterMod - state.pitcherMod;
        const netStr = net > 0 ? `+${net}` : net === 0 ? '0' : `${net}`;
        console.log(
            state.label.padEnd(25) +
            formatMod(state.batterMod).padStart(5) +
            formatMod(state.pitcherMod).padStart(5) +
            netStr.padStart(5) +
            `${(state.probability * 100).toFixed(2)}%`.padStart(10)
        );
    }

    console.log('\n' + '─'.repeat(80));
    console.log('MODIFIER LANDSCAPE: Symmetric stance (+1/-1)');
    console.log('─'.repeat(80));
    console.log('Max swing: +3/-1 = net +4 (batter wins RPS + reads stance)');
    console.log('\n' + 'Commit Outcome'.padEnd(25) + 'Bat'.padStart(5) + 'Pit'.padStart(5) + 'Net'.padStart(5) + 'Prob'.padStart(10));
    console.log('-'.repeat(50));

    const statesSymmetric = enumerateCommitStates(true, 2, 1, true);
    for (const state of statesSymmetric) {
        const net = state.batterMod - state.pitcherMod;
        const netStr = net > 0 ? `+${net}` : net === 0 ? '0' : `${net}`;
        console.log(
            state.label.padEnd(25) +
            formatMod(state.batterMod).padStart(5) +
            formatMod(state.pitcherMod).padStart(5) +
            netStr.padStart(5) +
            `${(state.probability * 100).toFixed(2)}%`.padStart(10)
        );
    }

    // Compare battle outcomes
    console.log('\n' + '='.repeat(80));
    console.log('BATTLE OUTCOMES COMPARISON');
    console.log('='.repeat(80));
    console.log('\n' +
        'Stance Mode'.padEnd(25) +
        'BatWin'.padStart(9) +
        'PitWin'.padStart(9) +
        'Tie'.padStart(7) +
        '│' +
        'Weak'.padStart(8) +
        'Solid'.padStart(8) +
        'Strong'.padStart(9)
    );
    console.log('-'.repeat(80));

    const resultPositive = calculateWeightedOutcomes(true, 2, 1, false);
    console.log(
        'Winner-only (+1/0)'.padEnd(25) +
        `${resultPositive.batterWin.toFixed(1)}%`.padStart(9) +
        `${resultPositive.pitcherWin.toFixed(1)}%`.padStart(9) +
        `${resultPositive.tie.toFixed(1)}%`.padStart(7) +
        '│' +
        `${resultPositive.weak.toFixed(1)}%`.padStart(8) +
        `${resultPositive.solid.toFixed(1)}%`.padStart(8) +
        `${resultPositive.strong.toFixed(1)}%`.padStart(9)
    );

    const resultSymmetric = calculateWeightedOutcomes(true, 2, 1, true);
    console.log(
        'Symmetric (+1/-1)'.padEnd(25) +
        `${resultSymmetric.batterWin.toFixed(1)}%`.padStart(9) +
        `${resultSymmetric.pitcherWin.toFixed(1)}%`.padStart(9) +
        `${resultSymmetric.tie.toFixed(1)}%`.padStart(7) +
        '│' +
        `${resultSymmetric.weak.toFixed(1)}%`.padStart(8) +
        `${resultSymmetric.solid.toFixed(1)}%`.padStart(8) +
        `${resultSymmetric.strong.toFixed(1)}%`.padStart(9)
    );

    // Also compare v5.2 for reference
    const resultV52 = calculateWeightedOutcomes(false, 2, 0, false);
    console.log(
        'v5.2 (no stance)'.padEnd(25) +
        `${resultV52.batterWin.toFixed(1)}%`.padStart(9) +
        `${resultV52.pitcherWin.toFixed(1)}%`.padStart(9) +
        `${resultV52.tie.toFixed(1)}%`.padStart(7) +
        '│' +
        `${resultV52.weak.toFixed(1)}%`.padStart(8) +
        `${resultV52.solid.toFixed(1)}%`.padStart(8) +
        `${resultV52.strong.toFixed(1)}%`.padStart(9)
    );

    console.log('-'.repeat(80));

    // Analysis
    console.log('\n' + '─'.repeat(80));
    console.log('ANALYSIS');
    console.log('─'.repeat(80));
    console.log('\nWinner-only (+1/0):');
    console.log('  • Max modifier swing: +3 vs +0 (net +3)');
    console.log('  • Simpler mental model: "win stance = get +1"');
    console.log('  • Less punishing for stance loser');

    console.log('\nSymmetric (+1/-1):');
    console.log('  • Max modifier swing: +3 vs -1 (net +4)');
    console.log('  • More variance in outcomes');
    console.log('  • Stance matters more — getting read hurts');

    const weakDiff = resultSymmetric.weak - resultPositive.weak;
    const strongDiff = resultSymmetric.strong - resultPositive.strong;
    console.log(`\nTier shift: Symmetric has ${weakDiff > 0 ? '+' : ''}${weakDiff.toFixed(1)}% Weak, ${strongDiff > 0 ? '+' : ''}${strongDiff.toFixed(1)}% Strong`);
}

/**
 * Compare multiple commit configurations side by side
 */
function runCommitComparison(): void {
    console.log('\n' + '='.repeat(80));
    console.log('COMMIT → BATTLE CONFIGURATION COMPARISON');
    console.log('='.repeat(80));
    console.log('\nShowing how different strategy/stance bonuses affect battle outcomes.\n');

    // Define configurations to compare
    const configs = [
        { label: 'v5.2 (Strat +1)', useStance: false, strategyBonus: 1, stanceBonus: 0, symmetric: false },
        { label: 'v5.2 (Strat +2)', useStance: false, strategyBonus: 2, stanceBonus: 0, symmetric: false },
        { label: 'v5.2 (Strat +3)', useStance: false, strategyBonus: 3, stanceBonus: 0, symmetric: false },
        { label: 'v5.3 +1/0 stance', useStance: true, strategyBonus: 2, stanceBonus: 1, symmetric: false },
        { label: 'v5.3 +1/-1 stance', useStance: true, strategyBonus: 2, stanceBonus: 1, symmetric: true },
        { label: 'v5.3 (S+1, St+1)', useStance: true, strategyBonus: 1, stanceBonus: 1, symmetric: false },
    ];

    // Header
    console.log(
        'Configuration'.padEnd(20) +
        'BatWin'.padStart(9) +
        'PitWin'.padStart(9) +
        'Tie'.padStart(7) +
        '│' +
        'Weak'.padStart(8) +
        'Solid'.padStart(8) +
        'Strong'.padStart(9)
    );
    console.log('-'.repeat(80));

    for (const cfg of configs) {
        const result = calculateWeightedOutcomes(cfg.useStance, cfg.strategyBonus, cfg.stanceBonus, cfg.symmetric);
        console.log(
            cfg.label.padEnd(20) +
            `${result.batterWin.toFixed(1)}%`.padStart(9) +
            `${result.pitcherWin.toFixed(1)}%`.padStart(9) +
            `${result.tie.toFixed(1)}%`.padStart(7) +
            '│' +
            `${result.weak.toFixed(1)}%`.padStart(8) +
            `${result.solid.toFixed(1)}%`.padStart(8) +
            `${result.strong.toFixed(1)}%`.padStart(9)
        );
    }

    console.log('-'.repeat(80));
    console.log('\nKey observations:');
    console.log('  • Higher strategy bonus → more STRONG tier wins, fewer WEAK');
    console.log('  • Adding stance spreads the modifier range, increasing variance');
    console.log('  • All configs are perfectly balanced (batter = pitcher win rate)');
    console.log('  • Tier distribution affects the result tables (more Strong = more dramatic outcomes)');
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
const { battles, seed, p1mod, p2mod, verbose, enumerate, compare, commit, useStance, strategyBonus, stanceBonus, skill, stanceCompare } = parseArgs();

console.log('Battle Phase Test Harness');
console.log('=========================');

showTierRules();

if (stanceCompare) {
    // Run stance modifier comparison
    runStanceComparison();
} else if (skill) {
    // Run skill advantage analysis
    runSkillAnalysis();
} else if (commit && compare) {
    // Run commit configuration comparison
    runCommitComparison();
} else if (commit) {
    // Run commit→battle analysis for a single config
    runCommitAnalysis(useStance, strategyBonus, stanceBonus);
} else if (compare) {
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
