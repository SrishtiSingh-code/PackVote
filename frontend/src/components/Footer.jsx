import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-mark">◎</span>
          Pack<span style={{ color: 'var(--cyan)' }}>Vote</span>
        </div>
        <p className="footer-tag">Group travel, without the arguments.</p>
        <p className="footer-copy">Built as a demo project — React, Express, MongoDB.</p>
      </div>
    </footer>
  );
}
