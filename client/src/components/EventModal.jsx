import { useState, useEffect } from 'react';

export default function EventModal({ event, onClose, isOpen }) {
  const [quantities, setQuantities] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!event) return;
    const initial = {};
    event.ticketTiers.forEach((tier) => {
      initial[tier.name] = 0;
    });
    setQuantities(initial);
    setErrors({});
  }, [event]);

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

  if (!event) return null;

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = event.ticketTiers.reduce(
    (sum, tier) => sum + (quantities[tier.name] || 0) * tier.price,
    0
  );

  const updateQty = (tierName, delta) => {
    const tier = event.ticketTiers.find((t) => t.name === tierName);
    if (!tier) return;
    setQuantities((prev) => ({
      ...prev,
      [tierName]: Math.max(0, Math.min(tier.maxPerOrder, (prev[tierName] || 0) + delta)),
    }));
    setErrors((prev) => ({ ...prev, [tierName]: null }));
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (totalQty === 0) {
      setErrors({ form: 'Select at least one ticket.' });
      return;
    }
    setErrors({});
    // Stub: would integrate PayHere/WEBXPAY
    alert('Payment would proceed with PayHere/WEBXPAY. This is a stub.');
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {event.title}
          </h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal__body">
          <p className="modal__description">{event.description}</p>
          <p className="modal__description">
            <strong>📅</strong> {formattedDate} · <strong>🕐</strong> {event.time} ·{' '}
            <strong>📍</strong> {event.location}
          </p>

          <div className="modal__tiers">
            <h4>Ticket tiers</h4>
            {event.ticketTiers.map((tier) => (
              <div key={tier.name} className="tier-row">
                <div>
                  <span className="tier-name">{tier.name}</span>
                  <span className="tier-price">
                    {' '}
                    — LKR {tier.price.toLocaleString()}
                  </span>
                </div>
                <div className="counter-controls">
                  <button
                    type="button"
                    onClick={() => updateQty(tier.name, -1)}
                    disabled={(quantities[tier.name] || 0) <= 0}
                    aria-label={`Decrease ${tier.name} quantity`}
                  >
                    −
                  </button>
                  <span aria-live="polite">{quantities[tier.name] || 0}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(tier.name, 1)}
                    disabled={(quantities[tier.name] || 0) >= tier.maxPerOrder}
                    aria-label={`Increase ${tier.name} quantity`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="modal__total">
            <span>Total</span>
            <span>LKR {totalPrice.toLocaleString()}</span>
          </div>

          {errors.form && (
            <p role="alert" style={{ color: 'var(--primary)', marginTop: 8 }}>
              {errors.form}
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 16 }}
            onClick={handlePay}
            disabled={totalQty === 0}
          >
            Pay with PayHere / WEBXPAY
          </button>

          <p className="modal__payment-stub">
            Payment powered by PayHere / WEBXPAY (stub)
          </p>
        </div>
      </div>
    </div>
  );
}
