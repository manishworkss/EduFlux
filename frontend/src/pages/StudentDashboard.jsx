import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    if (user?.userId) {
      // Need student ID from user ID
      api.get(`/students?userId=${user.userId}`)
        .then(res => {
           // mock logic for demo
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  return (
    <div className="dashboard">
      <h2>Welcome to your Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Paid</h3>
          <p className="stat-value">₹0</p>
        </div>
        <div className="stat-card warning">
          <h3>Pending Dues</h3>
          <p className="stat-value">₹0</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
