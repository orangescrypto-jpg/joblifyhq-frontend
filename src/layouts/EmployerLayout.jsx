import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiList, FiUsers, FiLogOut, FiPlus } from 'react-icons/fi';

export default function EmployerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { path: '/employer', label: 'Overview', icon: <FiBriefcase /> },
    { path: '/employer/post-job', label: 'Post a Job', icon: <FiPlus /> },
    { path: '/employer/listings', label: 'My Listings', icon: <FiList /> },
    { path: '/employer/applications', label: 'Applications', icon: <FiUsers /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Employer Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-primary-600">Joblify<span className="text-gray-900 dark:text-white">HQ</span></Link>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">Employer Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{user?.company || user?.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 transition">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-64 hidden lg:block">
          <nav className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
            <ul className="space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Employer Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Quick Stats</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Jobs</span>
                  <span className="font-semibold text-gray-900 dark:text-white">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Applications</span>
                  <span className="font-semibold text-gray-900 dark:text-white">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Promoted</span>
                  <span className="font-semibold text-primary-600">1</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
