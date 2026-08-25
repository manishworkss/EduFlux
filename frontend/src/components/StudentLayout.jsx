import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './StudentLayout.css';

const StudentLayout = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const [profile, setProfile] = useState(null);

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
        <h2>AI [EduFlux]</h2>
        <div className="student-subtitle">Smart Tuition Fee Management</div>
        <nav>
          <ul>
            <li><Link to="/student/dashboard" className={isActive('dashboard')}>Dashboard</Link></li>
            <li><Link to="/student/profile" className={isActive('profile')}>My Profile</Link></li>
            <li><Link to="/student/fees" className={isActive('fees')}>My Fees</Link></li>
            <li><Link to="/student/payment-history" className={isActive('payment-history')}>Payment History</Link></li>
            <li><Link to="/student/receipts" className={isActive('receipts')}>Receipts</Link></li>
            <li><Link to="/student/notifications" className={isActive('notifications')}>Notifications</Link></li>
            <li><Link to="/student/ai-assistant" className={isActive('ai-assistant')}>🤖 AI Fee Assistant</Link></li>
            <li><Link to="/student/settings" className={isActive('settings')}>Settings</Link></li>
          </ul>
        </nav>
        <button className="student-logout-btn" onClick={logout}>Logout</button>
      </aside>
      
      <main className="student-content">
        <header className="student-header">
          <div className="header-greeting">
            {profile ? (
              <>
                <h1>{getGreeting()}, {profile.user?.name.split(' ')[0]} 👋</h1>
                <p>{profile.course?.courseName} • Semester {profile.currentSemester} • Academic Year {profile.academicYear} | Enrollment No: {profile.enrollmentNumber}</p>
              </>
            ) : (
              <h1>Loading...</h1>
            )}
          </div>
          <div className="header-actions">
            {/* Notification bell and profile avatar could go here */}
          </div>
        </header>
        
        <div className="student-main-container">
          <Outlet context={{ profile }} />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
