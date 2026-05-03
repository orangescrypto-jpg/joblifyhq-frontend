import { Link } from 'react-router-dom';
import { FiGlobe, FiCalendar, FiAward } from 'react-icons/fi';

export default function ScholarshipCard({ scholarship }) {
  return (
    <Link to={`/scholarships/${scholarship.id}`} className="card p-5 flex flex-col gap-3 group">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition">{scholarship.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${scholarship.type === 'Full Funding' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {scholarship.type}
        </span>
      </div>
      <p className="text-sm text-gray-600">{scholarship.org}</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
        <span className="flex items-center gap-1"><FiGlobe /> {scholarship.country}</span>
        <span className="flex items-center gap-1"><FiCalendar /> {scholarship.deadline}</span>
      </div>
      <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-100">
        <span className="text-xs text-gray-500 flex items-center gap-1"><FiAward /> {scholarship.benefits}</span>
        <span className="text-primary-600 text-sm font-medium group-hover:underline">Learn More →</span>
      </div>
    </Link>
  );
}
