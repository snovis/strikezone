/**
 * Strikezone Engine - Speed Mode
 *
 * Fast-paced baseball dice game with simultaneous selection,
 * battle rolls, and dramatic resolution.
 *
 * One decision per at-bat. ~30 seconds per at-bat.
 * Perfect for tabletop play.
 */

// Types
export type {
    PitcherApproach,
    BatterApproach,
    Location,
    PitcherSelection,
    BatterSelection,
    AtBatResult,
    SpeedGameState,
    SpeedGameEvent,
    SpeedGameResult,
    RunnerOutcome,
    PitcherResultOutcome
} from './types';

// RPS and Location matchup
export {
    resolveRPS,
    resolveLocation,
    calculateModifiers,
    getArrowSymbol
} from './matchup';

// Battle roll system
export {
    resolveBattle,
    challengeRoll,
    type BattleResult,
    type ChallengeResult
} from './battle';

// Result tables
export {
    getBatterResult,
    getPitcherResult,
    isHit,
    isOut,
    formatPitcherOutcome,
    parseHitType
} from './results';

// CPU players
export {
    getCPUPitcher,
    getCPUBatter,
    getCPUPitcherSmart,
    getCPUBatterSmart
} from './cpu';

// At-bat resolution
export {
    resolveAtBat,
    toAtBatOutcome
} from './atbat';
