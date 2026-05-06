import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { getScholarships } from '../services/firebase/scholarships';
import ScholarshipCard from '../components/scholarship/ScholarshipCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const FUNDING_TYPES = ['Full Funding', 'Partial Funding', 'Grant'];
const AFRICAN_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania',
  'Ethiopia', 'Rwanda', 'Senegal', "Côte d'Ivoire", 'Cameroon',
  'Zimbabwe', 'Zambia', 'Botswana', 'Namibia', 'Egypt', 'Morocco', 'Tunisia'
];
const HOST_COUNTRIES = [
  'UK', 'USA', 'Canada', 'Australia', 'Germany', 'France', 'China',
  'Netherlands', 'Sweden', 'Norway', 'Japan', 'South Korea', 'Worldwide'
];

export default function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fundingFilter, setFundingFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchScholarships = async () => {
    try {
      const filters = {};
      if (fundingFilter) filters.funding = fundingFilter;
      if (countryFilter) filters.country = countryFilter;
      if (search) filters.search = search;

      const result = await getScholarships(filters);
      const sorted = [...(result || [])].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      setScholarships(sorted);
    } catch (err) {
      console.error('Error fetching scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchScholarships();
  }, [fundingFilter, countryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchScholarships();
  };

  const clearFilters = () => {
    setFundingFilter('');
    setCountryFilter('');
    setSearch('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Scholarships for Africans</h1>
        <p className="text-gray-500 dark:text-gray-400">Discover fully funded and partial scholarships open to African students worldwide</p>
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
              placeholder="Search scholarships..."
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
              value={fundingFilter}
              onChange={e => setFundingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Funding Types</option>
              {FUNDING_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">🌍 All Locations</option>
              <optgroup label="Study in Africa">
                {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
              <optgroup label="Study Abroad">
                {HOST_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            </select>
            {(fundingFilter || countryFilter || search) && (
              <button onClick={clearFilters} className="px-3 py-2 text-sm text-red-500 hover:text-red-600 font-medium">
                Clear filters
              </button>
            )}
          </div>
        )}

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
      ) : scholarships.length === 0 ? (
        <EmptyState title="No scholarships found" message="Try adjusting your search or filters." />
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {scholarships.length} scholarship{scholarships.length !== 1 ? 's' : ''} found{countryFilter ? ` in ${countryFilter}` : ''}
          </p>
          <div className="space-y-4">
            {scholarships.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
          </div>
        </>
      )}
    </div>
  );
}
