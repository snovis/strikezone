/**
 * Strikezone Engine - Speed Mode Result Tables
 */

import type { Tier } from '../../core/types';
import type { PitcherResultOutcome } from './types';

/**
 * Batter result table - diagonal pattern
 *
 * | Roll | Weak | Solid | Strong |
 * |------|------|-------|--------|
 * | <=7  | OUT  | OUT   | 1B+    |
 * | 8-9  | OUT  | 1B+   | 2B+    |
 * | 10+  | 1B   | 2B+   | HR     |
 *
 * Note: "+" means stretch opportunity (Runner Challenge roll)
 * Weak tier singles have NO stretch - barely made it!
 */
export function getBatterResult(tier: Tier, roll: number): string {
    if (roll <= 7) {
        // <=7: Weak/Solid = OUT, Strong = 1B+
        return tier === 'strong' ? '1B+' : 'OUT';
    } else if (roll <= 9) {
        // 8-9: Weak = OUT, Solid = 1B+, Strong = 2B+
        if (tier === 'weak') return 'OUT';
        if (tier === 'solid') return '1B+';
        return '2B+';
    } else {
        // 10+: Weak = 1B (no stretch!), Solid = 2B+, Strong = HR
        if (tier === 'weak') return '1B';
        if (tier === 'solid') return '2B+';
        return 'HR';
    }
}

/**
 * Pitcher result table - diagonal pattern (mirrors batter table)
 *
 * | Roll | Weak   | Solid  | Strong |
 * |------|--------|--------|--------|
 * | <=7  | BB     | O+RA   | K+RC   |
 * | 8-9  | O+RA   | K+RC   | O-RF   |
 * | 10+  | O+RC   | O-RF   | DP!    |
 *
 * Legend:
 * - BB = Walk (free base)
 * - RA = Runners Advance freely
 * - RC = Runners Challenge (battle roll to advance)
 * - RF = Runners Frozen (hold position)
 * - DP = Double Play (guaranteed if runner on 1st)
 * - K = Strikeout (no runner advancement)
 * - O = Out (runner advancement per result)
 */
export function getPitcherResult(tier: Tier, roll: number): PitcherResultOutcome {
    if (roll <= 7) {
        // <=7: Weak = BB, Solid = RA, Strong = K+RC
        if (tier === 'weak') return { runnerOutcome: 'BB', isStrikeout: false };
        if (tier === 'solid') return { runnerOutcome: 'RA', isStrikeout: false };
        return { runnerOutcome: 'RC', isStrikeout: true };  // K+RC
    } else if (roll <= 9) {
        // 8-9: Weak = RA, Solid = K+RC, Strong = RF
        if (tier === 'weak') return { runnerOutcome: 'RA', isStrikeout: false };
        if (tier === 'solid') return { runnerOutcome: 'RC', isStrikeout: true };  // K+RC
        return { runnerOutcome: 'RF', isStrikeout: false };
    } else {
        // 10+: Weak = O+RC, Solid = RF, Strong = DP!
        if (tier === 'weak') return { runnerOutcome: 'RC', isStrikeout: false };  // O+RC (not K)
        if (tier === 'solid') return { runnerOutcome: 'RF', isStrikeout: false };
        return { runnerOutcome: 'DP', isStrikeout: false };
    }
}

/**
 * Check if an outcome is a hit
 */
export function isHit(outcome: string): boolean {
    const baseOutcome = outcome.replace('+', '');
    return ['1B', '2B', '3B', 'HR'].includes(baseOutcome);
}

/**
 * Check if an outcome is an out
 */
export function isOut(outcome: string): boolean {
    return outcome === 'OUT' || outcome === 'K' || outcome === 'DP' ||
           outcome.startsWith('OUT-') || outcome.startsWith('K-');
}

/**
 * Format outcome string from pitcher result
 */
export function formatPitcherOutcome(result: PitcherResultOutcome): string {
    if (result.runnerOutcome === 'BB') return 'BB';
    if (result.runnerOutcome === 'DP') return 'DP';

    const outType = result.isStrikeout ? 'K' : 'OUT';
    return `${outType}-${result.runnerOutcome}`;
}

/**
 * Parse a hit type from outcome string
 */
export function parseHitType(outcome: string): '1B' | '2B' | '3B' | 'HR' | null {
    const baseOutcome = outcome.replace('+', '');
    if (['1B', '2B', '3B', 'HR'].includes(baseOutcome)) {
        return baseOutcome as '1B' | '2B' | '3B' | 'HR';
    }
    return null;
}
