import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { FiBookmark, FiSend, FiBriefcase, FiAward, FiFileText, FiMapPin, FiClock, FiEye } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const { savedJobs, savedScholarships, applications } = useDashboard();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demo (replace with real data from context)
  const mockViews = 124;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name || 'User'}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Your career dashboard</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xl font-bold text-primary-600 dark:text-primary-400">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{savedJobs.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Saved Jobs</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{applications.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Applications</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{savedScholarships.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Scholarships</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{mockViews}</p>
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Saved Jobs Section */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Saved Jobs</h2>
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
                  {savedJobs.map(job => (
                    <div key={job.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-gray-900 dark:bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {job.company?.substring(0, 2).toUpperCase() || 'JD'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{job.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                <FiMapPin size={12} /> {job.location}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                {job.type}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                                <FiClock size={12} /> Due {job.deadline}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-primary-600 transition">
                          <FiBookmark size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Applications Section */}
            {applications.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Applications</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {applications.map(app => (
                    <div key={app.id} className="p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{app.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{app.org}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        app.status === 'Interview' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        app.status === 'Under review' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Opportunities</h2>
            {savedJobs.length === 0 && savedScholarships.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No saved items yet.
              </div>
            ) : (
              <>
                {savedJobs.map(job => (
                  <div key={job.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
                  </div>
                ))}
                {savedScholarships.map(sch => (
                  <div key={sch.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{sch.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{sch.org}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Applications</h2>
            {applications.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No applications yet.
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{app.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{app.org}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" defaultValue={user?.name} className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" defaultValue={user?.email} className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
