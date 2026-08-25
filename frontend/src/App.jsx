import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
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
            <Route path="ai-assistant" element={<AdminAIAssistant />} />
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
