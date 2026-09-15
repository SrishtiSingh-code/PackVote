import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Working', id: 'working' },
  { label: 'Why Us', id: 'why-us' },
];

export default function Navbar() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-logo" onClick={() => navigate('/')}>
          <span className="navbar-logo-mark">◎</span>
          Pack<span className="navbar-logo-accent">Vote</span>
        </button>
        <ul className="navbar-links">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <button onClick={() => scrollTo(link.id)}>{link.label}</button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
