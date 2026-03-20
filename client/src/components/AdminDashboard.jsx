import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const SERVICES = ["Decoration", "DJ", "Food", "Photographers", "Travels"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  // Modal map for editing User roles
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('host');
  const [selectedSector, setSelectedSector] = useState('');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
    } catch (err) {
      showToast('Failed to load admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      const payload = { role: selectedRole, serviceSector: selectedRole === 'team_lead' ? selectedSector : null };
      const { data } = await api.put(`/admin/users/${editUser._id}/role`, payload);

      if (data.success) {
        showToast('User role updated!', 'success');
        setEditUser(null);
        fetchAdminData(); // Refresh list
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update user role.', 'error');
    }
  };

  const openEditModal = (u) => {
    setEditUser(u);
    setSelectedRole(u.role);
    setSelectedSector(u.serviceSector || SERVICES[0]);
  };

  if (!user || user.role !== 'admin') {
    return (
      <main className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only Administrators can access this dashboard.</p>
      </main>
    );
  }

  return (
    <main id="main" className="section" style={{ maxWidth: 1200, margin: '0 auto', minHeight: '60vh' }}>
      <h2 className="section__title" style={{ marginBottom: 32 }}>Admin Dashboard</h2>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading dashboard...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          
          {/* Stats Overview */}
          <section>
            <h3 style={{ marginBottom: 16 }}>Platform Overview</h3>
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalUsers}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Registered Users</div>
                </div>
                <div style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalEvents}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Created Events</div>
                </div>
                <div style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'green' }}>LKR {stats.totalTurnover.toLocaleString()}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Total Turnover</div>
                </div>
                <div style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'green' }}>LKR {stats.platformProfit.toLocaleString()}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Platform Profit (10%)</div>
                </div>
              </div>
            )}
          </section>

          {/* User Management */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>User & Role Management</h3>
            </div>
            
            <div style={{ overflowX: 'auto', background: 'var(--surface-light)', borderRadius: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: 16 }}>Name</th>
                    <th style={{ padding: 16 }}>Email</th>
                    <th style={{ padding: 16 }}>Role</th>
                    <th style={{ padding: 16 }}>Sector</th>
                    <th style={{ padding: 16, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: 16 }}>{u.name}</td>
                      <td style={{ padding: 16 }}>{u.email}</td>
                      <td style={{ padding: 16 }}>
                        <span style={{ padding: '4px 8px', background: 'var(--bg)', borderRadius: 12, fontSize: '0.85rem' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: 16, color: 'var(--text-muted)' }}>{u.serviceSector || '-'}</td>
                      <td style={{ padding: 16, textAlign: 'right' }}>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => openEditModal(u)}>
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Edit Role Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal__header">
              <h3 className="modal__title">Update User Role</h3>
              <button className="modal__close" onClick={() => setEditUser(null)}>×</button>
            </div>
            <form onSubmit={handleUpdateRole} className="modal__body">
              <p>Updating <strong>{editUser.name}</strong></p>
              
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Role</label>
                <select className="form-input" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                  <option value="host">Host / Standard User</option>
                  <option value="ticketer">Ticketer</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {selectedRole === 'team_lead' && (
                <div style={{ marginTop: 16 }}>
                  <label className="form-label">Assign Service Sector</label>
                  <select className="form-input" value={selectedSector} onChange={e => setSelectedSector(e.target.value)}>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 24 }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
