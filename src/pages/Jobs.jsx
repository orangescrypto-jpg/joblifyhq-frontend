import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiBookmark, FiExternalLink, FiCalendar } from 'react-icons/fi';
import { getJobById } from '../services/firebase/jobs';
import { useAuth } from '../context/AuthContext';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getJobById(id)
      .then(data => {
        setJob(data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSaved(prev => !prev);
  };

  if (loading) return (
    <div className="animate-pulse space-y-4 p-10 max-w-4xl mx-auto">
      <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );

  if (!job) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Job Not Found</h2>
      <button onClick={() => navigate('/jobs')} className="btn-primary">Browse Jobs</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <p className="text-lg text-primary-600 font-medium mt-1">{job.company}</p>
            </div>
            <button
              onClick={handleSave}
              className={`p-3 rounded-lg border self-start ${saved ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'} hover:opacity-80 transition`}
              title={user ? (saved ? 'Unsave Job' : 'Save Job') : 'Login to save'}
            >
              <FiBookmark size={20} />
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Location</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center justify-center gap-1"><FiMapPin size={14} /> {job.location}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Type</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center justify-center gap-1"><FiClock size={14} /> {job.type}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Salary</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center justify-center gap-1"><FiDollarSign size={14} /> {job.salary || 'N/A'}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Deadline</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center justify-center gap-1"><FiCalendar size={14} /> {job.deadline}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About the Role</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Apply Button */}
          {job.applyLink ? (
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition text-lg"
            >
              <FiExternalLink /> Apply Now
            </a>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center text-gray-500 dark:text-gray-400 text-sm">
              Application link not available. Contact the company directly.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
