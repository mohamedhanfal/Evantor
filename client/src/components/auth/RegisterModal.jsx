import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreeTerms(false);
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
    const n = (name || '').trim();
    if (!n) {
      setError('Name is required.');
      return false;
    }
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
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms to register.');
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
      const result = await register(name.trim(), (email || '').trim(), password);
      if (result.success) {
        showToast('Account created successfully.', 'success');
        onClose();
      } else {
        setError(result.error || 'Registration failed.');
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
      aria-labelledby="register-modal-title"
      onClick={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div className="modal auth-modal">
        <div className="modal__header">
          <h2 id="register-modal-title" className="modal__title">
            Create account
          </h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close registration modal"
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
          <label htmlFor="register-name" className="auth-form__label">
            Full name
          </label>
          <input
            ref={firstInputRef}
            id="register-name"
            type="text"
            className="auth-form__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            disabled={loading}
          />
          <label htmlFor="register-email" className="auth-form__label">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            className="auth-form__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
          />
          <label htmlFor="register-password" className="auth-form__label">
            Password (min 8 characters)
          </label>
          <input
            id="register-password"
            type="password"
            className="auth-form__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={loading}
          />
          <label htmlFor="register-confirm" className="auth-form__label">
            Confirm password
          </label>
          <input
            id="register-confirm"
            type="password"
            className="auth-form__input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={loading}
          />
          <label className="auth-form__checkbox">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={loading}
              aria-describedby="terms-desc"
            />
            <span id="terms-desc">I agree to the Terms of Service and Privacy Policy</span>
          </label>
          <button
            type="submit"
            className="btn btn-primary auth-form__submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden />
                Creating account…
              </>
            ) : (
              'Register'
            )}
          </button>
          <p className="auth-form__switch">
            Already have an account?{' '}
            <button
              type="button"
              className="auth-form__link"
              onClick={() => {
                onClose();
                onSwitchToLogin?.();
              }}
              aria-label="Open login form"
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
