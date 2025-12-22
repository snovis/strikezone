/**
 * Strikezone Engine - Classic Mode
 *
 * Pitch-by-pitch baseball simulation with count building,
 * multiple decisions per at-bat, and detailed resolution.
 *
 * Multiple decisions per at-bat. 5-15 pitches per at-bat.
 * Perfect for digital play with deeper engagement.
 *
 * TODO: Port full implementation from gstrike/engine/cheddar*.ts
 */

// Types
export type {
    PitchType,
    StrikeDirection,
    BallDirection,
    PitcherDirection,
    PitchGuess,
    LocationGuess,
    BatterAction,
    PitcherSelection,
    BatterSelection,
    DiceResult,
    PitcherExecutionResult,
    ContactOutcome,
    CoreZoneId,
    ShadowZoneId,
    ZoneId,
    PitchResolution,
    GamePhase,
    BatterProfile,
    ClassicGameState,
    PitchLogEntry
} from './types';

// Placeholder exports - to be implemented
// These will be ported from gstrike/engine/cheddarResolution.ts etc.

/**
 * Resolve a single pitch
 * TODO: Port from gstrike/engine/cheddarResolution.ts
 */
export function resolvePitch(
    _pitcherSelection: import('./types').PitcherSelection,
    _batterSelection: import('./types').BatterSelection,
    _gameState: import('./types').ClassicGameState
): import('./types').PitchResolution {
    throw new Error('Classic mode not yet implemented - port from gstrike');
}

/**
 * Check if at-bat is over
 * TODO: Port from gstrike/engine/cheddarUtils.ts
 */
export function isAtBatOver(
    balls: number,
    strikes: number,
    lastOutcome: string | null
): boolean {
    if (balls >= 4) return true;
    if (strikes >= 3) return true;
    if (lastOutcome && ['single', 'double', 'home_run', 'out'].includes(lastOutcome)) {
        return true;
    }
    return false;
}

/**
 * Create initial game state
 */
export function createInitialGameState(): import('./types').ClassicGameState {
    return {
        phase: 'pitcher_select',
        pitcherSelection: null,
        batterSelection: null,
        balls: 0,
        strikes: 0,
        outs: 0,
        bases: [false, false, false],
        score: { runs: 0, hits: 0 },
        seeingItBonus: 0,
        batter: { number: 1 },
        lineup: [
            { name: 'Leadoff', number: 1 },
            { name: 'Contact', number: 2 },
            { name: 'Star', number: 3 },
            { name: 'Cleanup', number: 4 },
            { name: 'Power', number: 5 },
            { name: 'Solid', number: 6 },
            { name: 'Steady', number: 7 },
            { name: 'Defense', number: 8 },
            { name: 'Pitcher', number: 9 },
        ],
        pitchLog: [],
        lastResolution: null
    };
}
