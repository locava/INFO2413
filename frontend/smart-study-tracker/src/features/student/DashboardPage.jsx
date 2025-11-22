import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { aiAPI, studentAPI } from '../../services/api';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch weekly report and recent sessions in parallel
      const [reportResponse, sessionsResponse] = await Promise.all([
        aiAPI.getWeeklyReport(user.user_id),
        studentAPI.getSessions()
      ]);

      if (reportResponse.success) {
        setWeeklyReport(reportResponse.data);
      }

      if (sessionsResponse.success) {
        setSessions(sessionsResponse.data);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const summary = weeklyReport?.summary || {
    total_hours: 0,
    sessions_count: 0,
    average_session_minutes: 0,
    focus_score: 0
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}! Here's your study overview</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/student/log-session')}>
          <span>📝</span>
          <span>Quick Log Session</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Total Study Time</h3>
            <p className="stat-value">{summary.total_hours} hrs</p>
            <span className="stat-change neutral">This week</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Sessions Completed</h3>
            <p className="stat-value">{summary.sessions_count}</p>
            <span className="stat-change neutral">This week</span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Avg Session Length</h3>
            <p className="stat-value">{summary.average_session_minutes} min</p>
            <span className="stat-change neutral">Per session</span>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Focus Score</h3>
            <p className="stat-value">{summary.focus_score}%</p>
            <span className={`stat-change ${summary.focus_score >= 75 ? 'positive' : 'neutral'}`}>
              {summary.focus_score >= 75 ? 'Great focus!' : 'Keep improving!'}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card recent-sessions">
          <div className="card-header">
            <h2>Recent Sessions</h2>
            <button onClick={() => navigate('/student/reports')} className="view-all">View All →</button>
          </div>
          <div className="sessions-list">
            {sessions.length === 0 ? (
              <div className="empty-state">
                <p>No study sessions yet. Start logging your sessions!</p>
                <button onClick={() => navigate('/student/log-session')} className="btn-secondary">
                  Log Your First Session
                </button>
              </div>
            ) : (
              sessions.slice(0, 5).map((session, index) => {
                const hours = Math.floor(session.duration_minutes / 60);
                const minutes = session.duration_minutes % 60;
                const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                const sessionDate = new Date(session.date);
                const today = new Date();
                const diffDays = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
                let dateText = 'Today';
                if (diffDays === 1) dateText = 'Yesterday';
                else if (diffDays > 1) dateText = `${diffDays} days ago`;

                const colors = [
                  'linear-gradient(135deg, #667eea, #764ba2)',
                  'linear-gradient(135deg, #f093fb, #f5576c)',
                  'linear-gradient(135deg, #4facfe, #00f2fe)',
                  'linear-gradient(135deg, #43e97b, #38f9d7)',
                  'linear-gradient(135deg, #fa709a, #fee140)'
                ];

                return (
                  <div key={session.session_id} className="session-item">
                    <div className="session-subject">
                      <span className="subject-icon" style={{background: colors[index % colors.length]}}>
                        {session.course_name?.charAt(0) || 'S'}
                      </span>
                      <div>
                        <h4>{session.course_name || 'Study Session'}</h4>
                        <p>{session.mood || 'No mood recorded'}</p>
                      </div>
                    </div>
                    <div className="session-meta">
                      <span className="session-duration">{durationText}</span>
                      <span className="session-date">{dateText}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card productivity-chart">
          <div className="card-header">
            <h2>Weekly Productivity</h2>
          </div>
          <div className="chart-placeholder">
            {weeklyReport?.by_day && weeklyReport.by_day.length > 0 ? (
              <div className="bar-chart">
                {weeklyReport.by_day.map((day, index) => {
                  const hours = (day.minutes / 60).toFixed(1);
                  const maxMinutes = Math.max(...weeklyReport.by_day.map(d => d.minutes), 1);
                  const heightPercent = (day.minutes / maxMinutes) * 100;
                  const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <div key={index} className="bar" style={{height: `${heightPercent}%`}}>
                      <span className="bar-label">{dayName}</span>
                      <span className="bar-value">{hours}h</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-chart">
                <p>No study data for this week yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      {weeklyReport?.recommendations && weeklyReport.recommendations.length > 0 && (
        <div className="card recommendations-card">
          <div className="card-header">
            <h2>🤖 AI Recommendations</h2>
          </div>
          <div className="recommendations-list">
            {weeklyReport.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="rec-icon">💡</span>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Courses Section */}
      {weeklyReport?.top_courses && weeklyReport.top_courses.length > 0 && (
        <div className="card top-courses-card">
          <div className="card-header">
            <h2>📚 Top Courses This Week</h2>
          </div>
          <div className="top-courses-list">
            {weeklyReport.top_courses.slice(0, 3).map((course, index) => (
              <div key={index} className="course-item">
                <div className="course-rank">#{index + 1}</div>
                <div className="course-info">
                  <h4>{course.course_name}</h4>
                  <p>{course.course_id}</p>
                </div>
                <div className="course-hours">{course.hours.toFixed(1)}h</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

