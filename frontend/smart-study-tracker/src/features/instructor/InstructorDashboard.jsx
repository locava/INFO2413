import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { instructorAPI, aiAPI } from '../../services/api';
import './InstructorDashboard.css';

function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseReport, setCourseReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseReport(selectedCourse.course_id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await instructorAPI.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
        if (response.data.length > 0) {
          setSelectedCourse(response.data[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseReport = async (courseId) => {
    setReportLoading(true);
    try {
      const response = await aiAPI.getInstructorReport(courseId);
      if (response.success) {
        setCourseReport(response.data);
      }
    } catch (err) {
      console.error('Failed to load course report:', err);
      setCourseReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="instructor-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="instructor-dashboard">
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchCourses} className="btn-retry">Retry</button>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="instructor-dashboard">
        <div className="page-header">
          <h1>Instructor Dashboard</h1>
          <p className="page-subtitle">Welcome, {user?.name}</p>
        </div>
        <div className="empty-state">
          <p>You don't have any courses assigned yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-dashboard">
      <div className="page-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <p className="page-subtitle">Welcome, {user?.name}</p>
        </div>
      </div>

      {/* Course Selector */}
      <div className="course-selector">
        <label htmlFor="course-select">Select Course:</label>
        <select
          id="course-select"
          value={selectedCourse?.course_id || ''}
          onChange={(e) => {
            const course = courses.find(c => c.course_id === e.target.value);
            setSelectedCourse(course);
          }}
          className="course-select"
        >
          {courses.map(course => (
            <option key={course.course_id} value={course.course_id}>
              {course.course_code} - {course.course_name}
            </option>
          ))}
        </select>
      </div>

      {/* Course Report */}
      {reportLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading course analytics...</p>
        </div>
      ) : courseReport ? (
        <>
          {/* Privacy Notice */}
          {courseReport.privacy_protected && (
            <div className="privacy-notice">
              <h3>🔒 Privacy Protection Active</h3>
              <p>Detailed analytics are hidden because this course has fewer than 5 enrolled students.</p>
            </div>
          )}

          {/* Summary Cards */}
          {!courseReport.privacy_protected && (
            <>
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-icon">📚</div>
                  <div className="summary-content">
                    <h3>Avg Hours/Student</h3>
                    <p className="summary-value">{courseReport.average_hours_per_student?.toFixed(1) || 0}</p>
                    <span className="summary-label">this week</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon">🎯</div>
                  <div className="summary-content">
                    <h3>Avg Focus Score</h3>
                    <p className="summary-value">{courseReport.average_focus_score || 0}</p>
                    <span className="summary-label">out of 100</span>
                  </div>
                </div>
              </div>

              {/* At-Risk Students */}
              {courseReport.students_at_risk && courseReport.students_at_risk.length > 0 && (
                <div className="card alert-card">
                  <h2>⚠️ Students At Risk</h2>
                  <div className="at-risk-list">
                    {courseReport.students_at_risk.map((student, index) => (
                      <div key={index} className="at-risk-item">
                        <div className="student-info">
                          <strong>{student.display_name}</strong>
                          <span className="student-id">{student.student_id}</span>
                        </div>
                        <div className="risk-reason">{student.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Engagement */}
              {courseReport.engagement_by_day && courseReport.engagement_by_day.length > 0 && (
                <div className="card">
                  <h2>Daily Class Engagement</h2>
                  <div className="bar-chart">
                    {courseReport.engagement_by_day.map((day) => (
                      <div key={day.date} className="bar-item">
                        <div className="bar-label">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="bar-container">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${(day.total_hours / Math.max(...courseReport.engagement_by_day.map(d => d.total_hours), 1)) * 100}%`
                            }}
                          >
                            <span className="bar-value">{day.total_hours.toFixed(1)} hours</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Distractions */}
              {courseReport.common_distractions && courseReport.common_distractions.length > 0 && (
                <div className="card">
                  <h2>Common Distractions</h2>
                  <div className="distractions-list">
                    {courseReport.common_distractions.map((distraction, index) => (
                      <div key={index} className="distraction-item">
                        <span className="distraction-name">{distraction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Suggestions */}
              {courseReport.action_suggestions && courseReport.action_suggestions.length > 0 && (
                <div className="card">
                  <h2>💡 Suggested Actions</h2>
                  <ul className="suggestions-list">
                    {courseReport.action_suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </>
      ) : null}
    </div>
  );
}

export default InstructorDashboard;

