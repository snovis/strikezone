/**
 * Strikezone Engine - Speed Mode RPS and Location Resolution
 */

import type { PitcherApproach, BatterApproach, Location } from './types';

/**
 * Resolve RPS matchup between pitcher and batter approaches
 *
 * Matrix (Pitcher vs Batter):
 * | Pitch    | Power  | Control | Contact |
 * |----------|--------|---------|---------|
 * | Fastball | B+1    | TIE     | P+1     |
 * | Curveball| P+1    | B+1     | TIE     |
 * | Changeup | TIE    | P+1     | B+1     |
 *
 * Baseball logic:
 * - Power crushes Fastball (sitting dead red)
 * - Control handles Curveball (discipline)
 * - Contact recognizes Changeup (stays back)
 * - Curveball fools Power (chasing)
 * - Changeup disrupts Control (early swing)
 * - Fastball overpowers Contact (too quick)
 */
export function resolveRPS(
    pitcher: PitcherApproach,
    batter: BatterApproach
): 'pitcher' | 'batter' | 'tie' {
    const matrix: Record<PitcherApproach, Record<BatterApproach, 'pitcher' | 'batter' | 'tie'>> = {
        fastball: { power: 'batter', control: 'tie', contact: 'pitcher' },
        curveball: { power: 'pitcher', control: 'batter', contact: 'tie' },
        changeup: { power: 'tie', control: 'pitcher', contact: 'batter' }
    };
    return matrix[pitcher][batter];
}

/**
 * Resolve location/setup comparison
 *
 * Arrow comparison:
 * - Match (arrows identical) = Batter +1 (guessed right)
 * - Opposite (up<->down, in<->out) = Pitcher +1 (fooled 'em)
 * - Perpendicular (different axis) = TIE (no advantage)
 */
export function resolveLocation(
    pitcherLoc: Location,
    batterLoc: Location
): 'pitcher' | 'batter' | 'none' {
    // Match - batter guessed right
    if (pitcherLoc === batterLoc) {
        return 'batter';
    }

    // Check for opposite
    const opposites: Record<Location, Location> = {
        up: 'down',
        down: 'up',
        in: 'out',
        out: 'in'
    };

    if (opposites[pitcherLoc] === batterLoc) {
        return 'pitcher'; // Opposite - pitcher fooled batter
    }

    return 'none'; // Perpendicular - no advantage
}

/**
 * Calculate modifiers from RPS and location results
 */
export function calculateModifiers(
    rpsWinner: 'pitcher' | 'batter' | 'tie',
    locationWinner: 'pitcher' | 'batter' | 'none'
): { pitcherMod: number; batterMod: number } {
    let pitcherMod = 0;
    let batterMod = 0;

    // RPS: winner +1, loser -1
    if (rpsWinner === 'pitcher') {
        pitcherMod += 1;
        batterMod -= 1;
    } else if (rpsWinner === 'batter') {
        batterMod += 1;
        pitcherMod -= 1;
    }

    // Location: winner +1 only
    if (locationWinner === 'pitcher') {
        pitcherMod += 1;
    } else if (locationWinner === 'batter') {
        batterMod += 1;
    }

    return { pitcherMod, batterMod };
}

/**
 * Get arrow symbol for location display
 */
export function getArrowSymbol(location: Location): string {
    const arrows: Record<Location, string> = {
        up: '\u2191',
        down: '\u2193',
        in: '\u2190',
        out: '\u2192'
    };
    return arrows[location];
}
