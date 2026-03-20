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
  const [myEvents, setMyEvents] = useState([]); 
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [expiredEvents, setExpiredEvents] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState([]);

  // Form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState({
    title: '', date: '', time: '', location: '', category: 'Music', price: 0, 
    description: '', image: null, isPrivate: false, ticketTiers: []
  });

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceData, setServiceData] = useState({ eventId: '', sector: 'Decoration' });

  const addTicketTier = () => {
    setEventData(prev => ({
      ...prev,
      ticketTiers: [...prev.ticketTiers, { name: '', price: 0, maxPerOrder: 5 }]
    }));
  };

  const updateTicketTier = (index, field, value) => {
    const newTiers = [...eventData.ticketTiers];
    newTiers[index][field] = value;
    setEventData({ ...eventData, ticketTiers: newTiers });
  };

  const removeTicketTier = (index) => {
    const newTiers = [...eventData.ticketTiers];
    newTiers.splice(index, 1);
    setEventData({ ...eventData, ticketTiers: newTiers });
  };

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/host/dashboard');
      if (data.success) {
        setServiceRequests(data.serviceRequests);
        setInvoices(data.invoices);
        setUpcomingEvents(data.upcomingEvents || []);
        setExpiredEvents(data.expiredEvents || []);
        setBudgetSummary(data.budgetSummary || []);
        
        // Combine events for dropdowns
        const allEv = [...(data.upcomingEvents || []), ...(data.expiredEvents || [])];
        setMyEvents(allEv);
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
      
      let basePrice = 0;
      if (eventData.ticketTiers && eventData.ticketTiers.length > 0) {
        basePrice = Math.min(...eventData.ticketTiers.map(t => Number(t.price)));
      }

      Object.keys(eventData).forEach(key => {
        if (key === 'price') return; // We calculate this manually

        if (key === 'ticketTiers') {
          formData.append(key, JSON.stringify(eventData[key]));
        } else if (eventData[key] !== null && eventData[key] !== '') {
          formData.append(key, eventData[key]);
        }
      });
      formData.append('price', basePrice);

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
                {/* Removed Base Price, computed dynamically now */}
              </div>

              <div className="trendy-input-group" style={{ marginTop: 16, marginBottom: 0 }}>
                <textarea id="ev-desc" className="trendy-input" rows="3" placeholder=" " value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})}></textarea>
                <label htmlFor="ev-desc" className="trendy-label">Description (Optional)</label>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'center' }}>
                <div className="trendy-input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <input type="file" id="ev-image" className="trendy-input" accept="image/*" onChange={e => setEventData({...eventData, image: e.target.files[0]})} style={{ paddingTop: '20px' }} />
                  <label htmlFor="ev-image" className="trendy-label" style={{ top: 0, fontSize: '0.8rem', background: 'var(--bg-elevated)', color: 'var(--primary)' }}>Event Cover Image</label>
                </div>
                
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <input type="checkbox" id="ev-private" checked={eventData.isPrivate} onChange={e => setEventData({...eventData, isPrivate: e.target.checked})} style={{ width: 20, height: 20 }} />
                  <label htmlFor="ev-private" style={{ margin: 0, color: 'var(--text)', cursor: 'pointer' }}>Keep Event Private (Invite-only)</label>
                </div>
              </div>

              {/* Ticket Pricing Section */}
              <div style={{ marginTop: 24, padding: 16, border: '1px dashed var(--border)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h5 style={{ margin: 0 }}>Ticket Pricing</h5>
                  <button type="button" className="btn btn-primary" onClick={addTicketTier} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Add Tier</button>
                </div>
                {eventData.ticketTiers.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Add ticket tiers here if you want. If no tiers are added, the event is Free.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {eventData.ticketTiers.map((tier, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input type="text" placeholder="Tier Name (e.g., VIP)" className="form-input" style={{ flex: 1, padding: 8 }} value={tier.name} onChange={e => updateTicketTier(idx, 'name', e.target.value)} required />
                        <input type="number" placeholder="Price (LKR)" min="0" className="form-input" style={{ width: 120, padding: 8 }} value={tier.price} onChange={e => updateTicketTier(idx, 'price', Number(e.target.value))} required />
                        <input type="number" placeholder="Max/Order" min="1" className="form-input" style={{ width: 100, padding: 8 }} value={tier.maxPerOrder} onChange={e => updateTicketTier(idx, 'maxPerOrder', Number(e.target.value))} required title="Max Tickets Per Order" />
                        <button type="button" onClick={() => removeTicketTier(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
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
        <>
          {/* Main Hosted Events Section */}
          <div className="glass-panel" style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 24 }}>My Hosted Events</h3>
            <div className="dashboard-grid">
              <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: 16 }}>Upcoming Events ({upcomingEvents.length})</h4>
                {upcomingEvents.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming events.</p> : (
                  <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {upcomingEvents.map(ev => (
                      <li key={ev._id}>
                        <strong>{ev.title}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 8 }}>{ev.date} - {ev.isPrivate ? '(Private)' : '(Public)'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Expired Past Events ({expiredEvents.length})</h4>
                {expiredEvents.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No expired events.</p> : (
                  <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {expiredEvents.map(ev => (
                      <li key={ev._id} style={{ color: 'var(--text-muted)' }}>
                        <strong>{ev.title}</strong>
                        <span style={{ fontSize: '0.85rem', marginLeft: 8 }}>{ev.date}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

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
                        <h4 className="card-title">{req.event?.title || 'Unknown Event'}</h4>
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
              <h3>Event Budget Summaries</h3>
              {budgetSummary.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No budgets or invoices assigned yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {budgetSummary.map(summary => (
                    <div key={summary.eventTitle} className="dashboard-card" style={{ borderLeftColor: summary.totalPending > 0 ? 'var(--warning)' : 'var(--success-soft-dark)' }}>
                      <div className="card-header" style={{ marginBottom: 8 }}>
                        <h4 className="card-title">{summary.eventTitle}</h4>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                        <span>Total Budget:</span>
                        <strong>LKR {summary.totalBudget.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--success)', marginBottom: 4 }}>
                        <span>Total Paid:</span>
                        <strong>LKR {summary.totalPaid.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: summary.totalPending > 0 ? 'var(--warning)' : 'var(--text)', fontWeight: 'bold' }}>
                        <span>Pending to Pay:</span>
                        <span>LKR {summary.totalPending.toLocaleString()}</span>
                      </div>
                      
                      {summary.invoices.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Sectors Requested</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                            {summary.invoices.map(inv => (
                               <span key={inv._id} className={`badge ${inv.status === 'Paid' ? 'success' : ''}`} style={{ fontSize: '0.7rem' }}>
                                 {inv.serviceRequest?.sector || 'Unknown'} - {inv.status}
                               </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
