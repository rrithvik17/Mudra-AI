/**
 * ConfidenceBar.jsx
 * Animated horizontal bar visualizing the confidence score (0-1).
 */

import React from 'react';

export function ConfidenceBar({ confidence, color }) {
  const pct = Math.round(confidence * 100);

  return (
    <div className="confidence-bar-container">
      <div className="confidence-bar-header">
        <span className="confidence-label">Confidence</span>
        <span className="confidence-pct" style={{ color }}>{pct}%</span>
      </div>
      <div className="confidence-bar-track">
        <div
          className="confidence-bar-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: pct > 70 ? `0 0 12px ${color}88` : 'none',
          }}
        />
        <div className="confidence-bar-threshold" style={{ left: '70%' }} />
      </div>
      <div className="confidence-bar-footer">
        <span>0</span>
        <span className="threshold-label">70% threshold</span>
        <span>100</span>
      </div>
    </div>
  );
}
