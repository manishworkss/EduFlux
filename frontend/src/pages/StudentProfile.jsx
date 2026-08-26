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
            <p>Enrollment Number / Username: {profile.enrollmentNumber}</p>
          </div>
        </div>

        <h3 style={{ color: '#0f172a', marginBottom: '24px' }}>Academic Information</h3>
        <div className="profile-grid">
          <div className="profile-field">
            <label>Course</label>
            <div className="profile-field-value">{profile.courseName || 'N/A'}</div>
          </div>
          <div className="profile-field">
            <label>Monthly Fee</label>
            <div className="profile-field-value">{profile.monthlyFee ? `₹${profile.monthlyFee}` : 'N/A'}</div>
          </div>
          <div className="profile-field">
            <label>Status</label>
            <div className="profile-field-value" style={{ color: '#10b981', fontWeight: 700 }}>Active</div>
          </div>
        </div>

        <h3 style={{ color: '#0f172a', margin: '32px 0 24px 0' }}>Personal Information</h3>
        <div className="profile-grid">
          <div className="profile-field">
            <label>Mobile Number</label>
            <div className="profile-field-value">{profile.phone || 'N/A'}</div>
          </div>
          <div className="profile-field">
            <label>Email Address</label>
            <div className="profile-field-value">{profile.personalEmail || 'N/A'}</div>
          </div>
          <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
            <label>Address</label>
            <div className="profile-field-value">
              {profile.address ? (
                <>
                  {profile.address}
                  <br />
                  {profile.state && <span>{profile.state}</span>}
                  {profile.pincode && <span> - {profile.pincode}</span>}
                </>
              ) : 'N/A'}
            </div>
          </div>
        </div>

        <h3 style={{ color: '#0f172a', margin: '32px 0 24px 0' }}>Guardian Information</h3>
        <div className="profile-grid">
          <div className="profile-field">
            <label>Parent / Guardian Name</label>
            <div className="profile-field-value">{profile.parentName || 'N/A'}</div>
          </div>
          <div className="profile-field">
            <label>Parent's Mobile Number</label>
            <div className="profile-field-value">{profile.parentPhone || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
