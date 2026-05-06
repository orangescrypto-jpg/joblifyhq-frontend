import { useState, useEffect } from 'react';
import { FiPlus, FiBriefcase, FiAward, FiFileText, FiEdit2, FiTrash2, FiEye, FiUsers, FiTrendingUp, FiMail, FiPhone, FiX, FiRefreshCw } from 'react-icons/fi';
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
  { key: 'applications', label: 'Applications', icon: FiUsers },
];

const COUNTRY_FLAGS = {
  'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Kenya': '🇰🇪', 'South Africa': '🇿🇦',
  'Uganda': '🇺🇬', 'Rwanda': '🇷🇼', 'Tanzania': '🇹🇿', 'Ethiopia': '🇪🇹',
  'Senegal': '🇸🇳', 'Cameroon': '🇨🇲', 'Zimbabwe': '🇿🇼', 'Zambia': '🇿🇲',
  'Botswana': '🇧🇼', 'Namibia': '🇳🇦', 'Egypt': '🇪🇬', 'Morocco': '🇲🇦',
  'Tunisia': '🇹🇳', "Côte d'Ivoire": '🇨🇮', 'UK': '🇬🇧', 'USA': '🇺🇸',
  'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Germany': '🇩🇪', 'France': '🇫🇷',
  'China': '🇨🇳', 'Worldwide': '🌍', 'Remote': '🌍'
};

