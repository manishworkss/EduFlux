import { useOutletContext } from 'react-router-dom';
import './StudentProfile.css';

const StudentProfile = () => {
  const { profile } = useOutletContext();

  if (!profile) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="profile-container">
      <h2 className="section-title">My Profile</h2>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.user?.name.charAt(0)}
          </div>
          <div className="profile-header-info">
            <h2>{profile.user?.name}</h2>
            <p>Enrollment Number: {profile.enrollmentNumber}</p>
          </div>
        </div>

        <h3 style={{ color: '#0f172a', marginBottom: '24px' }}>Academic Information</h3>
        <div className="profile-grid">
          <div className="profile-field">
            <label>Course</label>
            <div className="profile-field-value">{profile.course?.courseName}</div>
          </div>
          <div className="profile-field">
            <label>Current Semester</label>
            <div className="profile-field-value">Semester {profile.currentSemester}</div>
          </div>
          <div className="profile-field">
            <label>Academic Year</label>
            <div className="profile-field-value">{profile.academicYear}</div>
          </div>
          <div className="profile-field">
            <label>Status</label>
            <div className="profile-field-value" style={{ color: '#10b981', fontWeight: 700 }}>Active</div>
          </div>
        </div>

        <h3 style={{ color: '#0f172a', margin: '32px 0 24px 0' }}>Personal Information</h3>
        <div className="profile-grid">
          <div className="profile-field">
            <label>Email Address</label>
            <div className="profile-field-value">{profile.user?.email}</div>
          </div>
          <div className="profile-field">
            <label>Phone Number</label>
            <div className="profile-field-value">{profile.phone || 'N/A'}</div>
          </div>
          <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
            <label>Address</label>
            <div className="profile-field-value">{profile.address || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
