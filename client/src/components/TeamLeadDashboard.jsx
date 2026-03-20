import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

export default function TeamLeadDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // States for Modals/Forms
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  const [meetingDate, setMeetingDate] = useState('');
  const [invoiceData, setInvoiceData] = useState({ amount: '', description: '' });

  const fetchTeamLeadData = async () => {
    try {
      const { data } = await api.get('/team-lead/requests');
      if (data.success) {
        setRequests(data.requests);
        setInvoices(data.invoices);
      }
    } catch (err) {
      showToast('Failed to load team lead data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'team_lead' || user.role === 'admin')) {
      fetchTeamLeadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/team-lead/requests/${activeRequest._id}/schedule`, { meetingDate });
      if (data.success) {
        showToast('Meeting scheduled successfully!', 'success');
        setScheduleModalOpen(false);
        setActiveRequest(null);
        setMeetingDate('');
        fetchTeamLeadData();
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to schedule meeting.', 'error');
    }
  };

  const handleIssueInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        serviceRequestId: activeRequest._id,
        amount: Number(invoiceData.amount),
        description: invoiceData.description,
      };
      const { data } = await api.post('/team-lead/invoices', payload);
      if (data.success) {
        showToast('Invoice issued successfully!', 'success');
        setInvoiceModalOpen(false);
        setActiveRequest(null);
        setInvoiceData({ amount: '', description: '' });
        fetchTeamLeadData();
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to issue invoice.', 'error');
    }
  };

  if (!user || user.role !== 'team_lead') {
    return (
      <main id="main" className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only Team Leads can access this dashboard.</p>
      </main>
    );
  }

  return (
    <main id="main" className="section" style={{ maxWidth: 1000, margin: '0 auto', minHeight: '60vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 className="section__title" style={{ margin: 0 }}>Team Lead Dashboard</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Managing {user.serviceSector} Sector</p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading dashboard...</p>
      ) : (
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {/* Active Requests */}
          <div style={{ flex: '2 1 500px' }}>
            <h3 style={{ marginBottom: 16 }}>Pending Requests</h3>
            {requests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No active service requests in your sector.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {requests.map(req => (
                  <div key={req._id} style={{ background: 'var(--surface-light)', padding: 20, borderRadius: 8, borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h4 style={{ margin: 0 }}>{req.event.title}</h4>
                      <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--bg)', borderRadius: 12 }}>{req.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 32, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                      <div>Host: {req.host.name}</div>
                      <div>Event Date: {new Date(req.event.date).toLocaleDateString()}</div>
                    </div>
                    
                    {req.meetingDate && (
                      <div style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--primary)' }}>
                        <strong>📅 Scheduled Meeting:</strong> {new Date(req.meetingDate).toLocaleString()}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 12 }}>
                      {req.status === 'Requested' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 16px', fontSize: '0.9rem' }}
                          onClick={() => { setActiveRequest(req); setScheduleModalOpen(true); }}
                        >
                          Schedule Meeting
                        </button>
                      )}
                      {req.status === 'Meeting Scheduled' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 16px', fontSize: '0.9rem' }}
                          onClick={() => { setTimeout(() => setActiveRequest(req), 0); setInvoiceModalOpen(true); }}
                        >
                          Issue Invoice & Quote
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Issued Invoices */}
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ marginBottom: 16 }}>Issued Invoices</h3>
            {invoices.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No invoices issued yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {invoices.map(inv => (
                  <div key={inv._id} style={{ background: 'var(--surface-light)', padding: 16, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong>{inv.event.title}</strong>
                      <span style={{ color: inv.status === 'Paid' ? 'green' : 'var(--primary)', fontWeight: 'bold' }}>
                        {inv.status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{inv.description}</p>
                    <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      LKR {inv.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Modals */}
      {scheduleModalOpen && activeRequest && (
        <div className="modal-overlay" onClick={() => setScheduleModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal__header">
              <h3 className="modal__title">Schedule Meeting</h3>
              <button className="modal__close" onClick={() => setScheduleModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleScheduleMeeting} className="modal__body">
              <p>Host: {activeRequest.host.name}</p>
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Meeting Date & Time</label>
                <input type="datetime-local" className="form-input" required value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 24 }}>Confirm Schedule</button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceModalOpen && activeRequest && (
        <div className="modal-overlay" onClick={() => setInvoiceModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal__header">
              <h3 className="modal__title">Issue Invoice / Quote</h3>
              <button className="modal__close" onClick={() => setInvoiceModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleIssueInvoice} className="modal__body">
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Quoted Amount (LKR)</label>
                <input type="number" min="0" className="form-input" required value={invoiceData.amount} onChange={e => setInvoiceData({...invoiceData, amount: e.target.value})} />
              </div>
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Description / Breakdown</label>
                <textarea className="form-input" rows="4" required value={invoiceData.description} onChange={e => setInvoiceData({...invoiceData, description: e.target.value})} placeholder="e.g. DJ Setup + 4 hours play..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 24 }}>Send Invoice</button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
