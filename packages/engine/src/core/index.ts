/**
 * Strikezone Engine - Core Module
 *
 * Shared types, utilities, and baserunning logic.
 */

// Types
export type {
    Bases,
    GameState,
    Tier,
    HitType,
    AtBatOutcome,
    SpeedModeDetails,
    ClassicModeDetails,
    GameEvent,
    GameResult,
    BaseAdvanceResult
} from './types';

// Dice utilities
export {
    roll2d6,
    sum,
    isSnakeEyes,
    isBoxcars,
    getTier,
    getContactTier,
    roll2d6Detailed
} from './dice';

// Baserunning
export {
    copyBases,
    clearBases,
    countRunners,
    basesLoaded,
    tupleToBases,
    basesToTuple,
    advanceRunnersOnHit,
    advanceRunnersOnWalk,
    handleSimpleOut,
    handleDoublePlay,
    createInitialGameState
} from './baserunning';
