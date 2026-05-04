import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

// Pages
import Home from '../pages/Home';
import Jobs from '../pages/Jobs';
import JobDetails from '../pages/JobDetails';
import Scholarships from '../pages/Scholarships';
import ScholarshipDetails from '../pages/ScholarshipDetails';
import Blog from '../pages/Blog';
import BlogDetails from '../pages/BlogDetails';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Admin from '../pages/Admin';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import Contact from '../pages/Contact';

// Employer Pages
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import EmployerPostJob from '../pages/employer/EmployerPostJob';
import EmployerListings from '../pages/employer/EmployerListings';
import EmployerApplications from '../pages/employer/EmployerApplications';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, employerOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (employerOnly && user.role !== 'employer') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        <Route path="scholarships" element={<Scholarships />} />
        <Route path="scholarships/:id" element={<ScholarshipDetails />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:id" element={<BlogDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsConditions />} />
        <Route path="contact" element={<Contact />} />
        
        {/* User Dashboard */}
        <Route path="dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        {/* Admin Dashboard */}
        <Route path="admin" element={
          <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
        } />
        
        {/* Employer Portal */}
        <Route path="employer" element={
          <ProtectedRoute employerOnly><EmployerDashboard /></ProtectedRoute>
        } />
        <Route path="employer/post-job" element={
          <ProtectedRoute employerOnly><EmployerPostJob /></ProtectedRoute>
        } />
        <Route path="employer/listings" element={
          <ProtectedRoute employerOnly><EmployerListings /></ProtectedRoute>
        } />
        <Route path="employer/applications" element={
          <ProtectedRoute employerOnly><EmployerApplications /></ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
