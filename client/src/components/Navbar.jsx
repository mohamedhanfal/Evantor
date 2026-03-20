import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "./auth/UserDropdown";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [{ to: "/events", label: "Events" }];

export default function Navbar({
  authPageOpen,
  onOpenAuthPage,
  onCloseAuthPage,
  onCreateEventClick,
  onCreateEventRequiresLogin,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const goHome = () => {
    navigate("/");
    closeMenu();
  };

  const goToRoute = (to) => {
    navigate(to);
    closeMenu();
  };

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && closeMenu();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header className="navbar" role="banner">
      <button
        type="button"
        className="navbar__logo-btn"
        onClick={goHome}
        aria-label="Evantor home"
      >
        <h1 className="navbar__logo">Evantor</h1>
      </button>

      <nav
        className={`navbar__nav ${mobileOpen ? "is-open" : ""}`}
        aria-label="Main navigation"
      >
        {navLinks.map((link) => (
          <a
            key={link.to}
            type="button"
            className="navbar__link"
            onClick={() => goToRoute(link.to)}
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
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
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
