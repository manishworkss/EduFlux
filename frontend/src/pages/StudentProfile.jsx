import { useState, useEffect } from 'react';
import api from '../services/api';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/students/1') // Hardcoded demo ID
       .then(res => setProfile(res.data))
       .catch(err => console.error(err));
  }, []);

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2>My Profile</h2>
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <p><strong>Name:</strong> {profile.user?.name}</p>
        <p><strong>Email:</strong> {profile.user?.email}</p>
        <p><strong>Enrollment Number:</strong> {profile.enrollmentNumber}</p>
        <p><strong>Course:</strong> {profile.course?.courseName}</p>
        <p><strong>Semester:</strong> {profile.semester}</p>
        <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
        <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
      </div>
    </div>
  );
};

export default StudentProfile;
