// backend/src/db/queries/studySession.queries.js
const pool = require('../pool');

const studyQueries = {
  createStudySession: async (data) => {
    // ✅ FIX: SQL Query now includes 'date' and 'duration_minutes'
    const query = `
      INSERT INTO study_sessions (
        student_id, 
        course_id, 
        date, 
        start_time, 
        duration_minutes, 
        mood, 
        distractions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      data.studentId,
      data.courseId,
      data.date,            // $3 -> Matches the error "column date"
      data.startTime,
      data.durationMinutes, // $5 -> Matches your DB schema
      data.mood,
      data.distractions
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  getStudySessionsByStudent: async (studentId, filters = {}) => {
    // Base query selects sessions and joins to get course name
    let baseQuery = `
      SELECT s.*, c.course_name, c.course_code
      FROM study_sessions s
      LEFT JOIN courses c ON s.course_id = c.course_id
      WHERE s.student_id = $1 AND s.is_deleted = false
    `;
    
    const values = [studentId];
    let paramIndex = 2;

    // --- Subject Filter (Uses Course Name) ---
    if (filters.subject) {
      baseQuery += ` AND c.course_name ILIKE $${paramIndex}`;
      values.push(`%${filters.subject}%`);
      paramIndex++;
    }

    // --- Mood Filter ---
    if (filters.mood) {
      baseQuery += ` AND s.mood = $${paramIndex}`;
      values.push(filters.mood);
      paramIndex++;
    }

    // --- Time Range Filter: Start Date ---
    if (filters.startDate) {
      // Find sessions ON or AFTER the start date
      baseQuery += ` AND s.date >= $${paramIndex}`;
      values.push(filters.startDate);
      paramIndex++;
    }

    // --- Time Range Filter: End Date ---
    if (filters.endDate) {
      // Find sessions ON or BEFORE the end date
      baseQuery += ` AND s.date <= $${paramIndex}`;
      values.push(filters.endDate);
      paramIndex++;
    }

    // Final sorting
    baseQuery += ` ORDER BY s.date DESC, s.start_time DESC`;
    
    const result = await pool.query(baseQuery, values);
    return result.rows;
  },

  
  
  updateStudySession: async (data) => {
     const query = `
      UPDATE study_sessions
      SET date = $1, start_time = $2, duration_minutes = $3, mood = $4, distractions = $5
      WHERE session_id = $6 AND student_id = $7
      RETURNING *
    `;
    const values = [
        data.date, 
        data.startTime, 
        data.durationMinutes, 
        data.mood, 
        data.distractions, 
        data.sessionId, 
        data.studentId
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  softDeleteStudySession: async (studentId, sessionId) => {
    const query = `
      UPDATE study_sessions 
      SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP
      WHERE session_id = $1 AND student_id = $2
      RETURNING session_id
    `;
    const result = await pool.query(query, [sessionId, studentId]);
    return result.rows[0];
  }
};

module.exports = studyQueries;