/**
 * Visualize how 2d6 distribution shifts with modifiers
 */

// 2d6 probability distribution
const dist2d6: Record<number, number> = {};
for (let d1 = 1; d1 <= 6; d1++) {
    for (let d2 = 1; d2 <= 6; d2++) {
        const sum = d1 + d2;
        dist2d6[sum] = (dist2d6[sum] || 0) + 1;
    }
}

console.log('2d6 PROBABILITY DISTRIBUTION WITH MODIFIERS');
console.log('='.repeat(70));
console.log('\nThe bell curve shifts up by the modifier amount.\n');

// Show distributions for 2d6, 2d6+1, 2d6+2, 2d6+3
const modifiers = [0, 1, 2, 3];

// Header
console.log('Roll'.padStart(6) + '  2d6+0   2d6+1   2d6+2   2d6+3   │ Tier');
console.log('-'.repeat(55));

// Show each possible roll value
for (let roll = 2; roll <= 15; roll++) {
    let line = roll.toString().padStart(6);

    for (const mod of modifiers) {
        const baseRoll = roll - mod;
        if (baseRoll >= 2 && baseRoll <= 12) {
            const count = dist2d6[baseRoll];
            const pct = (count / 36 * 100).toFixed(1);
            line += pct.padStart(7) + '%';
        } else {
            line += '      - ';
        }
    }

    // Tier marker
    let tier = '';
    if (roll <= 6) tier = 'Weak';
    else if (roll <= 9) tier = 'Solid';
    else tier = 'Strong';
    line += ' │ ' + tier;

    console.log(line);
}

console.log('-'.repeat(55));

// Show tier probabilities for each modifier
console.log('\nTIER PROBABILITIES BY MODIFIER');
console.log('='.repeat(50));
console.log('\nMod'.padStart(6) + 'Weak (≤6)'.padStart(12) + 'Solid (7-9)'.padStart(14) + 'Strong (10+)'.padStart(14));
console.log('-'.repeat(46));

for (const mod of modifiers) {
    let weak = 0, solid = 0, strong = 0;

    for (let baseRoll = 2; baseRoll <= 12; baseRoll++) {
        const adjustedRoll = baseRoll + mod;
        const prob = dist2d6[baseRoll] / 36 * 100;

        if (adjustedRoll <= 6) weak += prob;
        else if (adjustedRoll <= 9) solid += prob;
        else strong += prob;
    }

    const weakStr = weak.toFixed(1) + '%';
    const solidStr = solid.toFixed(1) + '%';
    const strongStr = strong.toFixed(1) + '%';

    console.log(
        ('+' + mod).padStart(6) +
        weakStr.padStart(12) +
        solidStr.padStart(14) +
        strongStr.padStart(14)
    );
}

console.log('-'.repeat(46));
console.log('\nPeak of curve: 2d6+0 peaks at 7, 2d6+1 at 8, 2d6+2 at 9, 2d6+3 at 10');

// ASCII histogram with fixed range
console.log('\n\nASCII HISTOGRAM (fixed range 2-15 to show shift)');
console.log('='.repeat(70));

const histogramMods = [0, 1, 2, 3];
const labels = ['2d6+0 (baseline)', '2d6+1', '2d6+2 (strategy winner)', '2d6+3 (max commit)'];

for (let i = 0; i < histogramMods.length; i++) {
    const mod = histogramMods[i];
    console.log(`\n${labels[i]}:`);

    for (let roll = 2; roll <= 15; roll++) {
        const baseRoll = roll - mod;
        const count = (baseRoll >= 2 && baseRoll <= 12) ? dist2d6[baseRoll] : 0;
        const bar = count > 0 ? '█'.repeat(count * 2) : '';
        const tier = roll <= 6 ? 'W' : roll <= 9 ? 'S' : '★';
        console.log(`  ${roll.toString().padStart(2)}: ${bar.padEnd(14)} ${tier}`);
    }
}

console.log('\nLegend: W=Weak, S=Solid, ★=Strong');
