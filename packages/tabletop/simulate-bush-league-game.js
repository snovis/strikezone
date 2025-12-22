#!/usr/bin/env node
/**
 * Cheddar Bob: Bush League - Full Game Simulator
 *
 * Simulates complete 3-inning games using Bush League rules.
 * Run with: node simulate-bush-league-game.js [num_games]
 */

const NUM_GAMES = parseInt(process.argv[2]) || 1;
const INNINGS = 3;
const VERBOSE = NUM_GAMES === 1; // Show play-by-play for single game

// =============================================================================
// CONFIGURATION
// =============================================================================
const RPS_MODIFIER = 2;
const USE_CRITS = true;

// Outcome lists
const BATTER_OUTCOMES = ['OUT', 'OUT', '1B', '2B', 'HR'];
const PITCHER_OUTCOMES = ['BB', 'O-RA', 'O-RC', 'O-RF', 'DP'];

// =============================================================================
// DICE & ZONES
// =============================================================================
function roll2d6() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { dice: [d1, d2], total: d1 + d2 };
}

function getZone(roll) {
  if (roll <= 6) return 0;  // Weak
  if (roll <= 9) return 1;  // Solid
  return 2;                  // Strong
}

function zoneName(zone) {
  return ['Weak', 'Solid', 'Strong'][zone];
}

// =============================================================================
// RPS
// =============================================================================
const RPS_NAMES = ['Rock (FB)', 'Paper (CH)', 'Scissors (CB)'];

function simulateRPS() {
  const batter = Math.floor(Math.random() * 3);
  const pitcher = Math.floor(Math.random() * 3);
  let winner = 'tie';
  if (batter !== pitcher) {
    winner = (batter + 1) % 3 === pitcher ? 'batter' : 'pitcher';
  }
  return { batter, pitcher, winner };
}

// =============================================================================
// AT-BAT RESOLUTION
// =============================================================================
function resolveAtBat(bases, outs) {
  const log = [];

  // 1. RPS
  const rps = simulateRPS();
  const batterMod = rps.winner === 'batter' ? RPS_MODIFIER : 0;
  const pitcherMod = rps.winner === 'pitcher' ? RPS_MODIFIER : 0;

  log.push(`  RPS: Batter ${RPS_NAMES[rps.batter]} vs Pitcher ${RPS_NAMES[rps.pitcher]} → ${rps.winner.toUpperCase()} wins`);

  // 2. Battle
  let batterRoll, pitcherRoll;
  do {
    batterRoll = roll2d6();
    pitcherRoll = roll2d6();
  } while (batterRoll.total + batterMod === pitcherRoll.total + pitcherMod);

  const batterTotal = batterRoll.total + batterMod;
  const pitcherTotal = pitcherRoll.total + pitcherMod;
  const battleWinner = batterTotal > pitcherTotal ? 'batter' : 'pitcher';
  const winningTotal = battleWinner === 'batter' ? batterTotal : pitcherTotal;
  const offset = getZone(winningTotal);

  log.push(`  Battle: Batter ${batterRoll.dice.join('+')}${batterMod ? '+' + batterMod : ''}=${batterTotal} vs Pitcher ${pitcherRoll.dice.join('+')}${pitcherMod ? '+' + pitcherMod : ''}=${pitcherTotal} → ${battleWinner.toUpperCase()} wins (${zoneName(offset)})`);

  // 3. Result
  const resultRoll = roll2d6();
  let position;
  let crit = null;

  if (USE_CRITS && resultRoll.total === 2) {
    position = 0;
    crit = 'CRIT FAIL';
  } else if (USE_CRITS && resultRoll.total === 12) {
    position = 4;
    crit = 'CRIT HIT';
  } else {
    position = offset + getZone(resultRoll.total);
  }

  const outcomes = battleWinner === 'batter' ? BATTER_OUTCOMES : PITCHER_OUTCOMES;
  const outcome = outcomes[position];

  log.push(`  Result: ${resultRoll.dice.join('+')}=${resultRoll.total}${crit ? ' ' + crit + '!' : ''} → ${outcome}`);

  // 4. Process outcome
  const result = processOutcome(outcome, bases, outs, log);
  result.log = log;
  result.battleWinner = battleWinner;
  result.outcome = outcome;

  return result;
}

