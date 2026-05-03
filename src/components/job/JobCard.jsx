import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';

export default function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card p-5 flex flex-col gap-3 group">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition">{job.title}</h3>
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">{job.type}</span>
      </div>
      <p className="text-sm text-gray-600">{job.company}</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
        <span className="flex items-center gap-1"><FiMapPin /> {job.location}</span>
        <span className="flex items-center gap-1"><FiDollarSign /> {job.salary}</span>
        <span className="flex items-center gap-1"><FiClock /> {job.posted}</span>
      </div>
      <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-100">
        <span className="text-xs text-gray-500">Deadline: {job.deadline}</span>
        <span className="text-primary-600 text-sm font-medium group-hover:underline">View Details →</span>
      </div>
    </Link>
  );
}
