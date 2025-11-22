const pool = require('../pool');

const reportQueries = {
  getSystemStats: async () => {
    const totalUsersQuery = pool.query(`SELECT COUNT(*) FROM users WHERE status = 'Active'`);
    const activeSessionsQuery = pool.query(`SELECT COUNT(*) FROM study_sessions WHERE end_time IS NULL AND is_deleted = false`);
    const totalCoursesQuery = pool.query(`SELECT COUNT(*) FROM courses WHERE is_deleted = false`);
    
    const avgMoodQuery = pool.query(`
      SELECT AVG(mood) as avg_mood 
      FROM study_sessions 
      WHERE mood IS NOT NULL AND is_deleted = false
    `);

    const [totalUsers, activeSessions, totalCourses, avgMood] = await Promise.all([
      totalUsersQuery,
      activeSessionsQuery,
      totalCoursesQuery,
      avgMoodQuery
    ]);

    return {
      total_users: parseInt(totalUsers.rows[0].count),
      active_sessions: parseInt(activeSessions.rows[0].count),
      total_courses: parseInt(totalCourses.rows[0].count),
      average_system_mood: parseFloat(avgMood.rows[0].avg_mood || 0).toFixed(1)
    };
  }
};

module.exports = reportQueries;