/**
 * Strikezone Engine - Speed Mode Types
 *
 * Types specific to the speed edition (v5) game mode.
 */

import type { Tier, Bases } from '../../core/types';

// =============================================================================
// APPROACH TYPES
// =============================================================================

export type PitcherApproach = 'fastball' | 'curveball' | 'changeup';
export type BatterApproach = 'power' | 'control' | 'contact';
export type Location = 'up' | 'down' | 'in' | 'out';

// =============================================================================
// SELECTION INTERFACES
// =============================================================================

export interface PitcherSelection {
    approach: PitcherApproach;
    location: Location;
}

export interface BatterSelection {
    approach: BatterApproach;
    location: Location;
}

// =============================================================================
// RESULT INTERFACES
// =============================================================================

export interface AtBatResult {
    // Selections
    pitcherApproach: PitcherApproach;
    pitcherLocation: Location;
    batterApproach: BatterApproach;
    batterLocation: Location;

    // Modifiers
    rpsWinner: 'pitcher' | 'batter' | 'tie';
    locationWinner: 'pitcher' | 'batter' | 'none';

    // Battle
    pitcherDice: [number, number];
    batterDice: [number, number];
    pitcherTotal: number;
    batterTotal: number;
    battleWinner: 'pitcher' | 'batter';
    winnerTier: Tier;
    batterSnakeEyes: boolean;
    pitcherSnakeEyes: boolean;

    // Result
    resultDice: [number, number];
    resultTotal: number;
    resultSnakeEyes: boolean;
    outcome: string;
    finalOutcome: string;

    // Stretch attempts (battle rolls)
    stretchBatterDice?: [number, number];
    stretchPitcherDice?: [number, number];
    stretchResult?: 'safe' | 'out';

    // Runner advancement challenge
    advancementBatterDice?: [number, number];
    advancementPitcherDice?: [number, number];
    advancementResult?: 'advance' | 'hold';
}

// =============================================================================
// GAME STATE (Speed mode specific, extends core)
// =============================================================================

export interface SpeedGameState {
    inning: number;
    topBottom: 'top' | 'bottom';
    outs: number;
    bases: Bases;
    score: { away: number; home: number };
    hits: { away: number; home: number };
    lineupPos: { away: number; home: number };
}

export interface SpeedGameEvent {
    inning: number;
    topBottom: 'top' | 'bottom';
    batterNum: number;
    basesBefore: Bases;
    basesAfter: Bases;
    outsBefore: number;
    outsAfter: number;
    runsScored: number;
    atBat: AtBatResult;
}

export interface SpeedGameResult {
    innings: number;
    awayScore: number;
    homeScore: number;
    awayHits: number;
    homeHits: number;
    events: SpeedGameEvent[];
    extraInnings: boolean;
    walkoff: boolean;
}

// =============================================================================
// RUNNER OUTCOME TYPES
// =============================================================================

export type RunnerOutcome = 'BB' | 'RA' | 'RC' | 'RF' | 'DP';

export interface PitcherResultOutcome {
    runnerOutcome: RunnerOutcome;
    isStrikeout: boolean;
}
