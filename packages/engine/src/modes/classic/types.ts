/**
 * Strikezone Engine - Classic Mode Types
 *
 * Types for the pitch-by-pitch game mode.
 * Each at-bat involves multiple pitches with count building.
 */

import type { Bases } from '../../core/types';

// =============================================================================
// PITCH TYPES
// =============================================================================

export type PitchType = 'fastball' | 'changeup' | 'breaking';

// Strike zone directions (for both pitcher targeting and batter guessing)
export type StrikeDirection = 'up' | 'down' | 'in' | 'out' | 'middle';
// Ball zone directions (pitcher only)
export type BallDirection = 'high' | 'low' | 'inside' | 'outside';
// Combined pitcher target direction
export type PitcherDirection = StrikeDirection | BallDirection;

// =============================================================================
// SELECTION INTERFACES
// =============================================================================

export type PitchGuess = PitchType | 'none';
export type LocationGuess = StrikeDirection | 'none';
export type BatterAction = 'swing' | 'take';

export interface PitcherSelection {
    pitchType: PitchType;
    direction: PitcherDirection;
}

export interface BatterSelection {
    pitchGuess: PitchGuess;
    locationGuess: LocationGuess;
    action: BatterAction;
    protect?: boolean; // With 2 strikes: +2 contact, but strong→weak outcomes
}

// =============================================================================
// RESOLUTION TYPES
// =============================================================================

export type DiceResult = 'miss' | 'weak' | 'strong';
export type PitcherExecutionResult = 'miss' | 'solid' | 'painted';
export type ContactOutcome =
    | 'swing_miss'
    | 'out'
    | 'foul'
    | 'single'
    | 'double'
    | 'home_run';

export type CoreZoneId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type ShadowZoneId = 11 | 12 | 13 | 14;
export type ZoneId = CoreZoneId | ShadowZoneId;

// =============================================================================
// PITCH RESOLUTION
// =============================================================================

export interface PitchResolution {
    // Dice rolls
    pitcherDice: [number, number];
    pitcherRawTotal: number;
    pitchTypeModifier: number;
    pitcherTotal: number;
    pitcherExecution: PitcherExecutionResult;

    // Resolved zone
    resolvedZone: ZoneId;
    resolvedZoneType: 'middle' | 'edge' | 'corner' | 'ball';

    // Modifiers (if batter swung)
    modifierBreakdown?: {
        execution: number;
        pitchGuess: number;
        locationGuess: number;
        situational: number;
        seeingIt: number;
        total: number;
        clamped: number;
    };

    // Contact roll (if batter swung)
    contactDice?: [number, number];
    contactTotal?: number;
    contactResult?: DiceResult;

    // Outcome roll (if contact made)
    outcomeDice?: [number, number];
    outcomeTotal?: number;
    finalOutcome: ContactOutcome | 'ball' | 'called_strike';

    // Special mechanics
    driftDice?: [number, number];
    driftTotal?: number;
    driftResult?: 'continues' | 'middle' | 'axis_change';

    holdUpDice?: [number, number];
    holdUpModifiers?: {
        locationMatch: number;
        twoStrikes: number;
        breakingBall: number;
        obviousBall: number;
        total: number;
    };
    holdUpTotal?: number;
    holdUpSuccess?: boolean;

    // Game state changes
    strikeAdded: number;
    ballAdded: number;
    outAdded: number;
    seeingItEarned: boolean;
    protecting?: boolean;

    // Description
    description: string;
}

// =============================================================================
// GAME STATE
// =============================================================================

export type GamePhase = 'pitcher_select' | 'batter_select' | 'resolve' | 'result';

export interface BatterProfile {
    name: string;
    number: number;
}

export interface ClassicGameState {
    phase: GamePhase;
    pitcherSelection: PitcherSelection | null;
    batterSelection: BatterSelection | null;

    // Count
    balls: number;
    strikes: number;
    outs: number;

    // Bases (tuple format for classic mode)
    bases: [boolean, boolean, boolean];

    // Score
    score: { runs: number; hits: number };

    // Carry-over state
    seeingItBonus: 0 | 1;

    // Current batter
    batter: { number: number };

    // Lineup
    lineup: BatterProfile[];

    // History
    pitchLog: PitchLogEntry[];
    lastResolution: PitchResolution | null;
}

export interface PitchLogEntry {
    pitchNumber: number;
    pitcherPick: PitcherSelection;
    batterPick: BatterSelection;
    resolution: PitchResolution;
    countBefore: { balls: number; strikes: number };
    countAfter: { balls: number; strikes: number };
}
