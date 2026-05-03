import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiGlobe, FiCalendar, FiAward, FiBookmark, FiSend } from 'react-icons/fi';
import { fetchScholarships } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import UploadModal from '../components/common/UploadModal';

export default function ScholarshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedScholarships, toggleSaveScholarship, submitApplication } = useDashboard();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchScholarships().then(data => {
      setScholarship(data.find(s => s.id === id) || null);
      setLoading(false);
    });
  }, [id]);

  const isSaved = savedScholarships.some(s => s.id === id);

  if (loading) return <div className="animate-pulse space-y-4 p-10"><div className="h-8 w-3/4 bg-gray-200 rounded"></div><div className="h-4 w-1/2 bg-gray-200 rounded"></div><div className="h-32 bg-gray-200 rounded"></div></div>;
  if (!scholarship) return <div className="text-center py-20"><h2 className="text-2xl font-bold mb-2">Scholarship Not Found</h2><button onClick={() => navigate('/scholarships')} className="btn-primary">Browse Scholarships</button></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{scholarship.title}</h1>
              <p className="text-lg text-purple-600 font-medium mt-1">{scholarship.org}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => user ? toggleSaveScholarship(scholarship) : navigate('/login')} className={`p-3 rounded-lg border ${isSaved ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-gray-50 border-gray-200 text-gray-600'} hover:bg-gray-100 transition`}>
                <FiBookmark size={20} />
              </button>
              <button onClick={() => user ? setShowApplyModal(true) : navigate('/login')} className="btn-primary bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                <FiSend /> Apply Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"><span className="text-gray-500">Host Country</span><span className="font-medium flex items-center gap-2"><FiGlobe /> {scholarship.country}</span></div>
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"><span className="text-gray-500">Funding Type</span><span className="font-medium flex items-center gap-2"><FiAward /> {scholarship.type}</span></div>
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"><span className="text-gray-500">Deadline</span><span className="font-medium flex items-center gap-2"><FiCalendar /> {scholarship.deadline}</span></div>
          </div>

          <div className="prose max-w-none text-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Overview</h3>
            <p className="mb-6">{scholarship.description}</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Eligibility</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>International students accepted</li>
              <li>Minimum GPA of 3.0 or equivalent</li>
              <li>Proof of English proficiency (IELTS/TOEFL)</li>
              <li>Enrolled in an accredited university</li>
            </ul>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-1">Benefits Include:</h4>
              <p className="text-purple-700">{scholarship.benefits}</p>
            </div>
          </div>
        </div>
      </div>

      <UploadModal 
        isOpen={showApplyModal} 
        onClose={() => setShowApplyModal(false)} 
        opportunityType="scholarship"
        opportunityId={scholarship.id}
        title={scholarship.title}
        org={scholarship.org}
        onApply={submitApplication}
      />
    </div>
  );
}
