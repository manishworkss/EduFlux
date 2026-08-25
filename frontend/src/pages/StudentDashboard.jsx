import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { profile } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [upcomingFee, setUpcomingFee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, paymentsRes, feesRes] = await Promise.all([
          api.get('/students/me/fees/summary'),
          api.get('/students/me/payments'),
          api.get('/students/me/fees')
        ]);
        
        setSummary(summaryRes.data);
        
        // Sort and get top 3 recent payments
        const sortedPayments = paymentsRes.data.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
        setRecentPayments(sortedPayments.slice(0, 3));

        // Find next upcoming or overdue fee
        const pendingFees = feesRes.data.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL' || f.status === 'OVERDUE');
        if (pendingFees.length > 0) {
          pendingFees.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          setUpcomingFee(pendingFees[0]);
        }
        
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  const progressPercentage = summary?.totalFee > 0 
    ? Math.round((summary.paidAmount / summary.totalFee) * 100) 
    : 0;

  return (
    <div className="student-dashboard-container">
      <div className="fee-summary-grid">
        <div className="fee-stat-card">
          <h3>Total Fee</h3>
          <p className="fee-stat-value">₹{summary?.totalFee?.toLocaleString()}</p>
        </div>
        <div className="fee-stat-card paid">
          <h3>Paid</h3>
          <p className="fee-stat-value">₹{summary?.paidAmount?.toLocaleString()}</p>
        </div>
        <div className="fee-stat-card pending">
          <h3>Pending</h3>
          <p className="fee-stat-value">₹{summary?.pendingAmount?.toLocaleString()}</p>
        </div>
        <div className="fee-stat-card overdue">
          <h3>Overdue</h3>
          <p className="fee-stat-value">₹{summary?.overdueAmount?.toLocaleString()}</p>
        </div>
      </div>

      <div className="fee-progress-section">
        <div className="fee-progress-header">
          <span>Fee Payment Progress</span>
          <span>{progressPercentage}% Completed</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="progress-footer">
          ₹{summary?.paidAmount?.toLocaleString()} paid of ₹{summary?.totalFee?.toLocaleString()}
        </div>
      </div>

      <div className="dashboard-row">
        <div className="recent-payments-section">
          <h2 className="section-title">Recent Payments</h2>
          <div className="recent-payments-list">
            {recentPayments.length > 0 ? (
              recentPayments.map(payment => (
                <div key={payment.paymentId} className="payment-item">
                  <div className="payment-item-details">
                    <h4>{payment.studentFee?.feeStructure?.feeType}</h4>
                    <p>{new Date(payment.paymentDate).toLocaleDateString()} | TXN: {payment.transactionId}</p>
                  </div>
                  <div className="payment-item-amount">
                    ₹{payment.amount.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent payments found.</div>
            )}
          </div>
        </div>

        <div className="upcoming-payment-card">
          <h2 className="section-title">Action Required</h2>
          {upcomingFee ? (
            <div className="action-card-content">
              <h3 style={{ color: upcomingFee.status === 'OVERDUE' ? '#ef4444' : '#f59e0b', marginTop: 0 }}>
                {upcomingFee.status === 'OVERDUE' ? 'Payment Overdue' : 'Upcoming Fee'}
              </h3>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', margin: '8px 0' }}>{upcomingFee.feeStructure?.feeType}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0', color: '#0f172a' }}>
                ₹{(upcomingFee.amount - upcomingFee.paidAmount).toLocaleString()}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '20px' }}>
                Due: {new Date(upcomingFee.dueDate).toLocaleDateString()}
              </p>
              <Link to="/student/fees" className="action-btn" style={{ display: 'block', textAlign: 'center' }}>
                Pay Now
              </Link>
            </div>
          ) : (
            <div className="empty-state">🎉 You are all caught up! No pending fees.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
