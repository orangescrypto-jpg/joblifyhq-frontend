import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { FiBookmark, FiSend, FiBriefcase, FiAward, FiFileText } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const { savedJobs, savedScholarships, applications } = useDashboard();
  const [activeTab, setActiveTab] = useState('saved-jobs');

  const tabs = [
    { id: 'saved-jobs', label: 'Saved Jobs', icon: <FiBriefcase />, data: savedJobs },
    { id: 'saved-scholarships', label: 'Saved Scholarships', icon: <FiAward />, data: savedScholarships },
    { id: 'applications', label: 'Applications', icon: <FiFileText />, data: applications },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name || 'User'} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your saved opportunities and application status.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary-600">{savedJobs.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Saved Jobs</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{savedScholarships.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Scholarships</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">{applications.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Applied</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id 
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50 dark:bg-primary-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 min-h-[300px]">
          {currentTab.data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-gray-400">
                {currentTab.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No {currentTab.label.toLowerCase()} yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">Browse opportunities to start building your list.</p>
              <Link 
                to={currentTab.id.includes('job') ? '/jobs' : currentTab.id.includes('scholarship') ? '/scholarships' : '/jobs'} 
                className="btn-primary inline-flex"
              >
                Browse {currentTab.id.includes('job') ? 'Jobs' : 'Scholarships'}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {currentTab.data.map(item => (
                <div key={item.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.company || item.org}</p>
                  </div>
                  <div className="text-right">
                    {item.status ? (
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                        item.status === 'Submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Deadline: {item.deadline}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
