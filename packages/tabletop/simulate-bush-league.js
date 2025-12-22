#!/usr/bin/env node
/**
 * Cheddar Bob: Bush League - Balance Simulator
 *
 * Simulates at-bats to calculate expected batting stats.
 * Run with: node simulate-bush-league.js [iterations]
 */

const ITERATIONS = parseInt(process.argv[2]) || 100000;

// Configuration - TUNE THESE
const RPS_MODIFIER = 2;  // Bonus for winning RPS
const USE_CRITS = true;  // Snake eyes (2) = crit fail, Boxcars (12) = crit hit

// Outcome lists (0-indexed)
const BATTER_OUTCOMES = ['OUT', 'OUT', '1B', '2B', 'HR'];
const PITCHER_OUTCOMES = ['BB', 'O-RA', 'O-RC', 'O-RF', 'DP'];

// Roll 2d6
function roll2d6() {
  return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}

// Get zone: 0=weak(≤6), 1=solid(7-9), 2=strong(10+)
function getZone(roll) {
  if (roll <= 6) return 0;
  if (roll <= 9) return 1;
  return 2;
}

// Simulate RPS (returns: 1=batter wins, -1=pitcher wins, 0=tie)
function simulateRPS() {
  const batter = Math.floor(Math.random() * 3);
  const pitcher = Math.floor(Math.random() * 3);
  if (batter === pitcher) return 0;
  // RPS: 0 beats 2, 1 beats 0, 2 beats 1
  if ((batter + 1) % 3 === pitcher) return 1;  // batter wins
  return -1;  // pitcher wins
}

// Simulate a single at-bat
function simulateAtBat() {
  // 1. RPS
  const rpsResult = simulateRPS();
  const batterMod = rpsResult === 1 ? RPS_MODIFIER : 0;
  const pitcherMod = rpsResult === -1 ? RPS_MODIFIER : 0;

  // 2. Battle roll
  let batterRoll, pitcherRoll;
  do {
    batterRoll = roll2d6() + batterMod;
    pitcherRoll = roll2d6() + pitcherMod;
  } while (batterRoll === pitcherRoll);  // Re-roll ties

  const batterWins = batterRoll > pitcherRoll;
  const winningRoll = batterWins ? batterRoll : pitcherRoll;

  // 3. Calculate offset from battle roll zone
  const offset = getZone(winningRoll);

  // 4. Result roll
  const resultRoll = roll2d6();
  const resultZone = getZone(resultRoll);

  // 5. Get outcome (offset + resultZone gives position 0-4)
  const position = offset + resultZone;
  const outcomes = batterWins ? BATTER_OUTCOMES : PITCHER_OUTCOMES;
  const outcome = outcomes[position];

  return {
    batterWins,
    outcome,
    offset,
    resultZone,
    position
  };
}

// Simulate with RPS tracking
function simulateAtBatWithRPS() {
  // 1. RPS
  const rpsResult = simulateRPS();
  const batterMod = rpsResult === 1 ? RPS_MODIFIER : 0;
  const pitcherMod = rpsResult === -1 ? RPS_MODIFIER : 0;

  // 2. Battle roll
  let batterRoll, pitcherRoll;
  do {
    batterRoll = roll2d6() + batterMod;
    pitcherRoll = roll2d6() + pitcherMod;
  } while (batterRoll === pitcherRoll);

  const batterWins = batterRoll > pitcherRoll;
  const winningRoll = batterWins ? batterRoll : pitcherRoll;
  const offset = getZone(winningRoll);

  // 3. Result roll with crits
  const resultRoll = roll2d6();
  let position;
  let crit = null;

  if (USE_CRITS && resultRoll === 2) {
    // Snake eyes = CRIT FAIL = worst outcome (position 0)
    position = 0;
    crit = 'fail';
  } else if (USE_CRITS && resultRoll === 12) {
    // Boxcars = CRIT HIT = best outcome (position 4)
    position = 4;
    crit = 'hit';
  } else {
    const resultZone = getZone(resultRoll);
    position = offset + resultZone;
  }

  const outcomes = batterWins ? BATTER_OUTCOMES : PITCHER_OUTCOMES;
  const outcome = outcomes[position];

  return { batterWins, outcome, rpsResult, crit };
}

