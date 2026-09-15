import './WhyUs.css';

const REASONS = [
  {
    title: 'Democratic decisions',
    detail: "Every participant's preferences are weighed equally in the final result.",
  },
  {
    title: 'No endless group chats',
    detail: 'Skip the back-and-forth arguments about where to go.',
  },
  {
    title: 'Transparent scoring',
    detail: 'Understand exactly why a destination was recommended for your group.',
  },
  {
    title: 'Personalized',
    detail: 'Recommendations are calculated from your actual group, not generic trends.',
  },
  {
    title: 'AI-powered explanation',
    detail: 'AI turns the recommendation into an easy-to-read trip summary.',
  },
];

export default function WhyUs() {
  return (
    <section className="why-us" id="why-us">
      <div className="container">
        <span className="eyebrow">Why PackVote</span>
        <h2 className="why-us-title">Built for groups, not solo travellers</h2>

        <div className="why-us-grid">
          {REASONS.map((reason) => (
            <div className="why-us-card" key={reason.title}>
              <h3>{reason.title}</h3>
              <p>{reason.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