// =============================================================================
// OUTCOME PROCESSING
// =============================================================================
function processOutcome(outcome, bases, outs, log) {
  let runs = 0;
  let outsAdded = 0;
  const newBases = { ...bases };

  switch (outcome) {
    case 'HR':
      runs = 1 + (bases.first ? 1 : 0) + (bases.second ? 1 : 0) + (bases.third ? 1 : 0);
      newBases.first = newBases.second = newBases.third = false;
      log.push(`  💥 HOME RUN! ${runs} run${runs > 1 ? 's' : ''} score!`);
      break;

    case '2B':
      if (bases.third) runs++;
      if (bases.second) runs++;
      newBases.third = bases.first;
      newBases.second = true;
      newBases.first = false;
      log.push(`  📍 Double!${runs ? ' ' + runs + ' run' + (runs > 1 ? 's' : '') + ' score!' : ''}`);
      break;

    case '1B':
      if (bases.third) runs++;
      newBases.third = bases.second;
      newBases.second = bases.first;
      newBases.first = true;
      log.push(`  📍 Single!${runs ? ' ' + runs + ' run' + (runs > 1 ? 's' : '') + ' score!' : ''}`);
      break;

    case 'OUT':
      outsAdded = 1;
      log.push(`  ❌ Out`);
      break;

    case 'BB':
      // Walk - forced advancement
      if (bases.first && bases.second && bases.third) runs++;
      if (bases.first && bases.second) newBases.third = true;
      if (bases.first) newBases.second = true;
      newBases.first = true;
      log.push(`  🚶 Walk${runs ? ' - run scores!' : ''}`);
      break;

    case 'O-RA':
      outsAdded = 1;
      // Runners advance
      if (bases.third) runs++;
      newBases.third = bases.second;
      newBases.second = bases.first;
      newBases.first = false;
      log.push(`  ❌ Out - Runners Advance${runs ? ' - run scores!' : ''}`);
      break;

    case 'O-RC':
      outsAdded = 1;
      // Runner Challenge - 50/50 if runner tries
      // For simulation, we'll say runner on 3rd always tries
      if (bases.third) {
        const challenge = roll2d6();
        const defense = roll2d6();
        if (challenge.total >= defense.total) {
          runs++;
          newBases.third = false;
          log.push(`  ❌ Out - Runner Challenged (${challenge.total} vs ${defense.total}) SAFE! Run scores!`);
        } else {
          // Double play essentially
          outsAdded = 2;
          newBases.third = false;
          log.push(`  ❌ Out - Runner Challenged (${challenge.total} vs ${defense.total}) OUT! Double play!`);
        }
      } else {
        log.push(`  ❌ Out - Runner Challenge (no runner went)`);
      }
      break;

    case 'O-RF':
      outsAdded = 1;
      log.push(`  ❌ Out - Runners Freeze`);
      break;

    case 'DP':
      outsAdded = bases.first ? 2 : 1;
      if (bases.first) newBases.first = false;
      log.push(`  ❌❌ Double Play! ${outsAdded} out${outsAdded > 1 ? 's' : ''}`);
      break;
  }

  return {
    runs,
    outsAdded,
    bases: newBases,
    isHit: ['1B', '2B', 'HR'].includes(outcome)
  };
}

// =============================================================================
// GAME SIMULATION
// =============================================================================
function simulateHalfInning(teamName, verbose) {
  let outs = 0;
  let runs = 0;
  let hits = 0;
  let bases = { first: false, second: false, third: false };
  let batterNum = 1;
  const logs = [];

  while (outs < 3) {
    if (verbose) logs.push(`\n  [Batter #${batterNum}] Bases: ${formatBases(bases)}, Outs: ${outs}`);

    const result = resolveAtBat(bases, outs);
    if (verbose) logs.push(...result.log);

    runs += result.runs;
    outs += result.outsAdded;
    bases = result.bases;
    if (result.isHit) hits++;
    batterNum++;

    // Safety valve
    if (batterNum > 20) break;
  }

  return { runs, hits, logs };
}

function formatBases(bases) {
  const b = [];
  if (bases.first) b.push('1B');
  if (bases.second) b.push('2B');
  if (bases.third) b.push('3B');
  return b.length ? b.join(', ') : 'Empty';
}

