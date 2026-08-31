import { useState, useEffect } from 'react';
import api from '../services/api';
import './StudentRegistry.css';

const StudentRegistry = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdStudentDetails, setCreatedStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Form States
  // Personal Details
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDob, setNewDob] = useState(''); 

  // Academic Details
  const [newEnrollmentNumber, setNewEnrollmentNumber] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState('2026-27');
  const [newAdmissionDate, setNewAdmissionDate] = useState('');

  // Address Details
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');

  // Guardian Details
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [newGuardianRelationship, setNewGuardianRelationship] = useState('Father');

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses', error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/admin/dashboard/students', {
        name: newName,
        email: newEmail,
        phone: newPhone,
        enrollmentNumber: newEnrollmentNumber,
        courseName: newCourseName,
        semester: parseInt(newSemester),
        academicYear: newAcademicYear,
        admissionDate: newAdmissionDate || null,
        address: newAddress,
        city: newCity,
        state: newState,
        pincode: newPincode,
        guardianName: newGuardianName,
        guardianPhone: newGuardianPhone,
        guardianRelationship: newGuardianRelationship,
        dob: newDob || null
      });
      
      setCreatedStudentDetails({
        name: newName,
        enrollmentNumber: response.data.student.enrollmentNumber,
        temporaryPassword: response.data.temporaryPassword
      });
      
      resetForm();
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.put(`/admin/dashboard/students/${editingStudentId}`, {
        name: newName,
        email: newEmail,
        phone: newPhone,
        enrollmentNumber: newEnrollmentNumber,
        courseName: newCourseName,
        semester: parseInt(newSemester),
        academicYear: newAcademicYear,
        admissionDate: newAdmissionDate || null,
        address: newAddress,
        city: newCity,
        state: newState,
        pincode: newPincode,
        guardianName: newGuardianName,
        guardianPhone: newGuardianPhone,
        guardianRelationship: newGuardianRelationship,
        dob: newDob || null
      });
      
      closeModals();
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (student) => {
    setIsEditMode(true);
    setEditingStudentId(student.studentId);
    
    setNewName(student.user?.name || '');
    setNewEmail(student.personalEmail || student.user?.email || '');
    setNewPhone(student.phone || '');
    setNewDob(student.dob || '');
    setNewEnrollmentNumber(student.enrollmentNumber || '');
    setNewCourseName(student.courseName || '');
    setNewSemester(student.semester || '');
    setNewAcademicYear(student.academicYear || '2026-27');
    setNewAdmissionDate(student.admissionDate || '');
    setNewAddress(student.address || '');
    setNewCity(student.city || '');
    setNewState(student.state || '');
    setNewPincode(student.pincode || '');
    setNewGuardianName(student.guardianName || '');
    setNewGuardianPhone(student.guardianPhone || '');
    setNewGuardianRelationship(student.guardianRelationship || 'Father');
    
    setIsModalOpen(true);
  };

  const resetForm = () => {
      setNewName(''); setNewEmail(''); setNewPhone(''); setNewDob('');
      setNewEnrollmentNumber(''); setNewCourseName(''); setNewSemester(''); setNewAcademicYear('2026-27'); setNewAdmissionDate('');
      setNewAddress(''); setNewCity(''); setNewState(''); setNewPincode('');
      setNewGuardianName(''); setNewGuardianPhone(''); setNewGuardianRelationship('Father');
  }

  const closeModals = () => {
    setIsModalOpen(false);
    setCreatedStudentDetails(null);
    setError('');
    setIsEditMode(false);
    setEditingStudentId(null);
    resetForm();
  };
  
  const copyCredentials = () => {
      if(!createdStudentDetails) return;
      const text = `EduFlux Student Account\n\nStudent Name: ${createdStudentDetails.name}\nStudent ID: ${createdStudentDetails.enrollmentNumber}\nEnrollment No: ${createdStudentDetails.enrollmentNumber}\nTemporary Password: ${createdStudentDetails.temporaryPassword}\nLogin: ${window.location.origin}/login`;
      navigator.clipboard.writeText(text);
      alert("Credentials copied to clipboard!");
  };

  // Determine available semesters based on selected course
  const getAvailableSemesters = () => {
    if (!newCourseName) return [];
    const course = courses.find(c => c.courseName === newCourseName);
    if (!course || !course.duration) return [1, 2, 3, 4, 5, 6, 7, 8]; // default fallback
    
    // Attempt to extract years from string (e.g. "3 Years")
    const match = course.duration.match(/(\d+)/);
    if (match) {
        const years = parseInt(match[0]);
        const sems = years * 2;
        return Array.from({ length: Math.min(sems, 12) }, (_, i) => i + 1);
    }
    return [1, 2, 3, 4, 5, 6];
  };

  return (
    <div className="registry-container">
      <div className="registry-header">
        <h2>Student Registry</h2>
        <button className="btn-primary" onClick={() => { setIsEditMode(false); setIsModalOpen(true); }}>
          + Register Student
        </button>
      </div>

      {/* Modal */}
      {(isModalOpen || createdStudentDetails) && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            {createdStudentDetails ? (
              <div className="success-container">
                <div className="success-icon">✓</div>
                <h3 className="modal-title" style={{ borderBottom: 'none', marginBottom: '8px' }}>Student Account Created</h3>
                
                <div className="success-details-list">
                    <p><strong>Student:</strong> {createdStudentDetails.name}</p>
                    <p><strong>Student ID:</strong> {createdStudentDetails.enrollmentNumber}</p>
                    <p><strong>Enrollment Number:</strong> {createdStudentDetails.enrollmentNumber}</p>
                    <p><strong>Temporary Password:</strong> {createdStudentDetails.temporaryPassword}</p>
                    <p><strong>Role:</strong> STUDENT</p>
                    <p><strong>Status:</strong> Active</p>
                </div>
                
                <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
                  Provide these temporary credentials to the student. <br/>
                  The student will be required to change the password on first login.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button type="button" className="btn-secondary" onClick={copyCredentials}>
                    Copy Credentials
                    </button>
                    <button className="btn-primary" onClick={closeModals}>
                    Done
                    </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="modal-title">{isEditMode ? 'Edit Student Details' : 'Create New Student Account'}</h3>
                {error && <div className="error-banner">{error}</div>}
                
                <form onSubmit={isEditMode ? handleUpdateSubmit : handleRegisterSubmit}>
                  
                  <div className="form-grid-2col">
                    {/* Column 1 */}
                    <div className="form-column">
                      <div className="form-section">
                        <h4 className="section-title">👤 Personal Details</h4>
                        <div className="input-group">
                          <label>Student Full Name *</label>
                          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="e.g. Rahul Sharma" />
                        </div>
                        <div className="input-group">
                          <label>Email Address *</label>
                          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="rahul@example.com" />
                        </div>
                        <div className="input-group">
                          <label>Student Mobile Number *</label>
                          <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} required placeholder="+91" />
                        </div>
                        <div className="input-group">
                          <label>Date of Birth</label>
                          <input type="date" value={newDob} onChange={e => setNewDob(e.target.value)} />
                        </div>
                      </div>

                      <div className="form-section" style={{ marginTop: '24px' }}>
                        <h4 className="section-title">🏠 Address Details</h4>
                        <div className="input-group">
                          <label>Full Address *</label>
                          <textarea value={newAddress} onChange={e => setNewAddress(e.target.value)} required placeholder="Enter complete street address..." />
                        </div>
                        <div className="input-group">
                          <label>City *</label>
                          <input type="text" value={newCity} onChange={e => setNewCity(e.target.value)} required placeholder="e.g. Mumbai" />
                        </div>
                        <div className="input-row-half">
                            <div className="input-group">
                            <label>State *</label>
                            <select value={newState} onChange={e => setNewState(e.target.value)} required>
                                <option value="">Select State ▼</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Karnataka">Karnataka</option>
                                <option value="Gujarat">Gujarat</option>
                                <option value="Tamil Nadu">Tamil Nadu</option>
                                <option value="Other">Other</option>
                            </select>
                            </div>
                            <div className="input-group">
                            <label>Pincode *</label>
                            <input type="text" value={newPincode} onChange={e => setNewPincode(e.target.value)} required placeholder="e.g. 400001" />
                            </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="form-column">
                      <div className="form-section">
                        <h4 className="section-title">🎓 Academic Details</h4>
                        <div className="input-group">
                          <label>Enrollment Number *</label>
                          <input type="text" value={newEnrollmentNumber} onChange={e => setNewEnrollmentNumber(e.target.value)} required placeholder="e.g. EDU2026001" />
                        </div>
                        <div className="input-group">
                          <label>Course *</label>
                          <select value={newCourseName} onChange={e => { setNewCourseName(e.target.value); setNewSemester(''); }} required>
                            <option value="">Select Course ▼</option>
                            {courses.map(c => (
                                <option key={c.courseId} value={c.courseName}>{c.courseName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="input-row-half">
                            <div className="input-group">
                            <label>Semester *</label>
                            <select value={newSemester} onChange={e => setNewSemester(e.target.value)} required disabled={!newCourseName}>
                                <option value="">Select Semester ▼</option>
                                {getAvailableSemesters().map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                            </div>
                            <div className="input-group">
                            <label>Academic Year *</label>
                            <select value={newAcademicYear} onChange={e => setNewAcademicYear(e.target.value)} required>
                                <option value="2025-26">2025–26</option>
                                <option value="2026-27">2026–27</option>
                                <option value="2027-28">2027–28</option>
                            </select>
                            </div>
                        </div>
                        <div className="input-group">
                          <label>Admission Date *</label>
                          <input type="date" value={newAdmissionDate} onChange={e => setNewAdmissionDate(e.target.value)} required />
                        </div>
                      </div>

                      <div className="form-section" style={{ marginTop: '24px' }}>
                        <h4 className="section-title">👨‍👩‍👦 Guardian Details</h4>
                        <div className="input-group">
                          <label>Guardian Name *</label>
                          <input type="text" value={newGuardianName} onChange={e => setNewGuardianName(e.target.value)} required placeholder="e.g. Ramesh Sharma" />
                        </div>
                        <div className="input-group">
                          <label>Guardian Mobile Number *</label>
                          <input type="tel" value={newGuardianPhone} onChange={e => setNewGuardianPhone(e.target.value)} required placeholder="+91" />
                        </div>
                        <div className="input-group">
                            <label>Relationship</label>
                            <select value={newGuardianRelationship} onChange={e => setNewGuardianRelationship(e.target.value)}>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Guardian">Guardian</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

                  <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary" onClick={closeModals}>Cancel</button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? (isEditMode ? 'Updating...' : 'Creating Account...') : (isEditMode ? 'Update Details' : 'Create Student Account')}
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
            <th>Enrollment No.</th>
            <th>Name</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Guardian</th>
            <th>Mobile</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.studentId} onClick={() => handleEditClick(student)} style={{ cursor: 'pointer' }} className="student-row">
              <td style={{ fontWeight: '600', color: '#3b82f6' }}>{student.enrollmentNumber}</td>
              <td>{student.user?.name}</td>
              <td>{student.courseName || '-'}</td>
              <td>{student.semester || '-'}</td>
              <td>{student.guardianName || '-'}</td>
              <td>{student.phone || '-'}</td>
              <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>
                {student.user?.rawPassword || '••••••••'}
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan="7" className="empty-state">No students registered yet. Click "Register Student" to add one.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentRegistry;
