export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <nav className="footer__links" aria-label="Footer links">
          <a href="#about">About</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
        </nav>
        <p className="footer__copy">© 2026 Evantor</p>
      </div>
    </footer>
  );
}
