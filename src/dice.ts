/**
 * Grapple Engine - Dice Module
 *
 * Foundation for all randomness in the game.
 * Supports both true random and seeded random for reproducible testing.
 */

import seedrandom from 'seedrandom';

// The random number generator - defaults to Math.random
let rng: () => number = Math.random;

/**
 * Set a seed for reproducible random numbers
 */
export function setSeed(seed: string | number): void {
    rng = seedrandom(String(seed));
}

/**
 * Reset to true random (Math.random)
 */
export function resetRandom(): void {
    rng = Math.random;
}

/**
 * Core roller - roll a die with any number of sides
 * @param sides - Number of sides on the die
 * @returns Result from 1 to sides (inclusive)
 */
export function roll(sides: number): number {
    return Math.floor(rng() * sides) + 1;
}

/**
 * Roll a single d6
 */
export function roll1d6(): number {
    return roll(6);
}

/**
 * Roll two d6 and return both dice
 */
export function roll2d6(): [number, number] {
    return [roll1d6(), roll1d6()];
}

/**
 * Sum two dice values
 */
export function sum2d6(dice: [number, number]): number {
    return dice[0] + dice[1];
}
