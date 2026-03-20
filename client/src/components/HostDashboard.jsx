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
    title: '', date: '', time: '', location: '', category: 'Music', price: 0, description: '', image: null
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
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null && eventData[key] !== '') {
          formData.append(key, eventData[key]);
        }
      });

      const { data } = await api.post('/host/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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
    <main id="main" className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Host Dashboard</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Manage your events, services, and budgets.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => setShowEventForm(!showEventForm)}>
            {showEventForm ? 'Cancel Event Setup' : 'Create Event'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowServiceForm(!showServiceForm)}>
            {showServiceForm ? 'Cancel Service Request' : 'Request Service'}
          </button>
        </div>
      </div>

      {/* Forms Area */}
      {(showEventForm || showServiceForm) && (
        <div className="dashboard-grid" style={{ marginBottom: 32 }}>
          {showEventForm && (
            <form onSubmit={handleCreateEvent} className="glass-panel">
              <h4>Create New Event</h4>
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <div className="trendy-input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <input type="text" id="ev-title" className="trendy-input" placeholder=" " required value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} />
                  <label htmlFor="ev-title" className="trendy-label">Event Title</label>
                </div>
                <div className="trendy-input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <select className="trendy-input" required value={eventData.category} onChange={e => setEventData({...eventData, category: e.target.value})}>
                    {["Music", "Technology", "Business", "Wellness", "Food & Drink", "Design"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <label className="trendy-label" style={{ top: 0, fontSize: '0.8rem', background: 'var(--bg-elevated)', color: 'var(--primary)' }}>Category</label>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <div className="trendy-input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <input type="date" id="ev-date" className="trendy-input" placeholder=" " required value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})} />
                  <label htmlFor="ev-date" className="trendy-label" style={{ top: 0, fontSize: '0.8rem', background: 'var(--bg-elevated)', color: 'var(--primary)' }}>Date</label>
                </div>
                <div className="trendy-input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <input type="time" id="ev-time" className="trendy-input" placeholder=" " required value={eventData.time} onChange={e => setEventData({...eventData, time: e.target.value})} />
                  <label htmlFor="ev-time" className="trendy-label" style={{ top: 0, fontSize: '0.8rem', background: 'var(--bg-elevated)', color: 'var(--primary)' }}>Time</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <div className="trendy-input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <input type="text" id="ev-location" className="trendy-input" placeholder=" " required value={eventData.location} onChange={e => setEventData({...eventData, location: e.target.value})} />
                  <label htmlFor="ev-location" className="trendy-label">Location</label>
                </div>
                <div className="trendy-input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <input type="number" id="ev-price" min="0" className="trendy-input" placeholder=" " required value={eventData.price} onChange={e => setEventData({...eventData, price: Number(e.target.value)})} />
                  <label htmlFor="ev-price" className="trendy-label">Base Price (LKR)</label>
                </div>
              </div>

              <div className="trendy-input-group" style={{ marginTop: 16, marginBottom: 0 }}>
                <textarea id="ev-desc" className="trendy-input" rows="3" placeholder=" " value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})}></textarea>
                <label htmlFor="ev-desc" className="trendy-label">Description (Optional)</label>
              </div>

              <div className="trendy-input-group" style={{ marginTop: 16, marginBottom: 0 }}>
                <input type="file" id="ev-image" className="trendy-input" accept="image/*" onChange={e => setEventData({...eventData, image: e.target.files[0]})} style={{ paddingTop: '20px' }} />
                <label htmlFor="ev-image" className="trendy-label" style={{ top: 0, fontSize: '0.8rem', background: 'var(--bg-elevated)', color: 'var(--primary)' }}>Event Cover Image (Optional)</label>
              </div>

              <button type="submit" className="profile-btn" style={{ marginTop: 24, padding: '12px' }}>Create Event</button>
            </form>
          )}

          {showServiceForm && (
            <form onSubmit={handleRequestService} className="glass-panel" style={{ height: 'fit-content' }}>
              <h4>Request Evantor Service</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Book a professional team for your upcoming event.</p>
              
              <div className="trendy-input-group" style={{ marginTop: 24 }}>
                <select className="trendy-input" required value={serviceData.eventId} onChange={e => setServiceData({...serviceData, eventId: e.target.value})}>
                  <option value="" disabled>-- Select an Event --</option>
                  {myEvents.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                </select>
                <label className="trendy-label" style={{ top: 0, fontSize: '0.8rem', background: 'var(--bg-elevated)', color: 'var(--primary)' }}>Select Event</label>
                {myEvents.length === 0 && <small style={{ color: 'var(--primary)', marginTop: 8, display: 'block' }}>You need to create an event first.</small>}
              </div>

              <div className="trendy-input-group" style={{ marginTop: 16 }}>
                <select className="trendy-input" required value={serviceData.sector} onChange={e => setServiceData({...serviceData, sector: e.target.value})}>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className="trendy-label" style={{ top: 0, fontSize: '0.8rem', background: 'var(--bg-elevated)', color: 'var(--primary)' }}>Service Sector</label>
              </div>

              <button type="submit" className="profile-btn" style={{ marginTop: 16, padding: '12px' }} disabled={!serviceData.eventId}>Request Meeting</button>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading dashboard...</p>
      ) : (
        <div className="dashboard-grid-large">
          {/* Tracking Pipeline */}
          <div className="glass-panel">
            <h3>Service Tracking Pipeline</h3>
            {serviceRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No active service requests.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {serviceRequests.map(req => (
                  <div key={req._id} className="dashboard-card">
                    <div className="card-header">
                      <h4 className="card-title">{req.event.title}</h4>
                      <span className={`badge ${req.status === 'Completed' ? 'success' : ''}`}>{req.status}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sector: {req.sector}</span>
                    </div>
                    {req.meetingDate && (
                      <div style={{ marginTop: 12, fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                        📅 Meeting scheduled: {new Date(req.meetingDate).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget / Invoices */}
          <div className="glass-panel">
            <h3>Budget & Invoices</h3>
            {invoices.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No invoices received yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {invoices.map(inv => (
                  <div key={inv._id} className={`dashboard-card ${inv.status === 'Paid' ? 'success-border' : 'warning-border'}`}>
                    <div className="card-header">
                      <h4 className="card-title">{inv.serviceRequest?.sector} Team</h4>
                      <span className={`badge ${inv.status === 'Paid' ? 'success' : ''}`}>
                        {inv.status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Event: {inv.event.title}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{inv.description}</p>
                    
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        LKR {inv.amount.toLocaleString()}
                      </span>
                    </div>
                    
                    {inv.status === 'Pending' && (
                      <button className="profile-btn" style={{ marginTop: 16, padding: '10px' }}>
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
