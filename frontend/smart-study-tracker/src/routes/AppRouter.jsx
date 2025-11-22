import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import DashboardPage from '../features/student/DashboardPage';
import LogSessionPage from '../features/student/LogSessionPage';
import ReportsPage from '../features/student/ReportsPage';
import InstructorDashboard from '../features/instructor/InstructorDashboard';
import AdminDashboard from '../features/admin/AdminDashboard';
import StudentLayout from '../components/layout/StudentLayout';
import InstructorLayout from '../components/layout/InstructorLayout';
import AdminLayout from '../components/layout/AdminLayout';

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'Student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === 'Instructor') {
      return <Navigate to="/instructor/dashboard" replace />;
    } else if (user.role === 'Administrator') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Routes */}
      <Route path="/student" element={
        <PrivateRoute allowedRoles={['Student']}>
          <StudentLayout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="log-session" element={<LogSessionPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* Instructor Routes */}
      <Route path="/instructor" element={
        <PrivateRoute allowedRoles={['Instructor']}>
          <InstructorLayout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<InstructorDashboard />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['Administrator']}>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;

