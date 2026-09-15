import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import DestinationCarousel from './DestinationCarousel.jsx';
import './Hero.css';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero" id="home">
      <DestinationCarousel />
      <Navbar />
      <div className="hero-cta">
        <button className="btn btn-primary" onClick={() => navigate('/create')}>
          Create Trip
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/join')}>
          Join Trip
        </button>
      </div>
    </section>
  );
}
