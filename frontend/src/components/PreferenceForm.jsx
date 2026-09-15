import { useState } from 'react';
import {
  BUDGET_OPTIONS,
  DURATION_OPTIONS,
  STYLE_OPTIONS,
  CLIMATE_OPTIONS,
  ACCOMMODATION_OPTIONS,
  ACTIVITY_OPTIONS,
} from '../data/preferenceOptions.js';
import './PreferenceForm.css';

const emptyPreferences = {
  budget: '',
  duration: '',
  travelStyles: [],
  climate: '',
  accommodation: '',
  activities: [],
  additionalNotes: '',
};

export default function PreferenceForm({ onSubmit, submitting }) {
  const [prefs, setPrefs] = useState(emptyPreferences);
  const [error, setError] = useState('');

  const setSingle = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));

  const toggleMulti = (key, value) => {
    setPrefs((p) => {
      const has = p[key].includes(value);
      return {
        ...p,
        [key]: has ? p[key].filter((v) => v !== value) : [...p[key], value],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prefs.budget || !prefs.duration || !prefs.climate || !prefs.accommodation) {
      setError('Please fill in budget, duration, climate and accommodation.');
      return;
    }
    if (prefs.travelStyles.length === 0 || prefs.activities.length === 0) {
      setError('Please select at least one travel style and one activity.');
      return;
    }
    setError('');
    onSubmit(prefs);
  };

  return (
    <form className="pref-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}

      <PrefGroup label="Budget">
        <ChipRow options={BUDGET_OPTIONS} selected={[prefs.budget]} onToggle={(v) => setSingle('budget', v)} />
      </PrefGroup>

      <PrefGroup label="Trip duration">
        <ChipRow options={DURATION_OPTIONS} selected={[prefs.duration]} onToggle={(v) => setSingle('duration', v)} />
      </PrefGroup>

      <PrefGroup label="Travel style" hint="Select all that apply">
        <ChipRow options={STYLE_OPTIONS} selected={prefs.travelStyles} onToggle={(v) => toggleMulti('travelStyles', v)} multi />
      </PrefGroup>

      <PrefGroup label="Preferred climate">
        <ChipRow options={CLIMATE_OPTIONS} selected={[prefs.climate]} onToggle={(v) => setSingle('climate', v)} />
      </PrefGroup>

      <PrefGroup label="Accommodation">
        <ChipRow options={ACCOMMODATION_OPTIONS} selected={[prefs.accommodation]} onToggle={(v) => setSingle('accommodation', v)} />
      </PrefGroup>

      <PrefGroup label="Activities" hint="Select all that apply">
        <ChipRow options={ACTIVITY_OPTIONS} selected={prefs.activities} onToggle={(v) => toggleMulti('activities', v)} multi />
      </PrefGroup>

      <PrefGroup label="Additional preference">
        <textarea
          className="text-input pref-textarea"
          placeholder="Anything else you want from this trip?"
          value={prefs.additionalNotes}
          onChange={(e) => setSingle('additionalNotes', e.target.value)}
        />
      </PrefGroup>

      <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Preferences →'}
      </button>
    </form>
  );
}

function PrefGroup({ label, hint, children }) {
  return (
    <div className="pref-group">
      <div className="pref-group-header">
        <span className="field-label" style={{ marginBottom: 0 }}>
          {label}
        </span>
        {hint && <span className="pref-hint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ChipRow({ options, selected, onToggle }) {
  return (
    <div className="chip-row">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          className={`chip ${selected.includes(opt.value) ? 'chip-active' : ''}`}
          onClick={() => onToggle(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
