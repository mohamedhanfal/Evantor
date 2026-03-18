import { useState, useEffect } from 'react';
import UserDropdown from './auth/UserDropdown';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { href: '#featured-events', label: 'Events' },
  { href: '#my-tickets', label: 'My Tickets' },
];

export default function Navbar({
  authPageOpen,
  onOpenAuthPage,
  onCloseAuthPage,
  onCreateEventClick,
  onCreateEventRequiresLogin,
}) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleMenu = () => setMobileOpen((prev) => !prev);
  const closeMenu = () => setMobileOpen(false);

  const handleCreateEvent = (e) => {
    if (!user && onCreateEventRequiresLogin) {
      e.preventDefault();
      onCreateEventRequiresLogin();
      closeMenu();
      return;
    }
    closeMenu();
    onCreateEventClick?.();
  };

  const openAuthPage = () => {
    onOpenAuthPage?.();
    closeMenu();
  };

  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && closeMenu();
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className="navbar" role="banner">
      <button
        type="button"
        className="navbar__logo-btn"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          closeMenu();
        }}
        aria-label="Evantor home"
      >
        <h1 className="navbar__logo">Evantor</h1>
      </button>

      <nav
        className={`navbar__nav ${mobileOpen ? 'is-open' : ''}`}
        aria-label="Main navigation"
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="navbar__link"
            onClick={closeMenu}
          >
            {link.label}
          </a>
        ))}
        {!user ? (
          <button
            type="button"
            className="navbar__link"
            onClick={openAuthPage}
            aria-label="Open login"
          >
            Login
          </button>
        ) : (
          <div className="navbar__user-wrap">
            <UserDropdown onCloseMobile={closeMenu} />
          </div>
        )}
        <a
          href="#organizer"
          className="navbar__link navbar__link--cta"
          onClick={handleCreateEvent}
        >
          Create Event
        </a>
      </nav>

      <button
        type="button"
        className="navbar__toggle"
        onClick={handleToggleMenu}
        aria-expanded={mobileOpen}
        aria-controls="main-nav"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        id="menu-toggle"
      >
        <span className="navbar__toggle-icon" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>
    </header>
  );
}
