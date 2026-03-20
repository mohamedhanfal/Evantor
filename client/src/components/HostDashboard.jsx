import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const SERVICES = ["Decoration", "DJ", "Food", "Photographers", "Travels"];

export default function HostDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [myEvents, setMyEvents] = useState([]); // In a real app we'd fetch events created by this host

  // Form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState({
    title: '', date: '', time: '', location: '', category: 'Music', price: 0, description: ''
  });

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceData, setServiceData] = useState({ eventId: '', sector: 'Decoration' });

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/host/dashboard');
      if (data.success) {
        setServiceRequests(data.serviceRequests);
        setInvoices(data.invoices);
        
        // Extract unique events from service requests for the service dropdown
        // Ideally we'd have a separate endpoint for `GET /api/host/events`
        const uniqueEvents = [];
        const map = new Map();
        for (const sr of data.serviceRequests) {
            if (!map.has(sr.event._id)) {
                map.set(sr.event._id, true);
                uniqueEvents.push(sr.event);
            }
        }
        setMyEvents(uniqueEvents);
      }
    } catch (err) {
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/host/events', eventData);
      if (data.success) {
        showToast('Event created successfully!', 'success');
        setShowEventForm(false);
        // Add to our local list for the service request dropdown
        setMyEvents(prev => [...prev, data.event]);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create event.', 'error');
    }
  };

  const handleRequestService = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/host/services/request', serviceData);
      if (data.success) {
        showToast(`Requested ${serviceData.sector} service successfully!`, 'success');
        setShowServiceForm(false);
        fetchDashboardData(); // Refresh to show new request
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to request service.', 'error');
    }
  };

  if (!user || (user.role !== 'host' && user.role !== 'admin')) {
    return (
      <main id="main" className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only hosts can access this dashboard. Please log in.</p>
      </main>
    );
  }

  return (
    <main id="main" className="section" style={{ maxWidth: 1000, margin: '0 auto', minHeight: '60vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 className="section__title" style={{ margin: 0 }}>Host Dashboard</h2>
        <div>
          <button className="btn btn-primary" onClick={() => setShowEventForm(!showEventForm)} style={{ marginRight: 8 }}>
            {showEventForm ? 'Cancel' : 'Create Event'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowServiceForm(!showServiceForm)}>
            {showServiceForm ? 'Cancel' : 'Request Service'}
          </button>
        </div>
      </div>

      {/* Forms Area */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        {showEventForm && (
          <form onSubmit={handleCreateEvent} style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12, flex: 1 }}>
            <h4>Create New Event</h4>
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Title</label>
                <input type="text" className="form-input" required value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Category</label>
                <select className="form-input" required value={eventData.category} onChange={e => setEventData({...eventData, category: e.target.value})}>
                  {["Music", "Technology", "Business", "Wellness", "Food & Drink", "Design"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" required value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Time</label>
                <input type="time" className="form-input" required value={eventData.time} onChange={e => setEventData({...eventData, time: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Location</label>
                <input type="text" className="form-input" required value={eventData.location} onChange={e => setEventData({...eventData, location: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Base Price (LKR)</label>
                <input type="number" min="0" className="form-input" required value={eventData.price} onChange={e => setEventData({...eventData, price: Number(e.target.value)})} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="3" value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}>Create Event</button>
          </form>
        )}

        {showServiceForm && (
          <form onSubmit={handleRequestService} style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12, flex: 1 }}>
            <h4>Request Evantor Service</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Choose an event to request a service planning team.</p>
            
            <div style={{ marginTop: 16 }}>
              <label className="form-label">Select Event</label>
              <select className="form-input" required value={serviceData.eventId} onChange={e => setServiceData({...serviceData, eventId: e.target.value})}>
                <option value="" disabled>-- Select an Event --</option>
                {myEvents.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
              </select>
              {myEvents.length === 0 && <small style={{ color: 'var(--primary)' }}>You need to create an event first.</small>}
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="form-label">Service Sector</label>
              <select className="form-input" required value={serviceData.sector} onChange={e => setServiceData({...serviceData, sector: e.target.value})}>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} disabled={!serviceData.eventId}>Request Meeting</button>
          </form>
        )}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading dashboard...</p>
      ) : (
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {/* Tracking Pipeline */}
          <div style={{ flex: '1 1 500px' }}>
            <h3 style={{ marginBottom: 16 }}>Service Tracking Pipeline</h3>
            {serviceRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No active service requests.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {serviceRequests.map(req => (
                  <div key={req._id} style={{ background: 'var(--surface-light)', padding: 16, borderRadius: 8, borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong>{req.event.title}</strong>
                      <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--bg)', borderRadius: 12 }}>{req.status}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sector: {req.sector}</span>
                    </div>
                    {req.meetingDate && (
                      <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                        📅 Meeting scheduled: {new Date(req.meetingDate).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget / Invoices */}
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ marginBottom: 16 }}>Budget & Invoices</h3>
            {invoices.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No invoices received yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {invoices.map(inv => (
                  <div key={inv._id} style={{ background: 'var(--surface-light)', padding: 16, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong>{inv.serviceRequest?.sector} Team</strong>
                      <span style={{ color: inv.status === 'Paid' ? 'green' : 'var(--primary)', fontWeight: 'bold' }}>
                        {inv.status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>{inv.event.title}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{inv.description}</p>
                    <div style={{ marginTop: 12, textAlign: 'right', fontWeight: 'bold' }}>
                      LKR {inv.amount.toLocaleString()}
                    </div>
                    {inv.status === 'Pending' && (
                      <button className="btn btn-primary" style={{ width: '100%', marginTop: 12, padding: '8px' }}>
                        Pay Invoice
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
