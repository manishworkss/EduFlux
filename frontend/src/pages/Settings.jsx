import { useState, useEffect } from 'react';
import './StudentProfile.css';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleChangePassword = () => {
    alert("Password change functionality will be implemented in the next phase!");
  };

  const handleToggleNotification = () => {
    setNotifications(!notifications);
    alert(!notifications ? "Push Notifications Enabled" : "Push Notifications Disabled");
  };

  const handleToggleEmail = () => {
    setEmailAlerts(!emailAlerts);
    alert(!emailAlerts ? "Email Alerts Enabled" : "Email Alerts Disabled");
  };

  return (
    <div className="profile-container">
      <h2 className="section-title">Settings</h2>
      
      <div className="settings-card">
        <h3 style={{ color: 'var(--text-color, #0f172a)', marginBottom: '24px', marginTop: 0 }}>Preferences</h3>
        
        <div className="settings-row">
          <div className="settings-info">
            <h4>Push Notifications</h4>
            <p>Receive alerts for upcoming due dates and successful payments.</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={notifications} onChange={handleToggleNotification} />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-info">
            <h4>Email Alerts</h4>
            <p>Get receipts and fee reminders sent to your registered email.</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={emailAlerts} onChange={handleToggleEmail} />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-info">
            <h4>Dark Mode</h4>
            <p>Switch between light and dark themes.</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            <span className="slider round"></span>
          </label>
        </div>

      </div>

      <div className="settings-card" style={{ marginTop: '24px' }}>
        <h3 style={{ color: 'var(--text-color, #0f172a)', marginBottom: '16px', marginTop: 0 }}>Security</h3>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Update your password or configure two-factor authentication.</p>
        <button className="btn btn-cancel" style={{ width: 'auto', display: 'inline-block' }} onClick={handleChangePassword}>Change Password</button>
      </div>
    </div>
  );
};

export default Settings;
