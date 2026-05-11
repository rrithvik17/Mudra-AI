/**
 * useAudio.js
 * Audio feedback for mudra detection:
 *  1. Temple bell chime via Web Audio API (multi-partial synthesis)
 *  2. Voice announcement via Web Speech API — targets a sweet Indian female voice
 */

import { useRef, useState, useCallback, useEffect } from 'react';

// Bell partial frequencies and amplitudes
const BELL_PARTIALS = [
  { freq: 1.0,   amp: 0.50 },
  { freq: 2.76,  amp: 0.28 },
  { freq: 5.40,  amp: 0.14 },
  { freq: 8.93,  amp: 0.08 },
];
const BELL_BASE_HZ  = 432;
const BELL_DURATION = 2.2;

function createBellSound(ctx) {
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.005);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + BELL_DURATION);

  BELL_PARTIALS.forEach(({ freq, amp }) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = BELL_BASE_HZ * freq;
    gain.gain.setValueAtTime(amp, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + BELL_DURATION * 0.85);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + BELL_DURATION);
  });
}

// ── Voice scoring ─────────────────────────────────────────────────────────────

const INDIAN_FEMALE_NAMES = [
  'heera', 'priya', 'aditi', 'raveena', 'veena', 'neerja',
  'female', 'woman', 'girl',
];

function scoreVoice(voice) {
  const name = voice.name.toLowerCase();
  const lang = (voice.lang || '').toLowerCase();
  let score = 0;
  if (lang === 'en-in')            score += 100;
  else if (lang.startsWith('en-in')) score += 90;
  else if (lang === 'hi-in')         score += 40;
  else if (lang.startsWith('en'))    score += 10;
  for (const f of INDIAN_FEMALE_NAMES) {
    if (name.includes(f)) { score += 60; break; }
  }
  if (name.includes('google'))                     score += 15;
  if (name.includes('neural') || name.includes('online')) score += 10;
  return score;
}

function pickBestVoice(voices) {
  if (!voices || voices.length === 0) return null;
  return voices.reduce((best, v) =>
    scoreVoice(v) > scoreVoice(best) ? v : best
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAudio() {
  const ctxRef    = useRef(null);
  const voiceRef  = useRef(null);
  const [muted, setMuted] = useState(false);

  // Load voices — they arrive asynchronously in most browsers
  useEffect(() => {
    if (!window.speechSynthesis) return;

    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;
      const picked = pickBestVoice(voices);
      voiceRef.current = picked;
      console.log(
        '[useAudio] Selected voice:',
        picked ? `${picked.name} (${picked.lang})` : 'system default',
      );
    }

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  const playBell = useCallback(() => {
    if (muted) return;
    try { createBellSound(getCtx()); }
    catch (e) { console.warn('[useAudio] Bell failed:', e); }
  }, [muted]);

  const speakMudra = useCallback((name) => {
    if (muted || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(name);

      if (voiceRef.current) {
        utt.voice = voiceRef.current;
        const lang = voiceRef.current.lang.toLowerCase();
        // Indian English voices sound best with slightly slower, higher pitch
        utt.rate   = lang.startsWith('en-in') ? 0.82 : 0.88;
        utt.pitch  = lang.startsWith('en-in') ? 1.15 : 1.05;
      } else {
        // No specific voice found — nudge pitch up to sound more feminine
        utt.rate  = 0.85;
        utt.pitch = 1.25;
      }
      utt.volume = 0.92;

      // Delay slightly so the bell plays first
      setTimeout(() => window.speechSynthesis.speak(utt), 320);
    } catch (e) {
      console.warn('[useAudio] Speech failed:', e);
    }
  }, [muted]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return { playBell, speakMudra, muted, toggleMute };
}
