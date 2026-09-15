import './RecommendationCard.css';

export default function RecommendationCard({ recommendation }) {
  const { name, country, image, groupScore, factors, alternatives } = recommendation;

  return (
    <>
      <div className="result-hero">
        <div className="result-hero-bg" style={{ backgroundImage: `url(${image})` }} />
        <div className="result-hero-scrim" />
        <div className="result-hero-content">
          <span className="result-eyebrow">Your group's match</span>
          <h1 className="result-destination">
            {name}, {country}
          </h1>
          <div className="result-score-row">
            <span className="result-score">{groupScore}%</span>
            <span className="result-score-label">Group compatibility</span>
          </div>
        </div>
      </div>

      <div className="result-body">
        <div className="card" style={{ padding: 28 }}>
          <h2 className="result-section-title">Why {name}?</h2>
          <div className="result-factors">
            {factors.map((factor) => (
              <div className="result-factor" key={factor}>
                <span className="result-factor-check">✓</span>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <h2 className="result-section-title">Ranked alternatives</h2>
          <div className="result-alt-list">
            <div className="result-alt-row">
              <span>
                <span className="result-alt-rank">1</span>
                {name}
              </span>
              <span className="result-alt-score">{groupScore}%</span>
            </div>
            {alternatives.map((alt, i) => (
              <div className="result-alt-row" key={alt.destinationId}>
                <span>
                  <span className="result-alt-rank">{i + 2}</span>
                  {alt.name}
                </span>
                <span className="result-alt-score">{alt.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
