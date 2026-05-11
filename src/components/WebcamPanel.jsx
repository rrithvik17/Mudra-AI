/**
 * WebcamPanel.jsx
 * Left panel: shows live mirrored webcam feed with MediaPipe skeleton overlay.
 */

import React from 'react';

export function WebcamPanel({ videoRef, canvasRef, status, errorMsg }) {
  return (
    <div className="webcam-panel">
      <div className="webcam-wrapper">
        {/* Hidden video element used as MediaPipe input source */}
        <video
          ref={videoRef}
          className="webcam-video"
          autoPlay
          muted
          playsInline
          style={{ display: 'none' }}
        />

        {/* Canvas renders mirrored feed + skeleton */}
        <canvas ref={canvasRef} className="webcam-canvas" />

        {/* Status overlays */}
        {status === 'initializing' && (
          <div className="webcam-overlay">
            <div className="spinner" />
            <p>Starting camera…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="webcam-overlay error">
            <div className="error-icon">⚠️</div>
            <p>Camera Error</p>
            <p className="error-detail">{errorMsg}</p>
          </div>
        )}
      </div>

      <div className="webcam-label">
        <span className={`live-dot ${status === 'ready' ? 'live' : ''}`} />
        {status === 'ready' ? 'Live' : 'Waiting'}
      </div>
    </div>
  );
}
