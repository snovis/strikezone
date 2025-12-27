/**
 * Grapple Engine - Game Module (Quick Prototype)
 *
 * Simulates full games to test balance.
 * Strategy-only mode: +2 on win, 0 on tie/loss
 */

import { roll2d6, sum2d6 } from './dice';
import { resolve as resolveStrategy, BASEBALL_STRATEGY_SET, StrategySet } from './strategy';
import { resolve as resolveStance, BASEBALL_STANCE_SET, StanceSet } from './stance';
import { cpuChooseStrategy, cpuChooseStance } from './player';
import { rollBattle, BattleTier, getTier, DEFAULT_TIER_CONFIG } from './battle';
import {
    resolveResult,
    BATTER_RESULT_SET,
    BATTER_R3_PRESSURE_1WALK,
    PITCHER_RESULT_SET,
    Outcome
} from './result';

/**
 * Game configuration
 */
export interface GameConfig {
    innings: number;
    strategySet: StrategySet;
    strategyWinBonus: number;  // modifier for strategy winner
    useStance: boolean;        // whether to use stance (location) commitment
    stanceSet: StanceSet;
    stanceBonus: number;       // modifier for stance advantage
    useR3Pressure: boolean;    // when R3 occupied, batter gets better ladder
    verbose: boolean;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
    innings: 3,
    strategySet: BASEBALL_STRATEGY_SET,
    strategyWinBonus: 2,
    useStance: false,
    stanceSet: BASEBALL_STANCE_SET,
    stanceBonus: 1,  // +1/-1 for stance (reader wins = batter +1, actor wins = pitcher +1)
    useR3Pressure: false,
    verbose: false
};

/**
 * Game state
 */
export interface GameState {
    inning: number;
    topOfInning: boolean;  // true = away batting, false = home batting
    outs: number;
    runners: [boolean, boolean, boolean];  // [1st, 2nd, 3rd]
    awayScore: number;
    homeScore: number;
}

/**
 * At-bat result
 */
export interface AtBatResult {
    batterStrategy: string;
    pitcherStrategy: string;
    strategyResult: 'win' | 'lose' | 'tie';
    batterMod: number;
    pitcherMod: number;
    battleWinner: 'batter' | 'pitcher' | 'tie';
    battleTier: BattleTier | null;
    outcome: Outcome;
    runsScored: number;
    outsRecorded: number;
}

/**
 * Game summary
 */
export interface GameSummary {
    awayScore: number;
    homeScore: number;
    totalAtBats: number;
    hits: number;
    walks: number;
    outs: number;
    homeRuns: number;
    doublePlays: number;
    // Run sources
    runsFromHR: number;
    runsFrom2B: number;
    runsFrom1B: number;
    runsFromBB: number;
    runsFromORA: number;
}

/**
 * Simulate a single at-bat
 */
