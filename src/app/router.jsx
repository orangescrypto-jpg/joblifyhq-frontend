import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from '../components/common/ErrorBoundary';
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
import Students from '../pages/Students';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import Contact from '../pages/Contact';
import EmployerProfile from '../pages/EmployerProfile';
import GlobalRemoteJobs from '../pages/GlobalRemoteJobs';
import Premium from '../pages/Premium';
import SalaryPortal from '../pages/SalaryPortal';

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
import EmployerPremium from '../pages/employer/EmployerPremium';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roleRequired && user.role !== roleRequired) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'employer') return <Navigate to="/employer" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function AppRoutes() {
  const location = useLocation();
  return (
    // key={location.pathname} resets the boundary on every navigation
    // so a broken page doesn't lock the user out of the whole app.
    <ErrorBoundary key={location.pathname}>
    <Routes>
      {/* 🌍 Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        <Route path="remote-jobs" element={<GlobalRemoteJobs />} />
        <Route path="employers/:company" element={<EmployerProfile />} />
        <Route path="scholarships" element={<Scholarships />} />
        <Route path="scholarships/:id" element={<ScholarshipDetails />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:id" element={<BlogDetails />} />
        <Route path="students" element={<Students />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsConditions />} />
        <Route path="contact" element={<Contact />} />
        <Route path="premium" element={<Premium />} />
        <Route path="salaries" element={<SalaryPortal />} />
      </Route>

      {/* 🔑 Auth Pages */}
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="forgot-password" element={<ForgotPassword />} />

      {/* 🛡️ Dashboard */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      {/* 🔒 Admin */}
      <Route
        path="admin"
        element={
          <ProtectedRoute roleRequired="admin">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Admin />} />
      </Route>

      {/* 🏢 Employer Portal */}
      <Route
        element={
          <ProtectedRoute roleRequired="employer">
            <EmployerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="employer" element={<EmployerDashboard />} />
        <Route path="employer/post-job" element={<EmployerPostJob />} />
        <Route path="employer/listings" element={<EmployerListings />} />
        <Route path="employer/applications" element={<EmployerApplications />} />
        <Route path="employer/premium" element={<EmployerPremium />} />
      </Route>

      {/* 🚫 Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}
