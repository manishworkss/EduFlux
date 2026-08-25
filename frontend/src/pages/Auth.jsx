import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpView, setShowOtpView] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('ROLE_STUDENT');
  const [otp, setOtp] = useState('');
  
  // UI States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (isLogin) {
      if (newRole === 'ROLE_ADMIN') {
        setEmail('admin@example.com');
        setPassword('password123');
      } else {
        setEmail('alice@example.com');
        setPassword('password123');
      }
    }
  };
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', {
        name: fullName,
        email,
        password,
        role
      });
      setShowOtpView(true);
      setSuccessMsg(`OTP has been sent to ${email}. Please check your inbox.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp
      });
      // The verify endpoint logs the user in automatically and returns auth token + role
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      
      // We need to trigger the AuthContext to recognize the new token.
      // Easiest way is to force a reload which restores state from localStorage, 
      // or we can call a context method. We'll just manually navigate and let the app reload context if needed, 
      // but login() from context is better if we could pass the token. 
      // Since `login` in context does an API call, we can just do this:
      window.location.href = response.data.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/student/dashboard';
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setShowOtpView(false);
  };

  return (
    <div className="auth-container">
      {/* Left Panel - Dark Theme */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1>AI [EduFlux]</h1>
          </div>
          <p className="auth-subtitle">AI-POWERED TUITION MANAGEMENT SYSTEM</p>
          
          <div className="auth-features">
            <h2>{isLogin ? "Welcome Back" : "Join AI EduFlux"}</h2>
            <p>
              {isLogin 
                ? "Access your centralized tuition intelligence platform. Streamline your fees and analytics with AI EduFlux."
                : "Unlock the full potential of your tuition center's data with our advanced management platform."}
            </p>
            
            <ul className="feature-list">
              <li><span className="check-icon">✓</span> Real-Time Fee Tracking</li>
              <li><span className="check-icon">✓</span> Automated Notifications</li>
              <li><span className="check-icon">✓</span> Centralized Admin Dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel - Light Theme */}
      <div className="auth-right">
        <div className="auth-form-container">
          
          {showOtpView ? (
            <>
              <h2>Verify Your Email</h2>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>
                We've sent a verification code to <strong>{email}</strong>
              </p>
              
              {error && <div className="error-message">{error}</div>}
              {successMsg && <div className="success-message" style={{ color: '#059669', background: '#d1fae5', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{successMsg}</div>}
              
              <form onSubmit={handleOtpSubmit} className="auth-form">
                <div className="form-group">
                  <label>One-Time Password (OTP)</label>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <small style={{ color: '#64748b', marginTop: '8px', display: 'block' }}>
                    Tip: For local testing, check your backend console logs for the OTP!
                  </small>
                </div>
                
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>
              </form>
              
              <div className="toggle-auth">
                <span style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={() => setShowOtpView(false)}>
                  ← Back to Signup
                </span>
              </div>
            </>
          ) : (
            <>
              <h2>{isLogin ? "Sign In to Your Account" : "Create Your Account"}</h2>
              
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="auth-form">
                {!isLogin && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="password-header">
                    <label>Password</label>
                    {isLogin && <a href="#" className="forgot-password">Forgot Password?</a>}
                  </div>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span 
                      className="eye-icon" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer' }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                  </div>
                </div>

                <div className="form-group role-group">
                  <label>Role</label>
                  <div className="role-selector">
                    <button 
                      type="button" 
                      className={`role-btn ${role === 'ROLE_STUDENT' ? 'active' : ''}`}
                      onClick={() => handleRoleChange('ROLE_STUDENT')}
                    >
                      Student
                    </button>
                    <button 
                      type="button" 
                      className={`role-btn ${role === 'ROLE_ADMIN' ? 'active' : ''}`}
                      onClick={() => handleRoleChange('ROLE_ADMIN')}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account →")}
                </button>
              </form>

              <div className="toggle-auth">
                {isLogin ? (
                  <span>Don't have an account? <a href="#" onClick={toggleAuthMode}>Create one now</a></span>
                ) : (
                  <span>Already have an account? <a href="#" onClick={toggleAuthMode}>Sign in</a></span>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Auth;
