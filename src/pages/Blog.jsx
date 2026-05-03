import { useEffect, useState } from 'react';
import { fetchBlogs } from '../services/mockData';
import BlogCard from '../components/blog/BlogCard';
import SearchBar from '../components/common/SearchBar';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function Blog() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBlogs().then(setData).finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Career & Education Blog</h1>
      <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." className="mb-6 max-w-xl" />
      
      {loading ? <LoadingSkeleton /> : 
       filtered.length === 0 ? <EmptyState title="No articles found" message="Try a different keyword." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(b => <BlogCard key={b.id} post={b} />)}
        </div>
      )}
    </div>
  );
}
