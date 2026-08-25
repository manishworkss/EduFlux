import { useState } from 'react';
import api from '../services/api';

const MockCheckout = ({ feeId, amount, onSuccess, onCancel }) => {
  const [method, setMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const response = await api.post('/payments/process', {
        studentFee: { studentFeeId: feeId },
        amount: amount,
        paymentMethod: method
      });
      alert('Payment Successful! TXN ID: ' + response.data.transactionId);
      onSuccess();
    } catch (error) {
      alert('Payment failed');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '10px' }}>
      <h3>Mock Checkout</h3>
      <p>Amount to pay: <strong>₹{amount}</strong></p>
      <div style={{ margin: '15px 0' }}>
        <label>Payment Method: </label>
        <select value={method} onChange={e => setMethod(e.target.value)} style={{ padding: '8px' }}>
          <option value="UPI">UPI</option>
          <option value="CARD">Credit/Debit Card</option>
          <option value="NETBANKING">Net Banking</option>
        </select>
      </div>
      <div>
        <button onClick={handlePayment} disabled={processing} style={{ background: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', marginRight: '10px' }}>
          {processing ? 'Processing...' : 'Confirm Payment'}
        </button>
        <button onClick={onCancel} style={{ background: '#e74c3c', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px' }}>Cancel</button>
      </div>
    </div>
  );
};

export default MockCheckout;
