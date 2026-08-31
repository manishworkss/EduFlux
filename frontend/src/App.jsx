import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';

import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const TopProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(70), 200);
    const timer2 = setTimeout(() => setProgress(100), 400);
    const timer3 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 300);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '3px',
      zIndex: 999999, pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: visible ? 'opacity 0.1s ease' : 'opacity 0.4s ease'
    }}>
      <div style={{
        width: `${progress}%`, height: '100%',
        background: '#3b82f6',
        transition: 'width 0.2s ease-out',
        boxShadow: '0 0 10px #3b82f6, 0 0 5px #3b82f6'
      }}></div>
    </div>
  );
};

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );
  if (!user) return <Navigate to="/auth" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/auth" />;

  return children;
};

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import CourseManagement from './pages/CourseManagement';
import FeeStructureManagement from './pages/FeeStructureManagement';
import StudentRegistry from './pages/StudentRegistry';
import AdminAIAssistant from './pages/AdminAIAssistant';
import AdminAnalyticalReports from './pages/AdminAnalyticalReports';
import AdminProfile from './pages/AdminProfile';
import AdminFeeSetup from './pages/AdminFeeSetup';
import AdminFeeTracker from './pages/AdminFeeTracker';
import StudentLayout from './components/StudentLayout';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentFees from './pages/StudentFees';
import StudentNotifications from './pages/StudentNotifications';
import PaymentHistory from './pages/PaymentHistory';
import Receipts from './pages/Receipts';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';

import ForceChangePassword from './pages/ForceChangePassword';

function App() {
  return (
    <Router>
      <TopProgressBar />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/force-change-password" element={<ForceChangePassword />} />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute roles={['ROLE_ADMIN']}>
                <AdminLayout />
              </PrivateRoute>
            } 
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="fee-structures" element={<FeeStructureManagement />} />
            <Route path="students" element={<StudentRegistry />} />
            <Route path="fee-setup" element={<AdminFeeSetup />} />
            <Route path="fee-tracker" element={<AdminFeeTracker />} />
            <Route path="analytical-reports" element={<AdminAnalyticalReports />} />
            <Route path="ai-assistant" element={<AdminAIAssistant />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          <Route 
            path="/student" 
            element={
              <PrivateRoute roles={['ROLE_STUDENT']}>
                <StudentLayout />
              </PrivateRoute>
            } 
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="payment-history" element={<PaymentHistory />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
