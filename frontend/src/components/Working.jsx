import './Working.css';

const STEPS = [
  { title: 'Create trip', detail: 'One person starts a trip and sets a name.' },
  { title: 'Share trip code', detail: 'A unique code is generated to invite the group.' },
  { title: 'Friends join', detail: 'Everyone joins remotely using the trip code.' },
  { title: 'Submit preferences', detail: 'Each person fills in budget, style, climate and more.' },
  { title: 'PackVote calculates compatibility', detail: 'Every destination is scored against the group.' },
  { title: 'Best destination', detail: 'The highest-scoring destination is selected.' },
  { title: 'AI-generated summary', detail: 'AI explains the recommendation in plain language.' },
];

export default function Working() {
  return (
    <section className="working" id="working">
      <div className="container">
        <span className="eyebrow">How it works</span>
        <h2 className="working-title">From trip code to final destination</h2>

        <div className="working-steps">
          {STEPS.map((step, i) => (
            <div className="working-step" key={step.title}>
              <div className="working-step-index">{i + 1}</div>
              <div>
                <h3 className="working-step-title">{step.title}</h3>
                <p>{step.detail}</p>
              </div>
              {i < STEPS.length - 1 && <div className="working-connector" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
