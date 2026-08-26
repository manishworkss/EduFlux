import { Outlet, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026-27');


  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <ul className="sidebar-nav">
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/fee-structures">Fee Structures</Link></li>
            <li><Link to="/admin/students">Students</Link></li>
            <li><Link to="/admin/ai-assistant">AI Assistant</Link></li>
            <li><Link to="/admin/profile">My Profile</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <header className="header">
          <div className="header-left">
            {/* Title removed to match layout which has actions on right */}
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
                MK
              </div>
              <span className="profile-name">mmmm kkkkk</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </header>
        <div className="main-container">
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
