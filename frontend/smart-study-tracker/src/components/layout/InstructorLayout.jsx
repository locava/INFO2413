import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './StudentLayout.css';

function InstructorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="student-layout">
      {/* ✅ FIXED: Added layout-container */}
      <div className="layout-container">
        
        <aside className="sidebar">
          <div className="sidebar-header" style={{ padding: '1.5rem 1rem 0.5rem 1rem' }}>
            <div className="logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">Instructor</span>
            </div>
          </div>

          {/* ✅ FIXED: Class name is 'nav' */}
          <nav className="nav">
            <NavLink
              to="/instructor/dashboard"
              /* ✅ FIXED: Class name is 'nav-link' */
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </span>
              <span className="nav-text">Dashboard</span>
            </NavLink>
          </nav>

          <div style={{ marginTop: 'auto', paddingBottom: '1rem' }}>
            <div className="user-info" style={{ padding: '0 1rem 1rem', display: 'block' }}>
              <div className="user-name" style={{ color: 'var(--gray-900)' }}>{user?.name || 'Instructor'}</div>
              <div className="user-role">{user?.role || 'Faculty'}</div>
            </div>

            {/* ✅ FIXED: Class name is 'logout-button' */}
            <button onClick={handleLogout} className="logout-button">
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default InstructorLayout;