import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRooms from './pages/admin/ManageRooms';
import ManageStudents from './pages/admin/ManageStudents';
import ManageWardens from './pages/admin/ManageWardens';

// Warden
import WardenDashboard from './pages/warden/WardenDashboard';

// Student
import StudentDashboard from './pages/student/StudentDashboard';

// Shared
import Complaints from './pages/shared/Complaints';
import Fees from './pages/shared/Fees';
import MealSchedule from './pages/shared/MealSchedule';
import Notifications from './pages/shared/Notifications';
import Profile from './pages/shared/Profile';

const RedirectHome = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<RedirectHome />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/rooms" element={<ManageRooms />} />
                <Route path="/admin/students" element={<ManageStudents />} />
                <Route path="/admin/wardens" element={<ManageWardens />} />
                <Route path="/admin/fees" element={<Fees />} />
                <Route path="/admin/complaints" element={<Complaints />} />
                <Route path="/admin/meals" element={<MealSchedule />} />
                <Route path="/admin/notifications" element={<Notifications />} />
                <Route path="/admin/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Warden Routes */}
            <Route element={<ProtectedRoute allowedRoles={['warden']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/warden" element={<WardenDashboard />} />
                <Route path="/warden/rooms" element={<ManageRooms />} />
                <Route path="/warden/students" element={<ManageStudents />} />
                <Route path="/warden/complaints" element={<Complaints />} />
                <Route path="/warden/meals" element={<MealSchedule />} />
                <Route path="/warden/notifications" element={<Notifications />} />
                <Route path="/warden/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/room" element={<StudentDashboard />} />
                <Route path="/student/fees" element={<Fees />} />
                <Route path="/student/complaints" element={<Complaints />} />
                <Route path="/student/meals" element={<MealSchedule />} />
                <Route path="/student/notifications" element={<Notifications />} />
                <Route path="/student/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<RedirectHome />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
