/**
 * Grapple Engine - Battle Module
 *
 * Resolves the BATTLE phase:
 * 1. Both players roll 2d6 + their modifier
 * 2. Compare totals to determine winner
 * 3. Calculate margin to determine tier (weak/solid/strong)
 *
 * The winner's tier determines which result table column to use.
 */

import { roll2d6, sum2d6 } from './dice';

/**
 * Battle outcome tiers based on margin of victory
 */
export type BattleTier = 'weak' | 'solid' | 'strong';

/**
 * Who won the battle
 */
export type BattleWinner = 'player1' | 'player2' | 'tie';

/**
 * Configuration for tier thresholds (based on winning roll value)
 *
 * Tier is determined by the WINNER'S ROLL, not the margin.
 * A 12 vs 11 is an epic battle — winner gets strong tier.
 * A 4 vs 3 is a slapfight — winner gets weak tier.
 */
export interface TierConfig {
    weak: { max: number };    // roll value ≤ this = weak
    solid: { max: number };   // roll value ≤ this (but > weak) = solid
    // strong: anything above solid.max
}

/**
 * Default tier configuration (roll-value based)
 * Weak:   roll ≤ 6
 * Solid:  roll 7-9
 * Strong: roll 10+
 */
export const DEFAULT_TIER_CONFIG: TierConfig = {
    weak: { max: 6 },
    solid: { max: 9 }
};

/**
 * Result of a battle roll
 */
export interface BattleResult {
    // Raw dice
    player1Dice: [number, number];
    player2Dice: [number, number];

    // Modifiers (passed in)
    player1Modifier: number;
    player2Modifier: number;

    // Totals
    player1Total: number;
    player2Total: number;

    // Outcome
    margin: number;
    winner: BattleWinner;
    winningRoll: number | null;  // the winner's total (null if tie)
    tier: BattleTier | null;     // null if tie
}

/**
 * Determine the tier based on the winning roll value
 * @param winningRoll - The total roll of the winner (dice + modifier)
 */
export function getTier(winningRoll: number, config: TierConfig = DEFAULT_TIER_CONFIG): BattleTier {
    if (winningRoll > config.solid.max) return 'strong';
    if (winningRoll > config.weak.max) return 'solid';
    return 'weak';
}

/**
 * Roll a battle between two players
 *
 * @param player1Modifier - Batter's modifier from commit phase
 * @param player2Modifier - Pitcher's modifier from commit phase
 * @param tierConfig - Tier threshold configuration
 * @param verbose - If true, log the battle details
 */
export function rollBattle(
    player1Modifier: number,
    player2Modifier: number,
    tierConfig: TierConfig = DEFAULT_TIER_CONFIG,
    verbose: boolean = false
): BattleResult {
    const log = verbose ? console.log : () => {};

    // Roll dice
    const player1Dice = roll2d6();
    const player2Dice = roll2d6();

    // Calculate totals
    const player1Total = sum2d6(player1Dice) + player1Modifier;
    const player2Total = sum2d6(player2Dice) + player2Modifier;

    // Determine winner and tier (based on winning roll value)
    const margin = Math.abs(player1Total - player2Total);
    let winner: BattleWinner;
    let tier: BattleTier | null;
    let winningRoll: number | null;

    if (player1Total > player2Total) {
        winner = 'player1';
        winningRoll = player1Total;
        tier = getTier(winningRoll, tierConfig);
    } else if (player2Total > player1Total) {
        winner = 'player2';
        winningRoll = player2Total;
        tier = getTier(winningRoll, tierConfig);
    } else {
        winner = 'tie';
        winningRoll = null;
        tier = null;
    }

    // Log if verbose
    log(`\n--- BATTLE PHASE ---`);
    log(`Player 1: [${player1Dice[0]}+${player1Dice[1]}] + ${formatMod(player1Modifier)} = ${player1Total}`);
    log(`Player 2: [${player2Dice[0]}+${player2Dice[1]}] + ${formatMod(player2Modifier)} = ${player2Total}`);

    if (winner === 'tie') {
        log(`Result: TIE (${player1Total} vs ${player2Total})`);
    } else {
        const winnerName = winner === 'player1' ? 'Player 1 (Batter)' : 'Player 2 (Pitcher)';
        log(`Result: ${winnerName} wins (roll ${winningRoll}) — ${tier?.toUpperCase()} victory`);
    }

    return {
        player1Dice,
        player2Dice,
        player1Modifier,
        player2Modifier,
        player1Total,
        player2Total,
        margin,
        winner,
        winningRoll,
        tier
    };
}

/**
 * Format a modifier with + or - sign
 */
function formatMod(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
}

/**
 * Explain the tier thresholds
 */
export function showTierRules(config: TierConfig = DEFAULT_TIER_CONFIG): void {
    console.log('\nBattle Tier Thresholds (based on winning roll):');
    console.log(`  Weak:   winning roll ≤ ${config.weak.max}`);
    console.log(`  Solid:  winning roll ${config.weak.max + 1}-${config.solid.max}`);
    console.log(`  Strong: winning roll ${config.solid.max + 1}+`);
    console.log('');
}

