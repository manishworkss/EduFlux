import { Link } from 'react-router-dom';
import './Landing.css';
import logo from '../assets/vite.svg'; // Placeholder until logo is generated

const Landing = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo-container">
          <div className="logo-icon">
            {/* Fallback to simple icon if image fails to load */}
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="logo-text">AI [EduFlux]</span>
        </div>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>

          <Link to="/auth" className="nav-signin-btn">Sign In</Link>
        </nav>
      </header>

      <main className="landing-main">
        <div className="badge">
          <span className="badge-dot"></span>
          FREE AI TUITION MANAGEMENT SOFTWARE FOR INDIA
        </div>
        
        <h1 className="hero-title">
          Free AI Tuition Management Software — Smart Fees,<br/>
          Automated Receipts & Payment History <span className="highlight-text">for Coaching Centres</span>
        </h1>
        
        <p className="hero-subtitle">
          <strong>AI [EduFlux]</strong> is a free, intelligent tuition fee management platform for India and beyond. Streamline your entire fee collection process. Manage student fee structures, track payments in real-time, generate automated PDF receipts, and get instant analytics that keep owners, admins, and students perfectly in sync. Start free as a solo tutor; scale effortlessly without changing products.
        </p>

        <div className="hero-actions">
          <Link to="/auth" className="primary-btn">
            Get Started Free &rarr;
          </Link>
          <a href="#features" className="secondary-btn">
            Explore Features &rarr;
          </a>
        </div>
        
        {/* Features Section */}
        <section id="features" className="content-section features-section">
          <h2>Platform Features</h2>
          <p className="section-subtitle">Everything you need for smart fee management</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Smart Fee Collection</h3>
              <p>Automate your tuition fee collection and seamlessly record all cash or online payments in one centralized dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-Time Tracking</h3>
              <p>Instantly track who has paid, identify pending dues, and view detailed payment histories at a glance.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧾</div>
              <h3>Automated Receipts</h3>
              <p>Generate instant, professional PDF receipts for every transaction to share directly with parents.</p>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="content-section solutions-section">
          <h2>Tailored Solutions</h2>
          <p className="section-subtitle">Built to scale with your educational business</p>
          <div className="solutions-grid">
            <div className="solution-card">
              <h3>For Solo Tutors</h3>
              <p>Ditch the confusing spreadsheets. Track your small batches with zero friction and 100% clarity on your monthly revenue.</p>
            </div>
            <div className="solution-card">
              <h3>For Coaching Centers</h3>
              <p>Manage hundreds of students, complex multi-tier fee structures, and administrative staff with enterprise-grade tracking.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Landing;
