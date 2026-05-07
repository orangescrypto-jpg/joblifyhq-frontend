import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/common/Hero';
import JobCard from '../components/job/JobCard';
import ScholarshipCard from '../components/scholarship/ScholarshipCard';
import BlogCard from '../components/blog/BlogCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { getJobs } from '../services/firebase/jobs';
import { getScholarships } from '../services/firebase/scholarships';
import { getBlogs } from '../services/firebase/blog';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';

function isWithin7Days(createdAt) {
  if (!createdAt) return false;
  const posted = createdAt?.seconds
   ? new Date(createdAt.seconds * 1000)
    : new Date(createdAt);
  return (Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24) <= 7;
}

const COUNTRY_FLAGS = {
  'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Kenya': '🇰🇪', 'South Africa': '🇿🇦',
  'Uganda': '🇺🇬', 'Rwanda': '🇷🇼', 'Tanzania': '🇹🇿', 'Ethiopia': '🇪🇹',
  'Senegal': '🇸🇳', 'Cameroon': '🇨🇲', 'Zimbabwe': '🇿🇼', 'Zambia': '🇿🇲',
  'Botswana': '🇧🇼', 'Namibia': '🇳🇦', 'Egypt': '🇪🇬', 'Morocco': '🇲🇦',
  'Tunisia': '🇹🇳', "Côte d'Ivoire": '🇨🇮',
};

const CURRENCY_BY_COUNTRY = {
  'Nigeria': { symbol: '₦' },
  'Ghana': { symbol: 'GH₵' },
  'Kenya': { symbol: 'KSh' },
  'South Africa': { symbol: 'R' },
  'Uganda': { symbol: 'USh' },
  'Tanzania': { symbol: 'TSh' },
  'Ethiopia': { symbol: 'Br' },
  'Rwanda': { symbol: 'FRw' },
  'Egypt': { symbol: 'E£' },
  'Morocco': { symbol: 'MAD' },
};

