import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast && (
        <div
          className={`toast toast--${toast.type}`}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="toast__message">{toast.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={hideToast}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
