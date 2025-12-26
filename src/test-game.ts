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
 *   npm run test:game -- --compare           Compare strategy-only vs strategy+stance
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
const single = hasFlag('single');
const verbose = hasFlag('verbose');
const compare = hasFlag('compare');
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

} else if (single) {
    const stanceInfo = useStance ? `, stance +${stanceBonus}` : '';
    console.log(`\nSingle game: ${innings} innings, strategy +${bonus}${stanceInfo}`);
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
console.log('  npm run test:game -- --compare          Compare with/without stance');
