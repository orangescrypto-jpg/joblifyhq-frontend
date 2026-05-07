import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

const TYPE_STYLES = {
  job:         { label: '💼 New Job',         color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/30'   },
  scholarship: { label: '🎓 New Scholarship', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  salary:      { label: '💰 Salary Added',    color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/30'  },
};

function timeAgo(ts) {
  if (!ts) return '';
  const date = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isWithin24Hours(ts) {
  if (!ts) return false;
  const date = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return (Date.now() - date.getTime()) / (1000 * 60 * 60) <= 24;
}

export default function LiveTicker() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Fetch all three in parallel — no orderBy to avoid index issues
        const [jobsSnap, scholsSnap, salarySnap] = await Promise.all([
          getDocs(collection(db, 'jobs')),
          getDocs(collection(db, 'scholarships')),
          getDocs(collection(db, 'salary_data')),
        ]);

        const jobs = jobsSnap.docs
          .map(d => ({ id: d.id, ...d.data(), _type: 'job' }))
          .filter(j => isWithin24Hours(j.createdAt))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 1); // 1 latest job

        const scholarships = scholsSnap.docs
          .map(d => ({ id: d.id, ...d.data(), _type: 'scholarship' }))
          .filter(s => isWithin24Hours(s.createdAt))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 2); // 2 latest scholarships

        const salaries = salarySnap.docs
          .map(d => ({ id: d.id, ...d.data(), _type: 'salary' }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 2); // 2 latest salaries

        const merged = [...scholarships, ...jobs, ...salaries];
        setItems(merged);
      } catch (err) {
        console.error('Ticker fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Don't render if nothing to show
  if (loading || items.length === 0) return null;

  // Duplicate items so the scroll loops seamlessly
  const tickerItems = [...items, ...items, ...items];

  const getLink = (item) => {
    if (item._type === 'job') return `/jobs/${item.id}`;
    if (item._type === 'scholarship') return `/scholarships/${item.id}`;
    return '/salaries';
  };

  const getLabel = (item) => {
    if (item._type === 'job') return `${item.title} @ ${item.company}`;
    if (item._type === 'scholarship') return `${item.title} — ${item.org}`;
    return `${item.role} · ${item.country || 'Africa'}`;
  };

  return (
    <div
      className="w-full bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="flex items-center">

        {/* Left badge — fixed, never scrolls */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white z-10 shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            🔥 Live Updates
          </span>
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />

          <div
            ref={trackRef}
            className="flex items-center gap-0"
            style={{
              animation: `tickerScroll 30s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
              width: 'max-content',
            }}
          >
            {tickerItems.map((item, idx) => {
              const style = TYPE_STYLES[item._type];
              return (
                <Link
                  key={`${item.id}-${idx}`}
                  to={getLink(item)}
                  className="flex items-center gap-2.5 px-5 py-2.5 group whitespace-nowrap border-r border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {/* Type badge */}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.color} whitespace-nowrap`}>
                    {style.label}
                  </span>

                  {/* Title */}
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 transition max-w-xs truncate">
                    {getLabel(item)}
                  </span>

                  {/* Location */}
                  {(item.country || item.location) && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      📍 {item.country || item.location}
                    </span>
                  )}

                  {/* Time ago */}
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {timeAgo(item.createdAt)}
                  </span>

                  {/* Separator dot */}
                  <span className="text-gray-200 dark:text-gray-700 ml-2 text-lg">•</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inject the keyframe animation */}
      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
