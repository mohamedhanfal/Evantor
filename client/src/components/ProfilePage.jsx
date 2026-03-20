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
    <main id="main" className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="profile-container">
        <h2 className="profile__title">User Profile</h2>

        {!user.isEmailVerified && (
          <div className="verification-banner">
            <div>
              <strong style={{ display: 'block', fontSize: '1.1rem' }}>Email Not Verified</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Please verify your email address to secure your account.</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: 8, whiteSpace: 'nowrap' }} onClick={() => setShowVerifyModal(true)}>
              Verify Email
            </button>
          </div>
        )}

        {showVerifyModal && (
          <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: 8, color: 'var(--text)' }}>Verify Email</h4>
            {demoToken && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                (Demo: Simulation of email. Use token: <strong>{demoToken}</strong>)
              </p>
            )}
            <form onSubmit={handleVerify} style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <input 
                type="text" 
                placeholder="Paste verification token here" 
                className="trendy-input" 
                style={{ padding: '12px 16px' }}
                value={tokenInput} 
                onChange={(e) => setTokenInput(e.target.value)} 
                required 
              />
              <button type="submit" className="profile-btn" style={{ width: 'auto', padding: '0 24px' }}>Verify</button>
            </form>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div className="trendy-input-group">
            <input 
              className="trendy-input" 
              id="name" 
              name="name" 
              type="text" 
              placeholder=" "
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
            <label className="trendy-label" htmlFor="name">Full Name</label>
          </div>

          <div className="trendy-input-group">
            <input 
              className="trendy-input" 
              id="email" 
              name="email" 
              type="email" 
              placeholder=" "
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            <label className="trendy-label" htmlFor="email">Email Address</label>
          </div>

          <div className="trendy-input-group">
            <input 
              className="trendy-input" 
              id="password" 
              name="password" 
              type="password" 
              placeholder=" "
              value={formData.password} 
              onChange={handleChange} 
              minLength={8} 
            />
            <label className="trendy-label" htmlFor="password">New Password (leave blank to keep current)</label>
          </div>

          <button type="submit" className="profile-btn" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </main>
  );
}
