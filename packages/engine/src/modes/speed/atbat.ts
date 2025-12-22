/**
 * Strikezone Engine - Speed Mode At-Bat Resolution
 *
 * This is the main entry point for resolving a complete at-bat in speed mode.
 */

import type { AtBatOutcome, SpeedModeDetails, Bases, HitType } from '../../core/types';
import { roll2d6, sum, isSnakeEyes } from '../../core/dice';
import { advanceRunnersOnHit, advanceRunnersOnWalk, handleSimpleOut, handleDoublePlay, copyBases } from '../../core/baserunning';
import type { PitcherSelection, BatterSelection, AtBatResult } from './types';
import { resolveRPS, resolveLocation, calculateModifiers } from './matchup';
import { resolveBattle, challengeRoll } from './battle';
import { getBatterResult, getPitcherResult, formatPitcherOutcome, isHit, parseHitType } from './results';

/**
 * Resolve a complete at-bat given pitcher and batter selections
 *
 * Flow:
 * 1. Calculate RPS and location modifiers
 * 2. Battle roll to determine winner + tier
 * 3. Result roll on winner's table
 * 4. Handle stretch attempts if applicable
 */
export function resolveAtBat(
    pitcher: PitcherSelection,
    batter: BatterSelection
): AtBatResult {
    // Step 1: Calculate modifiers
    const rpsWinner = resolveRPS(pitcher.approach, batter.approach);
    const locationWinner = resolveLocation(pitcher.location, batter.location);
    const { pitcherMod, batterMod } = calculateModifiers(rpsWinner, locationWinner);

    // Step 2: Battle roll
    const battle = resolveBattle(pitcherMod, batterMod);

    // Step 3: Result roll
    const resultDice = roll2d6();
    const resultTotal = sum(resultDice);
    const resultSnakeEyes = isSnakeEyes(resultDice);

    // Initialize result object
    const result: AtBatResult = {
        pitcherApproach: pitcher.approach,
        pitcherLocation: pitcher.location,
        batterApproach: batter.approach,
        batterLocation: batter.location,
        rpsWinner,
        locationWinner,
        pitcherDice: battle.pitcherDice,
        batterDice: battle.batterDice,
        pitcherTotal: battle.pitcherTotal,
        batterTotal: battle.batterTotal,
        battleWinner: battle.winner,
        winnerTier: battle.winnerTier,
        batterSnakeEyes: battle.batterSnakeEyes,
        pitcherSnakeEyes: battle.pitcherSnakeEyes,
        resultDice,
        resultTotal,
        resultSnakeEyes,
        outcome: '',
        finalOutcome: ''
    };

    // Step 4: Determine outcome based on battle winner
    if (battle.batterSnakeEyes) {
        // Batter snake eyes in battle = auto strikeout (skip result roll)
        result.outcome = 'K';
        result.finalOutcome = 'K';
    } else if (battle.winner === 'batter') {
        // Batter won - use batter result table
        if (resultSnakeEyes) {
            // Result snake eyes for batter = critical fail = OUT
            result.outcome = 'OUT';
            result.finalOutcome = 'OUT';
        } else {
            result.outcome = getBatterResult(battle.winnerTier, resultTotal);
            result.finalOutcome = resolveStretch(result);
        }
    } else {
        // Pitcher won - use pitcher result table
        if (resultSnakeEyes) {
            // Result snake eyes for pitcher = critical fail = HBP
            result.outcome = 'HBP';
            result.finalOutcome = 'HBP';
        } else {
            const pitcherResult = getPitcherResult(battle.winnerTier, resultTotal);
            result.outcome = formatPitcherOutcome(pitcherResult);
            result.finalOutcome = pitcherResult.isStrikeout ? 'K' : (
                pitcherResult.runnerOutcome === 'BB' ? 'BB' :
                pitcherResult.runnerOutcome === 'DP' ? 'DP' : 'OUT'
            );
        }
    }

    return result;
}

/**
 * Handle stretch attempts for hits with "+" marker
 * Returns the final outcome after stretch resolution
 */
