import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';

const COUNTRY_FLAGS = {
  'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Kenya': '🇰🇪', 'South Africa': '🇿🇦',
  'Uganda': '🇺🇬', 'Rwanda': '🇷🇼', 'Tanzania': '🇹🇿', 'Ethiopia': '🇪🇹',
  'Senegal': '🇸🇳', 'Cameroon': '🇨🇲', 'Zimbabwe': '🇿🇼', 'Zambia': '🇿🇲',
  'Botswana': '🇧🇼', 'Namibia': '🇳🇦', 'Egypt': '🇪🇬', 'Morocco': '🇲🇦',
  'Tunisia': '🇹🇳', "Côte d'Ivoire": '🇨🇮', 'Remote': '🌍',
};

function getFlag(location = '') {
  for (const [country, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (location.toLowerCase().includes(country.toLowerCase())) return flag;
  }
  return '🌍';
}

export default function JobCard({ job }) {
  const flag = getFlag(job.location || job.country || '');

  return (
    <Link
      to={`/jobs/${job.id}`}
      className={`card p-5 flex flex-col gap-3 group ${job.isFeatured ? 'border-2 border-yellow-400 dark:border-yellow-500' : ''}`}
    >
      {job.isFeatured && (
        <span className="self-start text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full font-semibold">
          ⚡ Featured
        </span>
      )}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition">{job.title}</h3>
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">{job.type}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
        <span className="flex items-center gap-1"><FiMapPin /> {flag} {job.location}</span>
        <span className="flex items-center gap-1"><FiDollarSign /> {job.salary || 'N/A'}</span>
        <span className="flex items-center gap-1"><FiClock /> {job.posted || ''}</span>
      </div>
      <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-500">Deadline: {job.deadline}</span>
        <span className="text-primary-600 text-sm font-medium group-hover:underline">View Details →</span>
      </div>
    </Link>
  );
}
