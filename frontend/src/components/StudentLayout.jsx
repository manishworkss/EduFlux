import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './StudentLayout.css';

const StudentLayout = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/students/me');
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch student profile", error);
      }
    };
    fetchProfile();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px', marginBottom: '32px', marginTop: '8px' }}>
          <div style={{ background: '#3b82f6', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: '600' }}>AI [EduFlux]</h2>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/student/dashboard" className={isActive('dashboard')}>
                <span>Dashboard</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </Link>
            </li>
            <li>
              <Link to="/student/profile" className={isActive('profile')}>
                <span>My Profile</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </Link>
            </li>
            <li>
              <Link to="/student/fees" className={isActive('fees')}>
                <span>My Fees</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </Link>
            </li>
            <li>
              <Link to="/student/payment-history" className={isActive('payment-history')}>
                <span>Payment History</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </Link>
            </li>
            <li>
              <Link to="/student/receipts" className={isActive('receipts')}>
                <span>Receipts</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </Link>
            </li>
            <li>
              <Link to="/student/notifications" className={isActive('notifications')}>
                <span>Notifications</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </Link>
            </li>
            <li>
              <Link to="/student/ai-assistant" className={isActive('ai-assistant')}>
                <span>AI Fee Assistant</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </Link>
            </li>
            <li>
              <Link to="/student/settings" className={isActive('settings')}>
                <span>Settings</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      
      <main className="student-content">
        <header className="student-header">
          <div className="header-greeting">
            {profile ? (
              <>
                <h1>{getGreeting()}, {profile.user?.name?.split(' ')[0] || 'Student'} 👋</h1>
                <p>{profile.course?.courseName || 'No Course Assigned'} • Semester {profile.semester || 'N/A'} | Enrollment No: {profile.enrollmentNumber || 'N/A'}</p>
              </>
            ) : (
              <h1>Loading...</h1>
            )}
          </div>
          <div className="header-actions">
            <div className="header-profile" onClick={() => setShowLogoutPopup(true)} title="Click to view options">
              <div className="avatar-circle gradient-purple">
                {profile?.user?.name ? profile.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'S'}
              </div>
              <span className="profile-name">{profile?.user?.name || 'Student'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </header>
        
        <div className="student-main-container">
          <Outlet context={{ profile }} />
        </div>
      </main>

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Logout Confirmation</h3>
            <p>Are you sure you want to logout?</p>
            <div className="logout-modal-actions">
              <button className="btn-no" onClick={() => setShowLogoutPopup(false)}>No, Stay Here</button>
              <button className="btn-yes" onClick={logout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLayout;
