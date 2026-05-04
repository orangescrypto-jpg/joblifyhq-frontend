import { useEffect, useState } from 'react';
import { getScholarships } from '../services/firebase/scholarships';
import ScholarshipCard from '../components/scholarship/ScholarshipCard';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function Scholarships() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', funding: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const results = await getScholarships({ ...filters, search });
        setData(results);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, search]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Scholarship Opportunities</h1>
      <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search scholarships..." />
      <FilterPanel filters={filters} onChange={setFilters} />
      
      {loading ? <LoadingSkeleton /> : 
       data.length === 0 ? <EmptyState title="No scholarships found" message="Check back later for new opportunities." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
        </div>
      )}
    </div>
  );
}
