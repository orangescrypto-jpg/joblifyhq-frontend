import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-primary-600">JoblifyHQ</Link>
          <div className="hidden md:flex space-x-6 text-gray-600">
            <Link to="/jobs" className="hover:text-primary-600 transition">Jobs</Link>
            <Link to="/scholarships" className="hover:text-primary-600 transition">Scholarships</Link>
            <Link to="/blog" className="hover:text-primary-600 transition">Blog</Link>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-secondary text-sm">Dashboard</Link>
                {user.role === 'admin' && <Link to="/admin" className="btn-primary text-sm">Admin</Link>}
                <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Login</Link>
                <Link to="/signup" className="btn-primary text-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