// Run simulation
function runSimulation(iterations) {
  const stats = {
    atBats: 0,
    hits: 0,
    singles: 0,
    doubles: 0,
    homeRuns: 0,
    walks: 0,
    outs: 0,
    doublePlays: 0,
    runnerAdvance: 0,
    runnerChallenge: 0,
    runnerFreeze: 0,
    plateAppearances: iterations,
    // RPS tracking
    rpsWins: { batter: 0, pitcher: 0, tie: 0 },
    battleWinsWhenRPSWin: { batter: 0, pitcher: 0 },
    battleWinsWhenRPSLose: { batter: 0, pitcher: 0 },
    battleWinsWhenRPSTie: { batter: 0, pitcher: 0 },
    // Crit tracking
    crits: { fail: 0, hit: 0 },
    critOutcomes: { failBatter: {}, failPitcher: {}, hitBatter: {}, hitPitcher: {} }
  };

  for (let i = 0; i < iterations; i++) {
    const result = simulateAtBatWithRPS();

    // Track crits
    if (result.crit === 'fail') {
      stats.crits.fail++;
      const key = result.batterWins ? 'failBatter' : 'failPitcher';
      stats.critOutcomes[key][result.outcome] = (stats.critOutcomes[key][result.outcome] || 0) + 1;
    } else if (result.crit === 'hit') {
      stats.crits.hit++;
      const key = result.batterWins ? 'hitBatter' : 'hitPitcher';
      stats.critOutcomes[key][result.outcome] = (stats.critOutcomes[key][result.outcome] || 0) + 1;
    }

    // Track RPS impact
    if (result.rpsResult === 1) {
      stats.rpsWins.batter++;
      if (result.batterWins) stats.battleWinsWhenRPSWin.batter++;
      else stats.battleWinsWhenRPSLose.pitcher++;
    } else if (result.rpsResult === -1) {
      stats.rpsWins.pitcher++;
      if (result.batterWins) stats.battleWinsWhenRPSLose.batter++;
      else stats.battleWinsWhenRPSWin.pitcher++;
    } else {
      stats.rpsWins.tie++;
      if (result.batterWins) stats.battleWinsWhenRPSTie.batter++;
      else stats.battleWinsWhenRPSTie.pitcher++;
    }

    switch (result.outcome) {
      case 'OUT':
        stats.outs++;
        stats.atBats++;
        break;
      case '1B':
        stats.hits++;
        stats.singles++;
        stats.atBats++;
        break;
      case '2B':
        stats.hits++;
        stats.doubles++;
        stats.atBats++;
        break;
      case 'HR':
        stats.hits++;
        stats.homeRuns++;
        stats.atBats++;
        break;
      case 'BB':
        stats.walks++;
        // BB doesn't count as AB
        break;
      case 'O-RA':
        stats.outs++;
        stats.runnerAdvance++;
        stats.atBats++;
        break;
      case 'O-RC':
        stats.outs++;
        stats.runnerChallenge++;
        stats.atBats++;
        break;
      case 'O-RF':
        stats.outs++;
        stats.runnerFreeze++;
        stats.atBats++;
        break;
      case 'DP':
        stats.outs += 2;  // DP is 2 outs
        stats.doublePlays++;
        stats.atBats++;
        break;
    }
  }

  return stats;
}

// Calculate derived stats
function calculateStats(raw) {
  const avg = raw.hits / raw.atBats;
  const obp = (raw.hits + raw.walks) / raw.plateAppearances;
  const totalBases = raw.singles + (raw.doubles * 2) + (raw.homeRuns * 4);
  const slg = totalBases / raw.atBats;
  const ops = obp + slg;
  const hrRate = raw.homeRuns / raw.atBats;
  // For K rate, we're treating pitcher-win outs as potential strikeouts
  // In this simplified model, we don't have explicit K's
  const outRate = (raw.outs) / raw.atBats;

  return { avg, obp, slg, ops, hrRate, outRate, totalBases, ...raw };
}

// Main
console.log(`\n🎲 Cheddar Bob: Bush League - Balance Simulator`);
console.log(`   Running ${ITERATIONS.toLocaleString()} at-bats...\n`);
console.log(`   Config: RPS_MODIFIER = +${RPS_MODIFIER}, CRITS = ${USE_CRITS ? 'ON' : 'OFF'}\n`);

const rawStats = runSimulation(ITERATIONS);
const stats = calculateStats(rawStats);

console.log(`📊 Results:\n`);
console.log(`   Plate Appearances: ${stats.plateAppearances.toLocaleString()}`);
console.log(`   At Bats:           ${stats.atBats.toLocaleString()}`);
console.log(`   Hits:              ${stats.hits.toLocaleString()}`);
console.log(`   Walks:             ${stats.walks.toLocaleString()}`);
console.log(`   Outs:              ${stats.outs.toLocaleString()}`);
console.log(`   Double Plays:      ${stats.doublePlays.toLocaleString()}`);
console.log(``);
console.log(`   Singles:           ${stats.singles.toLocaleString()}`);
console.log(`   Doubles:           ${stats.doubles.toLocaleString()}`);
console.log(`   Home Runs:         ${stats.homeRuns.toLocaleString()}`);
console.log(``);
console.log(`   O-RA (advance):    ${stats.runnerAdvance.toLocaleString()}`);
console.log(`   O-RC (challenge):  ${stats.runnerChallenge.toLocaleString()}`);
console.log(`   O-RF (freeze):     ${stats.runnerFreeze.toLocaleString()}`);

console.log(`\n⚾ Batting Line:\n`);
console.log(`   AVG:  ${stats.avg.toFixed(3)}  (target: .318)`);
console.log(`   OBP:  ${stats.obp.toFixed(3)}  (target: .361)`);
console.log(`   SLG:  ${stats.slg.toFixed(3)}  (target: .534)`);
console.log(`   OPS:  ${stats.ops.toFixed(3)}`);
console.log(`   HR%:  ${(stats.hrRate * 100).toFixed(1)}%  (target: 3.5%)`);

