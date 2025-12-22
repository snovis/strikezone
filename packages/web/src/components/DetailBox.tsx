/**
 * DetailBox Component - Step-by-step resolution breakdown
 */

import React from 'react';
import { speed, sum } from '@strikezone/engine';
import DiceDisplay from './DiceDisplay';

interface DetailBoxProps {
    atBat: speed.AtBatResult;
}

export default function DetailBox({ atBat }: DetailBoxProps) {
    // RPS result styling
    const rpsClass = atBat.rpsWinner === 'batter' ? 'text-green-500' :
                     atBat.rpsWinner === 'pitcher' ? 'text-red-500' : 'text-yellow-500';
    const rpsText = atBat.rpsWinner === 'batter' ? 'B+1, P-1' :
                    atBat.rpsWinner === 'pitcher' ? 'P+1, B-1' : 'TIE';

    // Location result styling
    const locClass = atBat.locationWinner === 'batter' ? 'text-green-500' :
                     atBat.locationWinner === 'pitcher' ? 'text-red-500' : 'text-yellow-500';
    const locText = atBat.locationWinner === 'batter' ? 'B+1' :
                    atBat.locationWinner === 'pitcher' ? 'P+1' : 'TIE';

    // Battle winner styling
    const battleClass = atBat.battleWinner === 'batter' ? 'text-green-500' : 'text-red-500';

    // Approach display helpers
    const pitchIcon: Record<string, string> = {
        fastball: '🔥',
        curveball: '🌀',
        changeup: '🔄'
    };

    const batterIcon: Record<string, string> = {
        power: '💪',
        control: '🎯',
        contact: '✋'
    };

    return (
        <div className="text-sm text-gray-400 bg-gray-800 rounded p-3 border-l-4 border-gray-600 space-y-2">
            {/* SELECT Row */}
            <div className="flex items-center">
                <span className="font-bold text-gray-500 w-20">SELECT:</span>
                <span>
                    {pitchIcon[atBat.pitcherApproach]} {atBat.pitcherApproach.toUpperCase()} {speed.getArrowSymbol(atBat.pitcherLocation)}
                    <span className="mx-2 text-gray-600">vs</span>
                    {batterIcon[atBat.batterApproach]} {atBat.batterApproach.toUpperCase()} {speed.getArrowSymbol(atBat.batterLocation)}
                </span>
            </div>

            {/* MODIFIERS Row */}
            <div className="flex items-center">
                <span className="font-bold text-gray-500 w-20">MODS:</span>
                <span>
                    RPS: <span className={`font-bold ${rpsClass}`}>{rpsText}</span>
                    <span className="mx-2 text-gray-600">|</span>
                    Loc: <span className={`font-bold ${locClass}`}>{locText}</span>
                </span>
            </div>

            {/* BATTLE Row */}
            <div className="flex items-center flex-wrap">
                <span className="font-bold text-gray-500 w-20">BATTLE:</span>
                <span className="flex items-center gap-2 flex-wrap">
                    <span>
                        P: <DiceDisplay dice={atBat.pitcherDice} total={atBat.pitcherTotal} showTotal={true} size="small" />
                    </span>
                    <span className="text-gray-600">vs</span>
                    <span>
                        B: <DiceDisplay dice={atBat.batterDice} total={atBat.batterTotal} showTotal={true} size="small" />
                    </span>
                    <span className="ml-2">
                        → <span className={`font-bold ${battleClass}`}>{atBat.battleWinner.toUpperCase()}</span>
                        <span className="text-gray-500"> ({atBat.winnerTier})</span>
                    </span>
                </span>
            </div>

            {/* Snake Eyes Alert */}
            {atBat.pitcherSnakeEyes && (
                <div className="text-red-500 font-bold pl-20">
                    🐍 PITCHER SNAKE EYES → Batter gets STRONG!
                </div>
            )}
            {atBat.batterSnakeEyes && (
                <div className="text-red-500 font-bold pl-20">
                    🐍 BATTER SNAKE EYES → Auto K!
                </div>
            )}

            {/* RESULT Row (skip if batter snake eyes - auto K) */}
            {!atBat.batterSnakeEyes && (
                <div className="flex items-center">
                    <span className="font-bold text-gray-500 w-20">RESULT:</span>
                    <span className="flex items-center gap-2">
                        <DiceDisplay dice={atBat.resultDice} total={atBat.resultTotal} showTotal={true} size="small" />
                        <span>→ <span className="font-bold text-white">{atBat.outcome}</span></span>
                    </span>
                </div>
            )}

            {/* Result Snake Eyes Alert */}
            {atBat.resultSnakeEyes && !atBat.batterSnakeEyes && (
                <div className="text-red-500 font-bold pl-20">
                    🐍 RESULT SNAKE EYES!
                </div>
            )}

            {/* STRETCH Row (if applicable) */}
            {atBat.stretchBatterDice && atBat.stretchPitcherDice && (
                <div className="flex items-center flex-wrap">
                    <span className="font-bold text-gray-500 w-20">STRETCH:</span>
                    <span className="flex items-center gap-2 flex-wrap">
                        <span>
                            B: <DiceDisplay dice={atBat.stretchBatterDice} total={sum(atBat.stretchBatterDice)} showTotal={true} size="small" />
                        </span>
                        <span className="text-gray-600">vs</span>
                        <span>
                            P: <DiceDisplay dice={atBat.stretchPitcherDice} total={sum(atBat.stretchPitcherDice)} showTotal={true} size="small" />
                        </span>
                        <span className="ml-2">
                            → <span className={`font-bold ${atBat.stretchResult === 'safe' ? 'text-green-500' : 'text-red-500'}`}>
                                {atBat.stretchResult?.toUpperCase()}
                            </span>
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
}
