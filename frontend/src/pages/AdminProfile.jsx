import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './AdminProfile.css';

const AdminProfile = () => {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    mobileNo: user?.mobileNo || '+91 ',
    address: user?.address || '',
    className: user?.className || ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    // In a real app we might fetch existing profile details here.
    // For now, populate what we have from Context/LocalStorage.
    setFormData(prev => ({
      ...prev,
      name: user?.name || '',
      className: user?.className || '',
      mobileNo: user?.mobileNo || '+91 '
    }));
  }, [user]);

  const handleChange = (e) => {
    if (e.target.name === 'mobileNo') {
      let val = e.target.value;
      
      // Ensure it always starts with +91 
      if (!val.startsWith('+91 ')) {
        if (val.startsWith('+91')) {
          val = '+91 ' + val.substring(3).trim();
        } else {
          val = '+91 ' + val.replace(/\D/g, '');
        }
      }
      
      // Keep only digits after +91 
      const numberPart = val.substring(4).replace(/\D/g, '');
      const truncatedNumber = numberPart.substring(0, 10); // max 10 digits
      
      setFormData({ ...formData, mobileNo: '+91 ' + truncatedNumber });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    // Validate mobile number
    const numberPart = formData.mobileNo.substring(4);
    if (numberPart.length !== 10) {
      setError('Mobile number must be exactly 10 digits (excluding +91 code).');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.put('/auth/profile', formData);
      setMessage('Profile updated successfully!');
      
      // Update local storage and force reload so AuthContext picks up profileCompleted = true
      localStorage.setItem('profileCompleted', 'true');
      if (profilePic) localStorage.setItem('profilePic', profilePic);
      if (formData.name) localStorage.setItem('name', formData.name);
      if (formData.className) localStorage.setItem('className', formData.className);
      
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="admin-profile-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, color: '#1e293b' }}>My Profile</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Account Status</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#d1fae5', color: '#059669', padding: '4px 12px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }}></span>
              Active
            </span>
          </div>
        </div>
        
        {message && <div style={{ color: '#059669', background: '#d1fae5', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{message}</div>}
        {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
          {/* Avatar Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '160px', height: '160px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', color: '#94a3b8', overflow: 'hidden' }}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/jpeg, image/png, image/gif" 
              onChange={handleFileChange} 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              style={{ background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}
            >
              Change Photo
            </button>
            <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              Allowed *.jpeg, *.jpg, *.png, *.gif<br />max size of 3.1 MB
            </p>
          </div>

          {/* Fields Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="profile-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Class / Institute Name</label>
                <input type="text" name="className" value={formData.className} onChange={handleChange} className="profile-input" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="profile-input" placeholder="Currently uneditable" disabled />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Mobile No</label>
                <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleChange} className="profile-input" placeholder="+91 " required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="profile-textarea" required></textarea>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Change Password (Optional)</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="profile-input" placeholder="Leave blank to keep current password" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" disabled={isSubmitting} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
