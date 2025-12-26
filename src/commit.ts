/**
 * Grapple Engine - Commit Module
 *
 * Orchestrates the COMMIT and REVEAL phases:
 * 1. Both players choose strategy + stance
 * 2. Resolve strategy → outcome → modifier
 * 3. Resolve stance → outcome → modifier
 * 4. Combine modifiers for each player
 *
 * Each player accumulates their own modifier.
 */

import {
    StrategySet,
    BASEBALL_STRATEGY_SET,
    resolve as resolveStrategy,
    explainResult as explainStrategy,
    MatchupResult
} from './strategy';

import {
    StanceSet,
    BASEBALL_STANCE_SET,
    resolve as resolveStance,
    explainResult as explainStance,
    StanceResult
} from './stance';

/**
 * A player's complete commitment (strategy + stance)
 */
export interface PlayerCommitment {
    strategy: string;
    stance: string;
}

/**
 * Configuration for modifier values
 * These are tuning parameters — adjust to balance the game
 */
export interface ModifierConfig {
    strategy: { win: number; lose: number; tie: number };
    stance: { reader: number; actor: number; miss: number };
}

/**
 * Default modifier configuration
 * Strategy: winner gets +1, loser gets -1, tie = 0
 * Stance: winner gets +1, loser gets -1, miss = 0
 */
export const DEFAULT_MODIFIER_CONFIG: ModifierConfig = {
    strategy: { win: 1, lose: -1, tie: 0 },
    stance: { reader: 1, actor: -1, miss: 0 }
};

/**
 * Result of the commit/reveal phase
 */
export interface CommitResult {
    // Raw choices
    player1: PlayerCommitment;
    player2: PlayerCommitment;

    // Strategy resolution (from player1's perspective)
    strategy: {
        result: MatchupResult;
        explanation: string;
        player1Modifier: number;
        player2Modifier: number;
    };

    // Stance resolution (player1 = reader, player2 = actor)
    stance: {
        result: StanceResult;
        explanation: string;
        player1Modifier: number;
        player2Modifier: number;
    };

    // Combined modifiers
    player1TotalModifier: number;
    player2TotalModifier: number;
}

/**
 * Resolve the commit phase for two players
 *
 * @param player1 - First player's commitment (reader in stance)
 * @param player2 - Second player's commitment (actor in stance)
 * @param strategySet - Strategy rules to use
 * @param stanceSet - Stance rules to use
 * @param modifiers - Modifier values for outcomes
 * @param verbose - If true, log each step
 */
export function resolveCommit(
    player1: PlayerCommitment,
    player2: PlayerCommitment,
    strategySet: StrategySet = BASEBALL_STRATEGY_SET,
    stanceSet: StanceSet = BASEBALL_STANCE_SET,
    modifiers: ModifierConfig = DEFAULT_MODIFIER_CONFIG,
    verbose: boolean = false
): CommitResult {
    const log = verbose ? console.log : () => {};

    // Log choices
    log(`\n--- COMMIT PHASE ---`);
    log(`Player 1: ${player1.strategy} / ${player1.stance}`);
    log(`Player 2: ${player2.strategy} / ${player2.stance}`);

    // Resolve strategy
    log(`\n--- REVEAL: Strategy ---`);
    const strategyResult = resolveStrategy(player1.strategy, player2.strategy, strategySet);
    const strategyExplanation = explainStrategy(player1.strategy, player2.strategy, strategySet);
    log(`${strategyExplanation}`);

    // Convert strategy result to modifiers
    let strat1Mod = 0;
    let strat2Mod = 0;
    if (strategyResult === 'win') {
        strat1Mod = modifiers.strategy.win;
        strat2Mod = modifiers.strategy.lose;
    } else if (strategyResult === 'lose') {
        strat1Mod = modifiers.strategy.lose;
        strat2Mod = modifiers.strategy.win;
    } else {
        strat1Mod = modifiers.strategy.tie;
        strat2Mod = modifiers.strategy.tie;
    }
    log(`Strategy modifiers: P1=${formatMod(strat1Mod)}, P2=${formatMod(strat2Mod)}`);

    // Resolve stance (player1 = reader, player2 = actor)
    log(`\n--- REVEAL: Stance ---`);
    const stanceResult = resolveStance(player1.stance, player2.stance, stanceSet);
    const stanceExplanation = explainStance(player1.stance, player2.stance, stanceSet);
    log(`${stanceExplanation}`);

    // Convert stance result to modifiers
    let stance1Mod = 0;
    let stance2Mod = 0;
    if (stanceResult === 'reader') {
        stance1Mod = modifiers.stance.reader;
        stance2Mod = modifiers.stance.actor;  // actor loses when reader wins
    } else if (stanceResult === 'actor') {
        stance1Mod = modifiers.stance.actor;  // reader loses when actor wins
        stance2Mod = modifiers.stance.reader;
    } else {
        stance1Mod = modifiers.stance.miss;
        stance2Mod = modifiers.stance.miss;
    }
    log(`Stance modifiers: P1=${formatMod(stance1Mod)}, P2=${formatMod(stance2Mod)}`);

    // Combine modifiers
    const total1 = strat1Mod + stance1Mod;
    const total2 = strat2Mod + stance2Mod;
    log(`\n--- COMBINED ---`);
    log(`Player 1 total modifier: ${formatMod(total1)}`);
    log(`Player 2 total modifier: ${formatMod(total2)}`);

    return {
        player1,
        player2,
        strategy: {
            result: strategyResult,
            explanation: strategyExplanation,
            player1Modifier: strat1Mod,
            player2Modifier: strat2Mod
        },
        stance: {
            result: stanceResult,
            explanation: stanceExplanation,
            player1Modifier: stance1Mod,
            player2Modifier: stance2Mod
        },
        player1TotalModifier: total1,
        player2TotalModifier: total2
    };
}

/**
 * Format a modifier with + or - sign
 */
function formatMod(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
}
