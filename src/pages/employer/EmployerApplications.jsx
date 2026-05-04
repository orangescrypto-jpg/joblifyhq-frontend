import { useState } from 'react';
import { FiMail, FiPhone, FiDownload, FiEye, FiX } from 'react-icons/fi';

export default function EmployerApplications() {
  const [applications, setApplications] = useState([
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+234 801 234 5678', role: 'Frontend Developer', cv: 'sarah_cv.pdf', coverLetter: 'I am passionate about building scalable React applications...', applied: '2h ago', status: 'New', jobId: 1 },
    { id: 2, name: 'Michael Chen', email: 'm.chen@email.com', phone: '+44 7911 123456', role: 'Data Analyst', cv: 'michael_cv.pdf', coverLetter: 'With 3 years of experience in SQL and Python...', applied: '5h ago', status: 'Viewed', jobId: 2 },
    { id: 3, name: 'Emma Williams', email: 'emma.w@email.com', phone: '+1 555 0123', role: 'UX Designer', cv: 'emma_cv.pdf', coverLetter: 'I specialize in user-centered design and prototyping...', applied: '1d ago', status: 'Contacted', jobId: 3 },
  ]);

  const [selectedApp, setSelectedApp] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Applications Received</h2>
        <div className="flex gap-2">
          <select className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm w-40">
            <option>All Jobs</option>
            <option>Frontend Developer</option>
            <option>Data Analyst</option>
          </select>
          <select className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm w-40">
            <option>All Status</option>
            <option>New</option>
            <option>Viewed</option>
            <option>Contacted</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map(app => (
          <div key={app.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{app.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Applied for: <span className="font-medium">{app.role}</span></p>
                  </div>
                  <select 
                    value={app.status} 
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 ${
                      app.status === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      app.status === 'Viewed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      app.status === 'Contacted' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <option value="New">New</option>
                    <option value="Viewed">Viewed</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interview">Interview</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{app.coverLetter}</p>
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>📧 {app.email}</span>
                  <span>📱 {app.phone}</span>
                  <span>⏰ {app.applied}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => setSelectedApp(app)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition">
                  <FiEye /> View Full
                </button>
                <a href={`mailto:${app.email}`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">
                  <FiMail /> Email
                </a>
                <a href={`tel:${app.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition">
                  <FiPhone /> Call
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">
                  <FiDownload /> CV
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Applicant Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApp.name}'s Application</h3>
              <button onClick={() => setSelectedApp(null)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedApp.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedApp.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Applied For</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedApp.role}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Applied</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedApp.applied}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Letter</p>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedApp.coverLetter}</p>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a href={`mailto:${selectedApp.email}?subject=Interview Invitation - ${selectedApp.role}`} className="btn-primary flex items-center gap-2">
                  <FiMail /> Send Interview Invite
                </a>
                <a href={`tel:${selectedApp.phone.replace(/\s/g, '')}`} className="btn-secondary flex items-center gap-2">
                  <FiPhone /> Call Now
                </a>
                <button onClick={() => setSelectedApp(null)} className="btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
