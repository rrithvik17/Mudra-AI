/**
 * ResultPanel.jsx
 * Right panel: shows detected mudra image, name, confidence bar, and hint text.
 * Green border when valid mudra detected, red border otherwise.
 */

import React, { useEffect, useState } from 'react';
import { ConfidenceBar } from './ConfidenceBar';
import { MUDRAS } from '../lib/classifier';

export function ResultPanel({ mudra, confidence, scores, practiceTarget }) {
  const isValid = !!mudra;
  const accentColor = mudra?.color ?? '#ef4444';
  const borderColor = isValid ? '#22c55e' : '#ef4444';

  // Smooth image transition
  const [displayedMudra, setDisplayedMudra] = useState(null);
  const [imageOpacity, setImageOpacity] = useState(1);

  useEffect(() => {
    if (mudra?.id !== displayedMudra?.id) {
      setImageOpacity(0);
      const t = setTimeout(() => {
        setDisplayedMudra(mudra);
        setImageOpacity(1);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [mudra]);

  const imageSrc = displayedMudra
    ? `/mudra-images/${displayedMudra.id}.png`
    : '/mudra-images/no_mudra.png';

  const mudraName = displayedMudra?.name ?? 'No Mudra Detected';
  const mudraMeaning = displayedMudra?.meaning;
  const hint = mudra ? mudra.hint : 'Show your hand clearly to the camera';

  // Practice target highlight
  const targetMudra = practiceTarget
    ? MUDRAS.find((m) => m.id === practiceTarget)
    : null;

  return (
    <div
      className={`result-panel ${isValid ? 'result-valid' : 'result-invalid'}`}
      style={{ '--border-color': borderColor, '--accent-color': accentColor }}
    >
      {/* Practice mode banner */}
      {targetMudra && (
        <div className="practice-banner">
          <span className="practice-icon">🎯</span>
          Practice: <strong>{targetMudra.name}</strong>
          {mudra?.id === practiceTarget && (
            <span className="practice-success"> ✓ Matched!</span>
          )}
        </div>
      )}

      {/* Mudra image */}
      <div className="mudra-image-frame">
        <div
          className="mudra-image-glow"
          style={{ background: isValid ? `${accentColor}22` : 'transparent' }}
        />
        <img
          src={imageSrc}
          alt={mudraName}
          className="mudra-image"
          style={{
            opacity: imageOpacity,
            transition: 'opacity 0.2s ease',
            filter: isValid ? 'none' : 'grayscale(0.6) opacity(0.6)',
          }}
          onError={(e) => {
            e.target.src = '/mudra-images/no_mudra.png';
          }}
        />
        <div
          className="mudra-image-border"
          style={{ borderColor }}
        />
      </div>

      {/* Mudra name + meaning */}
      <div className="mudra-name-block">
        <h2
          className={`mudra-name ${isValid ? 'mudra-name-active' : ''}`}
          style={{ color: isValid ? accentColor : '#9ca3af' }}
        >
          {mudraName}
        </h2>
        {mudraMeaning && (
          <p className="mudra-meaning">"{mudraMeaning}"</p>
        )}
      </div>

      {/* Confidence bar */}
      <ConfidenceBar confidence={confidence} color={isValid ? accentColor : '#ef4444'} />

      {/* Hint text */}
      <div className={`hint-box ${isValid ? 'hint-valid' : 'hint-invalid'}`}>
        <span className="hint-icon">{isValid ? '✨' : '💡'}</span>
        <span className="hint-text">{hint}</span>
      </div>

      {/* Score breakdown (mini) */}
      {scores && Object.keys(scores).length > 0 && (
        <div className="score-grid">
          {MUDRAS.map((m) => (
            <div
              key={m.id}
              className={`score-chip ${mudra?.id === m.id ? 'score-chip-active' : ''}`}
              style={mudra?.id === m.id ? { borderColor: m.color, color: m.color } : {}}
            >
              <span className="score-chip-name">{m.name}</span>
              <span className="score-chip-val">
                {Math.round((scores[m.id] ?? 0) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
