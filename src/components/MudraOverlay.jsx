/**
 * MudraOverlay.jsx
 * Full-screen overlay HUD rendered on top of the webcam canvas.
 *
 *  - Top-left: title + Sanskrit subtitle
 *  - Top-right: mute toggle + live status
 *  - Bottom-left: frosted glass card (clickable → opens tutorial)
 *  - Near hand: floating pill chip with mudra name
 */

import React, { useEffect, useRef, useState } from 'react';

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

export function MudraOverlay({
  mudra,
  confidence,
  handCentroid,
  status,
  muted,
  onToggleMute,
  onOpenTutorial,
}) {
  const [displayedMudra, setDisplayedMudra] = useState(null);
  const [cardVisible,    setCardVisible]    = useState(false);
  const [labelPos,       setLabelPos]       = useState({ x: 0.5, y: 0.3 });
  const posRef = useRef({ x: 0.5, y: 0.3 });

  // Smooth label position
  useEffect(() => {
    if (handCentroid) {
      posRef.current = {
        x: posRef.current.x + 0.25 * (handCentroid.x - posRef.current.x),
        y: posRef.current.y + 0.25 * (handCentroid.y - posRef.current.y),
      };
      setLabelPos({ ...posRef.current });
    }
  }, [handCentroid]);

  // Animate card in/out
  useEffect(() => {
    if (mudra?.id !== displayedMudra?.id) {
      if (mudra) {
        setDisplayedMudra(mudra);
        setCardVisible(true);
      } else {
        setCardVisible(false);
        const t = setTimeout(() => setDisplayedMudra(null), 400);
        return () => clearTimeout(t);
      }
    }
  }, [mudra]);

  const emoji = displayedMudra ? (MUDRA_EMOJI[displayedMudra.id] ?? '🪷') : null;

  return (
    <div className="hud-root">
      {/* ── Top-left title ─────────────────────────────── */}
      <div className="hud-title-block">
        <span className="hud-title-en">kuchipudi mudras</span>
        <span className="hud-title-sa">కుచిపూడి మూద్రాః</span>
      </div>

      {/* ── Top-right controls ─────────────────────────── */}
      <div className="hud-controls">
        {/* Mute / unmute button */}
        <button
          className={`hud-ctrl-btn ${muted ? 'muted' : ''}`}
          onClick={onToggleMute}
          title={muted ? 'Unmute audio' : 'Mute audio'}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔔'}
        </button>

        {/* Live status pill */}
        <div className="hud-status">
          {status === 'ready' ? (
            <>
              <span className="hud-live-dot live" />
              <span className="hud-live-text">Live</span>
            </>
          ) : status === 'initializing' ? (
            <>
              <span className="hud-live-dot" />
              <span className="hud-live-text">Starting…</span>
            </>
          ) : (
            <>
              <span className="hud-live-dot err" />
              <span className="hud-live-text">Error</span>
            </>
          )}
        </div>
      </div>

      {/* ── Floating hand label ────────────────────────── */}
      {displayedMudra && handCentroid && (
        <div
          className={`hud-hand-label ${cardVisible ? 'visible' : ''}`}
          style={{
            left: `${labelPos.x * 100}%`,
            top:  `${Math.max(0.08, labelPos.y - 0.12) * 100}%`,
          }}
        >
          {displayedMudra.name.toLowerCase()}
          {displayedMudra.telugu && (
            <span className="hud-hand-label-script"> {displayedMudra.telugu}</span>
          )}
        </div>
      )}

      {/* ── Bottom-left mudra card (click → tutorial) ──── */}
      <div
        className={`hud-card ${cardVisible ? 'visible' : ''} ${displayedMudra ? 'clickable' : ''}`}
        onClick={() => displayedMudra && onOpenTutorial(displayedMudra)}
        role={displayedMudra ? 'button' : undefined}
        tabIndex={displayedMudra ? 0 : undefined}
        title={displayedMudra ? 'Click for full tutorial' : undefined}
      >
        <div className="hud-card-top-row">
          <div className="hud-card-tag">current mudra</div>
          {displayedMudra && (
            <span className="hud-card-info-icon" title="Learn more">ⓘ</span>
          )}
        </div>

        <h2 className="hud-card-name" style={{ color: displayedMudra?.color }}>
          {displayedMudra?.name ?? '—'}
        </h2>

        {displayedMudra && (
          <div className="hud-card-scripts">
            <span className="hud-card-deva">{displayedMudra.devanagari}</span>
            <span className="hud-card-sep">·</span>
            <span className="hud-card-tel">{displayedMudra.telugu}</span>
          </div>
        )}

        <div className="hud-card-emoji-row">
          <span className="hud-card-emoji">{emoji ?? '🪷'}</span>
        </div>

        {displayedMudra && (
          <div
            className="hud-card-rasa"
            style={{ color: displayedMudra.color }}
          >
            🎭 {displayedMudra.navarasa}
          </div>
        )}

        <p className="hud-card-desc">
          {displayedMudra
            ? displayedMudra.rasaDesc
            : 'Show a hand mudra to the camera'}
        </p>

        {displayedMudra && (
          <div className="hud-card-cta">tap for full tutorial →</div>
        )}

        {/* Confidence bar */}
        <div className="hud-card-bar-track">
          <div
            className="hud-card-bar-fill"
            style={{
              width: `${Math.round(confidence * 100)}%`,
              background: displayedMudra?.color ?? '#f5c842',
            }}
          />
        </div>
      </div>
    </div>
  );
}
