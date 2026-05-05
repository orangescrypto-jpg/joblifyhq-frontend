import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import EmployerLayout from '../layouts/EmployerLayout';

// 🌐 Public Pages
import Home from '../pages/Home';
import Jobs from '../pages/Jobs';
import JobDetails from '../pages/JobDetails';
import Scholarships from '../pages/Scholarships';
import ScholarshipDetails from '../pages/ScholarshipDetails';
import Blog from '../pages/Blog';
import BlogDetails from '../pages/BlogDetails';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import Contact from '../pages/Contact';

// 🔐 Auth Pages
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';

// 🛡️ Protected Pages
import Dashboard from '../pages/Dashboard';
import Admin from '../pages/Admin';
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import EmployerPostJob from '../pages/employer/EmployerPostJob';
import EmployerListings from '../pages/employer/EmployerListings';
import EmployerApplications from '../pages/employer/EmployerApplications';

/**
 * Protected Route Guard
 */
const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user.role !== roleRequired) {
    // Smart redirect based on actual user role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'employer') return <Navigate to="/employer" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🌍 Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        <Route path="scholarships" element={<Scholarships />} />
        <Route path="scholarships/:id" element={<ScholarshipDetails />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:id" element={<BlogDetails />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsConditions />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* 🔑 Standalone Auth Pages */}
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="forgot-password" element={<ForgotPassword />} />

      {/* 🛡️ Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route 
          path="admin" 
          element={
            <ProtectedRoute roleRequired="admin">
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* 🏢 Employer Portal */}
      <Route element={
        <ProtectedRoute roleRequired="employer">
          <EmployerLayout />
        </ProtectedRoute>
      }>
        <Route path="employer" element={<EmployerDashboard />} />
        <Route path="employer/post-job" element={<EmployerPostJob />} />
        <Route path="employer/listings" element={<EmployerListings />} />
        <Route path="employer/applications" element={<EmployerApplications />} />
      </Route>

      {/* 🚫 Catch-All Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
