import { useEffect, useState } from 'react';
import api from '../services/api';
import './AdminFeeSetup.css';

const AdminFeeSetup = () => {
  const [students, setStudents] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, configsRes] = await Promise.all([
        api.get('/students'),
        api.get('/admin/fee-management/configs')
      ]);
      setStudents(studentsRes.data);
      setConfigs(configsRes.data);
      
      // Initialize edit data
      const initialEditData = {};
      studentsRes.data.forEach(student => {
        const config = configsRes.data.find(c => c.student?.studentId === student.studentId);
        if (config) {
          initialEditData[student.studentId] = {
            monthlyAmount: config.monthlyAmount,
            feeStartMonth: config.feeStartMonth ? config.feeStartMonth.substring(0, 10) : ''
          };
        } else {
          // Default start month to current month
          const date = new Date();
          const firstDay = new Date(date.getFullYear(), date.getMonth(), 2).toISOString().substring(0, 10);
          initialEditData[student.studentId] = {
            monthlyAmount: student.course?.fee || '',
            feeStartMonth: firstDay
          };
        }
      });
      setEditData(initialEditData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (studentId, field, value) => {
    setEditData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async (studentId) => {
    try {
      setSavingId(studentId);
      const data = editData[studentId];
      if (!data.monthlyAmount || !data.feeStartMonth) {
        alert("Please enter both amount and start date.");
        setSavingId(null);
        return;
      }

      await api.post('/admin/fee-management/configs', {
        studentId: studentId,
        monthlyAmount: parseFloat(data.monthlyAmount),
        feeStartMonth: data.feeStartMonth,
        effectiveFrom: data.feeStartMonth,
        active: true
      });
      
      // Refresh configs
      const configsRes = await api.get('/admin/fee-management/configs');
      setConfigs(configsRes.data);
    } catch (error) {
      console.error("Failed to save config", error);
      alert("Failed to save fee configuration.");
    } finally {
      setSavingId(null);
    }
  };

  const handleTriggerGeneration = async () => {
    if (window.confirm("This will generate pending monthly fees for all active configurations. Proceed?")) {
      try {
        await api.post('/admin/fee-management/trigger-generation');
        alert("Monthly fees generated successfully!");
      } catch (error) {
        console.error("Failed to trigger generation", error);
        alert("Failed to generate fees.");
      }
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading Students and Fee Configurations...</p>
      </div>
    );
  }

  return (
    <div className="admin-fee-setup">
      <div className="fee-setup-header">
        <div>
          <h2>Fee Setup</h2>
          <p>Configure monthly fees and start dates for each student.</p>
        </div>
        <button className="trigger-btn" onClick={handleTriggerGeneration}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          Generate Pending Fees
        </button>
      </div>

      <div className="fee-table-container">
        <table className="fee-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Monthly Fee (₹)</th>
              <th>Start Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => {
              const config = configs.find(c => c.student?.studentId === student.studentId);
              const data = editData[student.studentId] || {};
              const initialLetters = student.user?.name ? student.user.name.substring(0, 2).toUpperCase() : 'ST';
              
              return (
                <tr key={student.studentId}>
                  <td>
                    <div className="student-info">
                      <div className="student-avatar">{initialLetters}</div>
                      <div className="student-details">
                        <span className="student-name">{student.user?.name}</span>
                        <span className="student-course">{student.course?.courseName || 'N/A'} • {student.enrollmentNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {config ? (
                      <span className="status-badge status-active">Configured</span>
                    ) : (
                      <span className="status-badge status-not-set">Not Set</span>
                    )}
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="fee-input" 
                      value={data.monthlyAmount || ''} 
                      onChange={(e) => handleInputChange(student.studentId, 'monthlyAmount', e.target.value)}
                      placeholder="e.g. 1500"
                    />
                  </td>
                  <td>
                    <input 
                      type="date" 
                      className="date-input"
                      value={data.feeStartMonth || ''}
                      onChange={(e) => handleInputChange(student.studentId, 'feeStartMonth', e.target.value)}
                    />
                  </td>
                  <td>
                    <button 
                      className={`btn-save ${savingId === student.studentId ? 'btn-saving' : ''}`}
                      onClick={() => handleSave(student.studentId)}
                      disabled={savingId === student.studentId}
                    >
                      {savingId === student.studentId ? 'Saving...' : 'Save Config'}
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {students.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                  No students found in the registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFeeSetup;
