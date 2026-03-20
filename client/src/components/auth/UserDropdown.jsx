import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function getInitials(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

export default function UserDropdown({ onCloseMobile }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => e.key === 'Escape' && setOpen(false);
    if (open) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (!user) return null;

  const handleLogout = () => {
    setOpen(false);
    logout();
    onCloseMobile?.();
  };

  return (
    <div className="user-dropdown" ref={ref}>
      <button
        type="button"
        className="user-dropdown__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`User menu for ${user.name}`}
        id="user-menu-button"
      >
        <span className="user-dropdown__avatar" aria-hidden>
          {getInitials(user.name)}
        </span>
        <span className="user-dropdown__name">{user.name}</span>
        <span className="user-dropdown__chevron" aria-hidden>▼</span>
      </button>
      {open && (
        <div
          className="user-dropdown__menu"
          role="menu"
          aria-labelledby="user-menu-button"
        >
          <div className="user-dropdown__menu-header">
            <span className="user-dropdown__avatar user-dropdown__avatar--lg">
              {getInitials(user.name)}
            </span>
            <span className="user-dropdown__email">{user.email}</span>
          </div>
          <Link
            to="/profile"
            className="user-dropdown__item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onCloseMobile?.();
            }}
          >
            Profile
          </Link>
          
          {(user.role === 'host' || user.role === 'admin') && (
            <>
              <Link to="/my-tickets" className="user-dropdown__item" role="menuitem" onClick={() => { setOpen(false); onCloseMobile?.(); }}>
                My Tickets
              </Link>
              <Link to="/host-dashboard" className="user-dropdown__item" role="menuitem" onClick={() => { setOpen(false); onCloseMobile?.(); }}>
                Host Dashboard
              </Link>
            </>
          )}

          {user.role === 'team_lead' && (
            <Link to="/team-lead" className="user-dropdown__item" role="menuitem" onClick={() => { setOpen(false); onCloseMobile?.(); }}>
              Team Lead Dashboard
            </Link>
          )}

          {user.role === 'ticketer' && (
            <Link to="/ticketer" className="user-dropdown__item" role="menuitem" onClick={() => { setOpen(false); onCloseMobile?.(); }}>
              Ticketing Analytics
            </Link>
          )}

          {user.role === 'admin' && (
            <>
              <Link to="/admin" className="user-dropdown__item" role="menuitem" onClick={() => { setOpen(false); onCloseMobile?.(); }}>
                Admin Dashboard
              </Link>
              <Link to="/ticketer" className="user-dropdown__item" role="menuitem" onClick={() => { setOpen(false); onCloseMobile?.(); }}>
                Ticketing Analytics
              </Link>
            </>
          )}

          <button
            type="button"
            className="user-dropdown__item user-dropdown__item--danger"
            role="menuitem"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