const APP_STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  New:       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Viewed:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Contacted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Interview: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Rejected:  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function getFlag(location = '') {
  for (const [name, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (location.toLowerCase().includes(name.toLowerCase())) return flag;
  }
  return '🌍';
}

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

  // Applications tab state
  const [selectedApp, setSelectedApp] = useState(null);
  const [appFilterStatus, setAppFilterStatus] = useState('all');
  const [appSearch, setAppSearch] = useState('');

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
      } else if (activeTab === 'applications') {
        const snap = await getDocs(collection(db, 'applications'));
        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        apps.sort((a, b) => (b.appliedAt?.seconds || 0) - (a.appliedAt?.seconds || 0));
        setItems(apps);
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

  const handleBoost = async (item) => {
    try {
      const colName = activeTab === 'job' ? 'jobs' : 'scholarships';
      const ref = doc(db, colName, item.id);
      await updateDoc(ref, { isFeatured: !item.isFeatured, updatedAt: Timestamp.now() });
      showToast(item.isFeatured ? 'Removed from featured' : '⚡ Marked as Featured!');
      fetchItems();
    } catch (err) {
      showToast('Failed to update featured status', 'error');
    }
  };

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
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAppStatusChange = async (appId, newStatus) => {
    try {
      await updateDoc(doc(db, 'applications', appId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      setItems(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      if (selectedApp?.id === appId) setSelectedApp(prev => ({ ...prev, status: newStatus }));
      showToast('Status updated');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const formatDate = (ts) => {
    if (!ts?.toDate) return 'Recently';
    const d = ts.toDate();
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString();
  };

  const filteredApps = items.filter(app => {
    const statusMatch = appFilterStatus === 'all' || app.status === appFilterStatus;
    const searchMatch = appSearch === '' ||
      app.userName?.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.userEmail?.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.title?.toLowerCase().includes(appSearch.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Stats for current tab
  const totalViews = items.reduce((sum, i) => sum + (i.views || 0), 0);
  const totalApplications = items.reduce((sum, i) => sum + (i.applications || 0), 0);
  const totalFeatured = items.filter(i => i.isFeatured).length;

  const columns = {
    job: ['title', 'company', 'country', 'type', 'deadline'],
    scholarship: ['title', 'org', 'country', 'type', 'deadline'],
    blog: ['title', 'author', 'category'],
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        {activeTab !== 'applications' && (
          <button onClick={handleCreate} className="flex items-center gap-2 btn-primary">
            <FiPlus /> Add {TABS.find(t => t.key === activeTab)?.label.slice(0, -1)}
          </button>
        )}
        {activeTab === 'applications' && (
          <button onClick={fetchItems} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition">
            <FiRefreshCw size={14} /> Refresh
          </button>
        )}
      </div>

      {/* Stats Row — only for jobs and scholarships */}
      {activeTab !== 'blog' && activeTab !== 'applications' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: items.length, icon: FiTrendingUp, color: 'text-gray-900 dark:text-white' },
            { label: 'Total Views', value: totalViews, icon: FiEye, color: 'text-blue-600' },
            { label: 'Applications', value: totalApplications, icon: FiUsers, color: 'text-primary-600' },
            { label: 'Featured', value: totalFeatured, icon: null, color: 'text-amber-600', emoji: '⚡' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.emoji && <span className="mr-1">{stat.emoji}</span>}{stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Applications stats */}
      {activeTab === 'applications' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: items.length, color: 'text-gray-900 dark:text-white' },
            { label: 'Pending', value: items.filter(a => a.status === 'pending' || !a.status).length, color: 'text-yellow-600' },
            { label: 'Interview', value: items.filter(a => a.status === 'Interview').length, color: 'text-indigo-600' },
            { label: 'With CV', value: items.filter(a => a.cvUrl).length, color: 'text-primary-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition -mb-px whitespace-nowrap ${activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
              <Icon size={16} /> {tab.label}
              {tab.key === 'applications' && items.length > 0 && activeTab === 'applications' && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full text-xs font-bold">
                  {items.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── APPLICATIONS TAB ── */}
      {activeTab === 'applications' && (
        <div className="space-y-5">
          {/* Search + Filter */}
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search by name, email or job title..."
              value={appSearch}
              onChange={e => setAppSearch(e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm flex-1 min-w-48"
            />
            <select
              value={appFilterStatus}
              onChange={e => setAppFilterStatus(e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm w-40"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="New">New</option>
              <option value="Viewed">Viewed</option>
              <option value="Contacted">Contacted</option>
              <option value="Interview">Interview</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FiUsers size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No applications found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {items.length === 0 ? 'No one has applied yet.' : 'Try adjusting your search or filter.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredApps.map(app => (
                <div key={app.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-base">{app.userName || 'Applicant'}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Applied for: <span className="font-medium text-gray-700 dark:text-gray-300">{app.title}</span>
                            {app.company && <span className="text-gray-400"> · {app.company}</span>}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${APP_STATUS_STYLES[app.status] || APP_STATUS_STYLES.pending}`}>
                          {app.status || 'pending'}
                        </span>
                      </div>

                      {app.coverNote && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-1">{app.coverNote}</p>
                      )}

                      {app.cvUrl && (
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                          <FiFileText size={12} /> {app.cvFileName || 'View CV'}
                        </a>
                      )}

                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        {app.userEmail && <span>📧 {app.userEmail}</span>}
                        {app.phone && <span>📱 {app.phone}</span>}
                        <span>⏰ {formatDate(app.appliedAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                      >
                        <FiEye size={13} /> View
                      </button>
                      {app.userEmail && (
                        <a href={`mailto:${app.userEmail}`}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-lg transition">
                          <FiMail size={13} /> Email
                        </a>
                      )}
                      {app.phone && (
                        <a href={`tel:${app.phone.replace(/\s/g, '')}`}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 rounded-lg transition">
                          <FiPhone size={13} /> Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Application Detail Modal */}
          {selectedApp && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApp.userName}'s Application</h3>
                  <button onClick={() => setSelectedApp(null)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                    <FiX size={20} />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApp.userName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApp.userEmail || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApp.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Applied For</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApp.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Company</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApp.company || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Applied</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedApp.appliedAt)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <select
                        value={selectedApp.status || 'pending'}
                        onChange={e => handleAppStatusChange(selectedApp.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${APP_STATUS_STYLES[selectedApp.status] || APP_STATUS_STYLES.pending}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="New">New</option>
                        <option value="Viewed">Viewed</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interview">Interview</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {selectedApp.cvUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CV / Resume</p>
                      <a
                        href={selectedApp.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition text-sm font-medium border border-primary-200 dark:border-primary-800"
                      >
                        <FiFileText size={15} /> {selectedApp.cvFileName || 'View CV / Resume'}
                      </a>
                    </div>
                  )}

                  {selectedApp.coverNote && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Note</p>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap text-sm">{selectedApp.coverNote}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-wrap">
                    {selectedApp.userEmail && (
                      <a href={`mailto:${selectedApp.userEmail}?subject=Re: Your application for ${selectedApp.title}`}
                        className="btn-primary flex items-center gap-2 text-sm">
                        <FiMail size={14} /> Send Email
                      </a>
                    )}
                    {selectedApp.phone && (
                      <a href={`tel:${selectedApp.phone.replace(/\s/g, '')}`}
                        className="btn-secondary flex items-center gap-2 text-sm">
                        <FiPhone size={14} /> Call Now
                      </a>
                    )}
                    {selectedApp.cvUrl && (
                      <a href={selectedApp.cvUrl} target="_blank" rel="noopener noreferrer"
                        className="btn-secondary flex items-center gap-2 text-sm">
                        <FiFileText size={14} /> Download CV
                      </a>
                    )}
                    <button onClick={() => setSelectedApp(null)} className="btn-secondary text-sm">Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── JOBS / SCHOLARSHIPS / BLOG TABLE ── */}
      {activeTab !== 'applications' && (
        <>
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
                    {activeTab !== 'blog' && (
                      <>
                        <th className="px-4 py-3 text-center">Views</th>
                        <th className="px-4 py-3 text-center">Applications</th>
                        <th className="px-4 py-3 text-center">Featured</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {items.map(item => (
                    <tr key={item.id}
                      className={`bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${item.isFeatured ? 'border-l-4 border-yellow-400' : ''}`}>

                      {columns[activeTab].map(col => (
                        <td key={col} className="px-4 py-3 text-gray-800 dark:text-gray-200 max-w-[180px] truncate">
                          {col === 'country' || col === 'location'
                            ? <span>{getFlag(item[col] || '')} {item[col] || '—'}</span>
                            : item[col] || '—'}
                        </td>
                      ))}

                      {activeTab !== 'blog' && (
                        <>
                          <td className="px-4 py-3 text-center">
                            <span className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400">
                              <FiEye size={13} /> {item.views || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="flex items-center justify-center gap-1 text-primary-600 font-medium">
                              <FiUsers size={13} /> {item.applications || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleBoost(item)}
                              title={item.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
                              className={`p-2 rounded-lg transition text-base ${item.isFeatured ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}>
                              ⚡
                            </button>
                          </td>
                        </>
                      )}

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleEdit(item)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                            title="Edit">
                            <FiEdit2 size={15} />
                          </button>
                          <button onClick={() => handleDeleteClick(item)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Delete">
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {activeTab !== 'applications' && (
        <AdminFormModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditItem(null); }}
          type={activeTab}
          initialData={editItem}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete this item?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              "<span className="font-medium text-gray-700 dark:text-gray-300">{deleteTarget?.title}</span>" will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setConfirmDelete(false); setDeleteTarget(null); }}
                className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700">Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
