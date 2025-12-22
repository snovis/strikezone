/**
 * Diamond Component - Visual base diamond
 */

import React from 'react';
import type { Bases } from '@strikezone/engine';

interface DiamondProps {
    bases: Bases;
    size?: 'small' | 'medium' | 'large';
}

export default function Diamond({ bases, size = 'medium' }: DiamondProps) {
    const sizeClasses = {
        small: 'w-10 h-10',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    const baseSize = {
        small: 'w-2 h-2',
        medium: 'w-2.5 h-2.5',
        large: 'w-3 h-3'
    };

    return (
        <div className={`${sizeClasses[size]} relative inline-block`}>
            {/* Diamond shape background */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon
                    points="50,10 90,50 50,90 10,50"
                    fill="#1f2937"
                    stroke="#4b5563"
                    strokeWidth="2"
                />
            </svg>

            {/* Base indicators - positioned at corners */}
            {/* Third base - left */}
            <div
                className={`absolute ${baseSize[size]} border-2 border-gray-600 transform rotate-45 ${
                    bases.third ? 'bg-orange-400' : 'bg-gray-700'
                }`}
                style={{ left: '8%', top: '50%', transform: 'translateY(-50%) rotate(45deg)' }}
            />

            {/* Second base - top */}
            <div
                className={`absolute ${baseSize[size]} border-2 border-gray-600 transform rotate-45 ${
                    bases.second ? 'bg-orange-400' : 'bg-gray-700'
                }`}
                style={{ left: '50%', top: '8%', transform: 'translateX(-50%) rotate(45deg)' }}
            />

            {/* First base - right */}
            <div
                className={`absolute ${baseSize[size]} border-2 border-gray-600 transform rotate-45 ${
                    bases.first ? 'bg-orange-400' : 'bg-gray-700'
                }`}
                style={{ right: '8%', top: '50%', transform: 'translateY(-50%) rotate(45deg)' }}
            />
        </div>
    );
}
