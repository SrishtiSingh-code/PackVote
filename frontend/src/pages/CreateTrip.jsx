import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../api/api.js';
import { setStoredName } from '../utils/session.js';
import '../styles/authPage.css';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [tripName, setTripName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await createTrip(name.trim(), tripName.trim());
      setStoredName(data.code, name.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => navigate('/')}>
        ‹ Back home
      </button>

      <div className="card auth-card">
        {!result ? (
          <>
            <span className="eyebrow">Group Travel</span>
            <h1 className="auth-heading">Create a Trip</h1>
            <p className="auth-subtitle">
              Start a trip and invite your group using a unique trip code.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
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

              <div className="auth-field">
                <label className="field-label">Trip name (optional)</label>
                <input
                  className="text-input"
                  type="text"
                  placeholder="e.g. Goa Weekend with Friends"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                />
              </div>

              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create Trip →'}
              </button>
            </form>

            <div className="auth-footer-link">
              Already have a trip code?{' '}
              <button onClick={() => navigate('/join')}>Join an existing trip</button>
            </div>
          </>
        ) : (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h1 className="auth-heading" style={{ fontSize: 26 }}>
              Your trip is ready!
            </h1>
            <p className="auth-subtitle" style={{ margin: '0 auto 8px' }}>
              Share this code with your friends.
            </p>

            <div className="trip-code-box">
              <div className="trip-code-label">Trip code</div>
              <div className="trip-code-value">{result.code}</div>
            </div>

            <div className="auth-success-actions">
              <button className="btn btn-ghost" onClick={handleCopy}>
                {copied ? 'Copied ✓' : 'Copy Code'}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/trip/${result.code}`)}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
