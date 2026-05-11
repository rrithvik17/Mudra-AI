/**
 * TutorialPanel.jsx
 * Slide-in educational panel (right side) for a selected mudra.
 * Shows: names in 3 scripts, navarasa emotion, Kuchipudi usage, finger guide steps.
 */

import React, { useEffect, useState } from 'react';

const MUDRA_EMOJI = {
  pataka:       '🚩',
  tripataka:    '✌️',
  ardhachandra: '🌙',
  katakamukha:  '💍',
  alapadma:     '🌸',
  chandrakala:  '🌛',
  mrigashirsha: '🦌',
  hamsasya:     '🦢',
};

// Navarasa colour accents
const RASA_COLORS = {
  'Vīra · Raudra':      '#f59e0b',
  'Shringāra · Vīra':   '#ec4899',
  'Shānta · Adbhuta':   '#6366f1',
  'Shringāra':          '#f43f5e',
  'Adbhuta · Shringāra':'#f43f5e',
  'Shānta · Karuna':    '#8b5cf6',
  'Hasya · Bhayanaka':  '#d97706',
  'Shringāra · Adbhuta':'#0ea5e9',
};

export function TutorialPanel({ mudra, onClose }) {
  const [mounted, setMounted]   = useState(false);
  const [visible, setVisible]   = useState(false);

  // Mount first, then animate in
  useEffect(() => {
    if (mudra) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(t);
    }
  }, [mudra]);

  if (!mounted) return null;

  const emoji      = MUDRA_EMOJI[mudra.id] ?? '🪷';
  const rasaColor  = RASA_COLORS[mudra.navarasa] ?? mudra.color;

  return (
    <>
      {/* Scrim */}
      <div
        className={`tutorial-scrim ${visible ? 'visible' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`tutorial-panel ${visible ? 'visible' : ''}`}>
        {/* Close button */}
        <button className="tutorial-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Header */}
        <div className="tutorial-header">
          <span className="tutorial-emoji">{emoji}</span>
          <div className="tutorial-names">
            <h2 className="tutorial-name-en" style={{ color: mudra.color }}>
              {mudra.name}
            </h2>
            <div className="tutorial-name-scripts">
              <span className="tutorial-name-deva">{mudra.devanagari}</span>
              <span className="tutorial-name-sep">·</span>
              <span className="tutorial-name-tel">{mudra.telugu}</span>
            </div>
            <p className="tutorial-meaning">"{mudra.meaning}"</p>
          </div>
        </div>

        {/* Navarasa chip */}
        <div
          className="tutorial-rasa-chip"
          style={{ borderColor: rasaColor, color: rasaColor }}
        >
          <span className="tutorial-rasa-icon">🎭</span>
          <div>
            <div className="tutorial-rasa-label">Navarasa</div>
            <div className="tutorial-rasa-name">{mudra.navarasa}</div>
            <div className="tutorial-rasa-desc">{mudra.rasaDesc}</div>
          </div>
        </div>

        {/* Kuchipudi usage */}
        <div className="tutorial-section">
          <div className="tutorial-section-title">
            <span>💃</span> Kuchipudi Usage
          </div>
          <p className="tutorial-section-body">{mudra.usage}</p>
        </div>

        {/* Finger formation guide */}
        <div className="tutorial-section">
          <div className="tutorial-section-title">
            <span>👆</span> How to Form It
          </div>
          <ol className="tutorial-steps">
            {mudra.fingerGuide.map((step, i) => (
              <li key={i} className="tutorial-step">
                <span
                  className="tutorial-step-num"
                  style={{ background: mudra.color }}
                >
                  {i + 1}
                </span>
                <span className="tutorial-step-text">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer hint */}
        <div className="tutorial-footer-hint">
          <span>💡</span>
          <span>{mudra.hint}</span>
        </div>
      </div>
    </>
  );
}
