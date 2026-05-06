import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiMapPin, FiFilter } from 'react-icons/fi';
import { getJobs } from '../services/firebase/jobs';
import JobCard from '../components/job/JobCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
const AFRICAN_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania',
  'Ethiopia', 'Rwanda', 'Senegal', "Côte d'Ivoire", 'Cameroon',
  'Zimbabwe', 'Zambia', 'Botswana', 'Namibia', 'Egypt', 'Morocco', 'Tunisia'
];

export default function Jobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState(searchParams.get('country') || '');
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
      const sorted = [...(result.jobs || [])].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

      if (reset) {
        setJobs(sorted);
      } else {
        setJobs(prev => [...prev, ...sorted]);
      }
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
  }, [typeFilter, countryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchJobs(true);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchJobs(false);
  };

  const clearFilters = () => {
    setTypeFilter('');
    setCountryFilter('');
    setSearch('');
  };

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
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <FiFilter size={16} /> Filters
          </button>
        </form>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">🌍 All Countries</option>
              {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="City or region..."
                className="pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {(typeFilter || countryFilter || search) && (
              <button onClick={clearFilters} className="px-3 py-2 text-sm text-red-500 hover:text-red-600 font-medium">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Active country filter pill */}
        {countryFilter && (
          <div className="flex gap-2 mt-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
              🌍 {countryFilter}
              <button onClick={() => setCountryFilter('')} className="ml-1 hover:text-red-500">✕</button>
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs found" message="Try adjusting your search or filters." />
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found{countryFilter ? ` in ${countryFilter}` : ' across Africa'}</p>
          <div className="space-y-4">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button onClick={handleLoadMore} disabled={loadingMore} className="btn-secondary px-8 py-3">
                {loadingMore ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
