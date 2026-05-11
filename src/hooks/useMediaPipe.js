/**
 * useMediaPipe.js
 * Custom hook that sets up webcam + MediaPipe Hands and delivers
 * live landmark data on each frame.
 *
 * MediaPipe is loaded via CDN script tags to avoid ESM/CJS conflicts with Vite.
 * Now also exposes hand centroid for the floating label overlay.
 */

import { useEffect, useRef, useState } from 'react';

// CDN URLs for MediaPipe bundles (UMD builds work reliably in browser)
const MEDIAPIPE_HANDS_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
const MEDIAPIPE_DRAWING_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });
}

export function useMediaPipe({ onResults }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const animRef = useRef(null);
  const cancelledRef = useRef(false);

  const [status, setStatus] = useState('initializing');
  const [errorMsg, setErrorMsg] = useState('');
  // Normalised [0,1] centroid of detected hand (for floating label placement)
  const [handCentroid, setHandCentroid] = useState(null);

  const onResultsRef = useRef(onResults);
  useEffect(() => { onResultsRef.current = onResults; }, [onResults]);

  useEffect(() => {
    cancelledRef.current = false;

    async function setup() {
      try {
        await loadScript(MEDIAPIPE_DRAWING_CDN);
        await loadScript(MEDIAPIPE_HANDS_CDN);

        if (cancelledRef.current) return;

        const Hands = window.Hands;
        const drawConnectors = window.drawConnectors;
        const drawLandmarks = window.drawLandmarks;
        const HAND_CONNECTIONS = window.HAND_CONNECTIONS;

        if (!Hands) throw new Error('MediaPipe Hands failed to load from CDN');

        const hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results) => {
          if (cancelledRef.current) return;

          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (!canvas || !video) return;

          const ctx = canvas.getContext('2d');
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 480;
          canvas.width = w;
          canvas.height = h;

          // Mirror the entire drawing
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-w, 0);

          // Draw video frame
          ctx.drawImage(video, 0, 0, w, h);

          let landmarks = null;

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            landmarks = results.multiHandLandmarks[0];

            // Draw connectors — white translucent lines like in the screenshot
            if (drawConnectors && HAND_CONNECTIONS) {
              drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                color: 'rgba(255, 255, 255, 0.55)',
                lineWidth: 1.5,
              });
            }

            // Draw landmarks — glowing white dots
            if (drawLandmarks) {
              drawLandmarks(ctx, landmarks, {
                color: 'rgba(255, 255, 255, 0.95)',
                fillColor: 'rgba(255, 255, 255, 0.20)',
                lineWidth: 1,
                radius: 3,
              });
            }

            // Compute centroid of all 21 landmarks (in normalised [0,1])
            // Note: landmarks x is in MediaPipe space (unmirrored), we mirror display-side
            let cx = 0, cy = 0;
            for (const lm of landmarks) { cx += lm.x; cy += lm.y; }
            cx /= landmarks.length;
            cy /= landmarks.length;
            // Mirror x to match canvas mirror transform
            setHandCentroid({ x: 1 - cx, y: cy });
          } else {
            setHandCentroid(null);
          }

          ctx.restore();

          onResultsRef.current({ landmarks });
        });

        handsRef.current = hands;

        // Get webcam stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });

        if (cancelledRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();

        if (!cancelledRef.current) setStatus('ready');

        // rAF processing loop
        async function processFrame() {
          if (cancelledRef.current) return;
          if (video.readyState >= 2 && handsRef.current) {
            try {
              await handsRef.current.send({ image: video });
            } catch (_) {
              // silently swallow transient frame errors
            }
          }
          animRef.current = requestAnimationFrame(processFrame);
        }

        processFrame();

      } catch (err) {
        if (!cancelledRef.current) {
          setStatus('error');
          setErrorMsg(err.message || 'Webcam or MediaPipe error');
          console.error('[useMediaPipe] Setup error:', err);
        }
      }
    }

    setup();

    return () => {
      cancelledRef.current = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (handsRef.current) {
        try { handsRef.current.close(); } catch (_) {}
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { videoRef, canvasRef, status, errorMsg, handCentroid };
}
