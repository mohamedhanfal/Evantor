import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <nav className="footer__links" aria-label="Footer links">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <p className="footer__copy">© 2026 Evantor</p>
      </div>
    </footer>
  );
}
