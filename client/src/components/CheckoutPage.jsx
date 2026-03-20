import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const event = state?.event;
  const quantities = state?.quantities;

  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [loading, setLoading] = useState(false);

  if (!event || !quantities) {
    return (
      <main id="main" className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <h2>No event selected</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Return Home</button>
      </main>
    );
  }

  const selectedTiers = Object.entries(quantities).filter(([, qty]) => qty > 0);
  const totalQty = selectedTiers.reduce((acc, [, qty]) => acc + qty, 0);
  const totalPrice = selectedTiers.reduce((acc, [tierName, qty]) => {
    const tier = event.ticketTiers.find((t) => t.name === tierName);
    return acc + (tier.price * qty);
  }, 0);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to continue.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/tickets', {
        eventId: event._id,
        tiers: quantities,
        paymentMethod
      });
      if (response.data.success) {
        showToast('Ticket purchased successfully!', 'success');
        navigate('/my-tickets');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Payment failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main" className="section" style={{ maxWidth: 800, margin: '0 auto', minHeight: '60vh' }}>
      <h2 className="section__title">Checkout</h2>
      
      <div style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12, marginBottom: 24 }}>
        <h3>{event.title}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          {new Date(event.date).toLocaleDateString()} at {event.time} • {event.location}
        </p>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <h4 style={{ marginBottom: 16 }}>Order Summary</h4>
          {selectedTiers.map(([tierName, qty]) => {
            const tier = event.ticketTiers.find((t) => t.name === tierName);
            return (
              <div key={tierName} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{qty} × {tierName}</span>
                <span>LKR {(qty * tier.price).toLocaleString()}</span>
              </div>
            );
          })}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>
            <span>Total ({totalQty} tickets)</span>
            <span>LKR {totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handlePay} style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12 }}>
        <h4 style={{ marginBottom: 16 }}>Payment Method</h4>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={(e) => setPaymentMethod(e.target.value)} />
            Credit/Debit Card
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="radio" name="payment" value="GPay" checked={paymentMethod === 'GPay'} onChange={(e) => setPaymentMethod(e.target.value)} />
            Google Pay
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Processing...' : `Pay LKR ${totalPrice.toLocaleString()}`}
        </button>
      </form>
    </main>
  );
}
