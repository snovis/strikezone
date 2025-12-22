/**
 * SelectionPanel Component - Player input UI
 */

import React from 'react';
import { speed } from '@strikezone/engine';

type PlayerType = 'pitcher' | 'batter';

interface SelectionPanelProps {
    playerType: PlayerType;
    approach: speed.PitcherApproach | speed.BatterApproach | null;
    location: speed.Location | null;
    onApproachChange: (approach: speed.PitcherApproach | speed.BatterApproach) => void;
    onLocationChange: (location: speed.Location) => void;
    isCPU: boolean;
    onCPUToggle: () => void;
    isLocked: boolean;
    onLockIn?: () => void;
    disabled?: boolean;
}

const PITCHER_APPROACHES: { value: speed.PitcherApproach; label: string; icon: string }[] = [
    { value: 'fastball', label: 'FB', icon: '🔥' },
    { value: 'curveball', label: 'CB', icon: '🌀' },
    { value: 'changeup', label: 'CH', icon: '🔄' }
];

const BATTER_APPROACHES: { value: speed.BatterApproach; label: string; icon: string }[] = [
    { value: 'power', label: 'PWR', icon: '💪' },
    { value: 'control', label: 'CTRL', icon: '🎯' },
    { value: 'contact', label: 'CNT', icon: '✋' }
];

const LOCATIONS: { value: speed.Location; label: string }[] = [
    { value: 'up', label: '↑' },
    { value: 'down', label: '↓' },
    { value: 'in', label: '←' },
    { value: 'out', label: '→' }
];

export default function SelectionPanel({
    playerType,
    approach,
    location,
    onApproachChange,
    onLocationChange,
    isCPU,
    onCPUToggle,
    isLocked,
    onLockIn,
    disabled = false
}: SelectionPanelProps) {
    const approaches = playerType === 'pitcher' ? PITCHER_APPROACHES : BATTER_APPROACHES;
    const title = playerType === 'pitcher' ? 'PITCHER' : 'BATTER';
    const accentColor = playerType === 'pitcher' ? 'blue' : 'green';

    const isDisabled = disabled || isLocked || isCPU;

    return (
        <div className={`bg-gray-800 rounded-lg p-4 border-2 ${
            isLocked ? 'border-yellow-500/50' :
            isCPU ? 'border-purple-500/50' :
            `border-${accentColor}-500/30`
        }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className={`font-bold text-${accentColor}-400`}>{title}</h3>
                <button
                    onClick={onCPUToggle}
                    className={`text-xs px-2 py-1 rounded ${
                        isCPU
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                >
                    {isCPU ? '🤖 CPU' : '👤 Human'}
                </button>
            </div>

            {/* CPU indicator */}
            {isCPU && (
                <div className="text-center py-4 text-purple-400">
                    <div className="text-2xl mb-1">🤖</div>
                    <div className="text-sm">CPU will select</div>
                </div>
            )}

            {/* Human selection controls */}
            {!isCPU && (
                <>
                    {/* Approach buttons */}
                    <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Approach</div>
                        <div className="flex gap-1">
                            {approaches.map(({ value, label, icon }) => (
                                <button
                                    key={value}
                                    onClick={() => onApproachChange(value as speed.PitcherApproach | speed.BatterApproach)}
                                    disabled={isDisabled}
                                    className={`flex-1 py-2 rounded text-sm font-bold transition-colors ${
                                        approach === value
                                            ? `bg-${accentColor}-600 text-white`
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {icon} {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location buttons */}
                    <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Direction</div>
                        <div className="flex gap-1">
                            {LOCATIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => onLocationChange(value)}
                                    disabled={isDisabled}
                                    className={`flex-1 py-3 rounded text-xl font-bold transition-colors ${
                                        location === value
                                            ? `bg-${accentColor}-600 text-white`
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lock-in button (pitcher only in sequential mode) */}
                    {onLockIn && playerType === 'pitcher' && (
                        <button
                            onClick={onLockIn}
                            disabled={!approach || !location || isLocked}
                            className={`w-full py-2 rounded font-bold transition-colors ${
                                isLocked
                                    ? 'bg-yellow-600 text-white cursor-not-allowed'
                                    : approach && location
                                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isLocked ? '🔒 LOCKED IN' : '🔓 LOCK IN'}
                        </button>
                    )}
                </>
            )}

            {/* Locked indicator */}
            {isLocked && !isCPU && (
                <div className="text-center py-2 text-yellow-400">
                    <div className="text-lg">
                        {approaches.find(a => a.value === approach)?.icon} {speed.getArrowSymbol(location!)}
                    </div>
                    <div className="text-xs mt-1">Selection locked</div>
                </div>
            )}
        </div>
    );
}
