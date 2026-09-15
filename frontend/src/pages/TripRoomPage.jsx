import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ParticipantList from '../components/ParticipantList.jsx';
import { getTrip, generateRecommendation } from '../api/api.js';
import { getStoredName } from '../utils/session.js';
import '../components/TripRoom.css';

const POLL_MS = 4000;

export default function TripRoomPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const myName = getStoredName(code);
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => {
    getTrip(code)
      .then((data) => {
        setTrip(data);
        if (data.recommendation) {
          navigate(`/trip/${code}/result`, { replace: true });
        }
      })
      .catch((err) => setError(err.message));
  }, [code, navigate]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      await generateRecommendation(code, myName || trip.creatorName);
      navigate(`/trip/${code}/result`);
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (error && !trip) {
    return (
      <div className="trip-room-page">
        <div className="card trip-room-card">
          <div className="auth-error">{error}</div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/join')}>
            Try another code
          </button>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const isCreator = myName && myName.toLowerCase() === trip.creatorName.toLowerCase();
  const allSubmitted = trip.submittedCount === trip.totalCount;
  const myEntry = trip.participants.find((p) => p.name.toLowerCase() === (myName || '').toLowerCase());

  return (
    <div className="trip-room-page">
      <div className="card trip-room-card">
        <div className="trip-room-header">
          <div>
            <span className="eyebrow">Trip Room</span>
            <h1 className="trip-room-title">{trip.title}</h1>
          </div>
          <div className="trip-room-code-pill">
            <span>{trip.code}</span>
            <button className="trip-room-copy-btn" onClick={handleCopy}>
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="trip-room-progress">
          <div className="trip-room-progress-label">
            {trip.submittedCount}/{trip.totalCount} participants have submitted preferences
          </div>
          <div className="trip-room-progress-bar">
            <div
              className="trip-room-progress-fill"
              style={{ width: `${(trip.submittedCount / trip.totalCount) * 100}%` }}
            />
          </div>
        </div>

        <ParticipantList participants={trip.participants} creatorName={trip.creatorName} />

        {myEntry && !myEntry.submitted && (
          <div className="trip-room-action">
            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate(`/trip/${code}/preferences`)}
            >
              Fill in your preferences →
            </button>
          </div>
        )}

        {isCreator ? (
          <div className="trip-room-action">
            <button
              className="btn btn-primary btn-block"
              disabled={!allSubmitted || generating}
              onClick={handleGenerate}
            >
              {generating
                ? 'Generating…'
                : allSubmitted
                ? 'Generate Recommendation →'
                : 'Waiting for everyone to submit…'}
            </button>
          </div>
        ) : (
          <div className="trip-room-waiting-note">
            Waiting for the trip creator to generate the recommendation.
          </div>
        )}
      </div>
    </div>
  );
}
