import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator';
import { validatePassword } from '../../utils/passwordValidator';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentNumber: '',
    role: 'Student'
  });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Fetch available courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/auth/courses');
        const data = await response.json();
        if (data.success) {
          setAvailableCourses(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    setError('');
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        if (prev.length >= 3) {
          setError('You can select a maximum of 3 courses');
          return prev;
        }
        setError('');
        return [...prev, courseId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (selectedCourses.length < 1 || selectedCourses.length > 3) {
      setError('Please select between 1 and 3 courses');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        studentNumber: formData.studentNumber || `B00${Math.floor(Math.random() * 900000 + 100000)}`,
        courseIds: selectedCourses
      };

      const response = await authAPI.register(registerData);

      if (response.success) {
        // Registration successful, redirect to login
        navigate('/login', {
          state: { message: 'Registration successful! Please log in.' }
        });
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

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

          {error && (
            <div className="error-message" style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              ❌ {error}
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentNumber">Student Number (optional)</label>
              <input
                type="text"
                id="studentNumber"
                placeholder="B00123456"
                value={formData.studentNumber}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Select Courses (1-3 required)</label>
              <div className="course-selection">
                {availableCourses.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading courses...</p>
                ) : (
                  availableCourses.map(course => (
                    <div
                      key={course.course_id}
                      className={`course-option ${selectedCourses.includes(course.course_id) ? 'selected' : ''}`}
                      onClick={() => !loading && handleCourseToggle(course.course_id)}
                      style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.course_id)}
                        onChange={() => {}}
                        disabled={loading}
                      />
                      <div className="course-info">
                        <div className="course-code">{course.code}</div>
                        <div className="course-title">{course.title}</div>
                        <div className="course-instructor">{course.instructor_name}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="course-count">
                {selectedCourses.length} of 3 courses selected
                {selectedCourses.length < 1 && <span style={{ color: '#ef4444' }}> (minimum 1 required)</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#ef4444'
                }}>
                  ❌ Passwords do not match
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={loading}
                />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>
            </div>

            <button type="submit" className="btn-register" disabled={loading}>
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
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

