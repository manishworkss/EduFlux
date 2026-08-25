import { useState, useEffect } from 'react';
import api from '../services/api';
import './StudentNotifications.css';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/students/me/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/students/me/notifications/${id}/read`);
      // Update local state to avoid refetching
      setNotifications(notifications.map(n => 
        n.notificationId === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error(error);
    }
  };

  const getIconForType = (type) => {
    if (type === 'PAYMENT_SUCCESS') return '✅';
    if (type === 'FEE_REMINDER') return '⚠️';
    if (type === 'OVERDUE_ALERT') return '🚨';
    return '🔔';
  };

  if (loading) return <div className="loading-state">Loading notifications...</div>;

  return (
    <div>
      <h2 className="section-title">Notifications</h2>
      
      <div className="notifications-container">
        {notifications.map(notif => (
          <div key={notif.notificationId} className={`notification-card ${!notif.isRead ? 'unread' : ''}`}>
            <div className="notification-icon">
              {getIconForType(notif.type)}
            </div>
            <div className="notification-content">
              <div className="notification-header">
                <h4>{notif.title}</h4>
                <span className="notification-time">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <p className="notification-message">{notif.message}</p>
              
              {!notif.isRead && (
                <div className="notification-actions">
                  <button onClick={() => markAsRead(notif.notificationId)} className="mark-read-btn">
                    Mark as Read
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="empty-state" style={{ background: 'white', padding: '48px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            🎉 You have no new notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
