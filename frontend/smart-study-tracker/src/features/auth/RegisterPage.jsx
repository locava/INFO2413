import { Link } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  return (
    <div className="register-page">
      <div className="register-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="logo">
              <span className="logo-icon">📚</span>
              <h1>Join Smart Study Tracker</h1>
            </div>
            <p className="subtitle">Start your journey to better learning habits</p>
          </div>

          <form className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="student@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Create a strong password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Re-enter your password"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>
            </div>

            <button type="submit" className="btn-register">
              <span>Create Account</span>
              <span className="arrow">→</span>
            </button>
          </form>

          <div className="register-footer">
            <p>Already have an account? <Link to="/login" className="login-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

