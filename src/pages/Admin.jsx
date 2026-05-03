import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchJobs, fetchScholarships, fetchBlogs } from '../services/mockData';
import AdminTable from '../components/admin/AdminTable';
import AdminFormModal from '../components/admin/AdminFormModal';
import DeleteModal from '../components/common/DeleteModal';
import { FiBriefcase, FiAward, FiBookOpen, FiUsers, FiPlus } from 'react-icons/fi';

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('job');
  const [data, setData] = useState({ job: [], scholarship: [], blog: [] });
  const [loading, setLoading] = useState(true);
  
  const [formModal, setFormModal] = useState({ open: false, type: '', item: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: '', type: '' });

  useEffect(() => {
    Promise.all([fetchJobs(), fetchScholarships(), fetchBlogs()])
      .then(([j, s, b]) => setData({ job: j, scholarship: s, blog: b }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (item) => {
    const key = item.type;
    setData(prev => {
      const arr = prev[key] || [];
      const exists = arr.find(i => i.id === item.id);
      return {
        ...prev,
        [key]: exists ? arr.map(i => i.id === item.id ? item : i) : [...arr, item]
      };
    });
  };

  const handleDeleteConfirm = () => {
    setData(prev => ({
      ...prev,
      [deleteModal.type]: prev[deleteModal.type].filter(i => i.id !== deleteModal.id)
    }));
    setDeleteModal({ open: false, id: '', type: '' });
  };

  const tabs = [
    { id: 'job', label: 'Jobs', icon: <FiBriefcase /> },
    { id: 'scholarship', label: 'Scholarships', icon: <FiAward /> },
    { id: 'blog', label: 'Blog', icon: <FiBookOpen /> },
  ];

  const renderTable = (type) => {
    const items = data[type] || [];
    let headers = [], rows = [];
    
    if (type === 'job') {
      headers = ['Title', 'Company', 'Location', 'Deadline', 'Type'];
      rows = items.map(j => ({ id: j.id, cells: [j.title, j.company, j.location, j.deadline, j.type] }));
    } else if (type === 'scholarship') {
      headers = ['Title', 'Organization', 'Country', 'Deadline', 'Funding'];
      rows = items.map(s => ({ id: s.id, cells: [s.title, s.org, s.country, s.deadline, s.type] }));
    } else {
      headers = ['Title', 'Author', 'Category', 'Date'];
      rows = items.map(b => ({ id: b.id, cells: [b.title, b.author, b.category, b.date] }));
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold capitalize">{type}s Management</h2>
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

  const stats = [
    { label: 'Total Jobs', value: data.job.length, icon: <FiBriefcase />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Scholarships', value: data.scholarship.length, icon: <FiAward />, color: 'bg-purple-100 text-purple-600' },
    { label: 'Blog Posts', value: data.blog.length, icon: <FiBookOpen />, color: 'bg-green-100 text-green-600' },
    { label: 'Total Users', value: 1240, icon: <FiUsers />, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === t.id ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      {renderTable(activeTab)}

      {/* Modals */}
      <AdminFormModal 
        isOpen={formModal.open} 
        onClose={() => setFormModal({ open: false, type: '', item: null })}
        type={formModal.type}
        initialData={formModal.item}
        onSubmit={handleSave}
      />

      <DeleteModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: '', type: '' })}
        onConfirm={handleDeleteConfirm}
        itemName={activeTab}
      />
    </div>
  );
}
