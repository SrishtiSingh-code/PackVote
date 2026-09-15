import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RecommendationCard from '../components/RecommendationCard.jsx';
import AISummary from '../components/AISummary.jsx';
import { getTrip, generateAISummary } from '../api/api.js';
import '../components/RecommendationCard.css';

export default function ResultPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getTrip(code);
        if (cancelled) return;

        if (!data.recommendation) {
          navigate(`/trip/${code}`, { replace: true });
          return;
        }

        setTrip(data);

        if (data.recommendation.aiSummary) {
          setAiSummary(data.recommendation.aiSummary);
        } else {
          setAiLoading(true);
          const res = await generateAISummary(code);
          if (!cancelled) {
            setAiSummary(res.aiSummary);
            setAiLoading(false);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [code, navigate]);

  if (error) {
    return (
      <div className="result-page">
        <div className="card" style={{ maxWidth: 480, margin: '80px auto', padding: 32 }}>
          <div className="auth-error">{error}</div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/')}>
            Back home
          </button>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="result-page">
      <RecommendationCard recommendation={trip.recommendation} />
      <AISummary summary={aiSummary} loading={aiLoading} />
      <div className="result-actions">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          Back to home
        </button>
      </div>
    </div>
  );
}
