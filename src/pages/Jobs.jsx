import { useEffect, useState } from 'react';
import { getJobs } from '../services/firebase/jobs';
import JobCard from '../components/job/JobCard';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function Jobs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', type: '' });
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchJobs = async (isLoadMore = false) => {
    setLoading(true);
    try {
      const { jobs, lastDoc: newLastDoc, hasMore: more } = await getJobs(
        { ...filters, search },
        20,
        isLoadMore ? lastDoc : null
      );
      
      if (isLoadMore) {
        setData(prev => [...prev, ...jobs]);
      } else {
        setData(jobs);
      }
      setLastDoc(newLastDoc);
      setHasMore(more);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Refetch when filters/search change (debounce in production)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, search]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchJobs(true);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Jobs</h1>
      <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or company..." />
      <FilterPanel filters={filters} onChange={setFilters} />
      
      {loading && !lastDoc ? <LoadingSkeleton /> : 
       data.length === 0 ? <EmptyState title="No jobs found" message="Try adjusting your search or filters." /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(j => <JobCard key={j.id} job={j} />)}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button 
                onClick={handleLoadMore} 
                disabled={loading}
                className="btn-secondary px-8"
              >
                {loading ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
