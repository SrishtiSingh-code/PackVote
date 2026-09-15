import './About.css';

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container about-grid">
        <div>
          <span className="eyebrow">The problem</span>
          <h2 className="about-title">Group travel, without the arguments.</h2>
        </div>
        <div className="about-copy">
          <p>
            Planning a trip with friends is hard because everyone wants something
            different. One person wants beaches, another wants mountains. Someone
            is chasing adventure, someone else just wants to relax. The group
            chat fills up with opinions and the trip never gets booked.
          </p>
          <p>
            PackVote brings everyone's preferences together in one place and
            finds the destination that works best for the whole group — not
            just the loudest voice in the chat.
          </p>
        </div>
      </div>
    </section>
  );
}
