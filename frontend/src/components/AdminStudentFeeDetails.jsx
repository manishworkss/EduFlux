import { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminStudentFeeDetails.css';

const AdminStudentFeeDetails = ({ student, studentFees, onClose }) => {
  const [activeTab, setActiveTab] = useState('FEES'); // 'FEES' or 'PAYMENTS'
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'PAYMENTS' && student) {
      fetchPayments();
    }
  }, [activeTab, student]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/payments/history/${student.studentId}`);
      const sorted = response.data.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      setPayments(sorted);
    } catch (error) {
      console.error("Failed to fetch payment history", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
        
        <div className="admin-modal-header">
          <h3>
            {student.user?.name}
            <span className="student-course-badge">
              {student.course?.courseName || student.courseName} • {student.enrollmentNumber}
            </span>
          </h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="admin-modal-tabs">
          <button 
            className={`admin-modal-tab ${activeTab === 'FEES' ? 'active' : ''}`}
            onClick={() => setActiveTab('FEES')}
          >
            Assigned Fees
          </button>
          <button 
            className={`admin-modal-tab ${activeTab === 'PAYMENTS' ? 'active' : ''}`}
            onClick={() => setActiveTab('PAYMENTS')}
          >
            Payment History
          </button>
        </div>

        <div className="admin-modal-body">
          {activeTab === 'FEES' && (
            <table className="admin-modal-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Remaining</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentFees.map(fee => (
                  <tr key={fee.studentFeeId}>
                    <td>{new Date(fee.feeMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                    <td>₹{fee.amount.toLocaleString()}</td>
                    <td>₹{fee.paidAmount.toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>₹{(fee.amount - fee.paidAmount).toLocaleString()}</td>
                    <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${fee.status.toLowerCase()}`}>
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {studentFees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state">No assigned fees found for this student.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'PAYMENTS' && (
            <>
              {loading ? (
                <div className="loading-spinner">Fetching payment records...</div>
              ) : (
                <table className="admin-modal-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Fee Type</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Transaction ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.paymentId}>
                        <td>{formatDateTime(payment.paymentDate)}</td>
                        <td>{payment.studentFee?.feeStructure?.feeType || 'Monthly Fee'}</td>
                        <td style={{ fontWeight: 600, color: '#10b981' }}>₹{payment.amount.toLocaleString()}</td>
                        <td>{payment.paymentMethod}</td>
                        <td><code style={{ background: '#f1f5f9', padding: '4px', borderRadius: '4px' }}>{payment.transactionId}</code></td>
                        <td>
                          <span className={`status-badge status-${payment.status === 'SUCCESS' ? 'paid' : 'overdue'}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan="6" className="empty-state">No payment history found for this student.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminStudentFeeDetails;
