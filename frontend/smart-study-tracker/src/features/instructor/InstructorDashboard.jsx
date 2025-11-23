import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { instructorAPI, aiAPI } from '../../services/api';
import './InstructorDashboard.css';

function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseReport, setCourseReport] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'students'

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseReport(selectedCourse.course_id);
      fetchCourseStudents(selectedCourse.course_id);
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
      const response = await aiAPI.getInstructorReport(courseId, { range: 'week' });
      if (response.success) {
        console.log('📊 Course Report Data:', response.data);
        console.log('📊 Engagement by day:', response.data.engagement_by_day);
        setCourseReport(response.data);
      }
    } catch (err) {
      console.error('Failed to load course report:', err);
      setCourseReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchCourseStudents = async (courseId) => {
    setStudentsLoading(true);
    try {
      const response = await instructorAPI.getCourseStudents(courseId);
      if (response.success) {
        setStudents(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
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
      <div className="course-selector-card">
        <div className="course-selector-header">
          <div>
            <label htmlFor="course-select">📚 Select Course</label>
            <p className="course-selector-subtitle">View analytics and student performance</p>
          </div>
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
      </div>

      {/* Tab Navigation */}
      {selectedCourse && (
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview & Analytics
          </button>
          <button
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👥 Students ({students.length})
          </button>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {reportLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading course analytics...</p>
            </div>
          ) : courseReport ? (
            <>
          {/* Privacy Notice */}
          {courseReport.privacy_notice && (
            <div className="privacy-notice">
              <h3>ℹ️ {courseReport.privacy_notice}</h3>
              <p>Students enrolled: {courseReport.students_enrolled || 0}</p>
            </div>
          )}

          {/* Summary Cards */}
          {courseReport.average_hours_per_student !== undefined && (
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

              {/* Daily Engagement - Completely Rewritten */}
              {courseReport.engagement_by_day && courseReport.engagement_by_day.length > 0 ? (
                <div className="card engagement-card">
                  <div className="engagement-header">
                    <div>
                      <h2>📊 Daily Class Engagement</h2>
                      <p className="card-subtitle">Total study hours per day across all students</p>
                    </div>
                  </div>

                  <div className="engagement-chart-wrapper">
                    {courseReport.engagement_by_day.map((dayData, idx) => {
                      // Calculate max hours for scaling
                      const allHours = courseReport.engagement_by_day.map(d => d.total_hours || 0);
                      const maxHours = Math.max(...allHours, 1);
                      const currentHours = dayData.total_hours || 0;
                      const barWidth = Math.max((currentHours / maxHours) * 100, 8);

                      // Parse and format date - directly from backend format "YYYY-MM-DD"
                      const [year, month, day] = dayData.date.split('-');
                      const dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      const monthName = dateObject.toLocaleDateString('en-US', { month: 'short' });
                      const dayNum = dateObject.getDate();

                      // Debug logging
                      if (idx === 0) {
                        console.log('📊 Rendering chart with data:', {
                          totalDays: courseReport.engagement_by_day.length,
                          maxHours,
                          firstDay: dayData
                        });
                      }

                      return (
                        <div key={`engagement-${idx}-${dayData.date}`} className="engagement-row">
                          <div className="engagement-date">
                            <span className="date-month">{monthName}</span>
                            <span className="date-day">{dayNum}</span>
                          </div>
                          <div className="engagement-bar-track">
                            <div
                              className="engagement-bar-fill"
                              style={{ width: `${barWidth}%` }}
                            >
                              <span className="engagement-bar-label">
                                {currentHours.toFixed(1)} hrs
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                courseReport && (
                  <div className="card">
                    <h2>📊 Daily Class Engagement</h2>
                    <p className="card-subtitle">No engagement data available for this period</p>
                  </div>
                )
              )}

              {/* Common Distractions */}
              {courseReport.common_distractions && courseReport.common_distractions.length > 0 && (
                <div className="card">
                  <h2>⚠️ Common Distractions</h2>
                  <div className="distractions-list">
                    {courseReport.common_distractions.map((distraction, index) => {
                      // Format distraction name: replace underscores with spaces and capitalize
                      const formattedDistraction = distraction
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

                      return (
                        <div key={index} className="distraction-item">
                          <span className="distraction-name">{formattedDistraction}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Insights & Action Suggestions */}
              {courseReport.action_suggestions && courseReport.action_suggestions.length > 0 && (
                <div className="card ai-insights-card">
                  <div className="ai-insights-header">
                    <div>
                      <h2>🤖 AI-Powered Insights</h2>
                      <p className="card-subtitle">Data-driven recommendations based on student performance</p>
                    </div>
                    <div className="ai-badge">
                      <span className="ai-badge-icon">✨</span>
                      <span>AI Analysis</span>
                    </div>
                  </div>
                  <div className="suggestions-list">
                    {courseReport.action_suggestions.map((suggestion, index) => (
                      <div key={index} className="suggestion-item">
                        <div className="suggestion-icon">💡</div>
                        <div className="suggestion-text">{suggestion}</div>
                      </div>
                    ))}
                  </div>
                  <div className="ai-insights-footer">
                    <p>📊 Analysis based on {courseReport.students_enrolled || 0} students • Week of {courseReport.week_start || 'N/A'}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* No Data Message */}
          {!courseReport.average_hours_per_student && courseReport.average_hours_per_student !== 0 && !courseReport.privacy_notice && (
            <div className="empty-state">
              <p>No study session data available for this course in the selected time period.</p>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>No report data available. Please select a course.</p>
        </div>
      )}
        </>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <>
          {studentsLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading students...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="card">
              <div className="card-header">
                <h2>👥 Enrolled Students</h2>
                <span className="student-count-badge">{students.length} {students.length === 1 ? 'Student' : 'Students'}</span>
              </div>
              <div className="students-grid">
                {students.map((student, index) => (
                  <div key={student.user_id || index} className="student-card">
                    <div className="student-avatar">
                      {student.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="student-details">
                      <h3>{student.name || 'Unknown Student'}</h3>
                      <p className="student-email">{student.email || 'No email'}</p>
                      {student.total_hours !== undefined && (
                        <div className="student-stats">
                          <span className="stat-badge">
                            ⏱️ {student.total_hours?.toFixed(1) || 0} hrs
                          </span>
                          {student.focus_score !== undefined && (
                            <span className="stat-badge">
                              🎯 {student.focus_score || 0}% focus
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No students enrolled in this course yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InstructorDashboard;

