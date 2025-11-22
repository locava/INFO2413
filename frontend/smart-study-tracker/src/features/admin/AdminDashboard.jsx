import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI, adminAPI } from '../../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const [systemReport, setSystemReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [reportResponse, usersResponse] = await Promise.all([
        aiAPI.getSystemReport(),
        adminAPI.getUsers()
      ]);

      if (reportResponse.success) {
        setSystemReport(reportResponse.data);
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
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
          <div className="summary-icon">🔔</div>
          <div className="summary-content">
            <h3>Alerts (7d)</h3>
            <p className="summary-value">{systemReport?.alerts_last_7_days || 0}</p>
            <span className="summary-label">triggered</span>
          </div>
        </div>
      </div>

      {/* System Diagnostics */}
      {systemReport && (
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

      {/* Users Management Table */}
      <div className="card">
        <div className="card-header">
          <h2>👥 User Management</h2>
          <span className="user-count">{users.length} total users</span>
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
                      <div className="user-avatar">
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
    </div>
  );
}

export default AdminDashboard;