export function simulateAtBat(
    state: GameState,
    config: GameConfig = DEFAULT_GAME_CONFIG,
    verbose: boolean = false
): AtBatResult {
    const log = verbose ? console.log : () => {};

    // 1. Both choose strategy (CPU random)
    const batterStrategy = cpuChooseStrategy(config.strategySet);
    const pitcherStrategy = cpuChooseStrategy(config.strategySet);

    // 2. Resolve strategy
    const strategyResult = resolveStrategy(batterStrategy, pitcherStrategy, config.strategySet);

    // 3. Calculate modifiers from strategy
    let batterMod = 0;
    let pitcherMod = 0;
    if (strategyResult === 'win') {
        batterMod += config.strategyWinBonus;
    } else if (strategyResult === 'lose') {
        pitcherMod += config.strategyWinBonus;
    }

    log(`  Strategy: ${batterStrategy} vs ${pitcherStrategy} → ${strategyResult}`);

    // 4. Stance (location) if enabled
    if (config.useStance) {
        // Batter is reader (trying to anticipate), pitcher is actor (trying to deceive)
        const batterStance = cpuChooseStance(config.stanceSet);
        const pitcherStance = cpuChooseStance(config.stanceSet);
        const stanceResult = resolveStance(batterStance, pitcherStance, config.stanceSet);

        if (stanceResult === 'reader') {
            // Batter anticipated correctly
            batterMod += config.stanceBonus;
        } else if (stanceResult === 'actor') {
            // Pitcher deceived successfully
            pitcherMod += config.stanceBonus;
        }
        // 'miss' = no modifier

        log(`  Stance: ${batterStance} vs ${pitcherStance} → ${stanceResult}`);
    }

    log(`  Modifiers: Batter ${batterMod >= 0 ? '+' : ''}${batterMod}, Pitcher ${pitcherMod >= 0 ? '+' : ''}${pitcherMod}`);

    // 4. Battle phase
    const battle = rollBattle(batterMod, pitcherMod, DEFAULT_TIER_CONFIG, false);

    let battleWinner: 'batter' | 'pitcher' | 'tie';
    if (battle.winner === 'player1') battleWinner = 'batter';
    else if (battle.winner === 'player2') battleWinner = 'pitcher';
    else battleWinner = 'tie';

    log(`  Battle: [${battle.player1Dice}]+${batterMod}=${battle.player1Total} vs [${battle.player2Dice}]+${pitcherMod}=${battle.player2Total}`);
    log(`  Winner: ${battleWinner}${battle.tier ? ` (${battle.tier})` : ''}`);

    // 5. Check for critical battle rolls (boxcars or snake eyes)
    const batterRawRoll = battle.player1Dice[0] + battle.player1Dice[1];
    const pitcherRawRoll = battle.player2Dice[0] + battle.player2Dice[1];

    let runsScored = 0;
    let outsRecorded = 0;
    let outcome: Outcome;

    // Batter boxcars = auto HR
    if (batterRawRoll === 12) {
        log(`  🎰 BATTER BOXCARS! Automatic HOME RUN!`);
        outcome = 'hr';
        runsScored = 1 + (state.runners[0] ? 1 : 0) + (state.runners[1] ? 1 : 0) + (state.runners[2] ? 1 : 0);
        state.runners = [false, false, false];
        if (runsScored > 0) {
            log(`  *** ${runsScored} RUN${runsScored > 1 ? 'S' : ''} SCORED ***`);
        }
        return {
            batterStrategy, pitcherStrategy, strategyResult,
            batterMod, pitcherMod, battleWinner: 'batter',
            battleTier: 'strong', outcome, runsScored, outsRecorded
        };
    }

    // Pitcher boxcars = auto double play (2 outs if runners, 1 otherwise)
    if (pitcherRawRoll === 12) {
        const hasRunners = state.runners[0] || state.runners[1] || state.runners[2];
        outsRecorded = hasRunners ? 2 : 1;
        outcome = 'dp';
        log(`  🎰 PITCHER BOXCARS! Automatic ${outsRecorded === 2 ? 'DOUBLE PLAY' : 'OUT'}!`);
        // Erase lead runner on DP
        if (hasRunners) {
            if (state.runners[2]) state.runners[2] = false;
            else if (state.runners[1]) state.runners[1] = false;
            else if (state.runners[0]) state.runners[0] = false;
        }
        return {
            batterStrategy, pitcherStrategy, strategyResult,
            batterMod, pitcherMod, battleWinner: 'pitcher',
            battleTier: 'strong', outcome, runsScored, outsRecorded
        };
    }

    // Batter snake eyes = auto out
    if (batterRawRoll === 2) {
        log(`  🐍 BATTER SNAKE EYES! Automatic OUT!`);
        outcome = 'out';
        outsRecorded = 1;
        return {
            batterStrategy, pitcherStrategy, strategyResult,
            batterMod, pitcherMod, battleWinner: 'pitcher',
            battleTier: 'weak', outcome, runsScored, outsRecorded
        };
    }

    // Pitcher snake eyes = auto walk
    if (pitcherRawRoll === 2) {
        log(`  🐍 PITCHER SNAKE EYES! Automatic WALK!`);
        outcome = 'bb';
        // Walk logic - forced runners advance
        if (state.runners[0] && state.runners[1] && state.runners[2]) {
            runsScored++;  // bases loaded walk
        }
        if (state.runners[0] && state.runners[1]) {
            state.runners[2] = true;
        }
        if (state.runners[0]) {
            state.runners[1] = true;
        }
        state.runners[0] = true;
        if (runsScored > 0) {
            log(`  *** ${runsScored} RUN SCORED ***`);
        }
        return {
            batterStrategy, pitcherStrategy, strategyResult,
            batterMod, pitcherMod, battleWinner: 'batter',
            battleTier: 'weak', outcome, runsScored, outsRecorded
        };
    }

    // 6. Handle tie (re-roll until decisive)
    if (battleWinner === 'tie') {
        return simulateAtBat(state, config, verbose);
    }

    // 7. Normal result phase (no criticals)
    // Use R3 pressure ladder if enabled and runner on 3rd
    const hasR3 = state.runners[2];
    const batterResultSet = (config.useR3Pressure && hasR3)
        ? BATTER_R3_PRESSURE_1WALK
        : BATTER_RESULT_SET;
    const resultSet = battleWinner === 'batter' ? batterResultSet : PITCHER_RESULT_SET;

    if (config.useR3Pressure && hasR3 && battleWinner === 'batter') {
        log(`  📍 R3 PRESSURE: Using favorable batter ladder (OUT→BB→1B→2B→HR)`);
    }

    const result = resolveResult(battle.tier!, null, resultSet, DEFAULT_TIER_CONFIG, false);

    log(`  Result roll: ${result.resultRoll} → ${result.outcome.toUpperCase()}`);

    outcome = result.outcome;

    switch (result.outcome) {
        case 'hr':
            // Everyone scores
            runsScored = 1 + (state.runners[0] ? 1 : 0) + (state.runners[1] ? 1 : 0) + (state.runners[2] ? 1 : 0);
            state.runners = [false, false, false];
            break;

        case '2b':
            // R2, R3 score, R1 to 3rd, batter to 2nd
            if (state.runners[2]) runsScored++;
            if (state.runners[1]) runsScored++;
            state.runners[2] = state.runners[0];
            state.runners[1] = true;  // batter
            state.runners[0] = false;
            break;

        case '1b':
            // R3 scores, R2 to 3rd, R1 to 2nd, batter to 1st
            if (state.runners[2]) runsScored++;
            state.runners[2] = state.runners[1];
            state.runners[1] = state.runners[0];
            state.runners[0] = true;  // batter
            break;

        case 'bb':
            // Walk - forced runners advance
            if (state.runners[0] && state.runners[1] && state.runners[2]) {
                runsScored++;  // bases loaded walk
            }
            if (state.runners[0] && state.runners[1]) {
                state.runners[2] = true;
            }
            if (state.runners[0]) {
                state.runners[1] = true;
            }
            state.runners[0] = true;
            break;

        case 'out':
        case 'o-ra':
        case 'o-rc':
        case 'o-rf':
            outsRecorded = 1;
            // For simplicity, O-RA moves runners, others freeze
            if (result.outcome === 'o-ra') {
                if (state.runners[2]) runsScored++;
                state.runners[2] = state.runners[1];
                state.runners[1] = state.runners[0];
                state.runners[0] = false;
            }
            break;

        case 'dp':
            // Double play - 2 outs, lead runner erased
            outsRecorded = state.runners[0] || state.runners[1] || state.runners[2] ? 2 : 1;
            if (state.runners[2]) {
                state.runners[2] = false;
            } else if (state.runners[1]) {
                state.runners[1] = false;
            } else if (state.runners[0]) {
                state.runners[0] = false;
            }
            break;
    }

    if (runsScored > 0) {
        log(`  *** ${runsScored} RUN${runsScored > 1 ? 'S' : ''} SCORED ***`);
    }

    return {
        batterStrategy,
        pitcherStrategy,
        strategyResult,
        batterMod,
        pitcherMod,
        battleWinner,
        battleTier: battle.tier,
        outcome: result.outcome,
        runsScored,
        outsRecorded
    };
}

