import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI, studentAPI } from '../../services/api'; 
import Select from '../../components/ui/Select';
import { WeeklyStudyChart, FocusScoreChart, CourseDistributionChart, MonthlyTrendChart } from '../../components/charts/StudyCharts';
import SessionList from './SessionList'; 
import './Reports.css';

function ReportsPage() {
  const { user } = useAuth();
  
  // --- STATE FOR PAGE VIEW & HISTORY DATA ---
  const [pageView, setPageView] = useState('reports'); // 'reports' or 'history'
  const [sessions, setSessions] = useState([]); // Sessions for modification/deletion
  const [courses, setCourses] = useState([]); // Courses list needed by SessionList
  
  // --- REPORT FILTERS & DATA ---
  const [reportType, setReportType] = useState('weekly');
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  
  // --- LOADING/ERROR STATE ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Unified effect hook to fetch all necessary data
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, reportType, selectedMonth]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    let sessionsResponse = null;
    let coursesResponse = null;

    try {
      // 1. Fetch History Data (Sessions and Courses)
      [sessionsResponse, coursesResponse] = await Promise.all([
        studentAPI.getSessions(),
        // NOTE: We assume studentAPI.getCourses() is the correct function 
        // that hits the GET /api/student/courses endpoint.
        studentAPI.getCourses() 
      ]);

      // 2. Handle Fetched Data (Sessions and Courses)
      if (sessionsResponse.success) {
        setSessions(sessionsResponse.data);

        // --- TEMPORARY DEBUGGING LOGS (Run ONLY after success) ---
        if (sessionsResponse.data.length > 0) {
            console.log("DEBUG A: FIRST SESSION COURSE_ID TYPE:", 
                         typeof sessionsResponse.data[0].course_id, 
                         sessionsResponse.data[0].course_id);
            console.log("DEBUG A: ENTIRE FIRST SESSION:", sessionsResponse.data[0]);
        }
      }
      
      if (coursesResponse.success) {
        setCourses(coursesResponse.data);

        // This log is CRITICAL and must be provided:
        if (coursesResponse.data.length > 0) {
            console.log("DEBUG B: FIRST COURSE COURSE_ID TYPE:", 
                        typeof coursesResponse.data[0].course_id, 
                        coursesResponse.data[0].course_id);
            console.log("DEBUG B: ENTIRE FIRST COURSE:", coursesResponse.data[0]);
        }
        // --- END TEMPORARY DEBUGGING LOGS ---
      }

      // 3. Fetch AI Reports (existing logic)
      if (reportType === 'weekly') {
        const reportResponse = await aiAPI.getWeeklyReport(user.user_id);
        if (reportResponse.success) {
          setWeeklyReport(reportResponse.data);
          setMonthlyReport(null);
        }
      } else {
        const reportResponse = await aiAPI.getMonthlyReport(user.user_id, selectedMonth);
        if (reportResponse.success) {
          setMonthlyReport(reportResponse.data);
          setWeeklyReport(null);
        }
      }

    } catch (err) {
      // console.error('Data fetch error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to only fetch reports (used after session update/delete)
  // This is faster than calling fetchData() which refetches everything.
  const fetchReportsOnly = async () => {
      if (reportType === 'weekly') {
        const response = await aiAPI.getWeeklyReport(user.user_id);
        if (response.success) setWeeklyReport(response.data);
      } else {
        const response = await aiAPI.getMonthlyReport(user.user_id, selectedMonth);
        if (response.success) setMonthlyReport(response.data);
      }
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };
  
  // --- HANDLERS FOR SESSIONLIST COMPONENT ---
  
  const handleSessionUpdated = (updatedSession) => {
    // Replace the old session with the updated session in the state
    setSessions(prevSessions => 
      prevSessions.map(s => 
        s.session_id === updatedSession.session_id ? updatedSession : s
      )
    );
    // Re-fetch reports to ensure charts and AI data are up-to-date
    fetchReportsOnly();
  };

  const handleSessionDeleted = (deletedSessionId) => {
    // Filter out the deleted session from the state
    setSessions(prevSessions => 
      prevSessions.filter(s => s.session_id !== deletedSessionId)
    );
    // Re-fetch reports to ensure charts and AI data are up-to-date
    fetchReportsOnly();
  };
  
  // --- LOADING/ERROR STATES ---
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
          <p>Loading your data...</p>
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
          <button onClick={fetchData} style={{ 
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

  // --- MAIN RENDER ---
  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Study Insights & History</h1>
          <p className="page-subtitle">Analyze your progress or modify your session logs</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button 
          className={pageView === 'reports' ? 'active' : ''} 
          onClick={() => setPageView('reports')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            borderBottom: pageView === 'reports' ? '3px solid #6366f1' : '3px solid transparent', 
            backgroundColor: 'transparent', 
            cursor: 'pointer',
            fontWeight: pageView === 'reports' ? 'bold' : 'normal'
          }}
        >
          AI Reports
        </button>
        <button 
          className={pageView === 'history' ? 'active' : ''} 
          onClick={() => setPageView('history')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            borderBottom: pageView === 'history' ? '3px solid #6366f1' : '3px solid transparent', 
            backgroundColor: 'transparent', 
            cursor: 'pointer',
            fontWeight: pageView === 'history' ? 'bold' : 'normal'
          }}
        >
          Session History & Edit
        </button>
      </div>

      {/* --- 1. AI REPORTS VIEW --- */}
      {pageView === 'reports' && (
        <>
          {/* Report Type Selector */}
          <div className="filter-bar" style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
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
              <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
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
              <div className="card visualization-card" style={{ marginBottom: '20px' }}>
                <h2>📊 Daily Study Time</h2>
                <WeeklyStudyChart data={weeklyReport.by_day} />
              </div>

              {/* Focus Score Trend */}
              <div className="card visualization-card" style={{ marginBottom: '20px' }}>
                <h2>🎯 Focus Score Trend</h2>
                <FocusScoreChart data={weeklyReport.by_day} />
              </div>

              {/* Top Courses Distribution */}
              <div className="card visualization-card" style={{ marginBottom: '20px' }}>
                <h2>📚 Course Time Distribution</h2>
                {weeklyReport.top_courses && weeklyReport.top_courses.length > 0 ? (
                  <CourseDistributionChart courses={weeklyReport.top_courses} />
                ) : (
                  <p className="no-data">No course data available</p>
                )}
              </div>

              {/* Distractions */}
              {weeklyReport.distractions && Object.keys(weeklyReport.distractions).length > 0 && (
                <div className="card" style={{ marginBottom: '20px' }}>
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
                <div className="card" style={{ marginBottom: '20px' }}>
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
              <div className="card" style={{ marginBottom: '20px' }}>
                <h2>Monthly Overview - {monthlyReport.month}</h2>
                <div className="monthly-stats">
                  <p><strong>Trend:</strong> {monthlyReport.trend}</p>
                  <p><strong>Mood Trend:</strong> {monthlyReport.mood_trend}</p>
                </div>
              </div>

              {/* Monthly Trend Chart */}
              <div className="card visualization-card" style={{ marginBottom: '20px' }}>
                <h2>📈 Monthly Progress Trend</h2>
                <MonthlyTrendChart
                  hoursPerWeek={monthlyReport.hours_per_week}
                  focusScores={monthlyReport.weekly_focus_scores}
                />
              </div>

              {/* Common Distractions */}
              {monthlyReport.common_distractions && monthlyReport.common_distractions.length > 0 && (
                <div className="card" style={{ marginBottom: '20px' }}>
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
                <div className="card" style={{ marginBottom: '20px' }}>
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
                <div className="card" style={{ marginBottom: '20px' }}>
                  <h2>Analysis Notes</h2>
                  <p>{monthlyReport.notes}</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* --- 2. SESSION HISTORY VIEW (NEW TAB) --- */}
      {pageView === 'history' && (
        <div className="session-history-view">
          <div className="history-description" style={{ marginBottom: '20px', padding: '15px', background: '#f0f4ff', borderLeft: '5px solid #6366f1', borderRadius: '4px' }}>
            <p>Review and manage your logged study sessions. Use the **Edit** and **Delete** buttons to make changes.</p>
          </div>
          <SessionList 
            sessions={sessions} 
            courses={courses} 
            onSessionUpdated={handleSessionUpdated}
            onSessionDeleted={handleSessionDeleted}
          />
        </div>
      )}
    </div>
  );
}

export default ReportsPage;