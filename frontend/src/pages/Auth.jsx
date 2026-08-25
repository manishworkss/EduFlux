import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('ROLE_STUDENT');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      try {
        await login(email, password);
        // AuthContext usually handles navigation upon success
      } catch (err) {
        setError('Invalid email or password');
      }
    } else {
      // Registration is just a mock for now unless API is ready
      setError('Registration API not yet implemented. Please sign in with an existing account.');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
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
              <li>
                <span className="check-icon">✓</span>
                Real-Time Fee Tracking
              </li>
              <li>
                <span className="check-icon">✓</span>
                Automated Notifications
              </li>
              <li>
                <span className="check-icon">✓</span>
                Centralized Admin Dashboard
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel - Light Theme */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h2>{isLogin ? "Sign In to Your Account" : "Create Your Account"}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
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

            <button type="submit" className="submit-btn">
              {isLogin ? "Sign In" : "Create Account →"}
            </button>
          </form>



          <div className="toggle-auth">
            {isLogin ? (
              <span>Don't have an account? <a href="#" onClick={toggleAuthMode}>Create one now</a></span>
            ) : (
              <span>Already have an account? <a href="#" onClick={toggleAuthMode}>Sign in</a></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
