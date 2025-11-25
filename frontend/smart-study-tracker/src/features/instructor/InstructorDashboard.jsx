import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { instructorAPI, aiAPI } from '../../services/api';
import './InstructorDashboard.css';
// 💡 Add useNavigate to handle navigation
import { useNavigate } from 'react-router-dom';

function InstructorDashboard() {
  const { user } = useAuth();
  // 💡 Initialize useNavigate
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseReport, setCourseReport] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', or 'feedback'

  // State for Search and Log Review
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingStudent, setReviewingStudent] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // State for Feedback (FR-I4)
  const [feedbackList, setFeedbackList] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    studentId: null,
    feedbackType: 'GENERAL',
    message: ''
  });

  useEffect(() => {
    fetchCourses();
  }, [user]);

  // Effect 2: Runs when course changes OR when search query changes
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseReport(selectedCourse.course_id);
      fetchCourseStudents(selectedCourse.course_id);
      fetchCourseFeedback(selectedCourse.course_id);
    }
  }, [selectedCourse, searchQuery]); // Dependency includes searchQuery

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
      // PASS SEARCH QUERY (name filter)
      const filters = { name: searchQuery }; 
      const response = await instructorAPI.getCourseStudents(courseId, filters);
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

  const fetchStudentLogs = async (studentId, courseId) => {
      setLogsLoading(true);
      try {
          const response = await instructorAPI.getStudentSessions(studentId, courseId); 
          if (response.success) {
              setStudentLogs(response.data || []);
              
              // Use user_id for lookup consistency
              const student = students.find(s => s.user_id === studentId); 
              setReviewingStudent(student);
          }
      } catch (err) {
          console.error('Failed to load student sessions:', err);
          setStudentLogs([]);
      } finally {
          setLogsLoading(false);
      }
  };

  const fetchCourseFeedback = async (courseId) => {
    try {
      const response = await instructorAPI.getCourseFeedback(courseId);
      if (response.success) {
        setFeedbackList(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    }
  };

  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !newFeedback.message.trim()) {
      alert('Please enter a feedback message');
      return;
    }

    try {
      const response = await instructorAPI.createFeedback(selectedCourse.course_id, {
        studentId: newFeedback.studentId,
        feedbackType: newFeedback.feedbackType,
        message: newFeedback.message.trim()
      });

      if (response.success) {
        alert('✅ Feedback added successfully!');
        setShowFeedbackModal(false);
        setNewFeedback({ studentId: null, feedbackType: 'GENERAL', message: '' });
        fetchCourseFeedback(selectedCourse.course_id);
      }
    } catch (err) {
      alert('❌ Failed to add feedback: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const response = await instructorAPI.deleteFeedback(feedbackId);
      if (response.success) {
        alert('✅ Feedback deleted successfully!');
        fetchCourseFeedback(selectedCourse.course_id);
      }
    } catch (err) {
      alert('❌ Failed to delete feedback: ' + (err.message || 'Unknown error'));
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
          <p className="page-subtitle">Manage your courses and review student performance</p>
        </div>
        
        {/* ✅ NEW: EDIT PROFILE BUTTON */}
        <button 
            className="btn-secondary" 
            onClick={() => navigate('/instructor/profile')} // Navigate to the profile page
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '8px 15px', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: 'var(--white)',
                cursor: 'pointer'
            }}
        >
          <span>⚙️</span>
          <span>Edit Profile</span>
        </button>
        
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
              // Reset search state when course changes
              setSearchQuery('');
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
          <button
            className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            💬 Feedback ({feedbackList.length})
          </button>
        </div>
      )}

      {/* Overview Tab (Content remains the same) */}
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
          {!courseReport?.average_hours_per_student && courseReport?.average_hours_per_student !== 0 && !courseReport?.privacy_notice && (
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
          {/* Search Input (Requirement 2) */}
          <div className="students-search-bar" style={{ marginBottom: '20px' }}>
              <input
                  type="text"
                  placeholder="Search students by name..."
                  value={searchQuery}
                  // fetchCourseStudents is triggered via useEffect on searchQuery change
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc' }}
              />
          </div>

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
                  // IMPORTANT: Ensure you use student.user_id or student.student_id for the key
                  <div key={student.user_id || student.student_id || index} className="student-card">
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
                      
                      {/* Review Logs Button (Requirement 3) */}
                      <button 
                          // Use student.user_id (or whichever ID matches the study_sessions table foreign key)
                          onClick={() => fetchStudentLogs(student.student_id, selectedCourse.course_id)}
                          className="btn-review-logs"
                          style={{ 
                              marginTop: '10px', 
                              padding: '8px 15px', 
                              backgroundColor: '#6366f1', 
                              color: 'white', 
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                          }}
                      >
                        Review Logs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No students match your search criteria or are enrolled.</p>
            </div>
          )}
          
          {/* Modal/Review View Panel */}
          {reviewingStudent && (
            <div className="student-logs-modal" style={{ 
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, overflowY: 'auto' 
            }}>
                <div className="modal-content-container" style={{ 
                    backgroundColor: 'white', margin: '50px auto', padding: '30px', 
                    borderRadius: '8px', maxWidth: '800px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}>
                    <button 
                        onClick={() => setReviewingStudent(null)} 
                        style={{ float: 'right', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                        &times;
                    </button>
                    <h2>Study Logs for {reviewingStudent.name}</h2>
                    <p style={{ marginBottom: '20px' }}>Course: **{selectedCourse.course_code} - {selectedCourse.course_name}**</p>
                    
                    {logsLoading ? (
                        <p>Loading logs...</p>
                    ) : studentLogs.length > 0 ? (
                        <div className="logs-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                            {studentLogs.map(log => (
                                <div 
                                    key={log.session_id} 
                                    className="log-item" 
                                    style={{ 
                                        border: '1px solid #ddd', 
                                        padding: '15px', 
                                        borderRadius: '6px',
                                        marginBottom: '10px',
                                        
                                        // Ensure vertical stacking of the main content lines
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                    }}
                                >
                                    {/* Inner Flex Container to manage horizontal spacing for all metrics */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                                        
                                        {/* Date/Time */}
                                        <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '20px' }}>
                                            Date: {new Date(log.date).toLocaleDateString()} at {new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        
                                        {/* Duration */}
                                        <div style={{ whiteSpace: 'nowrap', marginRight: '20px' }}>
                                            Duration: {log.duration_minutes} minutes
                                        </div>
                                        
                                        {/* Mood */}
                                        <div style={{ whiteSpace: 'nowrap', marginRight: '20px' }}>
                                            Mood: **{log.mood}**
                                        </div>
                                        
                                        {/* Distractions */}
                                        <div style={{ whiteSpace: 'nowrap' }}>
                                            Distractions: {log.distractions || 'None recorded'}
                                        </div>
                                        
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No study sessions found for this student in this course.</p>
                    )}
                </div>
            </div>
          )}
        </>
      )}

      {/* Feedback Tab (FR-I4) */}
      {activeTab === 'feedback' && (
        <div className="card">
          <div className="card-header">
            <h2>💬 Course Feedback & Tips</h2>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="btn-primary"
            >
              ➕ Add Feedback
            </button>
          </div>

          <div className="feedback-info">
            <p>Provide feedback and study tips to your students. Feedback can be course-wide or targeted to individual students.</p>
          </div>

          {feedbackList.length > 0 ? (
            <div className="feedback-list">
              {feedbackList.map((feedback) => (
                <div key={feedback.feedback_id} className="feedback-item">
                  <div className="feedback-header">
                    <div>
                      <span className={`feedback-type-badge ${feedback.feedback_type.toLowerCase()}`}>
                        {feedback.feedback_type}
                      </span>
                      {feedback.student_name && (
                        <span className="feedback-student">
                          👤 {feedback.student_name}
                        </span>
                      )}
                      {!feedback.student_name && (
                        <span className="feedback-student course-wide">
                          📢 Course-wide
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteFeedback(feedback.feedback_id)}
                      className="btn-delete-small"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  <div className="feedback-message">
                    {feedback.message}
                  </div>
                  <div className="feedback-meta">
                    Created: {new Date(feedback.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No feedback added yet. Click "Add Feedback" to get started!</p>
          )}
        </div>
      )}

      {/* Add Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add Feedback</h2>
              <button onClick={() => setShowFeedbackModal(false)} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleCreateFeedback} className="feedback-form">
              <div className="form-group">
                <label>Feedback Type:</label>
                <select
                  value={newFeedback.feedbackType}
                  onChange={(e) => setNewFeedback({ ...newFeedback, feedbackType: e.target.value })}
                  className="form-input"
                >
                  <option value="GENERAL">General</option>
                  <option value="STUDY_TIP">Study Tip</option>
                  <option value="ENCOURAGEMENT">Encouragement</option>
                  <option value="CONCERN">Concern</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Student (optional):</label>
                <select
                  value={newFeedback.studentId || ''}
                  onChange={(e) => setNewFeedback({ ...newFeedback, studentId: e.target.value || null })}
                  className="form-input"
                >
                  <option value="">Course-wide (all students)</option>
                  {students.map((student) => (
                    <option key={student.user_id} value={student.user_id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Message: *</label>
                <textarea
                  value={newFeedback.message}
                  onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                  className="form-textarea"
                  rows="5"
                  placeholder="Enter your feedback message..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">💾 Save Feedback</button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="btn-secondary"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorDashboard;