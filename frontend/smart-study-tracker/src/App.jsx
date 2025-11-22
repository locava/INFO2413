import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import StudentLayout from './components/layout/StudentLayout';
import InstructorLayout from './components/layout/InstructorLayout';
import AdminLayout from './components/layout/AdminLayout';

// Auth Pages
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

// Student Pages
import DashboardPage from './features/student/DashboardPage';
import LogSessionPage from './features/student/LogSessionPage';
import ReportsPage from './features/student/ReportsPage';

// Instructor Pages
import InstructorDashboard from './features/instructor/InstructorDashboard';

// Admin Pages
import AdminDashboard from './features/admin/AdminDashboard';

// Shared Pages
import ProfilePage from './features/profile/ProfilePage';

// --- Protected Route Component ---
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'Instructor') return <Navigate to="/instructor/dashboard" replace />;
    if (user.role === 'Administrator') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ---------------- STUDENT ROUTES ---------------- */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['Student']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="log-session" element={<LogSessionPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* ---------------- INSTRUCTOR ROUTES ---------------- */}
        <Route path="/instructor" element={
          <ProtectedRoute allowedRoles={['Instructor']}>
            <InstructorLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Administrator']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;