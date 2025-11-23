import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI, adminAPI } from '../../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const [systemReport, setSystemReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dataQuality, setDataQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'courses', 'alerts', 'data-quality'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [reportResponse, usersResponse, coursesResponse, alertsResponse, notificationsResponse, dataQualityResponse] = await Promise.all([
        aiAPI.getSystemReport(),
        adminAPI.getUsers(),
        adminAPI.getCourses(),
        adminAPI.getAlerts(20),
        adminAPI.getNotifications(20),
        adminAPI.getDataQuality()
      ]);

      if (reportResponse.success) {
        setSystemReport(reportResponse.data);
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }

      if (coursesResponse.success) {
        setCourses(coursesResponse.data || []);
      }

      if (alertsResponse.success) {
        setAlerts(alertsResponse.data || []);
      }

      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data || []);
      }

      if (dataQualityResponse.success) {
        setDataQuality(dataQualityResponse.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading system diagnostics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchData} className="btn-retry">Retry</button>
        </div>
      </div>
    );
  }

  const studentCount = users.filter(u => u.role === 'Student').length;
  const instructorCount = users.filter(u => u.role === 'Instructor').length;

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>System Administration</h1>
          <p className="page-subtitle">Welcome, {user?.name}</p>
        </div>
        <button onClick={fetchData} className="btn-primary">
          🔄 Refresh Data
        </button>
      </div>

      {/* User Statistics */}
      <div className="summary-cards">
        <div className="summary-card stat-primary">
          <div className="summary-icon">👥</div>
          <div className="summary-content">
            <h3>Total Users</h3>
            <p className="summary-value">{users.length}</p>
            <span className="summary-label">registered</span>
          </div>
        </div>

        <div className="summary-card stat-success">
          <div className="summary-icon">🎓</div>
          <div className="summary-content">
            <h3>Students</h3>
            <p className="summary-value">{studentCount}</p>
            <span className="summary-label">active</span>
          </div>
        </div>

        <div className="summary-card stat-info">
          <div className="summary-icon">👨‍🏫</div>
          <div className="summary-content">
            <h3>Instructors</h3>
            <p className="summary-value">{instructorCount}</p>
            <span className="summary-label">active</span>
          </div>
        </div>

        <div className="summary-card stat-warning">
          <div className="summary-icon">📚</div>
          <div className="summary-content">
            <h3>Courses</h3>
            <p className="summary-value">{courses.length}</p>
            <span className="summary-label">active</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 System Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({users.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          📚 Courses ({courses.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 Alerts ({alerts.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'data-quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('data-quality')}
        >
          📊 Data Quality
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && systemReport && (
        <>
          <div className="card">
            <h2>🤖 AI System Status</h2>
            <div className="diagnostics-grid">
              <div className="diagnostic-item">
                <span className="diagnostic-label">AI Version</span>
                <span className="diagnostic-value">{systemReport.ai_version}</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Models Trained</span>
                <span className="diagnostic-value">{systemReport.models_trained}</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Last Training Run</span>
                <span className="diagnostic-value">
                  {systemReport.last_training_run 
                    ? new Date(systemReport.last_training_run).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Avg Check Latency</span>
                <span className="diagnostic-value">{systemReport.avg_focus_check_latency_ms}ms</span>
              </div>
            </div>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">⚠️</div>
              <div className="summary-content">
                <h3>Alerts (7 days)</h3>
                <p className="summary-value">{systemReport.alerts_last_7_days}</p>
                <span className="summary-label">triggered</span>
              </div>
            </div>
          </div>

          {/* Notification Queue */}
          {systemReport.notifications && (
            <div className="card">
              <h2>📬 Notification Queue</h2>
              <div className="notification-stats">
                <div className="notification-stat">
                  <span className="stat-label">Sent</span>
                  <span className="stat-value success">{systemReport.notifications.sent}</span>
                </div>
                <div className="notification-stat">
                  <span className="stat-label">Pending</span>
                  <span className="stat-value warning">{systemReport.notifications.pending}</span>
                </div>
                <div className="notification-stat">
                  <span className="stat-label">Failed</span>
                  <span className="stat-value error">{systemReport.notifications.failed}</span>
                </div>
              </div>
            </div>
          )}

          {/* Data Quality */}
          {systemReport.data_quality && (
            <div className="card">
              <h2>📊 Data Quality</h2>
              <div className="diagnostics-grid">
                <div className="diagnostic-item">
                  <span className="diagnostic-label">Sessions (Last 7 Days)</span>
                  <span className="diagnostic-value">{systemReport.data_quality.sessions_logged_last_7_days}</span>
                </div>
                <div className="diagnostic-item">
                  <span className="diagnostic-label">Missing Fields</span>
                  <span className="diagnostic-value">{systemReport.data_quality.sessions_with_missing_fields}</span>
                </div>
              </div>
            </div>
          )}

          {/* System Notes */}
          {systemReport.notes && (
            <div className="card">
              <h2>📝 System Notes</h2>
              <p className="system-notes">{systemReport.notes}</p>
            </div>
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h2>👥 User Management</h2>
            <span className="user-count-badge">{users.length} total users</span>
          </div>

          {users.length > 0 ? (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.user_id}>
                      <td className="user-name">
                        <div className="user-avatar-small">
                          {user.role === 'Student' ? '🎓' : user.role === 'Instructor' ? '👨‍🏫' : '👑'}
                        </div>
                        {user.name}
                      </td>
                      <td className="user-email">{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="user-date">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No users found</p>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="card">
          <div className="card-header">
            <h2>📚 Course Management</h2>
            <span className="user-count-badge">{courses.length} total courses</span>
          </div>

          {courses.length > 0 ? (
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.course_id} className="course-card">
                  <div className="course-header">
                    <div className="course-icon">📚</div>
                    <div className="course-info">
                      <h3>{course.course_code}</h3>
                      <p className="course-name">{course.course_name}</p>
                    </div>
                  </div>
                  <div className="course-details">
                    <div className="course-detail-item">
                      <span className="detail-label">Instructor:</span>
                      <span className="detail-value">{course.instructor_name || 'Not assigned'}</span>
                    </div>
                    <div className="course-detail-item">
                      <span className="detail-label">Students:</span>
                      <span className="detail-value">{course.student_count || 0}</span>
                    </div>
                    <div className="course-detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge status-${course.is_active ? 'active' : 'inactive'}`}>
                        {course.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No courses found</p>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="card">
          <div className="card-header">
            <h2>🔔 System Alerts & Notifications</h2>
            <span className="user-count-badge">{alerts.length} total alerts</span>
          </div>

          {/* Notification Summary */}
          {systemReport?.notifications && (
            <div className="notification-summary">
              <div className="notification-stat">
                <span className="stat-icon success">✅</span>
                <div>
                  <div className="stat-value">{systemReport.notifications.sent}</div>
                  <div className="stat-label">Sent</div>
                </div>
              </div>
              <div className="notification-stat">
                <span className="stat-icon warning">⏳</span>
                <div>
                  <div className="stat-value">{systemReport.notifications.pending}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
              <div className="notification-stat">
                <span className="stat-icon error">❌</span>
                <div>
                  <div className="stat-value">{systemReport.notifications.failed}</div>
                  <div className="stat-label">Failed</div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts List */}
          {alerts.length > 0 ? (
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.alert_id} className="alert-item">
                  <div className="alert-header">
                    <span className={`alert-type-badge ${alert.alert_type?.toLowerCase()}`}>
                      {alert.alert_type || 'UNKNOWN'}
                    </span>
                    <span className="alert-time">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="alert-content">
                    <div className="alert-detail">
                      <strong>Recipient:</strong> {alert.recipient_name || 'Unknown'}
                    </div>
                    {alert.student_name && (
                      <div className="alert-detail">
                        <strong>Student:</strong> {alert.student_name}
                      </div>
                    )}
                    {alert.course_name && (
                      <div className="alert-detail">
                        <strong>Course:</strong> {alert.course_name}
                      </div>
                    )}
                    {alert.trigger_detail && (
                      <div className="alert-trigger">
                        {typeof alert.trigger_detail === 'string'
                          ? alert.trigger_detail
                          : (alert.trigger_detail.message || 'No details')}
                      </div>
                    )}
                  </div>
                  <div className="alert-status">
                    <span className={`status-badge status-${alert.status?.toLowerCase()}`}>
                      {alert.status || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>🎉 No alerts in the system</p>
              <p className="no-data-subtitle">All systems operating normally</p>
            </div>
          )}
        </div>
      )}

      {/* Data Quality Tab */}
      {activeTab === 'data-quality' && dataQuality && (
        <div className="card">
          <div className="card-header">
            <h2>📊 Data Quality Monitoring</h2>
            <span className="user-count-badge">Real-time metrics</span>
          </div>

          <div className="data-quality-grid">
            {/* Sessions Quality */}
            <div className="quality-card">
              <div className="quality-header">
                <span className="quality-icon">📝</span>
                <h3>Session Data</h3>
              </div>
              <div className="quality-metrics">
                <div className="quality-metric">
                  <span className="metric-label">Sessions (Last 7 Days)</span>
                  <span className="metric-value success">{dataQuality.sessions_last_7_days}</span>
                </div>
                <div className="quality-metric">
                  <span className="metric-label">Missing Fields</span>
                  <span className={`metric-value ${dataQuality.sessions_with_missing_fields > 0 ? 'warning' : 'success'}`}>
                    {dataQuality.sessions_with_missing_fields}
                  </span>
                </div>
                <div className="quality-metric">
                  <span className="metric-label">Avg Duration</span>
                  <span className="metric-value info">{dataQuality.avg_session_duration_minutes} min</span>
                </div>
              </div>
              {dataQuality.sessions_with_missing_fields > 0 && (
                <div className="quality-alert">
                  ⚠️ {dataQuality.sessions_with_missing_fields} sessions have incomplete data
                </div>
              )}
            </div>

            {/* User Engagement */}
            <div className="quality-card">
              <div className="quality-header">
                <span className="quality-icon">👥</span>
                <h3>User Engagement</h3>
              </div>
              <div className="quality-metrics">
                <div className="quality-metric">
                  <span className="metric-label">Students with No Sessions</span>
                  <span className={`metric-value ${dataQuality.students_with_no_sessions > 0 ? 'error' : 'success'}`}>
                    {dataQuality.students_with_no_sessions}
                  </span>
                </div>
                <div className="quality-metric">
                  <span className="metric-label">Active Students</span>
                  <span className="metric-value success">
                    {users.filter(u => u.role === 'Student').length - dataQuality.students_with_no_sessions}
                  </span>
                </div>
                <div className="quality-metric">
                  <span className="metric-label">Engagement Rate</span>
                  <span className="metric-value info">
                    {users.filter(u => u.role === 'Student').length > 0
                      ? Math.round(((users.filter(u => u.role === 'Student').length - dataQuality.students_with_no_sessions) / users.filter(u => u.role === 'Student').length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
              {dataQuality.students_with_no_sessions > 0 && (
                <div className="quality-alert">
                  ⚠️ {dataQuality.students_with_no_sessions} students haven't logged any sessions
                </div>
              )}
            </div>

            {/* Course Health */}
            <div className="quality-card">
              <div className="quality-header">
                <span className="quality-icon">📚</span>
                <h3>Course Health</h3>
              </div>
              <div className="quality-metrics">
                <div className="quality-metric">
                  <span className="metric-label">Courses with No Enrollments</span>
                  <span className={`metric-value ${dataQuality.courses_with_no_enrollments > 0 ? 'warning' : 'success'}`}>
                    {dataQuality.courses_with_no_enrollments}
                  </span>
                </div>
                <div className="quality-metric">
                  <span className="metric-label">Active Courses</span>
                  <span className="metric-value success">{courses.length}</span>
                </div>
                <div className="quality-metric">
                  <span className="metric-label">Total Enrollments</span>
                  <span className="metric-value info">
                    {courses.reduce((sum, course) => sum + parseInt(course.student_count || 0), 0)}
                  </span>
                </div>
              </div>
              {dataQuality.courses_with_no_enrollments === 0 && (
                <div className="quality-success">
                  ✅ All courses have active enrollments
                </div>
              )}
            </div>
          </div>

          {/* Overall Health Score */}
          <div className="health-score-card">
            <h3>📈 Overall System Health</h3>
            <div className="health-score">
              {(() => {
                const totalIssues =
                  dataQuality.sessions_with_missing_fields +
                  dataQuality.students_with_no_sessions +
                  dataQuality.courses_with_no_enrollments;
                const healthScore = Math.max(0, 100 - (totalIssues * 5));
                const healthClass = healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : healthScore >= 40 ? 'fair' : 'poor';

                return (
                  <>
                    <div className={`health-score-value ${healthClass}`}>
                      {healthScore}%
                    </div>
                    <div className="health-score-label">
                      {healthScore >= 80 ? '🎉 Excellent' : healthScore >= 60 ? '👍 Good' : healthScore >= 40 ? '⚠️ Fair' : '❌ Needs Attention'}
                    </div>
                    <div className="health-score-details">
                      {totalIssues === 0 ? (
                        <p>All systems operating at optimal levels!</p>
                      ) : (
                        <p>{totalIssues} issue{totalIssues !== 1 ? 's' : ''} detected that may need attention</p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

