import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJobs, createJob, updateJob, deleteJob } from '../services/firebase/jobs';
import { getScholarships, createScholarship, updateScholarship, deleteScholarship } from '../services/firebase/scholarships';
import { getBlogs, createBlog, updateBlog, deleteBlog } from '../services/firebase/blog';
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
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, scholarshipsData, blogsData] = await Promise.all([
          getJobs(),
          getScholarships(),
          getBlogs()
        ]);
        setData({ job: jobsData, scholarship: scholarshipsData, blog: blogsData });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // FIXED: closes modal on success, shows feedback banners instead of alert()
  const handleSave = async (item) => {
    setSaveError('');
    setSaveSuccess('');
    try {
      const { type, id, ...rest } = item;
      let savedId = id;

      if (type === 'job') {
        if (id && !id.startsWith('new_')) {
          await updateJob(id, rest, user.uid);
        } else {
          savedId = await createJob(rest, user.uid);
        }
      } else if (type === 'scholarship') {
        if (id && !id.startsWith('new_')) {
          await updateScholarship(id, rest, user.uid);
        } else {
          savedId = await createScholarship(rest, user.uid);
        }
      } else if (type === 'blog') {
        if (id && !id.startsWith('new_')) {
          await updateBlog(id, rest, user.uid);
        } else {
          savedId = await createBlog(rest, user.uid);
        }
      }

      const finalItem = { ...item, id: savedId };

      setData(prev => {
        const arr = prev[type] || [];
        const exists = arr.find(i => i.id === savedId);
        return {
          ...prev,
          [type]: exists
            ? arr.map(i => i.id === savedId ? { ...i, ...rest } : i)
            : [...arr, finalItem]
        };
      });

      // Close modal and show success
      setFormModal({ open: false, type: '', item: null });
      setSaveSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`);
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setSaveError('Failed to save. Please check your permissions and try again.');
      setTimeout(() => setSaveError(''), 5000);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const { type, id } = deleteModal;
      if (type === 'job') await deleteJob(id, user.uid);
      else if (type === 'scholarship') await deleteScholarship(id, user.uid);
      else if (type === 'blog') await deleteBlog(id);

      setData(prev => ({
        ...prev,
        [type]: prev[type].filter(i => i.id !== id)
      }));
      setDeleteModal({ open: false, id: '', type: '' });
    } catch (error) {
      console.error('Error deleting:', error);
      setSaveError('Failed to delete. Please try again.');
      setTimeout(() => setSaveError(''), 5000);
    }
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
      rows = items.map(s => ({ id: s.id, cells: [s.title, s.org, s.country, s.deadline, s.funding || s.type] }));
    } else if (type === 'blog') {
      headers = ['Title', 'Author', 'Category', 'Date'];
      rows = items.map(b => ({
        id: b.id,
        cells: [
          b.title,
          b.author,
          b.category,
          b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString() : b.date || 'Recently'
        ]
      }));
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold capitalize text-gray-900 dark:text-white">
            {type === 'blog' ? 'Blog Posts' : type + 's'} Management
          </h2>
          <button
            onClick={() => setFormModal({ open: true, type, item: null })}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> Add New
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        ) : (
          <AdminTable
            headers={headers}
            rows={rows}
            onEdit={(id) => setFormModal({ open: true, type, item: items.find(i => i.id === id) })}
            onDelete={(id) => setDeleteModal({ open: true, id, type })}
          />
        )}
      </div>
    );
  };

  const stats = [
    { label: 'Total Jobs', value: data.job.length, icon: <FiBriefcase />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Scholarships', value: data.scholarship.length, icon: <FiAward />, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Blog Posts', value: data.blog.length, icon: <FiBookOpen />, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { label: 'Total Users', value: 1240, icon: <FiUsers />, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h1>

      {/* Success/Error Notifications */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-lg">
          ✓ {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
          ✗ {saveError}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === t.id
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {renderTable(activeTab)}

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
        itemName={activeTab === 'blog' ? 'post' : activeTab}
      />
    </div>
  );
}
