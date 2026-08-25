import { useState, useEffect } from 'react';
import api from '../services/api';
import './Payments.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/students/me/payments');
        // Sort newest first
        const sorted = response.data.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
        setPayments(sorted);
      } catch (error) {
        console.error("Failed to fetch payment history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const downloadReceipt = async (payment) => {
    try {
      const response = await api.get(`/receipts/generate/${payment.paymentId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${payment.receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert('Receipt backend functionality pending implementation.');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.studentFee?.feeStructure?.feeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-state">Loading payment history...</div>;

  return (
    <div className="payments-container">
      <h2 className="section-title">Payment History</h2>
      
      <div className="payments-filters">
        <input 
          type="text" 
          placeholder="Search by Transaction ID or Fee Type..." 
          className="filter-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Transaction ID</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment.paymentId}>
                <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td>{payment.studentFee?.feeStructure?.feeType}</td>
                <td style={{ fontWeight: 600 }}>₹{payment.amount.toLocaleString()}</td>
                <td>{payment.paymentMethod}</td>
                <td><code style={{ background: '#f1f5f9', padding: '4px', borderRadius: '4px' }}>{payment.transactionId}</code></td>
                <td>
                  <span className={`status-badge status-${payment.status === 'SUCCESS' ? 'paid' : 'overdue'}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  {payment.status === 'SUCCESS' && (
                    <button onClick={() => downloadReceipt(payment)} className="receipt-btn">
                      PDF
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">No payment history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
