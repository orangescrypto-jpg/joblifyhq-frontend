import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiTrendingUp, FiUsers, FiClock } from 'react-icons/fi';

export default function EmployerDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Views', value: '1,248', change: '+12%', icon: <FiTrendingUp />, color: 'text-green-600' },
    { label: 'Applications', value: '24', change: '+5 this week', icon: <FiUsers />, color: 'text-blue-600' },
    { label: 'Active Listings', value: '3', change: '1 expiring soon', icon: <FiClock />, color: 'text-amber-600' },
  ];

  const recentApps = [
    { id: 1, name: 'Sarah Johnson', role: 'Frontend Developer', applied: '2h ago', status: 'New' },
    { id: 2, name: 'Michael Chen', role: 'Data Analyst', applied: '5h ago', status: 'Viewed' },
    { id: 3, name: 'Emma Williams', role: 'UX Designer', applied: '1d ago', status: 'Contacted' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.company || user?.name} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your job postings and review applicants.</p>
        </div>
        <Link to="/employer/post-job" className="btn-primary flex items-center gap-2 w-fit">
          <FiPlus /> Post a New Job
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
          <Link to="/employer/applications" className="text-sm text-primary-600 hover:underline">View All →</Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {recentApps.map(app => (
            <div key={app.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{app.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Applied for: {app.role}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">{app.applied}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  app.status === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  app.status === 'Viewed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {app.status}
                </span>
                <Link to={`/employer/applications/${app.id}`} className="text-sm text-primary-600 hover:underline">Review</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promote CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">🚀 Boost Your Listing</h3>
            <p className="text-primary-100 text-sm mt-1">Get 3x more applications by featuring your job on the homepage.</p>
          </div>
          <Link to="/employer/listings" className="bg-white text-primary-600 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition w-fit">
            Promote Now
          </Link>
        </div>
      </div>
    </div>
  );
}
