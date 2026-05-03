import { useEffect, useState } from 'react';
import { fetchJobs } from '../services/mockData';
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

  useEffect(() => {
    fetchJobs().then(setData).finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                        job.company.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filters.category || job.category === filters.category;
    const matchType = !filters.type || job.type === filters.type;
    return matchSearch && matchCategory && matchType;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Jobs</h1>
      <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or company..." />
      <FilterPanel filters={filters} onChange={setFilters} />
      
      {loading ? <LoadingSkeleton /> : 
       filtered.length === 0 ? <EmptyState title="No jobs found" message="Try adjusting your search or filters." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(j => <JobCard key={j.id} job={j} />)}
        </div>
      )}
    </div>
  );
}
