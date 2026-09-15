export default function AISummary({ summary, loading }) {
  return (
    <div className="card ai-summary-card">
      <div className="ai-summary-label">
        <span className="eyebrow">AI Trip Summary</span>
      </div>
      {loading ? (
        <p className="ai-summary-loading">Generating your group's summary…</p>
      ) : (
        <p className="ai-summary-text">{summary}</p>
      )}
    </div>
  );
}
