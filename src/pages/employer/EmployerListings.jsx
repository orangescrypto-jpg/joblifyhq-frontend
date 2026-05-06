import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiStar, FiEye, FiUsers, FiBriefcase, FiAward, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getEmployerJobs, deleteJob } from '../../services/firebase/jobs';
import { getEmployerScholarships, deleteScholarship } from '../../services/firebase/scholarships';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const COUNTRY_FLAGS = {
  'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Kenya': '🇰🇪', 'South Africa': '🇿🇦',
  'Uganda': '🇺🇬', 'Rwanda': '🇷🇼', 'Tanzania': '🇹🇿', 'Ethiopia': '🇪🇹',
  'Senegal': '🇸🇳', 'Cameroon': '🇨🇲', 'Zimbabwe': '🇿🇼', 'Zambia': '🇿🇲',
  'Botswana': '🇧🇼', 'Namibia': '🇳🇦', 'Egypt': '🇪🇬', 'Morocco': '🇲🇦',
  'Tunisia': '🇹🇳', "Côte d'Ivoire": '🇨🇮', 'UK': '🇬🇧', 'USA': '🇺🇸',
  'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Germany': '🇩🇪', 'France': '🇫🇷',
  'China': '🇨🇳', 'Worldwide': '🌍', 'Remote': '🌍'
};

function getFlag(country = '') {
  for (const [name, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (country.toLowerCase().includes(name.toLowerCase())) return flag;
  }
  return '🌍';
}

export default function EmployerListings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoteModal, setPromoteModal] = useState({ open: false, listing: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, listing: null });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchListings = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [jobs, scholarships] = await Promise.all([
        getEmployerJobs(user.uid),
        getEmployerScholarships(user.uid)
      ]);
      const jobsTagged = (jobs || []).map(j => ({ ...j, listingType: 'job' }));
      const scholsTagged = (scholarships || []).map(s => ({ ...s, listingType: 'scholarship' }));
      setListings([...jobsTagged, ...scholsTagged]);
    } catch (err) {
      console.error('Error fetching listings:', err);
      showToast('Failed to load listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [user?.uid]);

  const filteredListings = activeTab === 'all'
    ? listings
    : listings.filter(l => l.listingType === activeTab);

  const handlePromote = (listing) => setPromoteModal({ open: true, listing });

  const confirmPromote = async () => {
    const { listing } = promoteModal;
    try {
      const colName = listing.listingType === 'job' ? 'jobs' : 'scholarships';
      await updateDoc(doc(db, colName, listing.id), {
        isFeatured: true,
        updatedAt: Timestamp.now()
      });
      showToast('⚡ Listing is now featured!');
      setPromoteModal({ open: false, listing: null });
      fetchListings();
    } catch (err) {
      showToast('Failed to boost listing', 'error');
    }
  };

  const handleDelete = (listing) => setDeleteModal({ open: true, listing });

  const confirmDelete = async () => {
    const { listing } = deleteModal;
    try {
      if (listing.listingType === 'job') {
        await deleteJob(listing.id, user.uid);
      } else {
        await deleteScholarship(listing.id, user.uid);
      }
      showToast('Listing deleted');
      setDeleteModal({ open: false, listing: null });
      fetchListings();
    } catch (err) {
      showToast('Failed to delete listing', 'error');
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Listings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your jobs and scholarships across Africa</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button onClick={() => setActiveTab('all')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>All</button>
            <button onClick={() => setActiveTab('job')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition flex items-center gap-1 ${activeTab === 'job' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}><FiBriefcase size={13} /> Jobs</button>
            <button onClick={() => setActiveTab('scholarship')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition flex items-center gap-1 ${activeTab === 'scholarship' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}><FiAward size={13} /> Scholarships</button>
          </div>
          <Link to="/employer/post-job" className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus /> Post New
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No listings yet.</p>
          <Link to="/employer/post-job" className="btn-primary inline-flex items-center gap-2">
            <FiPlus /> Post Your First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium">
              <tr>
                <th className="px-5 py-4">Listing</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Country</th>
                <th className="px-5 py-4 text-center">Views</th>
                <th className="px-5 py-4 text-center">Applications</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredListings.map(listing => (
                <tr key={listing.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition ${listing.isFeatured ? 'border-l-4 border-yellow-400' : ''}`}>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{listing.title}</p>
                      <p className="text-xs text-gray-500">{listing.listingType === 'job' ? listing.company : listing.org} • Deadline: {listing.deadline || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${listing.listingType === 'job' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                      {listing.listingType === 'job' ? <FiBriefcase size={12} /> : <FiAward size={12} />}
                      {listing.listingType === 'job' ? 'Job' : 'Scholarship'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {getFlag(listing.country || listing.location)} {listing.country || listing.location || '—'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                      <FiEye size={14} /> {listing.views || 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="flex items-center justify-center gap-1 text-primary-600 font-medium">
                      <FiUsers size={14} /> {listing.applications || 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {listing.isFeatured ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full font-medium">
                        ⚡ Featured
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Standard</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!listing.isFeatured && (
                        <button
                          onClick={() => handlePromote(listing)}
                          className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition"
                          title="Boost Listing"
                        >
                          <FiStar size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(listing)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
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

      {/* Promote Modal */}
      {promoteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">⚡ Boost "{promoteModal.listing?.title}"?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Get 3x more visibility across Africa — your listing will appear at the top of results and on the homepage.</p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Promotion Duration</span>
                <span className="font-medium text-gray-900 dark:text-white">14 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                <span className="text-xl font-bold text-primary-600">$79</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setPromoteModal({ open: false, listing: null })} className="btn-secondary">Cancel</button>
              <button onClick={confirmPromote} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition">
                Boost for $79
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete this listing?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              "<span className="font-medium text-gray-700 dark:text-gray-300">{deleteModal.listing?.title}</span>" will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal({ open: false, listing: null })} className="btn-secondary">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
