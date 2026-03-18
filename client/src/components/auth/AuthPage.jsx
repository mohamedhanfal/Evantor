import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAB_LOGIN = 'login';
const TAB_REGISTER = 'register';

export default function AuthPage({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(TAB_LOGIN);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regTerms, setRegTerms] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [regError, setRegError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const panelRef = useRef(null);
  const previousOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setLoginError('');
      setRegError('');
      setLoginEmail('');
      setLoginPassword('');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirm('');
      setRegTerms(false);
      setActiveTab(TAB_LOGIN);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && !previousOpenRef.current) {
      const firstFocusable = panelRef.current?.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea'
      );
      firstFocusable?.focus();
    }
    previousOpenRef.current = isOpen;
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const validateLogin = () => {
    const e = (loginEmail || '').trim();
    if (!e) {
      setLoginError('Email is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(e)) {
      setLoginError('Please enter a valid email address.');
      return false;
    }
    if (!loginPassword) {
      setLoginError('Password is required.');
      return false;
    }
    if (loginPassword.length < 8) {
      setLoginError('Password must be at least 8 characters.');
      return false;
    }
    return true;
  };

  const validateRegister = () => {
    const n = (regName || '').trim();
    if (!n) {
      setRegError('Name is required.');
      return false;
    }
    const e = (regEmail || '').trim();
    if (!e) {
      setRegError('Email is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(e)) {
      setRegError('Please enter a valid email address.');
      return false;
    }
    if (!regPassword) {
      setRegError('Password is required.');
      return false;
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters.');
      return false;
    }
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.');
      return false;
    }
    if (!regTerms) {
      setRegError('You must agree to the Terms to register.');
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!validateLogin()) return;
    setLoginLoading(true);
    try {
      const result = await login((loginEmail || '').trim(), loginPassword);
      if (result.success) {
        showToast('Welcome back!', 'success');
        onClose();
      } else {
        setLoginError(result.error || 'Login failed.');
      }
    } catch (_) {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!validateRegister()) return;
    setRegLoading(true);
    try {
      const result = await register(regName.trim(), (regEmail || '').trim(), regPassword);
      if (result.success) {
        showToast('Account created successfully.', 'success');
        onClose();
      } else {
        setRegError(result.error || 'Registration failed.');
      }
    } catch (_) {
      setRegError('Something went wrong. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="auth-page"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-page-title"
      onClick={handleBackdropClick}
    >
      <div
        className="auth-page__panel"
        ref={panelRef}
        role="document"
      >
        <button
          type="button"
          className="auth-page__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2 id="auth-page-title" className="auth-page__heading">
          Welcome to Evantor
        </h2>

        <div
          className="auth-page__tabs"
          role="tablist"
          aria-label="Login or Register"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === TAB_LOGIN}
            aria-controls="auth-panel-login"
            id="auth-tab-login"
            className={`auth-page__tab ${activeTab === TAB_LOGIN ? 'auth-page__tab--active' : ''}`}
            onClick={() => setActiveTab(TAB_LOGIN)}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === TAB_REGISTER}
            aria-controls="auth-panel-register"
            id="auth-tab-register"
            className={`auth-page__tab ${activeTab === TAB_REGISTER ? 'auth-page__tab--active' : ''}`}
            onClick={() => setActiveTab(TAB_REGISTER)}
          >
            Register
          </button>
          <span
            className="auth-page__tab-indicator"
            aria-hidden
            style={{ '--tab-index': activeTab === TAB_LOGIN ? 0 : 1 }}
          />
        </div>

        <div className="auth-page__content">
          <div
            id="auth-panel-login"
            role="tabpanel"
            aria-labelledby="auth-tab-login"
            hidden={activeTab !== TAB_LOGIN}
            className={`auth-page__panel-inner ${activeTab === TAB_LOGIN ? 'auth-page__panel-inner--active' : ''}`}
          >
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              {loginError && (
                <p className="auth-form__error" role="alert">
                  {loginError}
                </p>
              )}
              <label htmlFor="auth-login-email" className="auth-form__label">
                Email
              </label>
              <input
                id="auth-login-email"
                type="email"
                className="auth-form__input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loginLoading}
              />
              <label htmlFor="auth-login-password" className="auth-form__label">
                Password
              </label>
              <input
                id="auth-login-password"
                type="password"
                className="auth-form__input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loginLoading}
              />
              <button
                type="submit"
                className="btn btn-primary auth-form__submit"
                disabled={loginLoading}
                aria-busy={loginLoading}
              >
                {loginLoading ? (
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
                  onClick={() => setActiveTab(TAB_REGISTER)}
                  aria-label="Switch to Register tab"
                >
                  Register
                </button>
              </p>
            </form>
          </div>

          <div
            id="auth-panel-register"
            role="tabpanel"
            aria-labelledby="auth-tab-register"
            hidden={activeTab !== TAB_REGISTER}
            className={`auth-page__panel-inner ${activeTab === TAB_REGISTER ? 'auth-page__panel-inner--active' : ''}`}
          >
            <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
              {regError && (
                <p className="auth-form__error" role="alert">
                  {regError}
                </p>
              )}
              <label htmlFor="auth-reg-name" className="auth-form__label">
                Full name
              </label>
              <input
                id="auth-reg-name"
                type="text"
                className="auth-form__input"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                disabled={regLoading}
              />
              <label htmlFor="auth-reg-email" className="auth-form__label">
                Email
              </label>
              <input
                id="auth-reg-email"
                type="email"
                className="auth-form__input"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={regLoading}
              />
              <label htmlFor="auth-reg-password" className="auth-form__label">
                Password (min 8 characters)
              </label>
              <input
                id="auth-reg-password"
                type="password"
                className="auth-form__input"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={regLoading}
              />
              <label htmlFor="auth-reg-confirm" className="auth-form__label">
                Confirm password
              </label>
              <input
                id="auth-reg-confirm"
                type="password"
                className="auth-form__input"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={regLoading}
              />
              <label className="auth-form__checkbox">
                <input
                  type="checkbox"
                  checked={regTerms}
                  onChange={(e) => setRegTerms(e.target.checked)}
                  disabled={regLoading}
                  aria-describedby="auth-terms-desc"
                />
                <span id="auth-terms-desc">I agree to the Terms of Service and Privacy Policy</span>
              </label>
              <button
                type="submit"
                className="btn btn-primary auth-form__submit"
                disabled={regLoading}
                aria-busy={regLoading}
              >
                {regLoading ? (
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
                  onClick={() => setActiveTab(TAB_LOGIN)}
                  aria-label="Switch to Login tab"
                >
                  Log in
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
