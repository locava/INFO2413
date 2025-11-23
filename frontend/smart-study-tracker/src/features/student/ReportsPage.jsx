import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import Select from '../../components/ui/Select';
import { WeeklyStudyChart, FocusScoreChart, CourseDistributionChart, MonthlyTrendChart } from '../../components/charts/StudyCharts';
import './Reports.css';

function ReportsPage() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('weekly');
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchReports();
  }, [reportType, selectedMonth, user]);

  const fetchReports = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      if (reportType === 'weekly') {
        const response = await aiAPI.getWeeklyReport(user.user_id);
        if (response.success) {
          setWeeklyReport(response.data);
        }
      } else {
        const response = await aiAPI.getMonthlyReport(user.user_id, selectedMonth);
        if (response.success) {
          setMonthlyReport(response.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="page-header">
          <h1>Study Reports</h1>
        </div>
        <div className="loading-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="page-header">
          <h1>Study Reports</h1>
        </div>
        <div className="error-state" style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#c33'
        }}>
          <p>❌ {error}</p>
          <button onClick={fetchReports} style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentReport = reportType === 'weekly' ? weeklyReport : monthlyReport;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Study Reports</h1>
          <p className="page-subtitle">AI-powered insights into your study patterns</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="filter-bar">
        <Select
          label="Report Type"
          name="reportType"
          value={reportType}
          onChange={handleReportTypeChange}
          options={[
            { value: 'weekly', label: 'Weekly Report' },
            { value: 'monthly', label: 'Monthly Report' }
          ]}
        />
        {reportType === 'monthly' && (
          <div className="form-group">
            <label htmlFor="month">Select Month</label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>
        )}
      </div>

      {/* Weekly Report */}
      {reportType === 'weekly' && weeklyReport && (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="summary-content">
                <h3>Total Hours</h3>
                <p className="summary-value">{weeklyReport.summary.total_hours.toFixed(1)}</p>
                <span className="summary-label">hours this week</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <div className="summary-content">
                <h3>Sessions</h3>
                <p className="summary-value">{weeklyReport.summary.sessions_count}</p>
                <span className="summary-label">completed</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
              </div>
              <div className="summary-content">
                <h3>Focus Score</h3>
                <p className="summary-value">{weeklyReport.summary.focus_score}</p>
                <span className="summary-label">out of 100</span>
              </div>
            </div>
          </div>

          {/* Daily Study Time Chart */}
          <div className="card visualization-card">
            <h2>📊 Daily Study Time</h2>
            <WeeklyStudyChart data={weeklyReport.by_day} />
          </div>

          {/* Focus Score Trend */}
          <div className="card visualization-card">
            <h2>🎯 Focus Score Trend</h2>
            <FocusScoreChart data={weeklyReport.by_day} />
          </div>

          {/* Top Courses Distribution */}
          <div className="card visualization-card">
            <h2>📚 Course Time Distribution</h2>
            {weeklyReport.top_courses && weeklyReport.top_courses.length > 0 ? (
              <CourseDistributionChart courses={weeklyReport.top_courses} />
            ) : (
              <p className="no-data">No course data available</p>
            )}
          </div>

          {/* Distractions */}
          {weeklyReport.distractions && Object.keys(weeklyReport.distractions).length > 0 && (
            <div className="card">
              <h2>⚠️ Common Distractions</h2>
              <div className="distractions-list">
                {Object.entries(weeklyReport.distractions).map(([distraction, count]) => {
                  // Format distraction name: replace underscores with spaces and capitalize
                  const formattedDistraction = distraction
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  return (
                    <div key={distraction} className="distraction-item">
                      <span className="distraction-name">{formattedDistraction}</span>
                      <span className="distraction-count">{count} {count === 1 ? 'time' : 'times'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {weeklyReport.recommendations && weeklyReport.recommendations.length > 0 && (
            <div className="card">
              <h2>🤖 AI Recommendations</h2>
              <ul className="recommendations-list">
                {weeklyReport.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Monthly Report */}
      {reportType === 'monthly' && monthlyReport && (
        <>
          <div className="card">
            <h2>Monthly Overview - {monthlyReport.month}</h2>
            <div className="monthly-stats">
              <p><strong>Trend:</strong> {monthlyReport.trend}</p>
              <p><strong>Mood Trend:</strong> {monthlyReport.mood_trend}</p>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="card visualization-card">
            <h2>📈 Monthly Progress Trend</h2>
            <MonthlyTrendChart
              hoursPerWeek={monthlyReport.hours_per_week}
              focusScores={monthlyReport.weekly_focus_scores}
            />
          </div>

          {/* Common Distractions */}
          {monthlyReport.common_distractions && monthlyReport.common_distractions.length > 0 && (
            <div className="card">
              <h2>Common Distractions This Month</h2>
              <div className="distractions-list">
                {monthlyReport.common_distractions.map((distraction, index) => (
                  <div key={index} className="distraction-item">
                    <span className="distraction-name">{distraction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Recommendations */}
          {monthlyReport.recommendations && monthlyReport.recommendations.length > 0 && (
            <div className="card">
              <h2>🤖 AI Recommendations</h2>
              <ul className="recommendations-list">
                {monthlyReport.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {monthlyReport.notes && (
            <div className="card">
              <h2>Analysis Notes</h2>
              <p>{monthlyReport.notes}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReportsPage;

