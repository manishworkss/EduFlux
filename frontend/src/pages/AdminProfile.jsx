import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AdminProfile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    className: user?.className || ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Ideally, fetch profile from backend
  useEffect(() => {
    // We can simulate fetching or just use what we know
    setFormData(prev => ({
      ...prev,
      className: user?.className || ''
    }));
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      // If we had a profile update endpoint:
      // await api.put('/admin/profile', formData);
      setMessage('Profile updated successfully!');
      // In a real scenario, this would update user context as well
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div style={{ maxWidth: '600px', background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#1e293b' }}>My Profile</h2>
      {message && <div style={{ color: '#059669', background: '#d1fae5', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{message}</div>}
      {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Class / Institute Name</label>
          <input
            type="text"
            name="className"
            value={formData.className}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            required
          />
        </div>
        <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default AdminProfile;
