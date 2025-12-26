/**
 * Simple dice test harness
 *
 * Usage:
 *   npm run test:dice -- --rolls 10 --type 1d6
 *   npm run test:dice -- --rolls 5 --type 2d6
 */

import { roll1d6, roll2d6, sum2d6 } from './dice';

// Parse command line arguments
function parseArgs(): { rolls: number; type: string } {
    const args = process.argv.slice(2);
    let rolls = 10;
    let type = '1d6';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--rolls' && args[i + 1]) {
            rolls = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--type' && args[i + 1]) {
            type = args[i + 1];
        }
    }

    return { rolls, type };
}

// Main
const { rolls, type } = parseArgs();

console.log(`Rolling ${type} ${rolls} times:\n`);

for (let i = 1; i <= rolls; i++) {
    if (type === '1d6') {
        const result = roll1d6();
        console.log(`  Roll ${i}: ${result}`);
    } else if (type === '2d6') {
        const dice = roll2d6();
        const sum = sum2d6(dice);
        console.log(`  Roll ${i}: [${dice[0]}, ${dice[1]}] = ${sum}`);
    } else {
        console.log(`Unknown type: ${type}`);
        process.exit(1);
    }
}
