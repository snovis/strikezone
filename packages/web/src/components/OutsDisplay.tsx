/**
 * OutsDisplay Component - Visual outs indicator
 */

import React from 'react';

interface OutsDisplayProps {
    outs: number;
    size?: 'small' | 'medium' | 'large';
}

export default function OutsDisplay({ outs, size = 'medium' }: OutsDisplayProps) {
    const sizeClasses = {
        small: 'w-2.5 h-2.5',
        medium: 'w-3 h-3',
        large: 'w-4 h-4'
    };

    const gapClasses = {
        small: 'gap-0.5',
        medium: 'gap-1',
        large: 'gap-1.5'
    };

    return (
        <div className={`flex justify-center ${gapClasses[size]}`}>
            {[0, 1].map((i) => (
                <div
                    key={i}
                    className={`${sizeClasses[size]} rounded-full border-2 border-gray-600 ${
                        i < outs ? 'bg-red-600' : 'bg-gray-800'
                    }`}
                />
            ))}
        </div>
    );
}
