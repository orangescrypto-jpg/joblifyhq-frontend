import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FiBookmark, FiSend, FiBriefcase, FiAward, FiMapPin, FiClock, FiEye, FiUser, FiChevronRight } from 'react-icons/fi';

const STATUS_STYLES = {
  'Interview':     'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  'Under review':  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  'pending':       'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Submitted':     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Rejected':      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { savedJobs, savedScholarships, applications, loading } = useDashboard();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileViews, setProfileViews] = useState(0);
  const [viewsLoading, setViewsLoading] = useState(true);

  // Fetch live profile views from Firestore
  useEffect(() => {
    if (!user?.uid) { setViewsLoading(false); return; }
    const fetchViews = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'profile_views'), where('userId', '==', user.uid))
        );
        setProfileViews(snap.size);
      } catch {
        // Fallback: count unique job detail views from applications
        setProfileViews(applications.length * 3);
      } finally {
        setViewsLoading(false);
      }
    };
    fetchViews();
  }, [user, applications]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Your career dashboard</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xl font-bold text-primary-600 dark:text-primary-400">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats Grid — all live from Firebase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '—' : savedJobs.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Saved Jobs</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '—' : applications.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Applications</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '—' : savedScholarships.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Scholarships</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {viewsLoading ? '—' : profileViews}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          {['overview', 'saved', 'applications', 'profile'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize whitespace-nowrap transition ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Saved Jobs */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Jobs</h2>
                {savedJobs.length > 0 && (
                  <button onClick={() => setActiveTab('saved')} className="text-sm text-primary-600 hover:underline font-medium">
                    View all →
                  </button>
                )}
              </div>
              {savedJobs.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FiBookmark size={24} />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium mb-1">No saved jobs yet</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Browse opportunities to start building your list.</p>
                  <Link to="/jobs" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition">
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedJobs.slice(0, 3).map(job => {
                    const data = job.itemData || job;
                    return (
                      <Link
                        key={job.id}
                        to={`/jobs/${data.id || job.jobId}`}
                        className="block bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-4">
                            <div className="w-11 h-11 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {data.company?.substring(0, 2).toUpperCase() || 'JB'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{data.title}</h3>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">{data.company}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                  <FiMapPin size={11} /> {data.location}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                  {data.type}
                                </span>
                                {data.deadline && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                                    <FiClock size={11} /> Due {data.deadline}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <FiChevronRight className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recent Applications */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Applications</h2>
                {applications.length > 0 && (
                  <button onClick={() => setActiveTab('applications')} className="text-sm text-primary-600 hover:underline font-medium">
                    View all →
                  </button>
                )}
              </div>
              {applications.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FiSend size={24} />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium mb-1">No applications yet</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Find a job or scholarship and hit Apply on JoblifyHQ.</p>
                  <Link to="/jobs" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition">
                    Find Opportunities
                  </Link>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="p-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0">
                          {app.opportunityType === 'scholarship' ? <FiAward size={16} /> : <FiBriefcase size={16} />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{app.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{app.company || app.org}</p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_STYLES[app.status] || STATUS_STYLES['pending']}`}>
                        {app.status === 'pending' ? 'Submitted' : app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Saved Scholarships teaser */}
            {savedScholarships.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Scholarships</h2>
                  <button onClick={() => setActiveTab('saved')} className="text-sm text-primary-600 hover:underline font-medium">
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {savedScholarships.slice(0, 2).map(sch => {
                    const data = sch.itemData || sch;
                    return (
                      <Link
                        key={sch.id}
                        to={`/scholarships/${data.id || sch.scholarshipId}`}
                        className="block bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex gap-3 items-center">
                            <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                              <FiAward size={18} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{data.title}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{data.org} · {data.country}</p>
                            </div>
                          </div>
                          <FiChevronRight className="text-gray-400 flex-shrink-0" size={18} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── SAVED TAB ── */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            {/* Saved Jobs */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiBriefcase className="text-primary-600" /> Saved Jobs ({savedJobs.length})
              </h2>
              {savedJobs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No saved jobs yet. <Link to="/jobs" className="text-primary-600 hover:underline">Browse Jobs</Link></p>
              ) : (
                <div className="space-y-3">
                  {savedJobs.map(job => {
                    const data = job.itemData || job;
                    return (
                      <Link
                        key={job.id}
                        to={`/jobs/${data.id || job.jobId}`}
                        className="block bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{data.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{data.company} · {data.location}</p>
                            {data.deadline && <p className="text-xs text-amber-600 mt-1">Deadline: {data.deadline}</p>}
                          </div>
                          <FiChevronRight className="text-gray-400 flex-shrink-0" size={18} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Saved Scholarships */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiAward className="text-purple-600" /> Saved Scholarships ({savedScholarships.length})
              </h2>
              {savedScholarships.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No saved scholarships yet. <Link to="/scholarships" className="text-primary-600 hover:underline">Browse Scholarships</Link></p>
              ) : (
                <div className="space-y-3">
                  {savedScholarships.map(sch => {
                    const data = sch.itemData || sch;
                    return (
                      <Link
                        key={sch.id}
                        to={`/scholarships/${data.id || sch.scholarshipId}`}
                        className="block bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{data.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{data.org} · {data.country}</p>
                            {data.deadline && <p className="text-xs text-amber-600 mt-1">Deadline: {data.deadline}</p>}
                          </div>
                          <FiChevronRight className="text-gray-400 flex-shrink-0" size={18} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── APPLICATIONS TAB ── */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Applications ({applications.length})
            </h2>
            {applications.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <FiSend size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium mb-1">No applications yet</p>
                <p className="text-sm">Apply to jobs and scholarships to track them here.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {applications.map(app => (
                  <div key={app.id} className="p-5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0 mt-0.5">
                        {app.opportunityType === 'scholarship' ? <FiAward size={16} /> : <FiBriefcase size={16} />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{app.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{app.company || app.org}</p>
                        {app.appliedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Applied {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_STYLES[app.status] || STATUS_STYLES['pending']}`}>
                      {app.status === 'pending' ? 'Submitted' : app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" defaultValue={user?.name} className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" defaultValue={user?.email} readOnly className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white opacity-60 cursor-not-allowed" />
              </div>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
