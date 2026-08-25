import { useState, useEffect } from 'react';
import api from '../services/api';

const FeeStructureManagement = () => {
  const [feeStructures, setFeeStructures] = useState([]);

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const response = await api.get('/fee-structures');
      setFeeStructures(response.data);
    } catch (error) {
      console.error('Error fetching fee structures', error);
    }
  };

  return (
    <div>
      <h2>Fee Structure Management</h2>
      <button style={{ marginBottom: '20px', padding: '10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px' }}>+ Add Fee Structure</button>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#ecf0f1', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Course</th>
            <th style={{ padding: '12px' }}>Semester</th>
            <th style={{ padding: '12px' }}>Amount</th>
            <th style={{ padding: '12px' }}>Type</th>
          </tr>
        </thead>
        <tbody>
          {feeStructures.map(fee => (
            <tr key={fee.feeStructureId} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{fee.feeStructureId}</td>
              <td style={{ padding: '12px' }}>{fee.course?.courseName}</td>
              <td style={{ padding: '12px' }}>{fee.semester}</td>
              <td style={{ padding: '12px' }}>₹{fee.amount}</td>
              <td style={{ padding: '12px' }}>{fee.feeType}</td>
            </tr>
          ))}
          {feeStructures.length === 0 && <tr><td colSpan="5" style={{ padding: '12px', textAlign: 'center' }}>No fee structures found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default FeeStructureManagement;
