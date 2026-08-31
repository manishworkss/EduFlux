import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026-27');
  const location = useLocation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSubtitle = () => {
    if (location.pathname.includes('profile')) {
      return user?.profileCompleted
        ? 'Manage your personal information and preferences.'
        : 'Welcome to the Main Admin Dashboard. Please complete your profile to continue.';
    }
    if (location.pathname.includes('dashboard')) return "Here's your tuition fee overview for 2026–27.";
    if (location.pathname.includes('students')) return 'Manage and view all student records and their fee status.';
    if (location.pathname.includes('ai-assistant')) return 'Interact with the AI assistant for quick insights and help.';
    return '';
  };

  if (user && !user.profileCompleted && location.pathname !== '/admin/profile') {
    return <Navigate to="/admin/profile" replace />;
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
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
          <ul className="sidebar-nav">
            {user?.profileCompleted ? (
              <>
                <li>
                  <Link to="/admin/dashboard" className={location.pathname.includes('dashboard') ? 'active' : ''}>
                    <span>Dashboard</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/students" className={location.pathname.includes('students') ? 'active' : ''}>
                    <span>Students</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/fee-setup" className={location.pathname.includes('fee-setup') ? 'active' : ''}>
                    <span>Fee Setup</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="22"></line><line x1="12" y1="2" x2="12" y2="6"></line></svg>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/fee-tracker" className={location.pathname.includes('fee-tracker') ? 'active' : ''}>
                    <span>Fee Tracker</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/analytical-reports" className={location.pathname.includes('analytical-reports') ? 'active' : ''}>
                    <span>Reports</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/ai-assistant" className={location.pathname.includes('ai-assistant') ? 'active' : ''}>
                    <span>AI Assistant</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  </Link>
                </li>
              </>
            ) : null}
            <li>
              <Link to="/admin/profile" className={location.pathname.includes('profile') ? 'active' : ''}>
                <span>My Profile</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <header className="header">
          <div className="header-left">
            <h1 style={{ margin: 0, fontSize: '22px', color: '#1e293b', fontWeight: '700' }}>
              {getGreeting()}, {user?.name || 'Admin'} 👋
            </h1>
          </div>
          <div className="header-right">
            <div className="header-action-pill date-picker">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <select
                className="year-selector"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
                <option value="2027-28">2027-28</option>
              </select>
            </div>

            <div className="header-action-pill institute-badge">
              <div className="avatar-circle light-purple">
                {user?.className ? user.className.charAt(0).toUpperCase() : 'N'}
              </div>
              <span>{user?.className || 'new'}</span>
            </div>

            <div className="header-profile" onClick={() => setShowLogoutPopup(true)} title="Click to view options">
              <div className="avatar-circle gradient-purple">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A'}
              </div>
              <span className="profile-name">{user?.name || 'Admin'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </header>
        <div className="main-container">
          {getSubtitle() && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>
                {getSubtitle()}
              </p>
            </div>
          )}
          <Outlet />
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

export default AdminLayout;
