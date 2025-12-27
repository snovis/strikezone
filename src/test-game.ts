/**
 * Test harness for Game simulation
 *
 * Usage:
 *   npm run test:game -- --games 100         Run N games
 *   npm run test:game -- --single --verbose  Single game with play-by-play
 *   npm run test:game -- --innings 3         Set innings per game
 *   npm run test:game -- --bonus 2           Strategy win bonus
 *   npm run test:game -- --stance            Enable stance (location) commitment
 *   npm run test:game -- --stance-bonus 1    Stance modifier value
 *   npm run test:game -- --r3pressure        Enable R3 pressure (batter ladder shifts)
 *   npm run test:game -- --compare           Compare strategy-only vs strategy+stance
 *   npm run test:game -- --compare-r3        Compare with/without R3 pressure
 */

import { setSeed, resetRandom } from './dice';
import { BASEBALL_STRATEGY_SET } from './strategy';
import { BASEBALL_STANCE_SET } from './stance';
import { simulateGame, runSimulation, DEFAULT_GAME_CONFIG, GameConfig } from './game';

// Parse command line arguments
const args = process.argv.slice(2);

function hasFlag(flag: string): boolean {
    return args.includes(`--${flag}`);
}

function getArg(flag: string): string | undefined {
    const index = args.indexOf(`--${flag}`);
    if (index !== -1 && index + 1 < args.length) {
        return args[index + 1];
    }
    return undefined;
}

// Get options
const numGames = parseInt(getArg('games') ?? '100', 10);
const innings = parseInt(getArg('innings') ?? '3', 10);
const bonus = parseInt(getArg('bonus') ?? '2', 10);
const useStance = hasFlag('stance');
const stanceBonus = parseInt(getArg('stance-bonus') ?? '1', 10);
const useR3Pressure = hasFlag('r3pressure');
const single = hasFlag('single');
const verbose = hasFlag('verbose');
const compare = hasFlag('compare');
const compareR3 = hasFlag('compare-r3');
const seed = getArg('seed');

// Setup randomness
if (seed) {
    setSeed(seed);
    console.log(`Using seed: ${seed}`);
} else {
    resetRandom();
}

const config: GameConfig = {
    innings,
    strategySet: BASEBALL_STRATEGY_SET,
    strategyWinBonus: bonus,
    useStance,
    stanceSet: BASEBALL_STANCE_SET,
    stanceBonus,
    useR3Pressure,
    verbose: verbose || single
};

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║          CHEDDAR BOB v5.2 — GAME SIMULATION              ║');
console.log('╚══════════════════════════════════════════════════════════╝');

if (compare) {
    // Run both configurations and compare
    console.log('\nComparing: Strategy-only vs Strategy+Stance');
    console.log('='.repeat(60));

    // Strategy only
    resetRandom();
    runSimulation(numGames, { ...config, useStance: false });

    // Strategy + Stance
    resetRandom();
    runSimulation(numGames, { ...config, useStance: true });

} else if (compareR3) {
    // Compare with/without R3 pressure
    console.log('\nComparing: Normal vs R3 Pressure');
    console.log('='.repeat(60));

    // Normal
    resetRandom();
    console.log('\n[BASELINE - Normal batter ladder]');
    runSimulation(numGames, { ...config, useR3Pressure: false });

    // R3 Pressure
    resetRandom();
    console.log('\n[R3 PRESSURE - Favorable batter ladder when R3 occupied]');
    runSimulation(numGames, { ...config, useR3Pressure: true });

} else if (single) {
    const stanceInfo = useStance ? `, stance +${stanceBonus}` : '';
    const r3Info = useR3Pressure ? ', R3 pressure' : '';
    console.log(`\nSingle game: ${innings} innings, strategy +${bonus}${stanceInfo}${r3Info}`);
    simulateGame(config);
} else {
    runSimulation(numGames, config);
}

console.log('\nUsage:');
console.log('  npm run test:game -- --games 1000       Run 1000 games');
console.log('  npm run test:game -- --single --verbose Play-by-play');
console.log('  npm run test:game -- --innings 9        9-inning games');
console.log('  npm run test:game -- --bonus 1          +1 strategy bonus');
console.log('  npm run test:game -- --stance           Enable stance commitment');
console.log('  npm run test:game -- --r3pressure       Enable R3 pressure mechanic');
console.log('  npm run test:game -- --compare          Compare with/without stance');
console.log('  npm run test:game -- --compare-r3       Compare with/without R3 pressure');
