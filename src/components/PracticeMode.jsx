/**
 * PracticeMode.jsx
 * Dropdown selector to target a specific mudra for practice.
 */

import React from 'react';
import { MUDRAS } from '../lib/classifier';

export function PracticeMode({ value, onChange }) {
  return (
    <div className="practice-mode">
      <label className="practice-mode-label" htmlFor="practice-select">
        🎯 Practice Mode
      </label>
      <select
        id="practice-select"
        className="practice-mode-select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">— Free exploration —</option>
        {MUDRAS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.meaning})
          </option>
        ))}
      </select>
    </div>
  );
}
