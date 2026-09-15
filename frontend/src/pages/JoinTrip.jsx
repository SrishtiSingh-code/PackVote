import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinTrip } from '../api/api.js';
import { setStoredName } from '../utils/session.js';
import '../styles/authPage.css';

export default function JoinTrip() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Please enter your name and the trip code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await joinTrip(name.trim(), code.trim().toUpperCase());
      setStoredName(data.code, name.trim());
      navigate(`/trip/${data.code}/preferences`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => navigate('/')}>
        ‹ Back home
      </button>

      <div className="card auth-card">
        <span className="eyebrow">Group Travel</span>
        <h1 className="auth-heading">Join a Trip</h1>
        <p className="auth-subtitle">Enter your name and the trip code your friend shared with you.</p>

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
            <label className="field-label">Trip code</label>
            <input
              className="text-input"
              type="text"
              placeholder="Enter trip code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{ letterSpacing: '0.12em', fontWeight: 700 }}
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Joining…' : 'Join Trip →'}
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have a code yet? <button onClick={() => navigate('/create')}>Create a trip</button>
        </div>
      </div>
    </div>
  );
}
