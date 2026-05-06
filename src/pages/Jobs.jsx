import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiMapPin, FiFilter, FiX } from 'react-icons/fi';
import { getJobs } from '../services/firebase/jobs';
import JobCard from '../components/job/JobCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Entry-level', 'Graduate Trainee', 'NYSC', 'Volunteer'];
const AFRICAN_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania',
  'Ethiopia', 'Rwanda', 'Senegal', "Côte d'Ivoire", 'Cameroon',
  'Zimbabwe', 'Zambia', 'Botswana', 'Namibia', 'Egypt', 'Morocco', 'Tunisia'
];

function isWithin7Days(createdAt) {
  if (!createdAt) return false;
  const posted = createdAt?.seconds
    ? new Date(createdAt.seconds * 1000)
    : new Date(createdAt);
  return (Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24) <= 7;
}

export default function Jobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [countryFilter, setCountryFilter] = useState(searchParams.get('country') || '');
  const [activeHiringOnly, setActiveHiringOnly] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = async (reset = false) => {
    try {
      const filters = {};
      if (typeFilter) filters.type = typeFilter;
      if (countryFilter) filters.country = countryFilter;
      if (search) filters.search = search;

      const result = await getJobs(filters, 20, reset ? null : lastDoc);
      let fetched = result.jobs || [];

      // Active hiring filter applied client-side
      if (activeHiringOnly) {
        fetched = fetched.filter(j => isWithin7Days(j.createdAt));
      }

      // Featured jobs float to top
      fetched = [...fetched].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

      if (reset) setJobs(fetched);
      else setJobs(prev => [...prev, ...fetched]);

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchJobs(true);
  }, [typeFilter, countryFilter, activeHiringOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchJobs(true);
  };

  const clearFilters = () => {
    setTypeFilter('');
    setCountryFilter('');
    setSearch('');
    setActiveHiringOnly(false);
  };

  const hasActiveFilters = typeFilter || countryFilter || search || activeHiringOnly;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Jobs Across Africa</h1>
        <p className="text-gray-500 dark:text-gray-400">Find opportunities in Nigeria, Ghana, Kenya, South Africa and more</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-3 mb-3">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search job title or keyword..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition">
            Search
          </button>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <FiFilter size={16} /> Filters
          </button>
        </form>

        {/* Active Hiring Quick Toggle */}
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => setActiveHiringOnly(!activeHiringOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
              activeHiringOnly
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-400 hover:text-green-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeHiringOnly ? 'bg-white animate-pulse' : 'bg-green-500'}`} />
            Actively Hiring (last 7 days)
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">🌍 All Countries</option>
              {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Types</option>
              <optgroup label="Professional">
                {['Full-time', 'Part-time', 'Remote', 'Contract'].map(t => <option key={t} value={t}>{t}</option>)}
              </optgroup>
              <optgroup label="Students & Graduates">
                {['Internship', 'Entry-level', 'Graduate Trainee', 'NYSC', 'Volunteer'].map(t => <option key={t} value={t}>{t}</option>)}
              </optgroup>
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-600 font-medium">
                <FiX size={14} /> Clear all
              </button>
            )}
          </div>
        )}

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeHiringOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
                🟢 Actively Hiring
                <button onClick={() => setActiveHiringOnly(false)} className="ml-1 hover:text-red-500">✕</button>
              </span>
            )}
            {countryFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                🌍 {countryFilter}
                <button onClick={() => setCountryFilter('')} className="ml-1 hover:text-red-500">✕</button>
              </span>
            )}
            {typeFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                {typeFilter}
                <button onClick={() => setTypeFilter('')} className="ml-1 hover:text-red-500">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          message={activeHiringOnly ? "No actively hiring jobs right now. Try removing the filter." : "Try adjusting your search or filters."}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            {activeHiringOnly ? ' — actively hiring' : ''}
            {countryFilter ? ` in ${countryFilter}` : ' across Africa'}
          </p>
          <div className="space-y-4">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button onClick={() => { setLoadingMore(true); fetchJobs(false); }}
                disabled={loadingMore}
                className="btn-secondary px-8 py-3">
                {loadingMore ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