/**
 * Simulate a half-inning
 */
export function simulateHalfInning(
    state: GameState,
    config: GameConfig = DEFAULT_GAME_CONFIG
): AtBatResult[] {
    const results: AtBatResult[] = [];
    state.outs = 0;
    state.runners = [false, false, false];

    while (state.outs < 3) {
        const result = simulateAtBat(state, config, config.verbose);
        results.push(result);

        // Update score
        if (state.topOfInning) {
            state.awayScore += result.runsScored;
        } else {
            state.homeScore += result.runsScored;
        }

        // Update outs
        state.outs += result.outsRecorded;
    }

    return results;
}

/**
 * Simulate a full game
 */
export function simulateGame(config: GameConfig = DEFAULT_GAME_CONFIG): GameSummary {
    const log = config.verbose ? console.log : () => {};

    const state: GameState = {
        inning: 1,
        topOfInning: true,
        outs: 0,
        runners: [false, false, false],
        awayScore: 0,
        homeScore: 0
    };

    let totalAtBats = 0;
    let hits = 0;
    let walks = 0;
    let outs = 0;
    let homeRuns = 0;
    let doublePlays = 0;

    // Run sources
    let runsFromHR = 0;
    let runsFrom2B = 0;
    let runsFrom1B = 0;
    let runsFromBB = 0;
    let runsFromORA = 0;

    for (let inning = 1; inning <= config.innings; inning++) {
        state.inning = inning;

        // Top of inning (away bats)
        state.topOfInning = true;
        log(`\n=== INNING ${inning} TOP (Away batting) ===`);
        const topResults = simulateHalfInning(state, config);

        for (const r of topResults) {
            totalAtBats++;
            if (r.outcome === '1b' || r.outcome === '2b' || r.outcome === 'hr') hits++;
            if (r.outcome === 'hr') homeRuns++;
            if (r.outcome === 'bb') walks++;
            if (r.outcome === 'dp') doublePlays++;
            outs += r.outsRecorded;

            // Track run sources
            if (r.runsScored > 0) {
                if (r.outcome === 'hr') runsFromHR += r.runsScored;
                else if (r.outcome === '2b') runsFrom2B += r.runsScored;
                else if (r.outcome === '1b') runsFrom1B += r.runsScored;
                else if (r.outcome === 'bb') runsFromBB += r.runsScored;
                else if (r.outcome === 'o-ra') runsFromORA += r.runsScored;
            }
        }

        log(`  Score: Away ${state.awayScore} - Home ${state.homeScore}`);

        // Bottom of inning (home bats)
        state.topOfInning = false;
        log(`\n=== INNING ${inning} BOTTOM (Home batting) ===`);
        const bottomResults = simulateHalfInning(state, config);

        for (const r of bottomResults) {
            totalAtBats++;
            if (r.outcome === '1b' || r.outcome === '2b' || r.outcome === 'hr') hits++;
            if (r.outcome === 'hr') homeRuns++;
            if (r.outcome === 'bb') walks++;
            if (r.outcome === 'dp') doublePlays++;
            outs += r.outsRecorded;

            // Track run sources
            if (r.runsScored > 0) {
                if (r.outcome === 'hr') runsFromHR += r.runsScored;
                else if (r.outcome === '2b') runsFrom2B += r.runsScored;
                else if (r.outcome === '1b') runsFrom1B += r.runsScored;
                else if (r.outcome === 'bb') runsFromBB += r.runsScored;
                else if (r.outcome === 'o-ra') runsFromORA += r.runsScored;
            }
        }

        log(`  Score: Away ${state.awayScore} - Home ${state.homeScore}`);
    }

    log(`\n${'='.repeat(40)}`);
    log(`FINAL: Away ${state.awayScore} - Home ${state.homeScore}`);
    log('='.repeat(40));

    return {
        awayScore: state.awayScore,
        homeScore: state.homeScore,
        totalAtBats,
        hits,
        walks,
        outs,
        homeRuns,
        doublePlays,
        runsFromHR,
        runsFrom2B,
        runsFrom1B,
        runsFromBB,
        runsFromORA
    };
}

