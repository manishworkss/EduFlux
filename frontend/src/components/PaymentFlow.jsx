import { useState } from 'react';
import api from '../services/api';
import './PaymentFlow.css';

const PaymentFlow = ({ fee, onClose, onSuccess }) => {
  const [step, setStep] = useState('REVIEW'); // REVIEW, PROCESSING, SUCCESS, FAILED
  const [method, setMethod] = useState('UPI');
  const [transactionData, setTransactionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const amountToPay = fee.amount - fee.paidAmount;

  const handlePayment = async () => {
    setStep('PROCESSING');
    try {
      const response = await api.post('/payments/process', {
        studentFee: { studentFeeId: fee.studentFeeId },
        amount: amountToPay,
        paymentMethod: method
      });
      setTransactionData(response.data);
      setStep('SUCCESS');
    } catch (error) {
      console.error("Payment failed", error);
      setErrorMsg(error.response?.data?.message || 'Payment processing failed. Please try again.');
      setStep('FAILED');
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await api.get(`/receipts/generate/${transactionData.paymentId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${transactionData.receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert('Failed to download receipt');
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        {step === 'REVIEW' && (
          <>
            <div className="payment-modal-header">
              <h2>Complete Payment</h2>
              <button className="close-btn" onClick={onClose}>&times;</button>
            </div>
            <div className="payment-modal-content">
              <div className="payment-summary">
                <div className="payment-summary-row">
                  <span>Fee Type</span>
                  <span>{fee.feeStructure?.feeType}</span>
                </div>
                <div className="payment-summary-row">
                  <span>Due Date</span>
                  <span>{new Date(fee.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="payment-summary-row">
                  <span>Amount to Pay</span>
                  <span>₹{amountToPay.toLocaleString()}</span>
                </div>
              </div>

              <h3>Select Payment Method</h3>
              <div className="payment-methods">
                <label className="payment-method-label">
                  <input type="radio" value="UPI" checked={method === 'UPI'} onChange={() => setMethod('UPI')} />
                  <span>UPI (Google Pay, PhonePe, Paytm)</span>
                </label>
                <label className="payment-method-label">
                  <input type="radio" value="CARD" checked={method === 'CARD'} onChange={() => setMethod('CARD')} />
                  <span>Credit / Debit Card</span>
                </label>
                <label className="payment-method-label">
                  <input type="radio" value="NETBANKING" checked={method === 'NETBANKING'} onChange={() => setMethod('NETBANKING')} />
                  <span>Net Banking</span>
                </label>
              </div>
            </div>
            <div className="payment-modal-footer">
              <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePayment}>Pay ₹{amountToPay.toLocaleString()}</button>
            </div>
          </>
        )}

        {step === 'PROCESSING' && (
          <div className="payment-result">
            <div className="result-icon">⏳</div>
            <h2>Processing Payment</h2>
            <p>Please wait while we securely process your payment via {method}. Do not close this window.</p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="payment-result">
            <div className="result-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Your fee payment was received successfully.</p>
            
            <div className="transaction-details">
              <div>Amount Paid: <span>₹{transactionData?.amount.toLocaleString()}</span></div>
              <div>Transaction ID: <span>{transactionData?.transactionId}</span></div>
              <div>Receipt Number: <span>{transactionData?.receiptNumber}</span></div>
              <div>Date: <span>{new Date(transactionData?.paymentDate).toLocaleString()}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
              <button className="btn btn-primary" onClick={onSuccess}>Done</button>
              <button className="btn btn-cancel" onClick={handleDownloadReceipt} style={{ border: 'none', background: 'none', color: '#3b82f6' }}>Download Receipt PDF</button>
            </div>
          </div>
        )}

        {step === 'FAILED' && (
          <div className="payment-result">
            <div className="result-icon">❌</div>
            <h2 style={{ color: '#ef4444' }}>Payment Failed</h2>
            <p>{errorMsg}</p>
            
            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
              <button className="btn btn-primary" onClick={() => setStep('REVIEW')}>Try Again</button>
              <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFlow;
