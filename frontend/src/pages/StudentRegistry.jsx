import { useState, useEffect } from 'react';
import api from '../services/api';

const StudentRegistry = () => {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        email: newEmail
      });
      setTempPassword(response.data.temporaryPassword);
      setNewName('');
      setNewEmail('');
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
    setError('');
  };

  return (
    <div>
      <h2>Student Registry</h2>
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: '20px', padding: '10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        + Register Student
      </button>

      {/* Basic Modal implementation */}
      {(isModalOpen || tempPassword) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            {tempPassword ? (
              <div>
                <h3 style={{ color: '#10b981', marginTop: 0 }}>Student Created Successfully!</h3>
                <p>Please share these credentials securely with the student:</p>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
                  <p style={{ margin: '0 0 8px 0' }}><strong>Temporary Password:</strong></p>
                  <code style={{ fontSize: '1.2rem', color: '#0f172a' }}>{tempPassword}</code>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>They will be prompted to change this upon their first login.</p>
                <button onClick={closeModals} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
              </div>
            ) : (
              <div>
                <h3 style={{ marginTop: 0 }}>Create New Student Account</h3>
                {error && <div style={{ color: '#ef4444', background: '#fee2e2', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
                
                <form onSubmit={handleRegisterSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={closeModals} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#ecf0f1', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Enrollment No</th>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Course</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.studentId} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{student.enrollmentNumber}</td>
              <td style={{ padding: '12px' }}>{student.user?.name}</td>
              <td style={{ padding: '12px' }}>{student.user?.email}</td>
              <td style={{ padding: '12px' }}>{student.course?.courseName}</td>
            </tr>
          ))}
          {students.length === 0 && <tr><td colSpan="4" style={{ padding: '12px', textAlign: 'center' }}>No students found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default StudentRegistry;
