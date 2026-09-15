import './ParticipantList.css';

export default function ParticipantList({ participants, creatorName }) {
  return (
    <ul className="participant-list">
      {participants.map((p) => (
        <li key={p.name} className="participant-row">
          <span className="participant-name">
            {p.name}
            {p.name.toLowerCase() === creatorName.toLowerCase() && (
              <span className="participant-badge">Creator</span>
            )}
          </span>
          {p.submitted ? (
            <span className="participant-status status-done">✓ Submitted</span>
          ) : (
            <span className="participant-status status-waiting">⏳ Waiting</span>
          )}
        </li>
      ))}
    </ul>
  );
}