console.log(`\n📈 Outcome Distribution:\n`);
const outcomes = {
  'OUT (batter)': rawStats.outs - rawStats.runnerAdvance - rawStats.runnerChallenge - rawStats.runnerFreeze - rawStats.doublePlays,
  'O-RA': rawStats.runnerAdvance,
  'O-RC': rawStats.runnerChallenge,
  'O-RF': rawStats.runnerFreeze,
  'DP': rawStats.doublePlays,
  'BB': rawStats.walks,
  '1B': rawStats.singles,
  '2B': rawStats.doubles,
  'HR': rawStats.homeRuns
};

for (const [outcome, count] of Object.entries(outcomes)) {
  const pct = (count / ITERATIONS * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(pct));
  console.log(`   ${outcome.padEnd(12)} ${pct.padStart(5)}% ${bar}`);
}

console.log(`\n💡 Tuning suggestions based on results vs targets...`);
const avgDiff = stats.avg - 0.318;
const obpDiff = stats.obp - 0.361;
const slgDiff = stats.slg - 0.534;
const hrDiff = stats.hrRate - 0.035;

if (Math.abs(avgDiff) > 0.02) {
  console.log(`   AVG is ${avgDiff > 0 ? 'HIGH' : 'LOW'} by ${Math.abs(avgDiff).toFixed(3)}`);
}
if (Math.abs(obpDiff) > 0.02) {
  console.log(`   OBP is ${obpDiff > 0 ? 'HIGH' : 'LOW'} by ${Math.abs(obpDiff).toFixed(3)}`);
}
if (Math.abs(slgDiff) > 0.05) {
  console.log(`   SLG is ${slgDiff > 0 ? 'HIGH' : 'LOW'} by ${Math.abs(slgDiff).toFixed(3)}`);
}
if (Math.abs(hrDiff) > 0.01) {
  console.log(`   HR% is ${hrDiff > 0 ? 'HIGH' : 'LOW'} by ${Math.abs(hrDiff * 100).toFixed(1)}%`);
}

// Critical Hit/Fail Analysis
if (USE_CRITS) {
  console.log(`\n🎰 Critical Rolls (Snake Eyes / Boxcars):\n`);
  const critFailPct = (stats.crits.fail / ITERATIONS * 100).toFixed(1);
  const critHitPct = (stats.crits.hit / ITERATIONS * 100).toFixed(1);
  console.log(`   Snake Eyes (2) - Crit Fail: ${stats.crits.fail.toLocaleString()} (${critFailPct}%)`);
  console.log(`   Boxcars (12) - Crit Hit:    ${stats.crits.hit.toLocaleString()} (${critHitPct}%)`);
  console.log(`\n   What happens on crits:`);
  console.log(`   - Crit FAIL when Batter wins  → OUT  (snatched defeat from victory)`);
  console.log(`   - Crit FAIL when Pitcher wins → BB   (gave up free base)`);
  console.log(`   - Crit HIT when Batter wins   → HR   (crushed it!)`);
  console.log(`   - Crit HIT when Pitcher wins  → DP   (turned two!)`);
}

// RPS Impact Analysis
console.log(`\n🎯 Does RPS Matter? (Decision Impact)\n`);
const rpsTotal = stats.rpsWins.batter + stats.rpsWins.pitcher + stats.rpsWins.tie;
console.log(`   RPS Outcomes: Batter ${(stats.rpsWins.batter/rpsTotal*100).toFixed(0)}% | Tie ${(stats.rpsWins.tie/rpsTotal*100).toFixed(0)}% | Pitcher ${(stats.rpsWins.pitcher/rpsTotal*100).toFixed(0)}%`);

const batterWinRateWhenRPSWin = stats.battleWinsWhenRPSWin.batter / stats.rpsWins.batter * 100;
const batterWinRateWhenRPSLose = stats.battleWinsWhenRPSLose.batter / stats.rpsWins.pitcher * 100;
const batterWinRateWhenRPSTie = stats.battleWinsWhenRPSTie.batter / stats.rpsWins.tie * 100;

console.log(`\n   Battle Win Rate for BATTER:`);
console.log(`   - When batter wins RPS:  ${batterWinRateWhenRPSWin.toFixed(0)}%  ← good read!`);
console.log(`   - When RPS ties:         ${batterWinRateWhenRPSTie.toFixed(0)}%  ← coin flip`);
console.log(`   - When pitcher wins RPS: ${batterWinRateWhenRPSLose.toFixed(0)}%  ← got fooled`);

const swing = batterWinRateWhenRPSWin - batterWinRateWhenRPSLose;
console.log(`\n   RPS Swing: ${swing.toFixed(0)} percentage points`);
if (swing > 20) {
  console.log(`   ✅ Decisions MATTER - big swing from good/bad reads`);
} else if (swing > 10) {
  console.log(`   ⚠️  Decisions matter somewhat - could increase RPS_MODIFIER`);
} else {
  console.log(`   ❌ Decisions don't matter enough - increase RPS_MODIFIER`);
}

console.log(`\n`);
