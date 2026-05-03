import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiBookmark, FiSend } from 'react-icons/fi';
import { fetchJobs } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import UploadModal from '../components/common/UploadModal';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedJobs, toggleSaveJob, submitApplication } = useDashboard();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchJobs().then(data => {
      setJob(data.find(j => j.id === id) || null);
      setLoading(false);
    });
  }, [id]);

  const isSaved = savedJobs.some(j => j.id === id);

  if (loading) return <div className="animate-pulse space-y-4 p-10"><div className="h-8 w-3/4 bg-gray-200 rounded"></div><div className="h-4 w-1/2 bg-gray-200 rounded"></div><div className="h-32 bg-gray-200 rounded"></div></div>;
  if (!job) return <div className="text-center py-20"><h2 className="text-2xl font-bold mb-2">Job Not Found</h2><button onClick={() => navigate('/jobs')} className="btn-primary">Browse Jobs</button></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-primary-600 font-medium mt-1">{job.company}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => user ? toggleSaveJob(job) : navigate('/login')} className={`p-3 rounded-lg border ${isSaved ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-gray-50 border-gray-200 text-gray-600'} hover:bg-gray-100 transition`}>
                <FiBookmark size={20} />
              </button>
              <button onClick={() => user ? setShowApplyModal(true) : navigate('/login')} className="btn-primary flex items-center gap-2">
                <FiSend /> Apply Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg text-center"><span className="text-sm text-gray-500 block">Location</span><span className="font-medium">{job.location}</span></div>
            <div className="p-4 bg-gray-50 rounded-lg text-center"><span className="text-sm text-gray-500 block">Type</span><span className="font-medium">{job.type}</span></div>
            <div className="p-4 bg-gray-50 rounded-lg text-center"><span className="text-sm text-gray-500 block">Salary</span><span className="font-medium">{job.salary}</span></div>
            <div className="p-4 bg-gray-50 rounded-lg text-center"><span className="text-sm text-gray-500 block">Deadline</span><span className="font-medium">{job.deadline}</span></div>
          </div>

          <div className="prose max-w-none text-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">About the Role</h3>
            <p className="mb-6">{job.description}</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Requirements</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Proven experience with React & modern frontend tooling</li>
              <li>Strong understanding of RESTful APIs & state management</li>
              <li>Excellent problem-solving & communication skills</li>
              <li>Bachelor's degree in CS or equivalent experience</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Benefits</h3>
            <p>Competitive salary, flexible remote work, health insurance, learning budget, and annual team retreats.</p>
          </div>
        </div>
      </div>

      <UploadModal 
        isOpen={showApplyModal} 
        onClose={() => setShowApplyModal(false)} 
        opportunityType="job"
        opportunityId={job.id}
        title={job.title}
        org={job.company}
        onApply={submitApplication}
      />
    </div>
  );
}
