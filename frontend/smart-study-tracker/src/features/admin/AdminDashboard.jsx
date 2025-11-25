import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI, adminAPI } from '../../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const [systemReport, setSystemReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dataQuality, setDataQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'courses', 'thresholds', 'alerts', 'data-quality'

  // State for Instructor Creation Form
  const [isCreatingInstructor, setIsCreatingInstructor] = useState(false);
  const [newInstructorData, setNewInstructorData] = useState({
    name: '', email: '', phone: '', workingId: '', department: '', password: 'password123', role: 'Instructor',
  });

  // State for Course Creation
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    courseName: '', courseCode: '', instructorId: '',
  });
  const [availableInstructors, setAvailableInstructors] = useState([]);

  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User management states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    phone: '',
    dob: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [reportResponse, usersResponse, coursesResponse, thresholdsResponse, alertsResponse, notificationsResponse, dataQualityResponse] = await Promise.all([
        aiAPI.getSystemReport(),
        adminAPI.getUsers(),
        adminAPI.getCourses(),
        adminAPI.getThresholds(),
        adminAPI.getAlerts(20),
        adminAPI.getNotifications(20),
        adminAPI.getDataQuality()
      ]);

      if (reportResponse.success) setSystemReport(reportResponse.data);
      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
        const instructors = usersResponse.data.filter(u => u.role === 'Instructor');
        setAvailableInstructors(instructors);
      }

      if (coursesResponse.success) {
        setCourses(coursesResponse.data || []);
      }

      if (thresholdsResponse.success) {
        setThresholds(thresholdsResponse.data || []);
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
  
  // Handler for instructor form input changes
  const handleInstructorInputChange = (e) => {
    setNewInstructorData({
      ...newInstructorData,
      [e.target.name]: e.target.value
    });
  };

  // Handler for course form input changes
  const handleCourseInputChange = (e) => {
    setNewCourseData({
      ...newCourseData,
      [e.target.name]: e.target.value
    });
  };

  // Handler for instructor form submission (existing logic)
  const handleCreateInstructorSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ type: '', text: '' });

    try {
      // Basic validation
      if (!newInstructorData.name || !newInstructorData.email || !newInstructorData.workingId || !newInstructorData.department) {
        setFormMessage({ type: 'error', text: 'Name, Email, Working ID, and Department are required.' });
        setIsSubmitting(false);
        return;
      }
      
      const response = await adminAPI.createUser(newInstructorData);

      if (response.success) {
        setFormMessage({ type: 'success', text: `Instructor ${response.data.name} created successfully!` });
        
        setTimeout(() => {
            setIsCreatingInstructor(false);
            setNewInstructorData({ name: '', email: '', phone: '', workingId: '', department: '', password: 'password123', role: 'Instructor' });
            fetchData(); // Refresh data including user/instructor lists
        }, 1500);

      } else {
        setFormMessage({ type: 'error', text: response.message || 'Creation failed due to server error.' });
      }

    } catch (err) {
      setFormMessage({ type: 'error', text: err.message || 'Network error during creation.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for course form submission (existing logic)
  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ type: '', text: '' });

    try {
      // Validation
      if (!newCourseData.courseName || !newCourseData.courseCode || !newCourseData.instructorId) {
        setFormMessage({ type: 'error', text: 'Course Name, Code, and Instructor are required.' });
        setIsSubmitting(false);
        return;
      }
      
      const payload = {
        course_name: newCourseData.courseName,
        course_code: newCourseData.courseCode,
        instructor_id: newCourseData.instructorId,
      };

      const response = await adminAPI.createCourse(payload);

      if (response.success) {
        setFormMessage({ type: 'success', text: `Course ${response.data.course_code} created successfully!` });
        
        setTimeout(() => {
            setIsCreatingCourse(false);
            setNewCourseData({ courseName: '', courseCode: '', instructorId: '' });
            fetchData(); // Refresh course list
        }, 1500);

      } else {
        setFormMessage({ type: 'error', text: response.message || 'Course creation failed.' });
      }

    } catch (err) {
      setFormMessage({ type: 'error', text: err.message || 'Network error during course creation.' });
    } finally {
      setIsSubmitting(false);
    }
  };

