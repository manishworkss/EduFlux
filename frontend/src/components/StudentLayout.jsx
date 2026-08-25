import { Outlet, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AdminLayout.css'; // Reusing layout CSS for consistency

const StudentLayout = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2>Student Panel</h2>
        <nav>
          <ul>
            <li><Link to="/student/dashboard">Dashboard</Link></li>
            <li><Link to="/student/profile">My Profile</Link></li>
            <li><Link to="/student/fees">My Fees</Link></li>
            <li><Link to="/student/notifications">Notifications</Link></li>
          </ul>
        </nav>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>
      <main className="content">
        <header className="header">
          <h1>Smart Tuition Fee Portal</h1>
        </header>
        <div className="main-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
