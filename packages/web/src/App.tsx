import React, { useState } from 'react';
import {
    speed,
    clearBases,
    advanceRunnersOnHit,
    advanceRunnersOnWalk
} from '@strikezone/engine';

/**
 * Strikezone Web App
 *
 * Placeholder implementation demonstrating the engine integration.
 * TODO: Port full UI from gstrike/CheddarBobV5App.tsx
 */
export default function App() {
    const [result, setResult] = useState<speed.AtBatResult | null>(null);
    const [bases, setBases] = useState(clearBases());
    const [score, setScore] = useState({ runs: 0, hits: 0 });

    const handleAtBat = () => {
        // CPU vs CPU at-bat for demo
        const pitcher = speed.getCPUPitcher();
        const batter = speed.getCPUBatter(1);
        const atBatResult = speed.resolveAtBat(pitcher, batter);

        setResult(atBatResult);

        // Update game state based on outcome
        const outcome = atBatResult.finalOutcome;
        if (speed.isHit(outcome)) {
            const hitType = speed.parseHitType(outcome);
            if (hitType) {
                const advancement = advanceRunnersOnHit(bases, hitType, atBatResult.winnerTier);
                setBases(advancement.bases);
                setScore(prev => ({
                    runs: prev.runs + advancement.runs,
                    hits: prev.hits + 1
                }));
            }
        } else if (outcome === 'BB' || outcome === 'HBP') {
            const advancement = advanceRunnersOnWalk(bases);
            setBases(advancement.bases);
            setScore(prev => ({
                ...prev,
                runs: prev.runs + advancement.runs
            }));
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1rem' }}>Strikezone</h1>
            <p style={{ marginBottom: '2rem', color: '#888' }}>
                Multi-platform baseball simulation engine
            </p>

            <div style={{
                background: '#2a2a4a',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem'
            }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Game State</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <strong>Score:</strong> {score.runs} runs, {score.hits} hits
                    </div>
                    <div>
                        <strong>Bases:</strong>{' '}
                        {bases.first ? '1B ' : ''}
                        {bases.second ? '2B ' : ''}
                        {bases.third ? '3B ' : ''}
                        {!bases.first && !bases.second && !bases.third && 'Empty'}
                    </div>
                </div>
            </div>

            <button
                onClick={handleAtBat}
                style={{
                    background: '#4a4a8a',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                }}
            >
                Simulate At-Bat (CPU vs CPU)
            </button>

            {result && (
                <div style={{
                    background: '#2a2a4a',
                    padding: '1.5rem',
                    borderRadius: '8px'
                }}>
                    <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Last At-Bat</h2>

                    <div style={{ marginBottom: '1rem' }}>
                        <strong>Matchup:</strong>{' '}
                        {result.pitcherApproach} vs {result.batterApproach}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <strong>Battle:</strong>{' '}
                        P: {result.pitcherDice.join('+')}={result.pitcherTotal} vs{' '}
                        B: {result.batterDice.join('+')}={result.batterTotal}
                        {' → '}{result.battleWinner} wins ({result.winnerTier})
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <strong>Result Roll:</strong>{' '}
                        {result.resultDice.join('+')}={result.resultTotal}
                    </div>

                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: speed.isHit(result.finalOutcome) ? '#4a8' :
                               result.finalOutcome === 'BB' ? '#48a' : '#a44'
                    }}>
                        {result.finalOutcome}
                        {result.stretchResult && ` (stretch: ${result.stretchResult})`}
                    </div>
                </div>
            )}

            <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.875rem' }}>
                Mode: Speed Edition (v5) | Engine: @strikezone/engine
            </p>
        </div>
    );
}
