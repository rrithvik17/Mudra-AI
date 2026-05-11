/**
 * App.jsx
 * Root component: full-screen webcam with floating HUD overlays.
 * Wires: MediaPipe → classifier → MudraOverlay + TutorialPanel + audio.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useMediaPipe } from './hooks/useMediaPipe';
import { useAudio }     from './hooks/useAudio';
import { classifyMudra, MUDRAS, CONFIDENCE_THRESHOLD } from './lib/classifier';
import { MudraOverlay }   from './components/MudraOverlay';
import { TutorialPanel }  from './components/TutorialPanel';

const ALPHA = 0.3;

export default function App() {
  const [result, setResult] = useState({ mudra: null, confidence: 0, scores: {} });
  const [tutorialMudra, setTutorialMudra] = useState(null);
  const smoothedScores = useRef({});
  const prevMudraId    = useRef(null);

  const { playBell, speakMudra, muted, toggleMute } = useAudio();

  const handleResults = useCallback(({ landmarks }) => {
    const raw = classifyMudra(landmarks, null);

    const smoothed = { ...smoothedScores.current };
    for (const key in raw.scores) {
      const prev = smoothed[key] ?? 0;
      smoothed[key] = prev + ALPHA * (raw.scores[key] - prev);
    }
    smoothedScores.current = smoothed;

    let bestKey = null;
    let bestVal = 0;
    for (const key in smoothed) {
      if (smoothed[key] > bestVal) { bestVal = smoothed[key]; bestKey = key; }
    }

    const detectedMudra =
      bestVal >= CONFIDENCE_THRESHOLD
        ? MUDRAS.find((m) => m.id === bestKey) ?? null
        : null;

    setResult({ mudra: detectedMudra, confidence: bestVal, scores: smoothed });
  }, []);

  // Play bell + speak whenever a NEW mudra is detected
  useEffect(() => {
    const newId = result.mudra?.id ?? null;
    if (newId && newId !== prevMudraId.current) {
      playBell();
      speakMudra(result.mudra.name);
    }
    prevMudraId.current = newId;
  }, [result.mudra?.id, playBell, speakMudra]);

  const { videoRef, canvasRef, status, errorMsg, handCentroid } = useMediaPipe({
    onResults: handleResults,
  });

  return (
    <div className="app-fullscreen">
      <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />
      <canvas ref={canvasRef} className="fullscreen-canvas" />

      {status === 'initializing' && (
        <div className="fullscreen-status">
          <div className="fs-spinner" />
          <p className="fs-status-text">Starting camera…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="fullscreen-status error">
          <span className="fs-error-icon">⚠️</span>
          <p className="fs-status-text">Camera Error</p>
          <p className="fs-error-detail">{errorMsg}</p>
        </div>
      )}

      <MudraOverlay
        mudra={result.mudra}
        confidence={result.confidence}
        handCentroid={handCentroid}
        status={status}
        muted={muted}
        onToggleMute={toggleMute}
        onOpenTutorial={setTutorialMudra}
      />

      <TutorialPanel
        mudra={tutorialMudra}
        onClose={() => setTutorialMudra(null)}
      />
    </div>
  );
}
