import { useState, useEffect } from 'react';
import api from '../services/api';
import PaymentFlow from '../components/PaymentFlow';
import './StudentFees.css';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, OVERDUE
  const [selectedFee, setSelectedFee] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFees = async () => {
    try {
      const response = await api.get('/students/me/fees');
      setFees(response.data);
    } catch (error) {
      console.error("Failed to fetch fees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const getFilteredFees = () => {
    if (activeTab === 'PENDING') return fees.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL');
    if (activeTab === 'OVERDUE') return fees.filter(f => f.status === 'OVERDUE');
    return fees;
  };

  const filteredFees = getFilteredFees();

  if (loading) return <div className="loading-state">Loading fees...</div>;

  return (
    <div className="fees-container">
      <div className="fees-header">
        <h2 className="section-title">My Fees</h2>
      </div>

      <div className="fees-tabs">
        <button 
          className={`fees-tab ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Fees
        </button>
        <button 
          className={`fees-tab ${activeTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Pending
        </button>
        <button 
          className={`fees-tab ${activeTab === 'OVERDUE' ? 'active' : ''}`}
          onClick={() => setActiveTab('OVERDUE')}
        >
          Overdue
        </button>
      </div>

      <div className="fees-table-container">
        <table className="fees-table">
          <thead>
            <tr>
              <th>Fee Type</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Remaining</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFees.map(fee => (
              <tr key={fee.studentFeeId}>
                <td>{fee.feeStructure?.feeType}</td>
                <td>₹{fee.amount.toLocaleString()}</td>
                <td>₹{fee.paidAmount.toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>₹{(fee.amount - fee.paidAmount).toLocaleString()}</td>
                <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${fee.status.toLowerCase()}`}>
                    {fee.status}
                  </span>
                </td>
                <td>
                  {fee.status !== 'PAID' && (
                    <button 
                      className="pay-now-btn"
                      onClick={() => setSelectedFee(fee)}
                    >
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredFees.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">No fees found in this category. 🎉</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedFee && (
        <PaymentFlow 
          fee={selectedFee} 
          onClose={() => setSelectedFee(null)}
          onSuccess={() => {
            setSelectedFee(null);
            fetchFees();
          }}
        />
      )}
    </div>
  );
};

export default StudentFees;
