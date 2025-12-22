/**
 * AtBatCard Component - Full at-bat display
 */

import React, { useState } from 'react';
import { speed } from '@strikezone/engine';
import Diamond from './Diamond';
import OutsDisplay from './OutsDisplay';
import DetailBox from './DetailBox';

interface AtBatCardProps {
    event: speed.SpeedGameEvent;
    defaultExpanded?: boolean;
}

export default function AtBatCard({ event, defaultExpanded = true }: AtBatCardProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const { atBat, batterNum, basesBefore, outsBefore, outsAfter, runsScored } = event;

    // Outcome styling
    const outcomeClass = speed.isHit(atBat.finalOutcome)
        ? 'text-green-400'
        : atBat.finalOutcome === 'BB' || atBat.finalOutcome === 'HBP'
            ? 'text-green-300'
            : 'text-red-400';

    // Outs display
    const outsStr = outsBefore === outsAfter
        ? `${outsAfter}`
        : `${outsBefore}→${outsAfter}`;

    return (
        <div className="border-b border-gray-700 last:border-b-0">
            {/* Summary row - always visible */}
            <div
                className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-800/50"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Batter number */}
                <div className="w-8 text-center font-bold text-gray-400">
                    #{batterNum}
                </div>

                {/* Situation: Diamond + Outs */}
                <div className="flex flex-col items-center gap-1">
                    <Diamond bases={basesBefore} size="small" />
                    <OutsDisplay outs={outsBefore} size="small" />
                </div>

                {/* Outcome */}
                <div className={`flex-1 font-bold text-lg ${outcomeClass}`}>
                    {atBat.finalOutcome}
                </div>

                {/* Outs */}
                <div className="w-16 text-center text-gray-400">
                    {outsStr}
                </div>

                {/* Runs */}
                <div className="w-12 text-center">
                    {runsScored > 0 && (
                        <span className="text-green-400 font-bold text-lg">
                            +{runsScored}
                        </span>
                    )}
                </div>

                {/* Expand indicator */}
                <div className="text-gray-500">
                    {expanded ? '▼' : '▶'}
                </div>
            </div>

            {/* Detail box - expandable */}
            {expanded && (
                <div className="px-3 pb-3">
                    <DetailBox atBat={atBat} />
                </div>
            )}
        </div>
    );
}
