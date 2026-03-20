import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

export default function TicketerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ totalTicketsSold: 0, totalRevenue: 0 });
  const [eventBreakdown, setEventBreakdown] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/ticketer/stats');
        if (data.success) {
          setGlobalStats(data.stats);
          setEventBreakdown(data.eventBreakdown);
        }
      } catch (err) {
        showToast('Failed to load ticketer analytics.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'ticketer' || user.role === 'admin')) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || (user.role !== 'ticketer' && user.role !== 'admin')) {
    return (
      <main className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only Ticketers or Admins can access this dashboard.</p>
      </main>
    );
  }

  return (
    <main id="main" className="section" style={{ maxWidth: 1000, margin: '0 auto', minHeight: '60vh' }}>
      <h2 className="section__title" style={{ marginBottom: 32 }}>Ticketer Analytics</h2>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading analytics...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, background: 'var(--surface-light)', padding: 32, borderRadius: 12, textAlign: 'center', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{globalStats.totalTicketsSold}</div>
              <div style={{ color: 'var(--text-muted)' }}>Total Tickets Sold</div>
            </div>
            <div style={{ flex: 1, background: 'var(--surface-light)', padding: 32, borderRadius: 12, textAlign: 'center', borderLeft: '4px solid green' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>LKR {globalStats.totalRevenue.toLocaleString()}</div>
              <div style={{ color: 'var(--text-muted)' }}>Total Ticket Revenue</div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: 16 }}>Sales by Event</h3>
            {eventBreakdown.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No tickets sold yet.</p>
            ) : (
              <div style={{ background: 'var(--surface-light)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: 16 }}>Event Title</th>
                      <th style={{ padding: 16, textAlign: 'right' }}>Tickets Sold</th>
                      <th style={{ padding: 16, textAlign: 'right' }}>Revenue (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventBreakdown.map((e, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: 16 }}><strong>{e.title}</strong></td>
                        <td style={{ padding: 16, textAlign: 'right' }}>{e.ticketsSold}</td>
                        <td style={{ padding: 16, textAlign: 'right', color: 'green', fontWeight: 'bold' }}>{e.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
