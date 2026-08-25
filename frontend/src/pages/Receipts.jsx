import { useState, useEffect } from 'react';
import api from '../services/api';
import './Payments.css'; // Reusing some base styles

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await api.get('/students/me/payments');
        // Filter only SUCCESS payments, as only they get receipts
        const successPayments = response.data.filter(p => p.status === 'SUCCESS');
        const sorted = successPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
        setReceipts(sorted);
      } catch (error) {
        console.error("Failed to fetch receipts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
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

  if (loading) return <div className="loading-state">Loading receipts...</div>;

  return (
    <div className="payments-container">
      <h2 className="section-title">My Receipts</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {receipts.map(payment => (
          <div key={payment.paymentId} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.25rem' }}>₹{payment.amount.toLocaleString()}</div>
              <span className="status-badge status-paid">PAID</span>
            </div>
            
            <div style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '8px' }}>
              <strong style={{ color: '#1e293b' }}>Fee:</strong> {payment.studentFee?.feeStructure?.feeType}
            </div>
            <div style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '8px' }}>
              <strong style={{ color: '#1e293b' }}>Date:</strong> {new Date(payment.paymentDate).toLocaleDateString()}
            </div>
            <div style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '24px' }}>
              <strong style={{ color: '#1e293b' }}>Receipt No:</strong> {payment.receiptNumber}
            </div>
            
            <button 
              onClick={() => downloadReceipt(payment)}
              style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.target.style.background = '#f1f5f9' }}
              onMouseOut={(e) => { e.target.style.background = '#f8fafc' }}
            >
              ⬇ Download PDF
            </button>
          </div>
        ))}
        {receipts.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No receipts generated yet.</div>
        )}
      </div>
    </div>
  );
};

export default Receipts;