function resolveStretch(result: AtBatResult): string {
    const outcome = result.outcome;

    // Only stretch on hits with "+" marker
    if (!outcome.endsWith('+')) {
        return outcome;
    }

    // Stretch is a battle roll, no modifiers, tie goes to runner
    const stretchChallenge = challengeRoll(0);
    result.stretchBatterDice = stretchChallenge.batterDice;
    result.stretchPitcherDice = stretchChallenge.pitcherDice;

    if (stretchChallenge.pitcherWins) {
        // Caught stretching - out at extra base, but still have the base hit
        result.stretchResult = 'out';
        return outcome.replace('+', ''); // 2B+ becomes 2B
    } else {
        // Safe! Advance to extra base
        result.stretchResult = 'safe';
        const baseHit = outcome.replace('+', '');
        if (baseHit === '1B') return '2B';
        if (baseHit === '2B') return '3B';
        return baseHit; // Shouldn't happen, but safe fallback
    }
}

/**
 * Convert speed mode AtBatResult to unified AtBatOutcome
 *
 * This allows the game engine to process at-bats uniformly
 * regardless of which mode (speed/classic) produced them.
 */
export function toAtBatOutcome(
    result: AtBatResult,
    basesBefore: Bases
): AtBatOutcome {
    const outcome = result.finalOutcome;
    let type: AtBatOutcome['type'];
    let hitType: HitType | undefined;
    let runsScored = 0;
    let basesAfter: Bases;
    let isHitResult = false;

    // Determine outcome type
    if (isHit(outcome)) {
        type = 'hit';
        hitType = parseHitType(outcome) || undefined;
        isHitResult = true;
        const advancement = advanceRunnersOnHit(basesBefore, hitType!, result.winnerTier);
        runsScored = advancement.runs;
        basesAfter = advancement.bases;
    } else if (outcome === 'BB') {
        type = 'walk';
        const advancement = advanceRunnersOnWalk(basesBefore);
        runsScored = advancement.runs;
        basesAfter = advancement.bases;
    } else if (outcome === 'HBP') {
        type = 'hit_by_pitch';
        const advancement = advanceRunnersOnWalk(basesBefore);
        runsScored = advancement.runs;
        basesAfter = advancement.bases;
    } else if (outcome === 'K') {
        type = 'strikeout';
        basesAfter = copyBases(basesBefore);
    } else if (outcome === 'DP') {
        type = 'out';
        const advancement = handleDoublePlay(basesBefore);
        basesAfter = advancement.bases;
    } else {
        type = 'out';
        basesAfter = copyBases(basesBefore);
    }

    // Build description
    let description = outcome;
    if (hitType) {
        const hitNames: Record<HitType, string> = {
            '1B': 'Single',
            '2B': 'Double',
            '3B': 'Triple',
            'HR': 'Home Run'
        };
        description = hitNames[hitType];
        if (result.stretchResult === 'safe') {
            description += ' (stretched!)';
        }
    } else if (type === 'walk') {
        description = 'Walk';
    } else if (type === 'hit_by_pitch') {
        description = 'Hit By Pitch';
    } else if (type === 'strikeout') {
        description = 'Strikeout';
    } else if (outcome === 'DP') {
        description = 'Double Play';
    } else {
        description = 'Out';
    }

    // Build speed mode details
    const details: SpeedModeDetails = {
        mode: 'speed',
        pitcherApproach: result.pitcherApproach,
        pitcherLocation: result.pitcherLocation,
        batterApproach: result.batterApproach,
        batterLocation: result.batterLocation,
        rpsWinner: result.rpsWinner,
        locationWinner: result.locationWinner,
        pitcherDice: result.pitcherDice,
        batterDice: result.batterDice,
        battleWinner: result.battleWinner,
        winnerTier: result.winnerTier,
        resultDice: result.resultDice,
        resultTotal: result.resultTotal,
        outcome: result.outcome,
        snakeEyes: result.batterSnakeEyes ? 'batter' :
                   result.pitcherSnakeEyes ? 'pitcher' : undefined,
        stretchResult: result.stretchResult
    };

    return {
        type,
        hitType,
        runsScored,
        basesAfter,
        description,
        isHit: isHitResult,
        details
    };
}
