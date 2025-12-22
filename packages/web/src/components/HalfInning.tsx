/**
 * HalfInning Component - Collapsible half-inning container
 */

import React, { useState } from 'react';
import { speed } from '@strikezone/engine';
import AtBatCard from './AtBatCard';

interface HalfInningProps {
    inning: number;
    topBottom: 'top' | 'bottom';
    teamName: string;
    events: speed.SpeedGameEvent[];
    defaultExpanded?: boolean;
}

export default function HalfInning({
    inning,
    topBottom,
    teamName,
    events,
    defaultExpanded = true
}: HalfInningProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    // Calculate summary stats
    const runs = events.reduce((sum, e) => sum + e.runsScored, 0);
    const hits = events.filter(e => speed.isHit(e.atBat.finalOutcome)).length;

    const halfLabel = topBottom === 'top' ? '▲' : '▼';

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 mb-4">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-2 bg-gray-800 cursor-pointer hover:bg-gray-700"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">{halfLabel}</span>
                    <span className="font-bold text-white">
                        {topBottom === 'top' ? 'Top' : 'Bot'} {inning}
                    </span>
                    <span className="text-gray-400">—</span>
                    <span className="text-gray-300">{teamName}</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">
                        {runs}R, {hits}H
                    </span>
                    <span className="text-gray-500">
                        {expanded ? '−' : '+'}
                    </span>
                </div>
            </div>

            {/* At-bats */}
            {expanded && (
                <div className="divide-y divide-gray-700">
                    {events.length === 0 ? (
                        <div className="p-4 text-gray-500 text-center italic">
                            No at-bats yet
                        </div>
                    ) : (
                        events.map((event, i) => (
                            <AtBatCard
                                key={i}
                                event={event}
                                defaultExpanded={true}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Summary */}
            {expanded && events.length > 0 && (
                <div className="px-4 py-2 bg-gray-800/50 text-gray-400 text-sm text-right italic">
                    {runs} run{runs !== 1 ? 's' : ''}, {hits} hit{hits !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
