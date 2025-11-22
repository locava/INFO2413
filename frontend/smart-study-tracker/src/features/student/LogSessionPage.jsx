import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import './LogSessionPage.css';

function LogSessionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    durationMinutes: '',
    mood: '',
    distractions: ''
  });

  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mood options matching the database seed data
  const moodOptions = [
    'Very Productive',
    'Productive',
    'Focused',
    'Neutral',
    'Tired',
    'Distracted',
    'Stressed'
  ];

  // Common distractions
  const distractionOptions = [
    'phone',
    'social_media',
    'noise',
    'internet',
    'other_people',
    'hunger',
    'fatigue'
  ];

  useEffect(() => {
    // In a real app, fetch courses from API
    // For now, use hardcoded courses matching seed data
    setCourses([
      { course_id: '550e8400-e29b-41d4-a716-446655440001', course_name: 'Database Systems', course_code: 'INFO2413' },
      { course_id: '550e8400-e29b-41d4-a716-446655440002', course_name: 'Web Development', course_code: 'INFO3410' },
      { course_id: '550e8400-e29b-41d4-a716-446655440003', course_name: 'Data Structures', course_code: 'COMP2103' },
      { course_id: '550e8400-e29b-41d4-a716-446655440004', course_name: 'Algorithms', course_code: 'COMP3105' }
    ]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.courseId) {
      newErrors.courseId = 'Course is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      newErrors.durationMinutes = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Combine date and time into a proper timestamp
      const startTimeISO = `${formData.date}T${formData.startTime}:00`;

      const sessionData = {
        courseId: formData.courseId,
        date: formData.date,
        startTime: startTimeISO,
        durationMinutes: parseInt(formData.durationMinutes),
        mood: formData.mood || null,
        distractions: formData.distractions || null
      };

      const response = await studentAPI.createSession(sessionData);

      if (response.success) {
        setSuccessMessage('✅ Study session logged successfully!');

        // Clear form
        setFormData({
          courseId: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          durationMinutes: '',
          mood: '',
          distractions: ''
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 2000);
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to log session. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/student/dashboard');
  };

  return (
    <div className="log-session-page">
      <div className="page-header">
        <div>
          <h1>Log Study Session</h1>
          <p className="page-subtitle">Record your study sessions and track your progress</p>
        </div>
      </div>

      <div className="session-container">
        <div className="session-form-card">
          {successMessage && (
            <div className="success-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="error-message">
              ❌ {errors.submit}
            </div>
          )}

          <form className="session-form" onSubmit={handleSubmit}>
            <Select
              label="Course *"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              options={courses.map(c => ({ value: c.course_id, label: `${c.course_code} - ${c.course_name}` }))}
              placeholder="Select a course"
              required
              error={errors.courseId}
            />

            <div className="form-row">
              <Input
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                error={errors.date}
              />

              <Input
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
                error={errors.startTime}
              />
            </div>

            <Input
              label="Duration (minutes) *"
              name="durationMinutes"
              type="number"
              value={formData.durationMinutes}
              onChange={handleChange}
              placeholder="e.g., 60"
              min="1"
              required
              error={errors.durationMinutes}
            />

            <Select
              label="Mood (optional)"
              name="mood"
              value={formData.mood}
              onChange={handleChange}
              options={moodOptions.map(m => ({ value: m, label: m }))}
              placeholder="How did you feel?"
            />

            <Textarea
              label="Distractions (optional)"
              name="distractions"
              value={formData.distractions}
              onChange={handleChange}
              placeholder="e.g., phone, social_media, noise (comma-separated)"
              rows={3}
            />

            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Session'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LogSessionPage;

