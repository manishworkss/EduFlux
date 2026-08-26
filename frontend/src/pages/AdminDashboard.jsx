import { useEffect, useState } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // We keep the metrics for backend connectivity, even if they aren't shown in the current UI mock, 
  // or we can add them to the top if we want, but user said "all should look like this type", so we exactly match the images.
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalCollections: 0,
    totalPending: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/admin/dashboard/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error("Failed to fetch metrics", error);
      }
    };
    fetchMetrics();
  }, []);

  // Empty state icon SVG
  const EmptyBoxIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="empty-state-icon">
      <path d="M52 24L32 12L12 24V40L32 52L52 40V24Z" fill="#F8FAFC"/>
      <path d="M52 24L32 12L12 24V40L32 52L52 40V24Z" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 24L32 36L52 24" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 52V36" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="24" y="28" width="16" height="8" rx="2" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2"/>
    </svg>
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Maintain detailed student records, track attendance, exams and results.</p>
      </div>

      <div className="dashboard-content">
        <div className="left-column">
          <div className="dashboard-card card-schedule">
            <div className="card-header">
              <h3>Upcoming Schedule</h3>
              <button className="view-more">View More</button>
            </div>
            <div className="card-body empty-state">
              <EmptyBoxIcon />
              <p>No upcoming classes</p>
            </div>
          </div>

          <div className="dashboard-card card-completed">
            <div className="card-header">
              <h3>Recently Completed</h3>
              <button className="view-more">View More</button>
            </div>
            <div className="card-body empty-state">
              <EmptyBoxIcon />
              <p>No recently completed classes</p>
            </div>
          </div>

          <div className="dashboard-card card-exams">
            <div className="card-header">
              <h3>Exams</h3>
              <button className="view-more">View More</button>
            </div>
            <div className="card-body empty-state">
              <EmptyBoxIcon />
              <p>No upcoming exams</p>
            </div>
          </div>

          <div className="dashboard-card card-announcements">
            <div className="card-header">
              <h3>Announcements</h3>
              <button className="view-more">View More</button>
            </div>
            <div className="card-body empty-state">
              <EmptyBoxIcon />
              <p>No announcements</p>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="dashboard-card todo-card">
            <div className="card-header todo-header">
              <h3>To-Do List</h3>
              <div className="todo-tabs">
                <button className="tab active">All</button>
                <button className="tab">Pending</button>
                <button className="tab">Completed</button>
              </div>
            </div>

            <div className="date-selector">
              <button className="nav-btn">&lt;</button>
              <span>Today</span>
              <button className="nav-btn">&gt;</button>
            </div>

            <div className="add-todo">
              <input type="text" placeholder="Write a to-do for this day..." />
              <button className="add-btn">+</button>
            </div>

            <div className="card-body empty-state todo-empty">
              <EmptyBoxIcon />
              <p>No to-dos for this day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
