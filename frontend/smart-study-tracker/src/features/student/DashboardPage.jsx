import './DashboardPage.css';

function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your study overview</p>
        </div>
        <button className="btn-primary">
          <span>📝</span>
          <span>Quick Log Session</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Total Study Time</h3>
            <p className="stat-value">24.5 hrs</p>
            <span className="stat-change positive">+12% from last week</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Sessions Completed</h3>
            <p className="stat-value">18</p>
            <span className="stat-change positive">+3 this week</span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Goals Achieved</h3>
            <p className="stat-value">7/10</p>
            <span className="stat-change neutral">70% completion</span>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <p className="stat-value">5 days</p>
            <span className="stat-change positive">Keep it up!</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card recent-sessions">
          <div className="card-header">
            <h2>Recent Sessions</h2>
            <a href="#" className="view-all">View All →</a>
          </div>
          <div className="sessions-list">
            <div className="session-item">
              <div className="session-subject">
                <span className="subject-icon" style={{background: 'linear-gradient(135deg, #667eea, #764ba2)'}}>M</span>
                <div>
                  <h4>Mathematics</h4>
                  <p>Calculus - Integration</p>
                </div>
              </div>
              <div className="session-meta">
                <span className="session-duration">2h 30m</span>
                <span className="session-date">Today</span>
              </div>
            </div>

            <div className="session-item">
              <div className="session-subject">
                <span className="subject-icon" style={{background: 'linear-gradient(135deg, #f093fb, #f5576c)'}}>P</span>
                <div>
                  <h4>Physics</h4>
                  <p>Quantum Mechanics</p>
                </div>
              </div>
              <div className="session-meta">
                <span className="session-duration">1h 45m</span>
                <span className="session-date">Yesterday</span>
              </div>
            </div>

            <div className="session-item">
              <div className="session-subject">
                <span className="subject-icon" style={{background: 'linear-gradient(135deg, #4facfe, #00f2fe)'}}>C</span>
                <div>
                  <h4>Chemistry</h4>
                  <p>Organic Chemistry</p>
                </div>
              </div>
              <div className="session-meta">
                <span className="session-duration">3h 15m</span>
                <span className="session-date">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card productivity-chart">
          <div className="card-header">
            <h2>Weekly Productivity</h2>
            <select className="chart-filter">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="chart-placeholder">
            <div className="bar-chart">
              <div className="bar" style={{height: '60%'}}>
                <span className="bar-label">Mon</span>
                <span className="bar-value">3h</span>
              </div>
              <div className="bar" style={{height: '80%'}}>
                <span className="bar-label">Tue</span>
                <span className="bar-value">4h</span>
              </div>
              <div className="bar" style={{height: '45%'}}>
                <span className="bar-label">Wed</span>
                <span className="bar-value">2h</span>
              </div>
              <div className="bar" style={{height: '90%'}}>
                <span className="bar-label">Thu</span>
                <span className="bar-value">4.5h</span>
              </div>
              <div className="bar" style={{height: '70%'}}>
                <span className="bar-label">Fri</span>
                <span className="bar-value">3.5h</span>
              </div>
              <div className="bar" style={{height: '55%'}}>
                <span className="bar-label">Sat</span>
                <span className="bar-value">2.5h</span>
              </div>
              <div className="bar" style={{height: '85%'}}>
                <span className="bar-label">Sun</span>
                <span className="bar-value">4h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card goals-section">
        <div className="card-header">
          <h2>Active Goals</h2>
          <button className="btn-secondary">+ Add Goal</button>
        </div>
        <div className="goals-list">
          <div className="goal-item">
            <div className="goal-info">
              <h4>Complete Calculus Course</h4>
              <p>Study 20 hours this month</p>
            </div>
            <div className="goal-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '75%'}}></div>
              </div>
              <span className="progress-text">15/20 hours</span>
            </div>
          </div>

          <div className="goal-item">
            <div className="goal-info">
              <h4>Master Quantum Physics</h4>
              <p>Complete 10 practice problems</p>
            </div>
            <div className="goal-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '40%'}}></div>
              </div>
              <span className="progress-text">4/10 problems</span>
            </div>
          </div>

          <div className="goal-item">
            <div className="goal-info">
              <h4>Maintain Study Streak</h4>
              <p>Study every day for 30 days</p>
            </div>
            <div className="goal-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '17%'}}></div>
              </div>
              <span className="progress-text">5/30 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

