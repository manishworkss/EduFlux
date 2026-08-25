import { Outlet, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <ul>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/courses">Courses</Link></li>
            <li><Link to="/admin/fee-structures">Fee Structures</Link></li>
            <li><Link to="/admin/students">Students</Link></li>
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

export default AdminLayout;
