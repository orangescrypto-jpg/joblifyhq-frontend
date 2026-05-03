import { useEffect, useState } from 'react';
import { fetchScholarships } from '../services/mockData';
import ScholarshipCard from '../components/scholarship/ScholarshipCard';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function Scholarships() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', type: '' });

  useEffect(() => {
    fetchScholarships().then(setData).finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                        s.org.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Scholarship Opportunities</h1>
      <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search scholarships..." />
      <FilterPanel filters={filters} onChange={setFilters} />
      
      {loading ? <LoadingSkeleton /> : 
       filtered.length === 0 ? <EmptyState title="No scholarships found" message="Check back later for new opportunities." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
        </div>
      )}
    </div>
  );
}
