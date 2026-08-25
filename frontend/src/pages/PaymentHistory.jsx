import { useState, useEffect } from 'react';
import api from '../services/api';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/payments/history/1') // Hardcoded student ID
       .then(res => setPayments(res.data))
       .catch(err => console.error(err));
  }, []);

  const downloadReceipt = (payment) => {
    // In a real app, this would fetch a PDF blob from backend or generate it locally with jsPDF
    alert('Mock PDF Download trigger for Receipt: ' + payment.receiptNumber);
  };

  return (
    <div>
      <h2>Payment History</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#ecf0f1', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Transaction ID</th>
            <th style={{ padding: '12px' }}>Date</th>
            <th style={{ padding: '12px' }}>Amount</th>
            <th style={{ padding: '12px' }}>Method</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px' }}>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.paymentId} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{payment.transactionId}</td>
              <td style={{ padding: '12px' }}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
              <td style={{ padding: '12px' }}>₹{payment.amount}</td>
              <td style={{ padding: '12px' }}>{payment.paymentMethod}</td>
              <td style={{ padding: '12px', color: payment.status === 'SUCCESS' ? 'green' : 'red' }}>{payment.status}</td>
              <td style={{ padding: '12px' }}>
                {payment.status === 'SUCCESS' && (
                  <button onClick={() => downloadReceipt(payment)} style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>Download</button>
                )}
              </td>
            </tr>
          ))}
          {payments.length === 0 && <tr><td colSpan="6" style={{ padding: '12px', textAlign: 'center' }}>No transactions found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;
