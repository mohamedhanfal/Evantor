import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function ProfilePage() {
  const { user, updateProfile, verifyEmail } = useAuth();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  // Simulating token reception for demo purposes
  const [demoToken, setDemoToken] = useState('');

  if (!user) {
    return (
      <main id="main" className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <h2>Please log in to view your profile.</h2>
      </main>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const updateData = {};
    if (formData.name !== user.name) updateData.name = formData.name;
    if (formData.email !== user.email) updateData.email = formData.email;
    if (formData.password) updateData.password = formData.password;

    if (Object.keys(updateData).length === 0) {
      showToast('No changes made.', 'info');
      setLoading(false);
      return;
    }

    const { success, error, message, token } = await updateProfile(updateData);
    if (success) {
      showToast(message, 'success');
      setFormData((prev) => ({ ...prev, password: '' }));
      if (token) setDemoToken(token); // For demo purposes only
    } else {
      showToast(error, 'error');
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const { success, error, message } = await verifyEmail(tokenInput || demoToken);
    if (success) {
      showToast(message, 'success');
      setShowVerifyModal(false);
      setDemoToken('');
      setTokenInput('');
    } else {
      showToast(error, 'error');
    }
  };

  return (
    <main id="main" className="section" style={{ maxWidth: 600, margin: '0 auto', minHeight: '60vh' }}>
      <h2 className="section__title">User Profile</h2>

      {!user.isEmailVerified && (
        <div style={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid #ff9800', color: '#ff9800', padding: 16, borderRadius: 8, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Email Not Verified</strong>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Please verify your email address to secure your account.</p>
          </div>
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setShowVerifyModal(true)}>
            Verify Email
          </button>
        </div>
      )}

      {showVerifyModal && (
        <div style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12, marginBottom: 24 }}>
          <h4>Verify Email</h4>
          {demoToken && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              (Demo: Simulation of email. Use token: <strong>{demoToken}</strong>)
            </p>
          )}
          <form onSubmit={handleVerify} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input 
              type="text" 
              placeholder="Paste verification token here" 
              className="form-input" 
              value={tokenInput} 
              onChange={(e) => setTokenInput(e.target.value)} 
              required 
            />
            <button type="submit" className="btn btn-primary">Verify</button>
          </form>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'var(--surface-light)', padding: 24, borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label" htmlFor="name">Full Name</label>
          <input className="form-input" id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label" htmlFor="email">Email Address</label>
          <input className="form-input" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="form-label" htmlFor="password">New Password (leave blank to keep current)</label>
          <input className="form-input" id="password" name="password" type="password" value={formData.password} onChange={handleChange} minLength={8} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
}
