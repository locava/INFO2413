import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import DashboardPage from '../features/student/DashboardPage';
import LogSessionPage from '../features/student/LogSessionPage';
import ReportsPage from '../features/student/ReportsPage';
import StudentLayout from '../components/layout/StudentLayout';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/student" element={
        <PrivateRoute>
          <StudentLayout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="log-session" element={<LogSessionPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;

