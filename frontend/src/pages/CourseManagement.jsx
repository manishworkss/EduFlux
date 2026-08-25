import { useState, useEffect } from 'react';
import api from '../services/api';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses', error);
    }
  };

  return (
    <div>
      <h2>Course Management</h2>
      <button style={{ marginBottom: '20px', padding: '10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px' }}>+ Add Course</button>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#ecf0f1', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Course Name</th>
            <th style={{ padding: '12px' }}>Duration</th>
            <th style={{ padding: '12px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.courseId} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{course.courseId}</td>
              <td style={{ padding: '12px' }}>{course.courseName}</td>
              <td style={{ padding: '12px' }}>{course.duration}</td>
              <td style={{ padding: '12px' }}>{course.status}</td>
            </tr>
          ))}
          {courses.length === 0 && <tr><td colSpan="4" style={{ padding: '12px', textAlign: 'center' }}>No courses found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default CourseManagement;
