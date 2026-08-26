import { useState, useEffect } from 'react';
import api from '../services/api';
import './StudentRegistry.css';

const StudentRegistry = () => {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdStudentId, setCreatedStudentId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newState, setNewState] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newMonthlyFee, setNewMonthlyFee] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students', error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/admin/dashboard/students', {
        name: newName,
        phone: newPhone,
        email: newEmail,
        parentName: newParentName,
        parentPhone: newParentPhone,
        address: newAddress,
        pincode: newPincode,
        state: newState,
        courseName: newCourseName,
        monthlyFee: parseFloat(newMonthlyFee)
      });
      setTempPassword(response.data.temporaryPassword);
      setCreatedStudentId(response.data.student.enrollmentNumber);
      
      // Clear form
      setNewName(''); setNewPhone(''); setNewEmail('');
      setNewParentName(''); setNewParentPhone('');
      setNewAddress(''); setNewPincode(''); newState('');
      setNewCourseName(''); setNewMonthlyFee('');
      
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setTempPassword('');
    setCreatedStudentId('');
    setError('');
  };

  return (
    <div className="registry-container">
      <div className="registry-header">
        <h2>Student Registry</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Register Student
        </button>
      </div>

      {/* Modal */}
      {(isModalOpen || tempPassword) && (
        <div className="modal-overlay">
          <div className="modal-content">
            {tempPassword ? (
              <div className="success-container">
                <div className="success-icon">✓</div>
                <h3 className="modal-title" style={{ borderBottom: 'none', marginBottom: '8px' }}>Student Created Successfully!</h3>
                <p>Please share these credentials securely with the student:</p>
                
                <div className="success-card">
                  <div className="credential-item">
                    <span className="credential-label">Student ID (Username)</span>
                    <span className="credential-value" style={{ color: '#3b82f6' }}>{createdStudentId}</span>
                  </div>
                  <div className="credential-item">
                    <span className="credential-label">Temporary Password</span>
                    <span className="credential-value">{tempPassword}</span>
                  </div>
                </div>
                
                <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '32px' }}>
                  Ensure they select the "Student" role on the login page.
                </p>
                <button className="btn-primary" style={{ width: '100%', padding: '14px' }} onClick={closeModals}>
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="modal-title">Create New Student Account</h3>
                {error && <div className="error-banner">{error}</div>}
                
                <form onSubmit={handleRegisterSubmit}>
                  
                  <div className="form-grid">
                    {/* Column 1 */}
                    <div className="form-section">
                      <h4 className="section-title">Personal Details</h4>
                      
                      <div className="input-group">
                        <label>Student Full Name*</label>
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="e.g. John Doe" />
                      </div>
                      <div className="input-group">
                        <label>Student Mobile Number*</label>
                        <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} required placeholder="+91" />
                      </div>
                      <div className="input-group">
                        <label>Email Address (Optional)</label>
                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="student@example.com" />
                      </div>

                      <h4 className="section-title" style={{ marginTop: '16px' }}>Academic & Fee Details</h4>
                      <div className="input-group">
                        <label>Course Name*</label>
                        <input type="text" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} required placeholder="e.g. Class 10th Science" />
                      </div>
                      <div className="input-group">
                        <label>Monthly Fee (₹)*</label>
                        <input type="number" value={newMonthlyFee} onChange={e => setNewMonthlyFee(e.target.value)} required placeholder="1500" />
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="form-section">
                      <h4 className="section-title">Guardian & Address Details</h4>
                      
                      <div className="input-group">
                        <label>Parent/Guardian's Name*</label>
                        <input type="text" value={newParentName} onChange={e => setNewParentName(e.target.value)} required placeholder="e.g. Jane Doe" />
                      </div>
                      <div className="input-group">
                        <label>Parent's Mobile Number*</label>
                        <input type="tel" value={newParentPhone} onChange={e => setNewParentPhone(e.target.value)} required placeholder="+91" />
                      </div>
                      <div className="input-group">
                        <label>Full Address*</label>
                        <textarea value={newAddress} onChange={e => setNewAddress(e.target.value)} required placeholder="Enter complete street address..." />
                      </div>
                      
                      <div className="input-row">
                        <div className="input-group">
                          <label>State*</label>
                          <input type="text" value={newState} onChange={e => setNewState(e.target.value)} required placeholder="e.g. Maharashtra" />
                        </div>
                        <div className="input-group">
                          <label>Pincode*</label>
                          <input type="text" value={newPincode} onChange={e => setNewPincode(e.target.value)} required placeholder="e.g. 400001" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={closeModals}>Cancel</button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? 'Registering Student...' : 'Complete Registration'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <table className="modern-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Course</th>
            <th>Monthly Fee</th>
            <th>Parent Name</th>
            <th>Mobile</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.studentId}>
              <td style={{ fontWeight: '600', color: '#3b82f6' }}>{student.enrollmentNumber}</td>
              <td>{student.user?.name}</td>
              <td>{student.courseName || '-'}</td>
              <td>{student.monthlyFee ? `₹${student.monthlyFee}` : '-'}</td>
              <td>{student.parentName || '-'}</td>
              <td>{student.phone || '-'}</td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan="6" className="empty-state">No students registered yet. Click "Register Student" to add one.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentRegistry;
