/**
 * Strikezone Engine - Shared Core Types
 *
 * These types are shared across all game modes (speed, classic, etc.)
 */

// =============================================================================
// BASE TYPES
// =============================================================================

/**
 * Base runner positions
 */
export interface Bases {
    first: boolean;
    second: boolean;
    third: boolean;
}

/**
 * Core game state (shared across modes)
 */
export interface GameState {
    inning: number;
    topBottom: 'top' | 'bottom';
    outs: number;
    bases: Bases;
    score: { away: number; home: number };
    hits: { away: number; home: number };
    lineupPos: { away: number; home: number };
}

/**
 * Tier classification for rolls/outcomes
 */
export type Tier = 'weak' | 'solid' | 'strong';

// =============================================================================
// AT-BAT OUTCOME INTERFACE
// =============================================================================

/**
 * Base hit types
 */
export type HitType = '1B' | '2B' | '3B' | 'HR';

/**
 * Abstract at-bat outcome - produced by any game mode
 *
 * This is the common interface that allows the game engine to process
 * at-bats regardless of which mode (speed/classic) produced them.
 */
export interface AtBatOutcome {
    /** What happened in this at-bat */
    type: 'hit' | 'out' | 'walk' | 'strikeout' | 'hit_by_pitch';

    /** For hits, what kind */
    hitType?: HitType;

    /** Runs scored during this at-bat */
    runsScored: number;

    /** Base state after the at-bat */
    basesAfter: Bases;

    /** Human-readable description */
    description: string;

    /** Was it a hit (for stats) */
    isHit: boolean;

    /** Mode-specific details (preserved for UI/logging) */
    details: SpeedModeDetails | ClassicModeDetails;
}

// =============================================================================
// MODE-SPECIFIC DETAIL TYPES
// =============================================================================

/**
 * Speed mode (v5) specific details
 */
export interface SpeedModeDetails {
    mode: 'speed';

    // Selections
    pitcherApproach: string;
    pitcherLocation: string;
    batterApproach: string;
    batterLocation: string;

    // Battle resolution
    rpsWinner: 'pitcher' | 'batter' | 'tie';
    locationWinner: 'pitcher' | 'batter' | 'none';
    pitcherDice: [number, number];
    batterDice: [number, number];
    battleWinner: 'pitcher' | 'batter';
    winnerTier: Tier;

    // Result roll
    resultDice: [number, number];
    resultTotal: number;
    outcome: string;

    // Special cases
    snakeEyes?: 'pitcher' | 'batter';
    stretchResult?: 'safe' | 'out';
}

/**
 * Classic mode (pitch-by-pitch) specific details
 */
export interface ClassicModeDetails {
    mode: 'classic';

    // Pitch sequence
    pitchCount: number;
    finalCount: { balls: number; strikes: number };

    // Final pitch details
    pitchType: string;
    zone: number;
    zoneType: 'middle' | 'edge' | 'corner' | 'ball';

    // Resolution
    contactResult?: 'miss' | 'weak' | 'strong';
    outcomeRoll?: number;

    // Modifiers used
    modifierTotal?: number;

    // Special mechanics
    holdUpSuccess?: boolean;
    protecting?: boolean;
}

// =============================================================================
// GAME EVENT
// =============================================================================

/**
 * A recorded game event (for game log)
 */
export interface GameEvent {
    inning: number;
    topBottom: 'top' | 'bottom';
    batterNum: number;
    basesBefore: Bases;
    basesAfter: Bases;
    outsBefore: number;
    outsAfter: number;
    runsScored: number;
    outcome: AtBatOutcome;
}

/**
 * Complete game result
 */
export interface GameResult {
    innings: number;
    awayScore: number;
    homeScore: number;
    awayHits: number;
    homeHits: number;
    events: GameEvent[];
    extraInnings: boolean;
    walkoff: boolean;
}

// =============================================================================
// BASE ADVANCE RESULT (internal)
// =============================================================================

/**
 * Result of baserunning advancement
 */
export interface BaseAdvanceResult {
    runs: number;
    bases: Bases;
    outs: number;
}
