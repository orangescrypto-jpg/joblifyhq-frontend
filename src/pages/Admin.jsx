// Add this to your existing Admin.jsx imports
import { getBlogs, createBlog, updateBlog, deleteBlog } from '../services/firebase/blog';

// In the component, add blog state
const [activeTab, setActiveTab] = useState('job'); // 'job', 'scholarship', 'blog'
const [data, setData] = useState({ job: [], scholarship: [], blog: [] });

// Update the useEffect to fetch blogs
useEffect(() => {
  const fetchData = async () => {
    const [j, s, b] = await Promise.all([
      fetchJobs(),
      fetchScholarships(),
      getBlogs()
    ]);
    setData({ job: j, scholarship: s, blog: b });
    setLoading(false);
  };
  fetchData();
}, []);

// Update handleSave to handle blogs
const handleSave = (item) => {
  const key = item.type; // 'job', 'scholarship', or 'blog'
  setData(prev => {
    const arr = prev[key] || [];
    const exists = arr.find(i => i.id === item.id);
    return {
      ...prev,
      [key]: exists ? arr.map(i => i.id === item.id ? item : i) : [...arr, item]
    };
  });
};

// Add blog-specific fields to AdminFormModal
// In the fields object, add:
const fields = {
  job: [ /* existing job fields */ ],
  scholarship: [ /* existing scholarship fields */ ],
  blog: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'author', label: 'Author', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'image', label: 'Featured Image URL', type: 'url' },
    { key: 'excerpt', label: 'Short Excerpt', type: 'textarea' },
    { key: 'content', label: 'Content (HTML supported)', type: 'textarea', rows: 12 },
  ]
};

// Update tabs to include blog
const tabs = [
  { id: 'job', label: 'Jobs', icon: <FiBriefcase /> },
  { id: 'scholarship', label: 'Scholarships', icon: <FiAward /> },
  { id: 'blog', label: 'Blog', icon: <FiBookOpen /> },
];

// Update renderTable for blog
const renderTable = (type) => {
  const items = data[type] || [];
  let headers = [], rows = [];
  
  if (type === 'blog') {
    headers = ['Title', 'Author', 'Category', 'Date'];
    rows = items.map(b => ({ 
      id: b.id, 
      cells: [b.title, b.author, b.category, new Date(b.createdAt?.seconds * 1000).toLocaleDateString()] 
    }));
  }
  // ... existing job and scholarship code
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold capitalize">{type === 'blog' ? 'Blog Posts' : type + 's'} Management</h2>
        <button onClick={() => setFormModal({ open: true, type, item: null })} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add New
        </button>
      </div>
      {loading ? <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div> : 
        <AdminTable 
          headers={headers} 
          rows={rows} 
          onEdit={(id) => setFormModal({ open: true, type, item: items.find(i => i.id === id) })}
          onDelete={(id) => setDeleteModal({ open: true, id, type })}
        />
      }
    </div>
  );
};
