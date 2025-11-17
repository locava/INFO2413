import { useState } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import './LogSessionPage.css';

function LogSessionPage() {
  const [formData, setFormData] = useState({
    course: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: '',
    mood: '',
    distractions: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const courseOptions = ['Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'Literature', 'History'];
  const moodOptions = ['Focused', 'Neutral', 'Tired', 'Stressed'];

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

    if (!formData.course) {
      newErrors.course = 'Course is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('New session:', formData);

      // Show success message
      setSuccessMessage('Session saved (demo). Backend integration coming next.');

      // Clear form
      setFormData({
        course: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        duration: '',
        mood: '',
        distractions: '',
        notes: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
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

          <form className="session-form" onSubmit={handleSubmit}>
            <Select
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              options={courseOptions}
              placeholder="Select a course"
              required
              error={errors.course}
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
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 60"
              min="1"
              required
              error={errors.duration}
            />

            <Select
              label="Mood"
              name="mood"
              value={formData.mood}
              onChange={handleChange}
              options={moodOptions}
              placeholder="How did you feel?"
            />

            <Textarea
              label="Distractions"
              name="distractions"
              value={formData.distractions}
              onChange={handleChange}
              placeholder="Any distractions during the session? (optional)"
              rows={3}
            />

            <Textarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="What did you learn? Any key takeaways? (optional)"
              rows={4}
            />

            <Button type="submit" variant="primary" fullWidth>
              Save Session
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LogSessionPage;

