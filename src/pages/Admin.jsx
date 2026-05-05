import { useState, useEffect } from 'react';
import { FiPlus, FiBriefcase, FiAward, FiFileText, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminFormModal from '../components/admin/AdminFormModal';
import { getJobs, createJob, updateJob, deleteJob } from '../services/firebase/jobs';
import { getScholarships, createScholarship, updateScholarship, deleteScholarship } from '../services/firebase/scholarships';
import { getDocs, collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { key: 'job', label: 'Jobs', icon: FiBriefcase },
  { key: 'scholarship', label: 'Scholarships', icon: FiAward },
  { key: 'blog', label: 'Blog Posts', icon: FiFileText },
];

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('job');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (activeTab === 'job') {
        const result = await getJobs({}, 100);
        setItems(result.jobs || []);
      } else if (activeTab === 'scholarship') {
        const result = await getScholarships();
        setItems(result || []);
      } else if (activeTab === 'blog') {
        const snap = await getDocs(collection(db, 'blog'));
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [activeTab]);

  const handleCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleEdit = (item) => { setEditItem(item); setModalOpen(true); };
  const handleDeleteClick = (item) => { setDeleteTarget(item); setConfirmDelete(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      if (activeTab === 'job') await deleteJob(deleteTarget.id, user?.uid);
      else if (activeTab === 'scholarship') await deleteScholarship(deleteTarget.id, user?.uid);
      else if (activeTab === 'blog') await deleteDoc(doc(db, 'blog', deleteTarget.id));
      showToast('Deleted successfully');
      setConfirmDelete(false);
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    const isEdit = !!editItem;
    try {
      const { id: _id, type: _type, ...cleanData } = formData;
      if (activeTab === 'job') {
        if (isEdit) await updateJob(editItem.id, cleanData, user?.uid);
        else await createJob(cleanData, user?.uid);
      } else if (activeTab === 'scholarship') {
        if (isEdit) await updateScholarship(editItem.id, cleanData, user?.uid);
        else await createScholarship(cleanData, user?.uid);
      } else if (activeTab === 'blog') {
        if (isEdit) {
          await updateDoc(doc(db, 'blog', editItem.id), { ...cleanData, updatedAt: Timestamp.now() });
        } else {
          await addDoc(collection(db, 'blog'), { ...cleanData, createdAt: Timestamp.now(), updatedAt: Timestamp.now(), views: 0 });
        }
      }
      showToast(isEdit ? 'Updated successfully!' : 'Created successfully!');
      setModalOpen(false);
      setEditItem(null);
      fetchItems();
    } catch (err) {
      console.error('Save error:', err);
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = {
    job: ['title', 'company', 'location', 'type', 'deadline'],
    scholarship: ['title', 'org', 'country', 'type', 'deadline'],
    blog: ['title', 'author', 'category'],
  };

  return (
    <div className="max-w-6xl mx-auto">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 btn-primary">
          <FiPlus /> Add {TABS.find(t => t.key === activeTab)?.label.slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No {activeTab}s yet.</p>
          <button onClick={handleCreate} className="text-primary-600 hover:underline font-medium">+ Create your first one</button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs uppercase">
              <tr>
                {columns[activeTab].map(col => (
                  <th key={col} className="px-4 py-3 capitalize">{col}</th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {items.map(item => (
                <tr key={item.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  {columns[activeTab].map(col => (
                    <td key={col} className="px-4 py-3 text-gray-800 dark:text-gray-200 max-w-[200px] truncate">
                      {item[col] || '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AdminFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        type={activeTab}
        initialData={editItem}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete this item?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              "<span className="font-medium text-gray-700 dark:text-gray-300">{deleteTarget?.title}</span>" will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setConfirmDelete(false); setDeleteTarget(null); }}
                className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
