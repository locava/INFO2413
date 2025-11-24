import React, { useState } from 'react';
import { studentAPI } from '../../services/api';
// Assuming these UI components exist in your project structure
import Button from '../../components/ui/Button'; 
import Input from '../../components/ui/Input'; 
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';

// Mood options used for the select field in the edit form
const moodOptions = [
    'Very Productive', 'Productive', 'Focused', 'Neutral', 
    'Tired', 'Distracted', 'Stressed'
];

// Reusable component to handle the session list, editing, and deleting
const SessionList = ({ sessions, onSessionUpdated, onSessionDeleted, courses }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  // Helper to get the course name from the course ID
  // In SessionList.jsx
  const getCourseName = (courseId) => {
  // 💡 DEFINITIVE FIX: Convert both IDs to lowercase strings for robust UUID comparison
  // (UUIDs are often stored as lowercase strings in the database)
  const sessionIdStr = String(courseId).toLowerCase();
  
  const course = courses.find(c => 
    c.course_id && String(c.course_id).toLowerCase() === sessionIdStr
  );
  
  // Display code and name if available, otherwise just name
  return course ? `${course.course_code || ''} - ${course.course_name}`.trim() : 'Unknown Course';
  };

  // Sets the session data into the state when 'Edit' is clicked
  const handleEditClick = (session) => {
    setEditingId(session.session_id);
    setEditData({
      // The date and start_time returned from DB need formatting for HTML input types
      date: session.date.split('T')[0], 
      startTime: session.start_time.substring(11, 16), 
      durationMinutes: session.duration_minutes.toString(),
      mood: session.mood,
      distractions: session.distractions
    });
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    const duration = parseInt(editData.durationMinutes);
    if (duration <= 0) return alert('Duration must be greater than 0.');
    
    setLoadingId(editingId);
    
    try {
      // Combine date and time back into an ISO timestamp for the backend
      const startTimeISO = `${editData.date}T${editData.startTime}:00`;
      
      const payload = {
        ...editData,
        startTime: startTimeISO,
        durationMinutes: duration,
      };

      const response = await studentAPI.updateSession(editingId, payload);
      
      if (response.success && onSessionUpdated) {
        // Pass the updated session back to the parent ReportsPage
        onSessionUpdated(response.data);
        setEditingId(null);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert(`Update failed: ${error.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (sessionId) => {
    // Custom modal/confirmation dialog should be used here instead of window.confirm
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) return;
    
    setLoadingId(sessionId);

    try {
      await studentAPI.deleteSession(sessionId);
      if (onSessionDeleted) {
        // Notify the parent component to remove the session from the list
        onSessionDeleted(sessionId);
      }
    } catch (error) {
      console.error("Deletion failed:", error);
      alert(`Deletion failed: ${error.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="session-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {sessions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)', borderRadius: 'var(--radius-md)' }}>
          No recorded sessions found.
        </div>
      ) : (
        sessions.map((session) => (
          <div key={session.session_id} className="session-item-card" style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            {editingId === session.session_id ? (
              // --- EDIT FORM VIEW ---
              <div className="session-edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Editing Session: {getCourseName(session.course_id)}</h3>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Input label="Date" type="date" name="date" value={editData.date} onChange={handleEditChange} required />
                  <Input label="Start Time" type="time" name="startTime" value={editData.startTime} onChange={handleEditChange} required />
                </div>
                
                <Input label="Duration (min)" type="number" name="durationMinutes" value={editData.durationMinutes} onChange={handleEditChange} placeholder="Duration (min)" required min="1" />
                
                <Select
                  label="Mood"
                  name="mood"
                  value={editData.mood}
                  onChange={handleEditChange}
                  options={moodOptions.map(m => ({ value: m, label: m }))}
                />
                <Textarea label="Distractions" name="distractions" value={editData.distractions} onChange={handleEditChange} placeholder="Notes on distractions" rows="2" />
                
                <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                  <Button variant="secondary" onClick={() => setEditingId(null)} disabled={loadingId}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleUpdate} disabled={loadingId === session.session_id}>
                    {loadingId === session.session_id ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              // --- READ-ONLY VIEW ---
              <div className="session-details">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0 }}>{getCourseName(session.course_id)}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(session.date).toLocaleDateString()} at {session.start_time.substring(11, 16)}
                  </div>
                </div>
                <p>Duration: <strong style={{ color: 'var(--gray-900)' }}>{session.duration_minutes} mins</strong></p>
                <p>Mood: <strong>{session.mood || 'N/A'}</strong></p>
                
                <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleEditClick(session)}
                    disabled={loadingId}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => handleDelete(session.session_id)}
                    disabled={loadingId}
                    style={{ backgroundColor: 'var(--accent-red)', borderColor: 'var(--accent-red)', color: 'white' }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default SessionList;