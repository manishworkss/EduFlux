import { useEffect, useState } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
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

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-value">{metrics.totalStudents}</p>
        </div>
        <div className="stat-card success">
          <h3>Total Collections</h3>
          <p className="stat-value">₹{metrics.totalCollections}</p>
        </div>
        <div className="stat-card warning">
          <h3>Total Pending</h3>
          <p className="stat-value">₹{metrics.totalPending}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
