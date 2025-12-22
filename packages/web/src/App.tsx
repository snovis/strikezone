/**
 * Strikezone Web App
 *
 * Fast-paced baseball dice game with simultaneous selection,
 * battle rolls, and dramatic resolution.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    speed,
    clearBases,
    copyBases,
    advanceRunnersOnHit,
    advanceRunnersOnWalk,
    handleDoublePlay,
    type Bases
} from '@strikezone/engine';
import {
    Diamond,
    OutsDisplay,
    DetailBox,
    HalfInning,
    Linescore,
    SelectionPanel
} from './components';

type GamePhase = 'pitcher_select' | 'batter_select' | 'resolved';

interface GameState {
    inning: number;
    topBottom: 'top' | 'bottom';
    outs: number;
    bases: Bases;
    score: { away: number; home: number };
    hits: { away: number; home: number };
    lineupPos: { away: number; home: number };
}

export default function App() {
    // Game state
    const [gameState, setGameState] = useState<GameState>({
        inning: 1,
        topBottom: 'top',
        outs: 0,
        bases: clearBases(),
        score: { away: 0, home: 0 },
        hits: { away: 0, home: 0 },
        lineupPos: { away: 1, home: 1 }
    });

    // Game log - all events
    const [events, setEvents] = useState<speed.SpeedGameEvent[]>([]);

    // Current phase
    const [phase, setPhase] = useState<GamePhase>('pitcher_select');

    // Player selections
    const [pitcherApproach, setPitcherApproach] = useState<speed.PitcherApproach | null>(null);
    const [pitcherLocation, setPitcherLocation] = useState<speed.Location | null>(null);
    const [batterApproach, setBatterApproach] = useState<speed.BatterApproach | null>(null);
    const [batterLocation, setBatterLocation] = useState<speed.Location | null>(null);

    // CPU modes
    // Default: User plays as HOME team (batter), CPU pitches
    const [pitcherIsCPU, setPitcherIsCPU] = useState(true);
    const [batterIsCPU, setBatterIsCPU] = useState(false);

    // Pitcher locked in
    const [pitcherLocked, setPitcherLocked] = useState(false);

    // Last resolution for display
    const [lastResult, setLastResult] = useState<speed.AtBatResult | null>(null);
    const [lastEvent, setLastEvent] = useState<speed.SpeedGameEvent | null>(null);

    // Settings
    const [totalInnings, setTotalInnings] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState<string | null>(null);

    // Derived state
    const isTop = gameState.topBottom === 'top';
    const currentTeam = isTop ? 'away' : 'home';
    const batterNum = gameState.lineupPos[currentTeam];

    // CPU auto-select for pitcher
    useEffect(() => {
        if (phase === 'pitcher_select' && pitcherIsCPU && !pitcherLocked) {
            const timer = setTimeout(() => {
                const cpuPick = speed.getCPUPitcher();
                setPitcherApproach(cpuPick.approach);
                setPitcherLocation(cpuPick.location);
                setPitcherLocked(true);
                setPhase('batter_select');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [phase, pitcherIsCPU, pitcherLocked]);

    // CPU auto-select for batter
    useEffect(() => {
        if (phase === 'batter_select' && batterIsCPU) {
            const timer = setTimeout(() => {
                const cpuPick = speed.getCPUBatter(batterNum);
                setBatterApproach(cpuPick.approach);
                setBatterLocation(cpuPick.location);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [phase, batterIsCPU, batterNum]);

    // Handle pitcher lock-in
    const handlePitcherLockIn = useCallback(() => {
        if (pitcherApproach && pitcherLocation) {
            setPitcherLocked(true);
            setPhase('batter_select');
        }
    }, [pitcherApproach, pitcherLocation]);

    // Handle battle resolution
    const handleBattle = useCallback(() => {
        if (!pitcherApproach || !pitcherLocation || !batterApproach || !batterLocation) {
            return;
        }

        const pitcherSelection: speed.PitcherSelection = {
            approach: pitcherApproach,
            location: pitcherLocation
        };
        const batterSelection: speed.BatterSelection = {
            approach: batterApproach,
            location: batterLocation
        };

        // Resolve the at-bat
        const result = speed.resolveAtBat(pitcherSelection, batterSelection);
        setLastResult(result);

        // Update game state
        setGameState(prev => {
            const newState = { ...prev };
            const currentTeam = prev.topBottom === 'top' ? 'away' : 'home';
            let runsScored = 0;
            let outsRecorded = 0;

            // Track hits
            if (speed.isHit(result.finalOutcome)) {
                newState.hits = { ...prev.hits };
                newState.hits[currentTeam]++;
            }

            // Process outcome using engine functions
            if (speed.isHit(result.finalOutcome) || result.finalOutcome === 'HBP') {
                const hitType = speed.parseHitType(result.finalOutcome);
                if (hitType) {
                    const advance = advanceRunnersOnHit(prev.bases, hitType, result.winnerTier);
                    runsScored = advance.runs;
                    newState.bases = advance.bases;
                } else if (result.finalOutcome === 'HBP') {
                    const advance = advanceRunnersOnWalk(prev.bases);
                    runsScored = advance.runs;
                    newState.bases = advance.bases;
                }
                newState.score = { ...prev.score };
                newState.score[currentTeam] += runsScored;
            } else if (result.finalOutcome === 'BB') {
                const advance = advanceRunnersOnWalk(prev.bases);
                runsScored = advance.runs;
                newState.bases = advance.bases;
                newState.score = { ...prev.score };
                newState.score[currentTeam] += runsScored;
            } else if (speed.isOut(result.finalOutcome)) {
                if (result.finalOutcome === 'DP') {
                    const advance = handleDoublePlay(prev.bases);
                    newState.bases = advance.bases;
                    outsRecorded = advance.outs;
                } else {
                    outsRecorded = 1;
                }
                newState.outs = prev.outs + outsRecorded;
            }

            // Handle caught stretching
            if (result.stretchResult === 'out') {
                newState.outs++;
                outsRecorded++;
            }

            // Create event
            const event: speed.SpeedGameEvent = {
                inning: prev.inning,
                topBottom: prev.topBottom,
                batterNum: prev.lineupPos[currentTeam],
                basesBefore: copyBases(prev.bases),
                basesAfter: copyBases(newState.bases),
                outsBefore: prev.outs,
                outsAfter: newState.outs,
                runsScored,
                atBat: result
            };

            // Update events (will be done separately)
            setLastEvent(event);

            // Advance lineup
            newState.lineupPos = { ...prev.lineupPos };
            newState.lineupPos[currentTeam] = (prev.lineupPos[currentTeam] % 9) + 1;

            // Check for 3 outs
            if (newState.outs >= 3) {
                newState.outs = 0;
                newState.bases = clearBases();

                if (prev.topBottom === 'top') {
                    newState.topBottom = 'bottom';
                } else {
                    // End of full inning
                    if (prev.inning >= totalInnings && newState.score.away !== newState.score.home) {
                        // Game over
                        setGameOver(true);
                        setGameResult(
                            newState.score.away > newState.score.home
                                ? 'AWAY WINS!'
                                : 'HOME WINS!'
                        );
                    } else {
                        newState.inning = prev.inning + 1;
                        newState.topBottom = 'top';
                    }
                }
            }

            // Check for walkoff
            if (prev.topBottom === 'bottom' && prev.inning >= totalInnings &&
                newState.score.home > newState.score.away) {
                setGameOver(true);
                setGameResult('HOME WINS - WALKOFF!');
            }

            return newState;
        });

        setPhase('resolved');
    }, [pitcherApproach, pitcherLocation, batterApproach, batterLocation, totalInnings]);

    // Add event to log when lastEvent changes
    useEffect(() => {
        if (lastEvent) {
            setEvents(prev => [...prev, lastEvent]);
        }
    }, [lastEvent]);

    // Handle next at-bat
    const handleNextAtBat = useCallback(() => {
        setPitcherApproach(null);
        setPitcherLocation(null);
        setBatterApproach(null);
        setBatterLocation(null);
        setPitcherLocked(false);
        setLastResult(null);
        setPhase('pitcher_select');
    }, []);

    // Handle new game
    const handleNewGame = useCallback(() => {
        setGameState({
            inning: 1,
            topBottom: 'top',
            outs: 0,
            bases: clearBases(),
            score: { away: 0, home: 0 },
            hits: { away: 0, home: 0 },
            lineupPos: { away: 1, home: 1 }
        });
        setEvents([]);
        setPhase('pitcher_select');
        setPitcherApproach(null);
        setPitcherLocation(null);
        setBatterApproach(null);
        setBatterLocation(null);
        setPitcherLocked(false);
        setLastResult(null);
        setLastEvent(null);
        setGameOver(false);
        setGameResult(null);
    }, []);

    // Group events by half-inning for display
    const eventsByHalfInning: Record<string, speed.SpeedGameEvent[]> = {};
    for (const event of events) {
        const key = `${event.inning}-${event.topBottom}`;
        if (!eventsByHalfInning[key]) eventsByHalfInning[key] = [];
        eventsByHalfInning[key].push(event);
    }

    // Check if can battle
    const canBattle = phase === 'batter_select' &&
        pitcherLocked &&
        batterApproach !== null &&
        batterLocation !== null;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold">Strikezone</h1>
                    <div className="flex items-center gap-4">
                        <label className="text-sm text-gray-400">
                            Innings:
                            <select
                                value={totalInnings}
                                onChange={(e) => setTotalInnings(Number(e.target.value))}
                                className="ml-2 bg-gray-700 rounded px-2 py-1 text-white"
                                disabled={events.length > 0}
                            >
                                <option value={3}>3</option>
                                <option value={6}>6</option>
                                <option value={9}>9</option>
                            </select>
                        </label>
                        <button
                            onClick={handleNewGame}
                            className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
                        >
                            New Game
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4">
                {/* Linescore */}
                <div className="mb-6">
                    <Linescore
                        events={events}
                        currentInning={gameState.inning}
                        currentHalf={gameState.topBottom}
                        awayScore={gameState.score.away}
                        homeScore={gameState.score.home}
                        awayHits={gameState.hits.away}
                        homeHits={gameState.hits.home}
                    />
                </div>

                {/* Current Situation */}
                <div className="mb-6 flex items-center justify-center gap-8 bg-gray-800 rounded-lg p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            {isTop ? '▲' : '▼'} {gameState.inning}
                        </div>
                        <div className="text-sm text-gray-400">Inning</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <Diamond bases={gameState.bases} size="large" />
                        <OutsDisplay outs={gameState.outs} size="medium" />
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">#{batterNum}</div>
                        <div className="text-sm text-gray-400">At Bat</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold">
                            {gameState.score.away} - {gameState.score.home}
                        </div>
                        <div className="text-sm text-gray-400">AWAY - HOME</div>
                    </div>
                </div>

                {/* Game Over */}
                {gameOver && (
                    <div className="mb-6 bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                            GAME OVER
                        </div>
                        <div className="text-xl text-white">{gameResult}</div>
                        <div className="text-lg text-gray-400 mt-2">
                            Final: AWAY {gameState.score.away} - HOME {gameState.score.home}
                        </div>
                    </div>
                )}

                {/* Selection Panels & Battle Button */}
                {!gameOver && (
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        {/* Pitcher Panel */}
                        <SelectionPanel
                            playerType="pitcher"
                            approach={pitcherApproach}
                            location={pitcherLocation}
                            onApproachChange={(a) => setPitcherApproach(a as speed.PitcherApproach)}
                            onLocationChange={setPitcherLocation}
                            isCPU={pitcherIsCPU}
                            onCPUToggle={() => setPitcherIsCPU(!pitcherIsCPU)}
                            isLocked={pitcherLocked}
                            onLockIn={handlePitcherLockIn}
                            disabled={phase !== 'pitcher_select'}
                        />

                        {/* Battle Button */}
                        <div className="flex flex-col items-center justify-center">
                            {phase === 'resolved' ? (
                                <button
                                    onClick={handleNextAtBat}
                                    className="px-8 py-4 bg-green-600 rounded-lg font-bold text-xl hover:bg-green-700 transition-colors"
                                >
                                    NEXT AT-BAT
                                </button>
                            ) : (
                                <button
                                    onClick={handleBattle}
                                    disabled={!canBattle}
                                    className={`px-8 py-4 rounded-lg font-bold text-xl transition-colors ${
                                        canBattle
                                            ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/50'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    BATTLE!
                                </button>
                            )}
                            <div className="mt-2 text-sm text-gray-500">
                                {phase === 'pitcher_select' && 'Waiting for pitcher...'}
                                {phase === 'batter_select' && !canBattle && 'Waiting for batter...'}
                                {phase === 'batter_select' && canBattle && 'Ready to battle!'}
                                {phase === 'resolved' && 'At-bat complete'}
                            </div>
                        </div>

                        {/* Batter Panel */}
                        <SelectionPanel
                            playerType="batter"
                            approach={batterApproach}
                            location={batterLocation}
                            onApproachChange={(a) => setBatterApproach(a as speed.BatterApproach)}
                            onLocationChange={setBatterLocation}
                            isCPU={batterIsCPU}
                            onCPUToggle={() => setBatterIsCPU(!batterIsCPU)}
                            isLocked={false}
                            disabled={phase !== 'batter_select'}
                        />
                    </div>
                )}

                {/* Last Result */}
                {lastResult && (
                    <div className="mb-6">
                        <div className="text-lg font-bold mb-2 flex items-center gap-2">
                            Last At-Bat:
                            <span className={`text-xl ${
                                speed.isHit(lastResult.finalOutcome) ? 'text-green-400' :
                                lastResult.finalOutcome === 'BB' || lastResult.finalOutcome === 'HBP' ? 'text-green-300' :
                                'text-red-400'
                            }`}>
                                {lastResult.finalOutcome}
                            </span>
                            {lastEvent && lastEvent.runsScored > 0 && (
                                <span className="text-green-400">+{lastEvent.runsScored} RUN{lastEvent.runsScored > 1 ? 'S' : ''}</span>
                            )}
                        </div>
                        <DetailBox atBat={lastResult} />
                    </div>
                )}

                {/* Game Log */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-4">Game Log</h2>
                    {Object.entries(eventsByHalfInning).length === 0 ? (
                        <div className="text-gray-500 text-center py-8 bg-gray-800/50 rounded-lg">
                            No at-bats yet - start the game!
                        </div>
                    ) : (
                        Object.entries(eventsByHalfInning)
                            .sort(([a], [b]) => {
                                const [aInn, aHalf] = a.split('-');
                                const [bInn, bHalf] = b.split('-');
                                if (aInn !== bInn) return Number(bInn) - Number(aInn);
                                return bHalf === 'bottom' ? 1 : -1;
                            })
                            .map(([key, halfEvents]) => {
                                const [inn, half] = key.split('-');
                                return (
                                    <HalfInning
                                        key={key}
                                        inning={Number(inn)}
                                        topBottom={half as 'top' | 'bottom'}
                                        teamName={half === 'top' ? 'AWAY' : 'HOME'}
                                        events={halfEvents}
                                        defaultExpanded={
                                            Number(inn) === gameState.inning &&
                                            half === gameState.topBottom
                                        }
                                    />
                                );
                            })
                    )}
                </div>
            </div>
        </div>
    );
}