const EXP_COLORS = {
  'Entry (0-2 yrs)': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Mid (3-5 yrs)': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Senior (5-10 yrs)': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Lead / Manager': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

function formatSalary(min, max, country) {
  const currency = CURRENCY_BY_COUNTRY[country] || { symbol: '₦' };
  const fmt = (n) => {
    if (!n) return null;
    if (n >= 1000000) return `${currency.symbol}${(n / 1000000).toFixed(1)}M`;
    return `${currency.symbol}${(n / 1000).toFixed(0)}k`;
  };
  const fMin = fmt(min);
  const fMax = fmt(max);
  if (!fMin &&!fMax) return 'N/A';
  if (!fMax) return `${fMin}/mo`;
  return `${fMin} – ${fMax}/mo`;
}

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salaryLoading, setSalaryLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResult, scholarshipsData, blogsData] = await Promise.all([
          getJobs(),
          getScholarships(),
          getBlogs(),
        ]);

        const jobsArray = Array.isArray(jobsResult)
         ? jobsResult
          : (jobsResult?.jobs || []);

        setFeaturedJobs(jobsArray.filter(j => j.isFeatured === true).slice(0, 5));
        setLatestJobs(jobsArray.slice(0, 3));
        setScholarships((scholarshipsData || []).slice(0, 5));
        setBlogs((blogsData || []).slice(0, 10));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSalaries = async () => {
      try {
        const snap = await getDocs(collection(db, 'salary_data'));
        const rows = snap.docs.map(d => ({ id: d.id,...d.data() }));
        rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setSalaries(rows.slice(0, 4));
      } catch {
        setSalaries([]);
      } finally {
        setSalaryLoading(false);
      }
    };

    fetchData();
    fetchSalaries();
  }, []);

  const Section = ({ title, link, badge, subtitle, children, columns = 'md:grid-cols-2 lg:grid-cols-3' }) => (
    <div className="mb-14">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {badge}
        </div>
        <Link to={link} className="text-primary-600 font-medium hover:underline text-sm">View All →</Link>
      </div>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{subtitle}</p>}
      {loading? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className={`grid grid-cols-1 ${columns} gap-6`}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Hero />

      {/* ── Featured Jobs ── */}
      {(loading || featuredJobs.length > 0) && (
        <Section
          title="Featured Jobs"
          link="/jobs"
          subtitle="Hand-picked and boosted opportunities across Africa"
          columns="md:grid-cols-2 lg:grid-cols-3"
        >
          {featuredJobs.map(j => <JobCard key={j.id} job={j} />)}
        </Section>
      )}

      {/* ── Latest Jobs ── */}
      <Section
        title="Latest Jobs"
        link="/jobs"
        subtitle="The most recently posted jobs across Africa"
        badge={
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-semibold border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            Live
          </span>
        }
        columns="md:grid-cols-2 lg:grid-cols-3"
      >
        {latestJobs.map(j => <JobCard key={j.id} job={j} />)}
      </Section>

      {/* ── Global Remote CTA ── */}
      <div className="mb-14">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-2">
              🌍 Global Remote Jobs
            </div>
            <h2 className="text-2xl font-bold mb-2">Get Hired by a US Company from Lagos.</h2>
            <p className="text-blue-100 max-w-xl text-sm">
              International companies actively hiring Nigerian & African talent — work remotely, earn in dollars, build a global career.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              {['🇺🇸 US Companies', '🇬🇧 UK Companies', '💰 Dollar Salaries', '🌍 Work from Africa'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/20 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
          <Link
            to="/remote-jobs"
            className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition whitespace-nowrap self-start md:self-center"
          >
            Browse Remote Jobs →
          </Link>
        </div>
      </div>

      {/* ── Latest Scholarships ── */}
      <Section
        title="Latest Scholarships"
        link="/scholarships"
        subtitle="Fresh funding opportunities for African students"
        columns="md:grid-cols-2 lg:grid-cols-3"
      >
        {scholarships.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
      </Section>

      {/* ── Student Hub CTA ── */}
      <div className="mb-14">
        <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎓 Fresh Graduate or Student?</h2>
            <p className="text-primary-100 max-w-xl">
              Internships, NYSC-friendly roles, graduate trainee programmes and entry-level jobs across Africa — all in one place.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 text-sm">
              {['Internships', 'NYSC Roles', 'Graduate Trainee', 'Entry Level', 'Volunteer'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/20 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
          <Link
            to="/students"
            className="bg-white text-primary-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition whitespace-nowrap self-start md:self-center"
          >
            Explore Student Hub →
          </Link>
        </div>
      </div>

      {/* ── Salary Guide Teaser ── */}
      <div className="mb-14">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600">
              <FiDollarSign size={18} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">African Salary Guide</h2>
            </div>
          </div>
          <Link to="/salaries" className="text-primary-600 font-medium hover:underline text-sm">
            View All →
          </Link>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Real salary ranges by role, city & experience — free, no account needed
        </p>

        {salaryLoading? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : salaries.length === 0? (
          <div className="bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-primary-100 dark:border-primary-800 rounded-2xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                💰 Know what you should be earning
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Browse verified salary ranges for hundreds of roles across Nigeria, Ghana, Kenya, South Africa and more — completely free.
              </p>
            </div>
            <Link to="/salaries" className="btn-primary whitespace-nowrap self-start md:self-center">
              Explore Salary Guide →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {salaries.map(s => (
                <Link
                  key={s.id}
                  to="/salaries"
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition flex items-center gap-4"
                >
                  <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition">
                    <FiDollarSign size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition">
                      {s.role}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {s.country && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {COUNTRY_FLAGS[s.country] || '🌍'} {s.city? `${s.city}, ${s.country}` : s.country}
                        </span>
                      )}
                      {s.experience && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EXP_COLORS[s.experience] || 'bg-gray-100 text-gray-600'}`}>
                          {s.experience}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-primary-600">
                      {formatSalary(s.salaryMin, s.salaryMax, s.country)}
                    </p>
                    {s.industry && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.industry}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-5 text-center">
              <Link
                to="/salaries"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-xl font-medium text-sm hover:bg-primary-100 dark:hover:bg-primary-900/40 transition border border-primary-200 dark:border-primary-800"
              >
                <FiTrendingUp size={15} />
                See full salary guide for all roles & cities →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ── Latest Blog Posts ── */}
      <Section
        title="Recent Articles"
        link="/blog"
        subtitle="Career tips, scholarship guides and industry insights"
        columns="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {blogs.map(b => <BlogCard key={b.id} post={b} />)}
      </Section>
    </>
  );
}