function simulateGame(verbose) {
  const score = { away: 0, home: 0 };
  const hits = { away: 0, home: 0 };
  const logs = [];

  for (let inning = 1; inning <= INNINGS; inning++) {
    if (verbose) logs.push(`\n${'='.repeat(50)}`);
    if (verbose) logs.push(`INNING ${inning} TOP - Away batting`);

    const topHalf = simulateHalfInning('Away', verbose);
    score.away += topHalf.runs;
    hits.away += topHalf.hits;
    if (verbose) logs.push(...topHalf.logs);
    if (verbose) logs.push(`\n  --- End Top ${inning}: Away ${score.away}, Home ${score.home} ---`);

    if (verbose) logs.push(`\nINNING ${inning} BOTTOM - Home batting`);

    // Walk-off check (bottom of last inning)
    if (inning === INNINGS && score.home > score.away) {
      if (verbose) logs.push(`\n  Home already winning - no need to bat!`);
      break;
    }

    const bottomHalf = simulateHalfInning('Home', verbose);
    score.home += bottomHalf.runs;
    hits.home += bottomHalf.hits;
    if (verbose) logs.push(...bottomHalf.logs);

    // Walk-off
    if (inning === INNINGS && score.home > score.away) {
      if (verbose) logs.push(`\n  🎉 WALK-OFF! Home wins!`);
      break;
    }

    if (verbose) logs.push(`\n  --- End Inning ${inning}: Away ${score.away}, Home ${score.home} ---`);
  }

  // Handle tie (extra innings simplified - just note it)
  const isTie = score.away === score.home;

  return {
    score,
    hits,
    winner: score.away > score.home ? 'away' : score.home > score.away ? 'home' : 'tie',
    logs,
    isTie
  };
}

// =============================================================================
// MAIN
// =============================================================================
console.log(`\n⚾ Cheddar Bob: Bush League - Game Simulator`);
console.log(`   Simulating ${NUM_GAMES} game${NUM_GAMES > 1 ? 's' : ''} (${INNINGS} innings each)\n`);

if (NUM_GAMES === 1) {
  // Single game - show play-by-play
  const game = simulateGame(true);
  console.log(game.logs.join('\n'));
  console.log(`\n${'='.repeat(50)}`);
  console.log(`FINAL SCORE: Away ${game.score.away} - Home ${game.score.home}`);
  console.log(`Hits: Away ${game.hits.away}, Home ${game.hits.home}`);
  if (game.isTie) console.log(`(Game ended in tie - would go to extras)`);
} else {
  // Multiple games - aggregate stats
  let totalRuns = 0;
  let totalHits = 0;
  let homeWins = 0;
  let awayWins = 0;
  let ties = 0;
  const runDistribution = {};

  for (let i = 0; i < NUM_GAMES; i++) {
    const game = simulateGame(false);
    totalRuns += game.score.away + game.score.home;
    totalHits += game.hits.away + game.hits.home;

    if (game.winner === 'home') homeWins++;
    else if (game.winner === 'away') awayWins++;
    else ties++;

    // Track run distribution
    const totalGameRuns = game.score.away + game.score.home;
    runDistribution[totalGameRuns] = (runDistribution[totalGameRuns] || 0) + 1;
  }

  const avgRunsPerGame = totalRuns / NUM_GAMES;
  const avgHitsPerGame = totalHits / NUM_GAMES;
  const avgRunsPerTeam = avgRunsPerGame / 2;

  console.log(`📊 Results from ${NUM_GAMES} games:\n`);
  console.log(`   Home Wins: ${homeWins} (${(homeWins/NUM_GAMES*100).toFixed(1)}%)`);
  console.log(`   Away Wins: ${awayWins} (${(awayWins/NUM_GAMES*100).toFixed(1)}%)`);
  console.log(`   Ties:      ${ties} (${(ties/NUM_GAMES*100).toFixed(1)}%)`);
  console.log(``);
  console.log(`   Avg Runs/Game:  ${avgRunsPerGame.toFixed(1)} total, ${avgRunsPerTeam.toFixed(1)} per team`);
  console.log(`   Avg Hits/Game:  ${avgHitsPerGame.toFixed(1)} total`);
  console.log(``);
  console.log(`📈 Runs per game distribution:`);

  const sortedRuns = Object.keys(runDistribution).map(Number).sort((a, b) => a - b);
  for (const runs of sortedRuns) {
    const count = runDistribution[runs];
    const pct = (count / NUM_GAMES * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / NUM_GAMES * 50));
    console.log(`   ${String(runs).padStart(2)} runs: ${pct.padStart(5)}% ${bar}`);
  }
}

console.log(``);
