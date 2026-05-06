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
import { FiGlobe, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const sortFeaturedFirst = (arr) =>
  [...arr].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

function isActivelyHiring(createdAt) {
  if (!createdAt) return false;
  const posted = createdAt?.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt);
  return (Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24) <= 7;
}

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [remoteJobs, setRemoteJobs] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toggles for "Show Few More"
  const [showMoreJobs, setShowMoreJobs] = useState(false);
  const [showMoreScholarships, setShowMoreScholarships] = useState(false);
  const [showMoreBlogs, setShowMoreBlogs] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch main data EXACTLY like your old working code (no arguments passed)
        const [jobsResult, scholarshipsData, blogsData] = await Promise.all([
          getJobs(),
          getScholarships(),
          getBlogs()
        ]);

        // Extract arrays EXACTLY like your old working code
        const jobsArray = Array.isArray(jobsResult) ? jobsResult : (jobsResult?.jobs || []);

        // Set states (Updated to 6 for jobs/scholarships as requested)
        setJobs(sortFeaturedFirst(jobsArray).slice(0, 6));
        setScholarships(sortFeaturedFirst(scholarshipsData || []).slice(0, 6));
        setBlogs((blogsData || []).slice(0, 10));

        // Calculate actively hiring from the fetched jobs
        setActiveJobs(jobsArray.filter(j => isActivelyHiring(j.createdAt)).slice(0, 4));

        // 2. Fetch remote jobs SEPARATELY so it doesn't break the main data if it fails
        try {
          const remoteResult = await getJobs({ isRemote: true });
          const remoteArray = Array.isArray(remoteResult) ? remoteResult : (remoteResult?.jobs || []);
          setRemoteJobs(remoteArray.slice(0, 4));
        } catch (remoteError) {
          console.error("Could not fetch remote jobs:", remoteError);
        }

      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Reusable "Show Few More" Button ---
  const ShowMoreButton = ({ visibleCount, totalCount, expanded, onToggle }) => {
    if (visibleCount >= totalCount) return null;
    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-all duration-200 bg-white dark:bg-gray-800 hover:shadow-md"
        >
          {expanded ? (
            <>Show Less <FiChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show Few More ({totalCount - 3} remaining) <FiChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>
    );
  };

  // --- Section Component with Expand/Collapse ---
  const ExpandableSection = ({ title, link, children, linkLabel = 'View All →', visibleCount, totalCount, expanded, onToggle, columns = 'md:grid-cols-2 lg:grid-cols-3' }) => (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <Link to={link} className="text-primary-600 font-medium hover:underline text-sm">{linkLabel}</Link>
      </div>
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : totalCount === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No {title.toLowerCase()} available at the moment.</p>
      ) : (
        <>
          <div className={`grid grid-cols-1 ${columns} gap-6 transition-all duration-300`}>
            {children}
          </div>
          <ShowMoreButton visibleCount={visibleCount} totalCount={totalCount} expanded={expanded} onToggle={onToggle} />
        </>
      )}
    </div>
  );

  // Initially show 3 items
  const INITIAL_VISIBLE = 3;
  const visibleJobs = showMoreJobs ? jobs : jobs.slice(0, INITIAL_VISIBLE);
  const visibleScholarships = showMoreScholarships ? scholarships : scholarships.slice(0, INITIAL_VISIBLE);
  const visibleBlogs = showMoreBlogs ? blogs : blogs.slice(0, INITIAL_VISIBLE);

  return (
    <>
      <Hero />

      {/* ─── Featured Jobs ─── */}
      <ExpandableSection
        title="Featured Jobs"
        link="/jobs"
        visibleCount={visibleJobs.length}
        totalCount={jobs.length}
        expanded={showMoreJobs}
        onToggle={() => setShowMoreJobs(prev => !prev)}
      >
        {visibleJobs.map(j => <JobCard key={j.id} job={j} />)}
      </ExpandableSection>

      {/* ─── Actively Hiring ─── */}
      {(loading || activeJobs.length > 0) && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse inline-block"></span>
              Actively Hiring
            </h2>
            <Link to="/jobs" className="text-primary-600 font-medium hover:underline text-sm">View All →</Link>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 -mt-4">Posted within the last 7 days — fresh opportunities only</p>
          {loading ? <LoadingSkeleton count={2} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeJobs.map(j => <JobCard key={j.id} job={j} />)}
            </div>
          )}
        </div>
      )}

      {/* ─── Global Remote ─── */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiGlobe /> Get Hired Globally from Africa
              </h2>
              <p className="text-blue-100 mt-2 max-w-xl">
                International companies hiring Nigerian & African talent remotely. Work for US, UK & EU companies from Lagos, Accra, Nairobi — no relocation needed.
              </p>
            </div>
            <Link to="/jobs?remote=1" className="flex-shrink-0 px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition text-center">
              Browse Remote Jobs →
            </Link>
          </div>
        </div>
        {loading ? <LoadingSkeleton count={2} /> : remoteJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remoteJobs.map(j => <JobCard key={j.id} job={j} />)}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">Remote jobs coming soon — employers can mark roles as Global Remote when posting.</p>
        )}
      </div>

      {/* ─── Latest Scholarships ─── */}
      <ExpandableSection
        title="Latest Scholarships"
        link="/scholarships"
        visibleCount={visibleScholarships.length}
        totalCount={scholarships.length}
        expanded={showMoreScholarships}
        onToggle={() => setShowMoreScholarships(prev => !prev)}
      >
        {visibleScholarships.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
      </ExpandableSection>

      {/* ─── Student Hub CTA ─── */}
      <div className="mb-12">
        <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎓 Fresh Graduate or Student?</h2>
            <p className="text-primary-100 max-w-xl">
              We have a dedicated hub just for you — internships, NYSC-friendly roles, graduate trainee programmes and entry-level jobs across Africa.
            </p>
            {/* Restored your old tags here */}
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

      {/* ─── Latest Articles & Blogs (Below Student Hub) ─── */}
      <ExpandableSection
        title="Recent Articles"
        link="/blog"
        linkLabel="Read All →"
        visibleCount={visibleBlogs.length}
        totalCount={blogs.length}
        expanded={showMoreBlogs}
        onToggle={() => setShowMoreBlogs(prev => !prev)}
        columns="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {/* FIXED: Changed blog={b} to post={b} to match your old working code */}
        {visibleBlogs.map(b => <BlogCard key={b.id} post={b} />)}
      </ExpandableSection>
    </>
  );
}
