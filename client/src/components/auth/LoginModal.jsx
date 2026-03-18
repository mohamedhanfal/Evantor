import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setEmail('');
      setPassword('');
      const t = setTimeout(() => firstInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const validate = () => {
    const e = (email || '').trim();
    if (!e) {
      setError('Email is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(e)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login((email || '').trim(), password);
      if (result.success) {
        showToast('Welcome back!', 'success');
        onClose();
      } else {
        setError(result.error || 'Login failed.');
      }
    } catch (_) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div className="modal auth-modal">
        <div className="modal__header">
          <h2 id="login-modal-title" className="modal__title">
            Log in
          </h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close login modal"
          >
            ×
          </button>
        </div>
        <form className="modal__body auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="auth-form__error" role="alert">
              {error}
            </p>
          )}
          <label htmlFor="login-email" className="auth-form__label">
            Email
          </label>
          <input
            ref={firstInputRef}
            id="login-email"
            type="email"
            className="auth-form__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!error}
            disabled={loading}
          />
          <label htmlFor="login-password" className="auth-form__label">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className="auth-form__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary auth-form__submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden />
                Logging in…
              </>
            ) : (
              'Log in'
            )}
          </button>
          <p className="auth-form__switch">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="auth-form__link"
              onClick={() => {
                onClose();
                onSwitchToRegister?.();
              }}
              aria-label="Open registration form"
            >
              Register
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
