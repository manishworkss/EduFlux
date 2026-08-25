import { useState, useEffect } from 'react';
import api from '../services/api';

const StudentRegistry = () => {
  const [students, setStudents] = useState([]);

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

  return (
    <div>
      <h2>Student Registry</h2>
      <button style={{ marginBottom: '20px', padding: '10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px' }}>+ Register Student</button>
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
