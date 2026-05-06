import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiGlobe } from 'react-icons/fi';

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

// Returns days until deadline, null if no deadline
function daysUntil(deadline) {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(deadline);
  if (isNaN(end)) return null;
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
}

// Was this job posted within last 7 days?
function isActivelyHiring(createdAt) {
  if (!createdAt) return false;
  const posted = createdAt?.seconds
    ? new Date(createdAt.seconds * 1000)
    : new Date(createdAt);
  const diff = (Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

export default function JobCard({ job }) {
  const flag = getFlag(job.location || job.country || '');
  const days = daysUntil(job.deadline);
  const activeHiring = isActivelyHiring(job.createdAt);

  const urgencyLabel = () => {
    if (days === null) return null;
    if (days < 0) return { text: 'Expired', color: 'bg-red-100 text-red-600' };
    if (days === 0) return { text: 'Closes today!', color: 'bg-red-100 text-red-600' };
    if (days <= 3) return { text: `Closes in ${days} day${days === 1 ? '' : 's'}`, color: 'bg-orange-100 text-orange-600' };
    if (days <= 7) return { text: `Closes in ${days} days`, color: 'bg-yellow-100 text-yellow-700' };
    return null;
  };

  const urgency = urgencyLabel();

  return (
    <Link
      to={`/jobs/${job.id}`}
      className={`card p-5 flex flex-col gap-3 group ${job.isFeatured ? 'border-2 border-yellow-400 dark:border-yellow-500' : ''}`}
    >
      {/* Top badges row */}
      <div className="flex flex-wrap gap-2">
        {job.isFeatured && (
          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full font-semibold">
            ⚡ Featured
          </span>
        )}
        {activeHiring && (
          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 border border-green-300 rounded-full font-semibold animate-pulse">
            🟢 Actively Hiring
          </span>
        )}
        {job.isRemote && (
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full font-semibold flex items-center gap-1">
            <FiGlobe size={10} /> Global Remote
          </span>
        )}
        {urgency && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${urgency.color}`}>
            ⏰ {urgency.text}
          </span>
        )}
      </div>

      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition">{job.title}</h3>
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium flex-shrink-0 ml-2">{job.type}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
        <span className="flex items-center gap-1"><FiMapPin /> {flag} {job.location}</span>
        <span className="flex items-center gap-1"><FiDollarSign /> {job.salary || 'N/A'}</span>
      </div>
      <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-500">Deadline: {job.deadline || 'Rolling'}</span>
        <span className="text-primary-600 text-sm font-medium group-hover:underline">View Details →</span>
      </div>
    </Link>
  );
}
