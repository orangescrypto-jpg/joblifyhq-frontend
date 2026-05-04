import { useState } from 'react';
import { FiEdit2, FiTrash2, FiStar, FiEye, FiUsers, FiBriefcase, FiAward } from 'react-icons/fi';

export default function EmployerListings() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'job', 'scholarship'
  
  const [listings, setListings] = useState([
    { id: 1, type: 'job', title: 'Frontend Developer', company: 'Acme Corp', location: 'Remote', applications: 12, views: 234, isFeatured: true, posted: 'May 1, 2026', deadline: 'Jun 15, 2026' },
    { id: 2, type: 'scholarship', title: 'Global STEM Award', org: 'Acme Foundation', country: 'USA', applications: 28, views: 456, isFeatured: false, posted: 'Apr 28, 2026', deadline: 'Aug 30, 2026' },
    { id: 3, type: 'job', title: 'Data Analyst', company: 'Acme Corp', location: 'Lagos', applications: 5, views: 89, isFeatured: false, posted: 'Apr 25, 2026', deadline: 'May 30, 2026' },
  ]);

  const [promoteModal, setPromoteModal] = useState({ open: false, listing: null });

  const filteredListings = activeTab === 'all' ? listings : listings.filter(l => l.type === activeTab);

  const handlePromote = (listing) => {
    setPromoteModal({ open: true, listing });
  };

  const confirmPromote = () => {
    setListings(prev => prev.map(l => l.id === promoteModal.listing.id ? { ...l, isFeatured: true } : l));
    setPromoteModal({ open: false, listing: null });
    alert('✨ Listing promoted! It will now appear at the top of search results.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Listings</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}>All</button>
          <button onClick={() => setActiveTab('job')} className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'job' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}><FiBriefcase size={14} /> Jobs</button>
          <button onClick={() => setActiveTab('scholarship')} className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'scholarship' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}><FiAward size={14} /> Scholarships</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium">
            <tr>
              <th className="px-5 py-4">Listing</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">{activeTab === 'scholarship' ? 'Country' : 'Location'}</th>
              <th className="px-5 py-4 text-center">Views</th>
              <th className="px-5 py-4 text-center">Applications</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredListings.map(listing => (
              <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{listing.title}</p>
                    <p className="text-xs text-gray-500">{listing.type === 'job' ? listing.company : listing.org} • Deadline: {listing.deadline}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${listing.type === 'job' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                    {listing.type === 'job' ? <FiBriefcase size={12} /> : <FiAward size={12} />} {listing.type === 'job' ? 'Job' : 'Scholarship'}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{listing.location || listing.country}</td>
                <td className="px-5 py-4 text-center">
                  <span className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                    <FiEye size={14} /> {listing.views}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="flex items-center justify-center gap-1 text-primary-600 font-medium">
                    <FiUsers size={14} /> {listing.applications}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  {listing.isFeatured ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full font-medium">
                      <FiStar size={12} /> Featured
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Standard</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right space-x-2">
                  <button className="p-2 text-gray-400 hover:text-primary-600 transition" title="Edit">
                    <FiEdit2 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition" title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                  {!listing.isFeatured && (
                    <button onClick={() => handlePromote(listing)} className="p-2 text-amber-500 hover:text-amber-600 transition" title="Boost Listing">
                      <FiStar size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Promote Modal */}
      {promoteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Boost "{promoteModal.listing?.title}"?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Get 3x more visibility by featuring this {promoteModal.listing?.type} on the homepage and category tops.</p>
            
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
              <button onClick={confirmPromote} className="btn-primary bg-amber-500 hover:bg-amber-600">Boost for $79</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
