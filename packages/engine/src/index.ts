/**
 * Strikezone Engine
 *
 * Multi-mode baseball simulation engine.
 *
 * Two game modes:
 * - Speed Mode: One decision per at-bat, fast resolution (~30s/AB)
 * - Classic Mode: Pitch-by-pitch with count building (~5-15 pitches/AB)
 *
 * Both modes share core infrastructure:
 * - Dice utilities (2d6 mechanics)
 * - Baserunning logic
 * - Game state management
 */

// =============================================================================
// CORE - Shared types and utilities
// =============================================================================
export * from './core';

// =============================================================================
// SPEED MODE - Fast tabletop play
// =============================================================================
export * as speed from './modes/speed';

// =============================================================================
// CLASSIC MODE - Pitch-by-pitch simulation
// =============================================================================
export * as classic from './modes/classic';

// =============================================================================
// CONVENIENCE RE-EXPORTS
// =============================================================================

// Most common speed mode functions for quick access
export { resolveAtBat, toAtBatOutcome } from './modes/speed/atbat';
export { getCPUPitcher, getCPUBatter } from './modes/speed/cpu';
