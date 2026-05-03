import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const NavLinks = () => (
    <>
      <Link to="/jobs" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg md:hover:bg-transparent transition">Jobs</Link>
      <Link to="/scholarships" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg md:hover:bg-transparent transition">Scholarships</Link>
      <Link to="/blog" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg md:hover:bg-transparent transition">Blog</Link>
    </>
  );

  const AuthButtons = () => (
    user ? (
      <>
        <Link to="/dashboard" className="btn-secondary text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">Dashboard</Link>
        {user.role === 'admin' && <Link to="/admin" className="btn-primary text-sm">Admin</Link>}
        <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">Logout</button>
      </>
    ) : (
      <>
        <Link to="/login" className="btn-secondary text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">Login</Link>
        <Link to="/signup" className="btn-primary text-sm">Sign Up</Link>
      </>
    )
  );

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">JoblifyHQ</Link>
          
          <div className="hidden md:flex items-center space-x-2">
            <NavLinks />
            <DarkModeToggle />
            <div className="flex items-center space-x-3 ml-4 border-l border-gray-200 dark:border-gray-700 pl-4">
              <AuthButtons />
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <DarkModeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600 dark:text-gray-300">
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-4 px-4 transition-all">
          <div className="pt-2 space-y-1">
            <NavLinks />
            <div className="pt-4 space-y-3 flex flex-col">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
