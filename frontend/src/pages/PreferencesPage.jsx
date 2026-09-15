import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PreferenceForm from '../components/PreferenceForm.jsx';
import { getTrip, submitPreferences } from '../api/api.js';
import { getStoredName, setStoredName } from '../utils/session.js';
import '../styles/authPage.css';

export default function PreferencesPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState(getStoredName(code));
  const [nameConfirmed, setNameConfirmed] = useState(Boolean(getStoredName(code)));
  const [trip, setTrip] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getTrip(code)
      .then(setTrip)
      .catch((err) => setError(err.message));
  }, [code]);

  const handleConfirmName = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStoredName(code, name.trim());
    setNameConfirmed(true);
  };

  const handleSubmit = async (preferences) => {
    setSubmitting(true);
    setError('');
    try {
      await submitPreferences(code, name.trim(), preferences);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !trip) {
    return (
      <div className="auth-page">
        <div className="card auth-card">
          <div className="auth-error">{error}</div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/join')}>
            Try another code
          </button>
        </div>
      </div>
    );
  }

  if (!nameConfirmed) {
    return (
      <div className="auth-page">
        <button className="auth-back" onClick={() => navigate('/')}>
          ‹ Back home
        </button>
        <div className="card auth-card">
          <span className="eyebrow">Group Travel</span>
          <h1 className="auth-heading">Who are you?</h1>
          <p className="auth-subtitle">Confirm your name to fill in your preferences for this trip.</p>
          <form onSubmit={handleConfirmName}>
            <div className="auth-field">
              <label className="field-label">Your name</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              Continue →
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="card auth-card auth-success">
          <div className="auth-success-icon">✓</div>
          <h1 className="auth-heading" style={{ fontSize: 24 }}>
            Preferences submitted ✓
          </h1>
          <p className="auth-subtitle" style={{ margin: '0 auto 24px' }}>
            Waiting for the rest of your group…
          </p>
          <button className="btn btn-primary btn-block" onClick={() => navigate(`/trip/${code}`)}>
            Go to Trip Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => navigate(`/trip/${code}`)}>
        ‹ Trip room
      </button>
      <div className="card auth-card" style={{ maxWidth: 620 }}>
        <span className="eyebrow">Group Travel</span>
        <h1 className="auth-heading">Hi {name} 👋</h1>
        <p className="auth-subtitle">Tell us what kind of trip you want.</p>

        {error && <div className="auth-error">{error}</div>}

        <PreferenceForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
