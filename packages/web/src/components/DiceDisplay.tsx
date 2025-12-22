/**
 * DiceDisplay Component - Styled dice roll display
 */

import React from 'react';

interface DiceDisplayProps {
    dice: [number, number];
    total?: number;
    modifier?: number;
    showTotal?: boolean;
    size?: 'small' | 'medium';
    highlight?: boolean;
}

export default function DiceDisplay({
    dice,
    total,
    modifier,
    showTotal = true,
    size = 'medium',
    highlight = false
}: DiceDisplayProps) {
    const calculatedTotal = total ?? (dice[0] + dice[1] + (modifier ?? 0));

    const isSnakeEyes = dice[0] === 1 && dice[1] === 1;
    const isBoxcars = dice[0] === 6 && dice[1] === 6;

    const diceClasses = size === 'small'
        ? 'px-1.5 py-0.5 text-xs'
        : 'px-2 py-1 text-sm';

    return (
        <span className="inline-flex items-center gap-1 font-mono">
            {/* Dice values */}
            <span
                className={`bg-white text-gray-900 rounded border border-gray-400 ${diceClasses} ${
                    isSnakeEyes ? 'ring-2 ring-red-500' : isBoxcars ? 'ring-2 ring-yellow-500' : ''
                }`}
            >
                [{dice[0]},{dice[1]}]
            </span>

            {/* Modifier */}
            {modifier !== undefined && modifier !== 0 && (
                <>
                    <span className="text-gray-500">+</span>
                    <span className={`font-bold ${modifier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {modifier > 0 ? '+' : ''}{modifier}
                    </span>
                </>
            )}

            {/* Total */}
            {showTotal && (
                <>
                    <span className="text-gray-500">=</span>
                    <span className={`font-bold ${highlight ? 'text-yellow-400 text-lg' : 'text-white'}`}>
                        {calculatedTotal}
                    </span>
                </>
            )}
        </span>
    );
}
