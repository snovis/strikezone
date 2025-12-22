/**
 * Linescore Component - Box score table
 */

import React from 'react';
import type { speed } from '@strikezone/engine';

interface LinescoreProps {
    events: speed.SpeedGameEvent[];
    awayName?: string;
    homeName?: string;
    currentInning: number;
    currentHalf: 'top' | 'bottom';
    awayScore: number;
    homeScore: number;
    awayHits: number;
    homeHits: number;
}

export default function Linescore({
    events,
    awayName = 'AWAY',
    homeName = 'HOME',
    currentInning,
    currentHalf,
    awayScore,
    homeScore,
    awayHits,
    homeHits
}: LinescoreProps) {
    // Calculate runs per inning from events
    const inningRuns: Record<number, { away: number | '-'; home: number | '-' }> = {};

    // Initialize all innings up to current
    for (let i = 1; i <= currentInning; i++) {
        inningRuns[i] = { away: 0, home: '-' };
        if (i < currentInning || currentHalf === 'bottom') {
            inningRuns[i].home = 0;
        }
    }

    // Sum up runs from events
    for (const event of events) {
        const inn = event.inning;
        if (!inningRuns[inn]) {
            inningRuns[inn] = { away: 0, home: 0 };
        }
        if (event.topBottom === 'top') {
            inningRuns[inn].away = (typeof inningRuns[inn].away === 'number' ? inningRuns[inn].away : 0) + event.runsScored;
        } else {
            inningRuns[inn].home = (typeof inningRuns[inn].home === 'number' ? inningRuns[inn].home : 0) + event.runsScored;
        }
    }

    const innings = Object.keys(inningRuns).map(Number).sort((a, b) => a - b);

    return (
        <div className="overflow-x-auto">
            <table className="border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-800">
                        <th className="px-3 py-2 text-left font-bold text-gray-300 border border-gray-700">
                            Team
                        </th>
                        {innings.map(inn => (
                            <th
                                key={inn}
                                className={`px-3 py-2 text-center font-bold border border-gray-700 ${
                                    inn === currentInning ? 'bg-blue-900/30 text-blue-300' : 'text-gray-400'
                                }`}
                            >
                                {inn}
                            </th>
                        ))}
                        <th className="px-3 py-2 text-center font-bold text-white bg-gray-700 border border-gray-600">
                            R
                        </th>
                        <th className="px-3 py-2 text-center font-bold text-white bg-gray-700 border border-gray-600">
                            H
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* Away row */}
                    <tr className="bg-gray-900">
                        <td className="px-3 py-2 font-bold text-gray-300 border border-gray-700">
                            {awayName}
                        </td>
                        {innings.map(inn => (
                            <td
                                key={inn}
                                className={`px-3 py-2 text-center border border-gray-700 ${
                                    inn === currentInning && currentHalf === 'top'
                                        ? 'bg-blue-900/20 text-blue-300'
                                        : 'text-gray-400'
                                }`}
                            >
                                {inningRuns[inn].away}
                            </td>
                        ))}
                        <td className="px-3 py-2 text-center font-bold text-white bg-gray-800 border border-gray-600">
                            {awayScore}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-gray-300 bg-gray-800 border border-gray-600">
                            {awayHits}
                        </td>
                    </tr>

                    {/* Home row */}
                    <tr className="bg-gray-900">
                        <td className="px-3 py-2 font-bold text-gray-300 border border-gray-700">
                            {homeName}
                        </td>
                        {innings.map(inn => (
                            <td
                                key={inn}
                                className={`px-3 py-2 text-center border border-gray-700 ${
                                    inn === currentInning && currentHalf === 'bottom'
                                        ? 'bg-blue-900/20 text-blue-300'
                                        : 'text-gray-400'
                                }`}
                            >
                                {inningRuns[inn].home}
                            </td>
                        ))}
                        <td className="px-3 py-2 text-center font-bold text-white bg-gray-800 border border-gray-600">
                            {homeScore}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-gray-300 bg-gray-800 border border-gray-600">
                            {homeHits}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
