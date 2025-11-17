import { useState, useMemo } from 'react';
import { mockStudySessions } from './mockData';
import Select from '../../components/ui/Select';
import './Reports.css';

function ReportsPage() {
  const [filters, setFilters] = useState({
    range: 'This Week',
    course: 'All Courses',
    mood: 'All Moods'
  });

  // Get unique courses and moods from data
  const uniqueCourses = useMemo(() => {
    const courses = [...new Set(mockStudySessions.map(s => s.course))];
    return ['All Courses', ...courses];
  }, []);

  const uniqueMoods = useMemo(() => {
    const moods = [...new Set(mockStudySessions.map(s => s.mood))];
    return ['All Moods', ...moods];
  }, []);

  // Filter sessions based on selected filters
  const filteredSessions = useMemo(() => {
    let filtered = [...mockStudySessions];

    // Filter by course
    if (filters.course !== 'All Courses') {
      filtered = filtered.filter(s => s.course === filters.course);
    }

    // Filter by mood
    if (filters.mood !== 'All Moods') {
      filtered = filtered.filter(s => s.mood === filters.mood);
    }

    // Filter by date range
    const today = new Date();
    const getDateDaysAgo = (days) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date;
    };

    if (filters.range === 'This Week') {
      const weekAgo = getDateDaysAgo(7);
      filtered = filtered.filter(s => new Date(s.date) >= weekAgo);
    } else if (filters.range === 'Last Week') {
      const twoWeeksAgo = getDateDaysAgo(14);
      const weekAgo = getDateDaysAgo(7);
      filtered = filtered.filter(s => {
        const date = new Date(s.date);
        return date >= twoWeeksAgo && date < weekAgo;
      });
    } else if (filters.range === 'This Month') {
      const monthAgo = getDateDaysAgo(30);
      filtered = filtered.filter(s => new Date(s.date) >= monthAgo);
    }

    return filtered;
  }, [filters]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalMinutes = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
    const sessionCount = filteredSessions.length;
    const avgDuration = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;

    return {
      totalMinutes,
      sessionCount,
      avgDuration
    };
  }, [filteredSessions]);

  // Calculate minutes per course for visualization
  const minutesPerCourse = useMemo(() => {
    const courseMap = {};
    filteredSessions.forEach(session => {
      if (!courseMap[session.course]) {
        courseMap[session.course] = 0;
      }
      courseMap[session.course] += session.duration;
    });
    return Object.entries(courseMap).map(([course, minutes]) => ({
      course,
      minutes
    }));
  }, [filteredSessions]);

  const maxMinutes = Math.max(...minutesPerCourse.map(c => c.minutes), 1);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Study Reports</h1>
          <p className="page-subtitle">Analyze your study patterns and track your progress</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <Select
          label="Time Range"
          name="range"
          value={filters.range}
          onChange={handleFilterChange}
          options={['This Week', 'Last Week', 'This Month']}
        />
        <Select
          label="Course"
          name="course"
          value={filters.course}
          onChange={handleFilterChange}
          options={uniqueCourses}
        />
        <Select
          label="Mood"
          name="mood"
          value={filters.mood}
          onChange={handleFilterChange}
          options={uniqueMoods}
        />
      </div>

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
            <h3>Total Minutes</h3>
            <p className="summary-value">{summary.totalMinutes}</p>
            <span className="summary-label">minutes</span>
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
            <p className="summary-value">{summary.sessionCount}</p>
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
            <h3>Average Duration</h3>
            <p className="summary-value">{summary.avgDuration}</p>
            <span className="summary-label">minutes</span>
          </div>
        </div>
      </div>

      {/* Minutes per Course Visualization */}
      <div className="card visualization-card">
        <h2>Study Time by Course</h2>
        <div className="bar-chart">
          {minutesPerCourse.length > 0 ? (
            minutesPerCourse.map(({ course, minutes }) => (
              <div key={course} className="bar-item">
                <div className="bar-label">{course}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{ width: `${(minutes / maxMinutes) * 100}%` }}
                  >
                    <span className="bar-value">{minutes} min</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No data available for the selected filters</p>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="card sessions-table-card">
        <h2>Session Details</h2>
        {filteredSessions.length > 0 ? (
          <div className="sessions-table-wrapper">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Duration</th>
                  <th>Mood</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map(session => (
                  <tr key={session.id}>
                    <td>{formatDate(session.date)}</td>
                    <td>{session.course}</td>
                    <td>{session.duration} min</td>
                    <td>
                      <span className={`mood-badge mood-${session.mood.toLowerCase()}`}>
                        {session.mood}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No sessions found for the selected filters</p>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;