/**
 * Run multiple games and aggregate stats
 */
export function runSimulation(
    numGames: number,
    config: GameConfig = DEFAULT_GAME_CONFIG
): void {
    let totalRuns = 0;
    let totalHits = 0;
    let totalWalks = 0;
    let totalAtBats = 0;
    let totalHR = 0;
    let totalDP = 0;
    let homeWins = 0;
    let awayWins = 0;
    let ties = 0;

    // Run sources
    let totalRunsFromHR = 0;
    let totalRunsFrom2B = 0;
    let totalRunsFrom1B = 0;
    let totalRunsFromBB = 0;
    let totalRunsFromORA = 0;

    const runDistribution: Record<number, number> = {};

    for (let i = 0; i < numGames; i++) {
        const result = simulateGame({ ...config, verbose: false });

        totalRuns += result.awayScore + result.homeScore;
        totalHits += result.hits;
        totalWalks += result.walks;
        totalAtBats += result.totalAtBats;
        totalHR += result.homeRuns;
        totalDP += result.doublePlays;

        // Aggregate run sources
        totalRunsFromHR += result.runsFromHR;
        totalRunsFrom2B += result.runsFrom2B;
        totalRunsFrom1B += result.runsFrom1B;
        totalRunsFromBB += result.runsFromBB;
        totalRunsFromORA += result.runsFromORA;

        if (result.awayScore > result.homeScore) awayWins++;
        else if (result.homeScore > result.awayScore) homeWins++;
        else ties++;

        // Track run distribution
        const gameRuns = result.awayScore + result.homeScore;
        runDistribution[gameRuns] = (runDistribution[gameRuns] || 0) + 1;
    }

    const avgRunsPerGame = totalRuns / numGames;
    const avgRunsPerTeam = avgRunsPerGame / 2;
    const battingAvg = totalHits / totalAtBats;
    const obp = (totalHits + totalWalks) / totalAtBats;
    const hrRate = totalHR / totalAtBats;

    console.log('\n' + '='.repeat(60));
    console.log(`CHEDDAR BOB v5.2 — SIMULATION`);
    console.log(`${numGames} games, ${config.innings} innings each`);
    const stanceInfo = config.useStance
        ? `Strategy +${config.strategyWinBonus}, Stance +${config.stanceBonus}`
        : `Strategy +${config.strategyWinBonus} only (no stance)`;
    console.log(`Config: ${stanceInfo}`);
    console.log('='.repeat(60));

    console.log('\nSCORING:');
    console.log(`  Avg runs/game: ${avgRunsPerGame.toFixed(2)} (${avgRunsPerTeam.toFixed(2)} per team)`);
    console.log(`  Total runs: ${totalRuns}`);

    console.log('\nRUN SOURCES:');
    const pctHR = totalRuns > 0 ? (totalRunsFromHR / totalRuns * 100).toFixed(1) : '0';
    const pct2B = totalRuns > 0 ? (totalRunsFrom2B / totalRuns * 100).toFixed(1) : '0';
    const pct1B = totalRuns > 0 ? (totalRunsFrom1B / totalRuns * 100).toFixed(1) : '0';
    const pctBB = totalRuns > 0 ? (totalRunsFromBB / totalRuns * 100).toFixed(1) : '0';
    const pctORA = totalRuns > 0 ? (totalRunsFromORA / totalRuns * 100).toFixed(1) : '0';
    console.log(`  HR:   ${totalRunsFromHR.toString().padStart(5)} runs (${pctHR.padStart(5)}%)`);
    console.log(`  2B:   ${totalRunsFrom2B.toString().padStart(5)} runs (${pct2B.padStart(5)}%)`);
    console.log(`  1B:   ${totalRunsFrom1B.toString().padStart(5)} runs (${pct1B.padStart(5)}%)`);
    console.log(`  BB:   ${totalRunsFromBB.toString().padStart(5)} runs (${pctBB.padStart(5)}%)`);
    console.log(`  O-RA: ${totalRunsFromORA.toString().padStart(5)} runs (${pctORA.padStart(5)}%)`);

    console.log('\nBATTING:');
    console.log(`  AVG: .${Math.round(battingAvg * 1000).toString().padStart(3, '0')}`);
    console.log(`  OBP: .${Math.round(obp * 1000).toString().padStart(3, '0')}`);
    console.log(`  HR rate: ${(hrRate * 100).toFixed(1)}%`);

    console.log('\nGAME OUTCOMES:');
    console.log(`  Home wins: ${homeWins} (${(homeWins/numGames*100).toFixed(1)}%)`);
    console.log(`  Away wins: ${awayWins} (${(awayWins/numGames*100).toFixed(1)}%)`);
    console.log(`  Ties: ${ties} (${(ties/numGames*100).toFixed(1)}%)`);

    console.log('\nRUN DISTRIBUTION:');
    const sortedRuns = Object.keys(runDistribution).map(Number).sort((a, b) => a - b);
    for (const runs of sortedRuns) {
        const count = runDistribution[runs];
        const pct = (count / numGames * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(count / numGames * 50));
        console.log(`  ${runs.toString().padStart(2)} runs: ${count.toString().padStart(4)} (${pct.padStart(5)}%) ${bar}`);
    }
}
