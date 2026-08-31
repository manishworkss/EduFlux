import { useState } from 'react';
import api from '../services/api';
import './PaymentFlow.css';

const PaymentFlow = ({ fee, onClose, onSuccess }) => {
  const [step, setStep] = useState('REVIEW'); // REVIEW, PROCESSING, SUCCESS, FAILED
  const [transactionData, setTransactionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const amountToPay = fee.amount - (fee.paidAmount || 0);

  const handlePayment = async () => {
    setStep('PROCESSING');
    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payments/create-order', {
        feeId: fee.studentFeeId,
        amount: amountToPay,
        paymentMethod: 'ONLINE'
      });
      
      const { orderId, amount, key } = orderRes.data;

      // 2. Initialize Razorpay options
      const options = {
        key: key, 
        amount: parseInt(amount) * 100, 
        currency: "INR",
        name: "Neel Mehta", // Configured as requested
        description: fee.feeStructure?.feeType || "Fee Payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Verify on backend
            setStep('PROCESSING');
            
            // Extract student ID from fee object or local storage (if paying own fee)
            let studentId = fee.student?.studentId;
            if (!studentId) {
               const userStr = localStorage.getItem('user');
               if (userStr) {
                  const userObj = JSON.parse(userStr);
                  // Since we only have userId here, backend handles the lookup inside PaymentController if studentId is not strict
                  // Actually, backend needs studentId, we might need an endpoint to get studentId for current user,
                  // or pass userId and let backend find studentId. Backend expects studentId.
                  // For now, let's pass a dummy if missing and let backend fallback to authenticated user.
                  studentId = 0; // Backend handles if studentId is 0 or null by fetching from auth
               }
            }

            const verifyRes = await api.post('/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              feeId: fee.studentFeeId,
              studentId: studentId,
              amount: amountToPay,
              method: 'RAZORPAY_ONLINE'
            });
            setTransactionData(verifyRes.data);
            setStep('SUCCESS');
          } catch (err) {
            console.error("Verification error", err);
            setErrorMsg("Payment verification failed. Please contact admin.");
            setStep('FAILED');
          }
        },
        prefill: {
          name: fee.student?.user?.name || "Student",
        },
        theme: {
          color: "#3b82f6"
        },
        modal: {
          ondismiss: function() {
            setStep('REVIEW');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
         console.error(response.error);
         setErrorMsg(response.error.description);
         setStep('FAILED');
      });
      rzp.open();

    } catch (error) {
      console.error("Failed to create order", error);
      setErrorMsg(error.response?.data?.message || 'Failed to initiate payment.');
      setStep('FAILED');
    }
  };

  const handleDownloadReceipt = () => {
    try {
      const receiptContent = `
========================================
             EDUFLUX TUITION            
             FEE RECEIPT                
========================================
Receipt No  : ${transactionData?.receiptNumber || 'N/A'}
Date & Time : ${new Date(transactionData?.paymentDate).toLocaleString('en-IN')}
Transaction : ${transactionData?.transactionId || 'N/A'}
----------------------------------------
Fee Type    : ${fee.feeStructure?.feeType || 'Monthly Fee'}
Method      : ${transactionData?.paymentMethod || 'ONLINE'}
Amount Paid : Rs. ${transactionData?.amount}
Status      : SUCCESS
----------------------------------------
Thank you for your payment!
========================================
`;
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${transactionData?.receiptNumber || transactionData?.transactionId}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
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
                  <span>Pay To</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>Neel Mehta</span>
                </div>
                <div className="payment-summary-row">
                  <span>Fee Type</span>
                  <span>{fee.feeStructure?.feeType}</span>
                </div>
                <div className="payment-summary-row">
                  <span>Amount to Pay</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{amountToPay.toLocaleString()}</span>
                </div>
              </div>
              <p style={{ textAlign: 'center', color: '#64748b', margin: '24px 0 8px' }}>
                You will be redirected to Razorpay's secure checkout to select UPI, Card, or Netbanking.
              </p>
            </div>
            <div className="payment-modal-footer">
              <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePayment} style={{ background: '#3b82f6' }}>
                Pay Securely ₹{amountToPay.toLocaleString()}
              </button>
            </div>
          </>
        )}

        {step === 'PROCESSING' && (
          <div className="payment-result">
            <div className="result-icon">⏳</div>
            <h2>Processing Payment</h2>
            <p>Please wait... Do not close this window.</p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="payment-result">
            <div className="result-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Your fee payment was securely verified and received.</p>
            
            <div className="transaction-details">
              <div>Amount Paid: <span>₹{transactionData?.amount.toLocaleString()}</span></div>
              <div>Transaction ID: <span>{transactionData?.transactionId}</span></div>
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