// ✅ MODIFIED: Function now accepts user directly and uses window.confirm()
const executeDelete = async (user) => {
    // 1. Use default browser confirmation dialog
    const confirmed = window.confirm(
        `Are you sure you want to DEACTIVATE the account for ${user.name} (${user.role})? \n\nThis action will set the user's status to 'Inactive'.`
    );

    if (!confirmed) {
        return;
    }

    setLoading(true);

    try {
        // 2. Call the API endpoint
        const response = await adminAPI.deleteUser(user.user_id);

        if (response.success) {
            // Success: User deleted (status set to Inactive), refresh data to update table
            fetchData();
        } else {
            // Display an alert for API failure
            alert(`Deletion failed: ${response.message || 'Server error.'}`);
            setLoading(false); 
        }

    } catch (err) {
        alert('Network error during user deletion. Check console for details.');
        setLoading(false);
    }
};

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.createUser(newUser);
      if (response.success) {
        alert('✅ User created successfully!');
        setShowAddUserModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'Student', phone: '', dob: '' });
        fetchData(); // Refresh user list
      }
    } catch (err) {
      alert('❌ Failed to create user: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await adminAPI.deleteUser(selectedUser.user_id);
      if (response.success) {
        alert('✅ User deleted successfully!');
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        fetchData(); // Refresh user list
      }
    } catch (err) {
      alert('❌ Failed to delete user: ' + (err.message || 'Unknown error'));
    }
  };

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleUpdateThreshold = async (thresholdId, valueNumeric, valueText) => {
    try {
      const response = await adminAPI.updateThreshold(thresholdId, {
        valueNumeric,
        valueText
      });

      if (response.success) {
        alert('✅ Threshold updated successfully!');
        fetchData(); // Refresh thresholds
      }
    } catch (err) {
      alert('❌ Failed to update threshold: ' + (err.message || 'Unknown error'));
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
        
        {/* Refresh Button remains in the header's flex container */}
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchData} className="btn-primary">
                🔄 Refresh Data
            </button>
        </div>
      </div>
      
      {/* MOVED BUTTON BLOCK */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
          
          {/* Create Instructor Button */}
          <button 
              onClick={() => { setIsCreatingInstructor(prev => !prev); setIsCreatingCourse(false); }} 
              className="btn-primary"
              style={{ backgroundColor: isCreatingInstructor ? '#ef4444' : '#10b981', padding: '10px 15px' }}
          >
              {isCreatingInstructor ? '✕ Cancel Instructor' : '➕ Create Instructor'}
          </button>
          
          {/* Create Course Button */}
          <button 
              onClick={() => { setIsCreatingCourse(prev => !prev); setIsCreatingInstructor(false); }} 
              className="btn-primary"
              style={{ backgroundColor: isCreatingCourse ? '#ef4444' : '#6366f1', padding: '10px 15px' }}
          >
              {isCreatingCourse ? '✕ Cancel Course' : '📚 Create Course'}
          </button>
          
      </div>

      {/* -------------------------------------------
      // INSTRUCTOR CREATION FORM
      // ------------------------------------------- */}
      {isCreatingInstructor && (
        <div className="card instructor-creation-form" style={{ marginBottom: '20px' }}>
            <h2>Create New Instructor Account</h2>
            
            {formMessage.text && (
                <div 
                    style={{ 
                        padding: '10px', marginBottom: '15px', borderRadius: '4px',
                        backgroundColor: formMessage.type === 'error' ? '#fee2e2' : '#d1fae5',
                        color: formMessage.type === 'error' ? '#991b1b' : '#065f46',
                        border: `1px solid ${formMessage.type === 'error' ? '#fca5a5' : '#a7f3d0'}`,
                        fontWeight: 'bold'
                    }}
                >
                    {formMessage.text}
                </div>
            )}

            <form onSubmit={handleCreateInstructorSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Name */}
                <div className="form-group">
                    <label>Full Name</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={newInstructorData.name} 
                        onChange={handleInstructorInputChange} 
                        required 
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    />
                </div>
                
                {/* Email */}
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={newInstructorData.email} 
                        onChange={handleInstructorInputChange} 
                        required 
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    />
                </div>

                {/* Working ID */}
                <div className="form-group">
                    <label>Working ID (Unique)</label>
                    <input 
                        type="text" 
                        name="workingId" 
                        value={newInstructorData.workingId} 
                        onChange={handleInstructorInputChange} 
                        required 
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    />
                </div>

                {/* Phone */}
                <div className="form-group">
                    <label>Phone Number (Optional)</label>
                    <input 
                        type="text" 
                        name="phone" 
                        value={newInstructorData.phone} 
                        onChange={handleInstructorInputChange} 
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    />
                </div>
                
                {/* Department Input Field */}
                <div className="form-group">
                    <label>Department</label>
                    <input 
                        type="text" 
                        name="department" 
                        value={newInstructorData.department} 
                        onChange={handleInstructorInputChange} 
                        required 
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    />
                </div>

                {/* Placeholder/Empty div to align layout */}
                <div className="form-group">
                    {/* Keeps the grid layout consistent */}
                </div>
                
                {/* Hidden/Default Password field for security */}
                <input type="hidden" name="password" value={newInstructorData.password} />
                <p style={{ gridColumn: 'span 2', fontSize: '0.9em', color: '#666', marginTop: '-10px' }}>
                    *Initial Password: **{newInstructorData.password}** (User must change on first login)
                </p>

                {/* Submit Button */}
                <div style={{ gridColumn: 'span 2', textAlign: 'right', paddingTop: '10px' }}>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="btn-primary" 
                        style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Instructor Account'}
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* -------------------------------------------
      // COURSE CREATION FORM
      // ------------------------------------------- */}
      {isCreatingCourse && (
        <div className="card course-creation-form" style={{ marginBottom: '20px' }}>
            <h2>Create New Course</h2>
            
            {formMessage.text && (
                <div 
                    style={{ 
                        padding: '10px', marginBottom: '15px', borderRadius: '4px',
                        backgroundColor: formMessage.type === 'error' ? '#fee2e2' : '#d1fae5',
                        color: formMessage.type === 'error' ? '#991b1b' : '#065f46',
                        border: `1px solid ${formMessage.type === 'error' ? '#fca5a5' : '#a7f3d0'}`,
                        fontWeight: 'bold'
                    }}
                >
                    {formMessage.text}
                </div>
            )}

            <form onSubmit={handleCreateCourseSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Course Name */}
                <div className="form-group">
                    <label>Course Name</label>
                    <input 
                        type="text" 
                        name="courseName" 
                        value={newCourseData.courseName} 
                        onChange={handleCourseInputChange} 
                        required 
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    />
                </div>
                
                {/* Course Code */}
                <div className="form-group">
                    <label>Course Code (e.g., INFO2413)</label>
                    <input 
                        type="text" 
                        name="courseCode" 
                        value={newCourseData.courseCode} 
                        onChange={handleCourseInputChange} 
                        required 
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    />
                </div>

                {/* Instructor Selection (Dropdown) */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Assign Instructor</label>
                    <select
                        name="instructorId"
                        value={newCourseData.instructorId}
                        onChange={handleCourseInputChange}
                        required
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', backgroundColor: 'white' }}
                    >
                        <option value="">-- Select Instructor --</option>
                        {availableInstructors.map(inst => (
                            // The value must be the user_id (UUID) which is the FK in the courses table
                            <option key={inst.user_id} value={inst.user_id}>
                                {inst.name} ({inst.email})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <div style={{ gridColumn: 'span 2', textAlign: 'right', paddingTop: '10px' }}>
                    <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {isSubmitting ? 'Creating Course...' : 'Create Course'}
                    </button>
                </div>
            </form>
        </div>
      )}
      
      {/* User Statistics */}
      <div className="summary-cards">
      {/* ... (Summary Cards content remains the same) ... */}
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
      {/* ... (Tab Navigation content remains the same) ... */}
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
          className={`tab-button ${activeTab === 'thresholds' ? 'active' : ''}`}
          onClick={() => setActiveTab('thresholds')}
        >
          ⚙️ Thresholds ({thresholds.length})
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
          {/* ... (Overview Tab content remains the same) ... */}
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
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span className="user-count-badge">{users.length} total users</span>
              <button
                className="btn-primary"
                onClick={() => setShowAddUserModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>➕</span>
                <span>Add User</span>
              </button>
            </div>
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
                    <th>Actions</th>
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
                      <td>
                        <button
                          className="btn-danger-small"
                          onClick={() => confirmDelete(user)}
                          disabled={user.role === 'Administrator'}
                          title={user.role === 'Administrator' ? 'Cannot delete admin' : 'Delete user'}
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.85rem',
                            backgroundColor: user.role === 'Administrator' ? '#ccc' : '#dc3545',
                            cursor: user.role === 'Administrator' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          🗑️ Delete
                        </button>
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

          {/* ... (Courses Tab content remains the same) ... */}
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

      {/* Thresholds Tab */}
      {activeTab === 'thresholds' && (
        <div className="card">
          <div className="card-header">
            <h2>⚙️ System Thresholds Configuration</h2>
            <span className="user-count-badge">{thresholds.length} thresholds</span>
          </div>

          <div className="thresholds-info">
            <p>Configure system-wide thresholds and parameters. Changes take effect immediately.</p>
          </div>

          {thresholds.length > 0 ? (
            <div className="thresholds-grid">
              {thresholds.map((threshold) => (
                <ThresholdCard
                  key={threshold.threshold_id}
                  threshold={threshold}
                  onUpdate={handleUpdateThreshold}
                />
              ))}
            </div>
          ) : (
            <p className="no-data">No thresholds configured</p>
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

          {/* ... (Data Quality Tab content remains the same) ... */}
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
                    {dataQuality.active_students || 0}
                  </span>
                </div>
                <div className="quality-metric">
                  <span className="metric-label">Engagement Rate</span>
                  <span className="metric-value info">
                    {dataQuality.engagement_rate || 0}%
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
                // Weight different issues differently
                const criticalIssues = dataQuality.courses_with_no_enrollments * 10; // Critical
                const moderateIssues = dataQuality.students_with_no_sessions * 2; // Moderate
                const minorIssues = dataQuality.sessions_with_missing_fields * 1; // Minor
                const totalDeduction = criticalIssues + moderateIssues + minorIssues;
                const healthScore = Math.max(0, Math.min(100, 100 - totalDeduction));
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

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add New User</h2>
              <button className="modal-close" onClick={() => setShowAddUserModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddUser} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  placeholder="Enter password (min 8 chars)"
                  minLength="8"
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  required
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={newUser.dob}
                  onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this user?</p>
              <div className="delete-user-info">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
              </div>
              <p className="warning-text">⚠️ This action cannot be undone!</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteUser}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Threshold Card Component
function ThresholdCard({ threshold, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [valueNumeric, setValueNumeric] = useState(threshold.value_numeric || '');
  const [valueText, setValueText] = useState(threshold.value_text || '');

  const handleSave = () => {
    onUpdate(
      threshold.threshold_id,
      valueNumeric !== '' ? parseFloat(valueNumeric) : null,
      valueText !== '' ? valueText : null
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValueNumeric(threshold.value_numeric || '');
    setValueText(threshold.value_text || '');
    setIsEditing(false);
  };

  const formatName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className={`threshold-card ${threshold.is_critical ? 'critical' : ''}`}>
      <div className="threshold-header">
        <h3>{formatName(threshold.name)}</h3>
        {threshold.is_critical && <span className="critical-badge">Critical</span>}
      </div>

      {isEditing ? (
        <div className="threshold-edit">
          {threshold.value_numeric !== null && (
            <div className="form-group">
              <label>Numeric Value:</label>
              <input
                type="number"
                step="0.01"
                value={valueNumeric}
                onChange={(e) => setValueNumeric(e.target.value)}
                className="threshold-input"
              />
            </div>
          )}
          {threshold.value_text !== null && (
            <div className="form-group">
              <label>Text Value:</label>
              <input
                type="text"
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                className="threshold-input"
              />
            </div>
          )}
          <div className="threshold-actions">
            <button onClick={handleSave} className="btn-save">💾 Save</button>
            <button onClick={handleCancel} className="btn-cancel">❌ Cancel</button>
          </div>
        </div>
      ) : (
        <div className="threshold-display">
          <div className="threshold-value">
            {threshold.value_numeric !== null && (
              <span className="value-numeric">{threshold.value_numeric}</span>
            )}
            {threshold.value_text !== null && (
              <span className="value-text">{threshold.value_text}</span>
            )}
          </div>
          <button onClick={() => setIsEditing(true)} className="btn-edit">
            ✏️ Edit
          </button>
        </div>
      )}

      {threshold.updated_at && (
        <div className="threshold-meta">
          Last updated: {new Date(threshold.updated_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;