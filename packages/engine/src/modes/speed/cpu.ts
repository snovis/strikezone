/**
 * Strikezone Engine - Speed Mode CPU Player Logic
 */

import type { Bases } from '../../core/types';
import type {
    PitcherApproach,
    BatterApproach,
    Location,
    PitcherSelection,
    BatterSelection
} from './types';

/**
 * Random choice from array
 */
function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get CPU pitcher selection (random approach + location)
 */
export function getCPUPitcher(): PitcherSelection {
    return {
        approach: randomChoice(['fastball', 'curveball', 'changeup'] as PitcherApproach[]),
        location: randomChoice(['up', 'down', 'in', 'out'] as Location[])
    };
}

/**
 * Get CPU batter selection based on lineup position
 *
 * Lineup tendencies:
 * - #1-2: Control (get on base, work counts)
 * - #3-4: Power (drive in runs)
 * - #5-6: Control (situational hitting)
 * - #7-9: Contact (put ball in play)
 */
export function getCPUBatter(lineupPos: number): BatterSelection {
    let approach: BatterApproach;

    if (lineupPos <= 2) {
        approach = 'control';
    } else if (lineupPos <= 4) {
        approach = 'power';
    } else if (lineupPos <= 6) {
        approach = 'control';
    } else {
        approach = 'contact';
    }

    return {
        approach,
        location: randomChoice(['up', 'down', 'in', 'out'] as Location[])
    };
}

/**
 * Smarter CPU pitcher that considers game situation
 */
export function getCPUPitcherSmart(
    _outs: number,
    _bases: Bases,
    _lineupPos: number
): PitcherSelection {
    // For now, same as basic CPU
    // Future: Add situational logic
    // - More fastballs when ahead
    // - More breaking balls with runners in scoring position
    // - Location adjustments based on batter tendencies
    return getCPUPitcher();
}

/**
 * Smarter CPU batter that considers game situation
 */
export function getCPUBatterSmart(
    lineupPos: number,
    _outs: number,
    _bases: Bases,
    _scoreDiff: number
): BatterSelection {
    // For now, same as basic CPU
    // Future: Add situational logic
    // - More power approach when behind
    // - More contact with RISP and 2 outs
    // - Location guessing based on pitcher patterns
    return getCPUBatter(lineupPos);
}
