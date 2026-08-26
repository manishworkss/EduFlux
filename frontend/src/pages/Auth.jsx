import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(() => {
    return sessionStorage.getItem('authMode') !== 'signup';
  });
  const [showOtpView, setShowOtpView] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [otp, setOtp] = useState('');
  const [loginRole, setLoginRole] = useState('ROLE_ADMIN');

  // UI States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Admin and Student specific dummy credentials can be added to standard logins, 
  // but we removed the role selector so no need to auto-fill based on role here.

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, loginRole);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Invalid email or password');
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
        className
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
      // The verify endpoint logs the user in automatically and returns auth token + role + className
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userId', response.data.userId);
      if (response.data.className) {
        localStorage.setItem('className', response.data.className);
      }

      // We need to trigger the AuthContext to recognize the new token.
      // Easiest way is to force a reload which restores state from localStorage, 
      // or we can call a context method. We'll just manually navigate and let the app reload context if needed, 
      // but login() from context is better if we could pass the token. 
      // Since `login` in context does an API call, we can just do this:
      if (response.data.mustChangePassword) {
        window.location.href = '/force-change-password';
      } else {
        window.location.href = response.data.role === 'ROLE_ADMIN' ? '/admin/profile' : '/student/dashboard';
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    sessionStorage.setItem('authMode', newIsLogin ? 'login' : 'signup');
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
          <p className="auth-subtitle">AI-POWERED TUITION FEE MANAGEMENT SYSTEM</p>

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
              <h2>{isLogin ? "Sign In to Your Account" : "Create Admin Account"}</h2>
              {!isLogin && (
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>
                  Note: This registration is for Admin use only. Students will be provided accounts by their administrator.
                </p>
              )}

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

                {!isLogin && (
                  <div className="form-group">
                    <label>Class Name<span style={{color: 'red'}}>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. new"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={loginRole}
                      onChange={(e) => setLoginRole(e.target.value)}
                      className="role-select"
                    >
                      <option value="ROLE_ADMIN">Admin (Staff)</option>
                      <option value="ROLE_STUDENT">Student</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>{(isLogin && loginRole === 'ROLE_STUDENT') ? "Student ID" : "Email Address"}</label>
                  <input
                    type={(isLogin && loginRole === 'ROLE_STUDENT') ? "text" : "email"}
                    placeholder={(isLogin && loginRole === 'ROLE_STUDENT') ? "Enter your Student ID" : "name@company.com"}
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



                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Admin Account →")}
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
