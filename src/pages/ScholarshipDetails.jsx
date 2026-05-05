import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiGlobe, FiCalendar, FiAward, FiBookmark, FiExternalLink } from 'react-icons/fi';
import { getScholarshipById } from '../services/firebase/scholarships';
import { useAuth } from '../context/AuthContext';

export default function ScholarshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getScholarshipById(id)
      .then(data => {
        setScholarship(data || null);
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

  if (!scholarship) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Scholarship Not Found</h2>
      <button onClick={() => navigate('/scholarships')} className="btn-primary">Browse Scholarships</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{scholarship.title}</h1>
              <p className="text-lg text-primary-600 font-medium mt-1">{scholarship.org}</p>
            </div>
            <button
              onClick={handleSave}
              className={`p-3 rounded-lg border self-start ${saved ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'} hover:opacity-80 transition`}
              title={user ? (saved ? 'Unsave' : 'Save Scholarship') : 'Login to save'}
            >
              <FiBookmark size={20} />
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Host Country</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2"><FiGlobe /> {scholarship.country}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Funding Type</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2"><FiAward /> {scholarship.type}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Deadline</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2"><FiCalendar /> {scholarship.deadline}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Overview</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{scholarship.description}</p>
          </div>

          {/* Apply Button */}
          {scholarship.applyLink ? (
            <a
              href={scholarship.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition text-lg mb-4"
            >
              <FiExternalLink /> Apply Now
            </a>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center text-gray-500 dark:text-gray-400 text-sm">
              Application link not available. Search for this scholarship directly.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
