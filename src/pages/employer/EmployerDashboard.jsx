import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEmployerJobs } from '../../services/firebase/jobs';
import { getEmployerScholarships } from '../../services/firebase/scholarships';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiPlus, FiTrendingUp, FiUsers, FiClock } from 'react-icons/fi';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalViews: 0,
    totalApplications: 0,
    activeListings: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashboardData = async () => {
      try {
        const jobs = await getEmployerJobs(user.uid);
        const scholarships = await getEmployerScholarships(user.uid);

        const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0) +
                          scholarships.reduce((sum, sch) => sum + (sch.views || 0), 0);
        const totalApplications = jobs.reduce((sum, job) => sum + (job.applications || 0), 0) +
                                 scholarships.reduce((sum, sch) => sum + (sch.applications || 0), 0);

        setStats({
          totalViews,
          totalApplications,
          activeListings: jobs.length + scholarships.length
        });

        // Only query applications if there are listings
        const allIds = [...jobs.map(j => j.id), ...scholarships.map(s => s.id)];
        if (allIds.length === 0) {
          setRecentApps([]);
          return;
        }

        // Firestore 'in' query supports max 10 items
        const appsQuery = query(
          collection(db, 'applications'),
          where('opportunityId', 'in', allIds.slice(0, 10))
        );
        const appsSnap = await getDocs(appsQuery);
        const appsData = appsSnap.docs.slice(0, 3).map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setRecentApps(appsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.uid]);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

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
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalViews}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
              <FiTrendingUp />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalApplications}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <FiUsers />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeListings}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
              <FiClock />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
          <Link to="/employer/applications" className="text-sm text-primary-600 hover:underline">View All →</Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {recentApps.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No applications yet. Post a job to start receiving applications!
            </div>
          ) : (
            recentApps.map(app => (
              <div key={app.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{app.userName || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Applied for: {app.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">
                    {app.appliedAt?.toDate().toLocaleDateString() || 'Recently'}
                  </span>
                  <Link to={`/employer/applications/${app.id}`} className="text-sm text-primary-600 hover:underline">Review</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Promote CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">🚀 Boost Your Listing</h3>
            <p className="text-primary-100 text-sm mt-1">Get 3x more applications by featuring your job on the homepage for just $5.</p>
          </div>
          <Link to="/employer/listings" className="bg-white text-primary-600 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition w-fit">
            Promote Now
          </Link>
        </div>
      </div>
    </div>
  );
}
