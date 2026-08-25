import { useState, useEffect } from 'react';
import api from '../services/api';
import MockCheckout from '../components/MockCheckout';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);

  useEffect(() => {
    // Hardcoded fetch for UI demo context
    api.get('/student-fees/student/1')
       .then(res => setFees(res.data))
       .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>My Fees</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#ecf0f1', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Fee Type</th>
            <th style={{ padding: '12px' }}>Total Amount</th>
            <th style={{ padding: '12px' }}>Paid</th>
            <th style={{ padding: '12px' }}>Due Date</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {fees.map(fee => (
            <tr key={fee.studentFeeId} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{fee.feeStructure?.feeType}</td>
              <td style={{ padding: '12px' }}>₹{fee.amount}</td>
              <td style={{ padding: '12px' }}>₹{fee.paidAmount}</td>
              <td style={{ padding: '12px' }}>{fee.dueDate}</td>
              <td style={{ padding: '12px' }}>{fee.status}</td>
              <td style={{ padding: '12px' }}>
                {fee.status !== 'PAID' && (
                  <button onClick={() => setSelectedFee(fee)} style={{ padding: '6px 12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pay Now</button>
                )}
              </td>
            </tr>
          ))}
          {fees.length === 0 && <tr><td colSpan="6" style={{ padding: '12px', textAlign: 'center' }}>No fees assigned yet.</td></tr>}
        </tbody>
      </table>
      
      {selectedFee && (
        <MockCheckout 
          feeId={selectedFee.studentFeeId} 
          amount={selectedFee.amount - selectedFee.paidAmount} 
          onSuccess={() => {
            setSelectedFee(null);
            // Refresh logic could go here
          }} 
          onCancel={() => setSelectedFee(null)} 
        />
      )}
    </div>
  );
};

export default StudentFees;