/**
 * Result of enumerating all possible battles
 */
export interface EnumerationResult {
    totalCombinations: number;

    // Win counts
    player1Wins: number;
    player2Wins: number;
    ties: number;

    // Tier counts (decisive battles only)
    weakWins: number;
    solidWins: number;
    strongWins: number;

    // Tier by winner
    player1Tiers: { weak: number; solid: number; strong: number };
    player2Tiers: { weak: number; solid: number; strong: number };

    // Percentages (computed)
    player1WinPct: number;
    player2WinPct: number;
    tiePct: number;
    weakPct: number;
    solidPct: number;
    strongPct: number;
}

/**
 * Enumerate ALL possible 2d6 vs 2d6 battles (1,296 combinations)
 * Returns exact probabilities, not samples.
 *
 * @param player1Modifier - Modifier for player 1
 * @param player2Modifier - Modifier for player 2
 * @param tierConfig - Tier threshold configuration
 */
export function enumerateBattles(
    player1Modifier: number = 0,
    player2Modifier: number = 0,
    tierConfig: TierConfig = DEFAULT_TIER_CONFIG
): EnumerationResult {
    // Initialize counts
    let player1Wins = 0;
    let player2Wins = 0;
    let ties = 0;

    const tierCounts = { weak: 0, solid: 0, strong: 0 };
    const p1Tiers = { weak: 0, solid: 0, strong: 0 };
    const p2Tiers = { weak: 0, solid: 0, strong: 0 };

    // Enumerate all 36 × 36 = 1,296 combinations
    // Player 1 dice: d1a, d1b (1-6 each)
    // Player 2 dice: d2a, d2b (1-6 each)
    for (let d1a = 1; d1a <= 6; d1a++) {
        for (let d1b = 1; d1b <= 6; d1b++) {
            for (let d2a = 1; d2a <= 6; d2a++) {
                for (let d2b = 1; d2b <= 6; d2b++) {
                    // Calculate totals
                    const p1Total = d1a + d1b + player1Modifier;
                    const p2Total = d2a + d2b + player2Modifier;

                    // Determine outcome
                    if (p1Total > p2Total) {
                        player1Wins++;
                        const tier = getTier(p1Total, tierConfig);
                        tierCounts[tier]++;
                        p1Tiers[tier]++;
                    } else if (p2Total > p1Total) {
                        player2Wins++;
                        const tier = getTier(p2Total, tierConfig);
                        tierCounts[tier]++;
                        p2Tiers[tier]++;
                    } else {
                        ties++;
                    }
                }
            }
        }
    }

    const total = 1296;  // 6^4
    const decisive = total - ties;

    return {
        totalCombinations: total,
        player1Wins,
        player2Wins,
        ties,
        weakWins: tierCounts.weak,
        solidWins: tierCounts.solid,
        strongWins: tierCounts.strong,
        player1Tiers: p1Tiers,
        player2Tiers: p2Tiers,
        player1WinPct: (player1Wins / total) * 100,
        player2WinPct: (player2Wins / total) * 100,
        tiePct: (ties / total) * 100,
        weakPct: decisive > 0 ? (tierCounts.weak / decisive) * 100 : 0,
        solidPct: decisive > 0 ? (tierCounts.solid / decisive) * 100 : 0,
        strongPct: decisive > 0 ? (tierCounts.strong / decisive) * 100 : 0
    };
}

/**
 * Display enumeration results in a readable format
 */
export function showEnumerationResult(
    result: EnumerationResult,
    label: string = 'Battle Enumeration'
): void {
    console.log(`\n${'='.repeat(50)}`);
    console.log(label);
    console.log('='.repeat(50));

    console.log(`\nTotal combinations: ${result.totalCombinations}`);

    console.log('\nWin Rates (exact):');
    console.log(`  Player 1: ${result.player1Wins} (${result.player1WinPct.toFixed(2)}%)`);
    console.log(`  Player 2: ${result.player2Wins} (${result.player2WinPct.toFixed(2)}%)`);
    console.log(`  Ties:     ${result.ties} (${result.tiePct.toFixed(2)}%)`);

    const decisive = result.totalCombinations - result.ties;
    console.log(`\nTier Distribution (${decisive} decisive battles):`);
    console.log(`  Weak:   ${result.weakWins} (${result.weakPct.toFixed(2)}%)`);
    console.log(`  Solid:  ${result.solidWins} (${result.solidPct.toFixed(2)}%)`);
    console.log(`  Strong: ${result.strongWins} (${result.strongPct.toFixed(2)}%)`);

    console.log('\nPlayer 1 wins by tier:');
    console.log(`  Weak: ${result.player1Tiers.weak}, Solid: ${result.player1Tiers.solid}, Strong: ${result.player1Tiers.strong}`);
    console.log('Player 2 wins by tier:');
    console.log(`  Weak: ${result.player2Tiers.weak}, Solid: ${result.player2Tiers.solid}, Strong: ${result.player2Tiers.strong}`);
}
