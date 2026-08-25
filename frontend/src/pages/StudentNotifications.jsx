import { useState, useEffect } from 'react';
import api from '../services/api';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/student/1'); // Hardcoded ID
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      <div style={{ marginTop: '20px' }}>
        {notifications.map(notif => (
          <div key={notif.notificationId} style={{ 
            padding: '15px', 
            background: notif.isRead ? 'white' : '#eaf2f8', 
            borderLeft: notif.isRead ? '4px solid #bdc3c7' : '4px solid #3498db',
            marginBottom: '10px',
            borderRadius: '4px'
          }}>
            <h4 style={{ margin: '0 0 5px 0' }}>{notif.title}</h4>
            <p style={{ margin: '0 0 10px 0', color: '#555' }}>{notif.message}</p>
            {!notif.isRead && (
              <button onClick={() => markAsRead(notif.notificationId)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Mark as Read</button>
            )}
          </div>
        ))}
        {notifications.length === 0 && <p>No notifications.</p>}
      </div>
    </div>
  );
};

export default StudentNotifications;
