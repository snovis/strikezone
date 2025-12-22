/**
 * Strikezone Engine - Baserunning Logic
 *
 * Shared baserunning mechanics for all game modes.
 * Handles runner advancement on hits, walks, and outs.
 */

import type { Bases, BaseAdvanceResult, HitType, Tier } from './types';

// =============================================================================
// BASE STATE UTILITIES
// =============================================================================

/**
 * Create a copy of bases state
 */
export function copyBases(bases: Bases): Bases {
    return { first: bases.first, second: bases.second, third: bases.third };
}

/**
 * Create empty bases
 */
export function clearBases(): Bases {
    return { first: false, second: false, third: false };
}

/**
 * Count runners on base
 */
export function countRunners(bases: Bases): number {
    return (bases.first ? 1 : 0) + (bases.second ? 1 : 0) + (bases.third ? 1 : 0);
}

/**
 * Check if bases are loaded
 */
export function basesLoaded(bases: Bases): boolean {
    return bases.first && bases.second && bases.third;
}

/**
 * Convert tuple format [1st, 2nd, 3rd] to Bases object
 * (for classic mode compatibility)
 */
export function tupleToBases(tuple: [boolean, boolean, boolean]): Bases {
    return { first: tuple[0], second: tuple[1], third: tuple[2] };
}

/**
 * Convert Bases object to tuple format
 * (for classic mode compatibility)
 */
export function basesToTuple(bases: Bases): [boolean, boolean, boolean] {
    return [bases.first, bases.second, bases.third];
}

// =============================================================================
// RUNNER ADVANCEMENT ON HITS
// =============================================================================

/**
 * Advance runners on a hit
 *
 * Standard advancement rules:
 * - HR: Everyone scores
 * - 3B: All runners score, batter to third
 * - 2B: Strong tier = runner from 1st scores, otherwise to 3rd
 * - 1B: Station-to-station advancement
 */
export function advanceRunnersOnHit(
    bases: Bases,
    hitType: HitType,
    tier: Tier = 'solid'
): BaseAdvanceResult {
    let runs = 0;
    const newBases = clearBases();

    // Home Run - everyone scores
    if (hitType === 'HR') {
        runs = 1 + countRunners(bases);
        return { runs, bases: newBases, outs: 0 };
    }

    // Triple - all runners score, batter to third
    if (hitType === '3B') {
        runs = countRunners(bases);
        newBases.third = true;
        return { runs, bases: newBases, outs: 0 };
    }

    // Double - runner advancement varies by tier
    if (hitType === '2B') {
        // Runners on 3rd and 2nd always score
        if (bases.third) runs++;
        if (bases.second) runs++;
        // Runner on 1st: Strong = scores, otherwise to 3rd
        if (bases.first) {
            if (tier === 'strong') {
                runs++;
            } else {
                newBases.third = true;
            }
        }
        newBases.second = true; // Batter to 2nd
        return { runs, bases: newBases, outs: 0 };
    }

    // Single - station-to-station
    if (hitType === '1B') {
        if (bases.third) runs++;
        if (bases.second) newBases.third = true;
        if (bases.first) newBases.second = true;
        newBases.first = true;
        return { runs, bases: newBases, outs: 0 };
    }

    return { runs: 0, bases, outs: 0 };
}

// =============================================================================
// RUNNER ADVANCEMENT ON WALKS
// =============================================================================

/**
 * Advance runners on walk/HBP
 * Only forced runners advance
 */
export function advanceRunnersOnWalk(bases: Bases): BaseAdvanceResult {
    let runs = 0;
    const newBases = copyBases(bases);

    // Bases loaded - runner on 3rd scores
    if (basesLoaded(bases)) {
        runs = 1;
        // Everyone is forced forward, but positions stay full
    }
    // Force advancement
    else if (bases.first && bases.second) {
        newBases.third = true;
    }
    else if (bases.first) {
        newBases.second = true;
    }

    // Batter always takes first
    newBases.first = true;

    return { runs, bases: newBases, outs: 0 };
}

// =============================================================================
// SIMPLE OUT (no runner advancement)
// =============================================================================

/**
 * Handle a simple out (strikeout, popup, etc.)
 * No runner advancement
 */
export function handleSimpleOut(bases: Bases): BaseAdvanceResult {
    return { runs: 0, bases: copyBases(bases), outs: 1 };
}

/**
 * Handle double play
 */
export function handleDoublePlay(bases: Bases): BaseAdvanceResult {
    const newBases = copyBases(bases);
    let outs = 1;

    if (bases.first) {
        outs = 2;
        newBases.first = false;
        // Runners on 2nd/3rd hold
    }

    return { runs: 0, bases: newBases, outs };
}

// =============================================================================
// GAME STATE
// =============================================================================

/**
 * Create initial game state
 */
export function createInitialGameState() {
    return {
        inning: 1,
        topBottom: 'top' as const,
        outs: 0,
        bases: clearBases(),
        score: { away: 0, home: 0 },
        hits: { away: 0, home: 0 },
        lineupPos: { away: 1, home: 1 }
    };
}
