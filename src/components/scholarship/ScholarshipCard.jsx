import { Link } from 'react-router-dom';
import { FiGlobe, FiCalendar, FiAward } from 'react-icons/fi';

const COUNTRY_FLAGS = {
  'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Kenya': '🇰🇪', 'South Africa': '🇿🇦',
  'Uganda': '🇺🇬', 'Rwanda': '🇷🇼', 'Tanzania': '🇹🇿', 'Ethiopia': '🇪🇹',
  'Senegal': '🇸🇳', 'Cameroon': '🇨🇲', 'Zimbabwe': '🇿🇼', 'Zambia': '🇿🇲',
  'Botswana': '🇧🇼', 'Namibia': '🇳🇦', 'Egypt': '🇪🇬', 'Morocco': '🇲🇦',
  'Tunisia': '🇹🇳', "Côte d'Ivoire": '🇨🇮', 'UK': '🇬🇧', 'USA': '🇺🇸',
  'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Germany': '🇩🇪', 'France': '🇫🇷',
  'China': '🇨🇳', 'Worldwide': '🌍', 'International': '🌍',
};

function getFlag(country = '') {
  for (const [name, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (country.toLowerCase().includes(name.toLowerCase())) return flag;
  }
  return '🌍';
}

export default function ScholarshipCard({ scholarship }) {
  const flag = getFlag(scholarship.country || '');

  return (
    <Link
      to={`/scholarships/${scholarship.id}`}
      className={`card p-5 flex flex-col gap-3 group ${scholarship.isFeatured ? 'border-2 border-yellow-400 dark:border-yellow-500' : ''}`}
    >
      {scholarship.isFeatured && (
        <span className="self-start text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full font-semibold">
          ⚡ Featured
        </span>
      )}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition">{scholarship.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${scholarship.type === 'Full Funding' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {scholarship.type}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{scholarship.org}</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
        <span className="flex items-center gap-1"><FiGlobe /> {flag} {scholarship.country}</span>
        <span className="flex items-center gap-1"><FiCalendar /> {scholarship.deadline}</span>
      </div>
      <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-500 flex items-center gap-1"><FiAward /> {scholarship.benefits}</span>
        <span className="text-primary-600 text-sm font-medium group-hover:underline">Learn More →</span>
      </div>
    </Link>
  );
}
