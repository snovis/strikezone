/**
 * Simple dice test harness
 *
 * Usage:
 *   npm run test:dice -- --rolls 10 --type 1d6
 *   npm run test:dice -- --rolls 5 --type 2d6
 *   npm run test:dice -- --rolls 1000 --type 2d6 --histogram
 */

import { roll1d6, roll2d6, sum2d6 } from './dice';

// Parse command line arguments
function parseArgs(): { rolls: number; type: string; histogram: boolean } {
    const args = process.argv.slice(2);
    let rolls = 10;
    let type = '1d6';
    let histogram = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--rolls' && args[i + 1]) {
            rolls = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--type' && args[i + 1]) {
            type = args[i + 1];
        }
        if (args[i] === '--histogram') {
            histogram = true;
        }
    }

    return { rolls, type, histogram };
}

// Roll and return result based on type
function rollDice(type: string): number {
    if (type === '1d6') {
        return roll1d6();
    } else if (type === '2d6') {
        return sum2d6(roll2d6());
    }
    throw new Error(`Unknown type: ${type}`);
}

// Get the range of possible results for a dice type
function getRange(type: string): { min: number; max: number } {
    if (type === '1d6') {
        return { min: 1, max: 6 };
    } else if (type === '2d6') {
        return { min: 2, max: 12 };
    }
    throw new Error(`Unknown type: ${type}`);
}

// Get expected percentage for a dice result
function getExpectedPct(type: string, value: number): number {
    if (type === '1d6') {
        // Each face has 1/6 probability
        return (1 / 6) * 100;
    } else if (type === '2d6') {
        // Number of ways to roll each sum out of 36 possibilities
        // 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:5, 9:4, 10:3, 11:2, 12:1
        const ways = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
        return (ways[value] / 36) * 100;
    }
    return 0;
}

// Display histogram
function showHistogram(counts: Map<number, number>, total: number, type: string): void {
    const { min, max } = getRange(type);

    console.log(`\nHistogram (${total} rolls):\n`);
    console.log('Result  Count    Exp%   Actual%  Bar');
    console.log('------  ------  ------  -------  ' + '-'.repeat(30));

    for (let value = min; value <= max; value++) {
        const count = counts.get(value) || 0;
        const pct = (count / total) * 100;
        const expectedPct = getExpectedPct(type, value);
        const barLength = Math.round(pct * 2);  // Scale: 50% = 100 chars
        const bar = '#'.repeat(barLength);

        console.log(
            `  ${String(value).padStart(2)}    ` +
            `${String(count).padStart(6)}  ` +
            `${expectedPct.toFixed(2).padStart(6)}%  ` +
            `${pct.toFixed(2).padStart(6)}%  ` +
            `${bar}`
        );
    }
}

// Main
const { rolls, type, histogram } = parseArgs();

if (type !== '1d6' && type !== '2d6') {
    console.log(`Unknown type: ${type}`);
    process.exit(1);
}

console.log(`Rolling ${type} ${rolls} times...`);

if (histogram) {
    // Collect counts for histogram
    const counts = new Map<number, number>();

    for (let i = 0; i < rolls; i++) {
        const result = rollDice(type);
        counts.set(result, (counts.get(result) ?? 0) + 1);
    }

    showHistogram(counts, rolls, type);
} else {
    // Show individual rolls
    console.log('');
    for (let i = 1; i <= rolls; i++) {
        if (type === '1d6') {
            const result = roll1d6();
            console.log(`  Roll ${i}: ${result}`);
        } else if (type === '2d6') {
            const dice = roll2d6();
            const sum = sum2d6(dice);
            console.log(`  Roll ${i}: [${dice[0]}, ${dice[1]}] = ${sum}`);
        }
    }
}
