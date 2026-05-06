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
import { FiGlobe, FiZap, FiAlertCircle } from 'react-icons/fi';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from all sources
        const [jobsResult, scholarshipsData, blogsData, remoteResult] = await Promise.all([
          getJobs({}, 20),
          getScholarships(),
          getBlogs(),
          getJobs({ isRemote: true }, 4)
        ]);

        // Handle response formats (sometimes API returns { jobs: [] }, sometimes just [])
        const jobsArray = Array.isArray(jobsResult) ? jobsResult : (jobsResult?.jobs || []);
        const remoteArray = Array.isArray(remoteResult) ? remoteResult : (remoteResult?.jobs || []);

        // Debugging: Check if you actually have data in your console (F12)
        console.log('🔍 Data Check:', {
          jobs: jobsArray.length,
          remote: remoteArray.length,
          scholarships: scholarshipsData?.length || 0,
          blogs: blogsData?.length || 0
        });

        // Set State
        setJobs(sortFeaturedFirst(jobsArray).slice(0, 6)); // Show top 6 featured jobs
        setActiveJobs(jobsArray.filter(j => isActivelyHiring(j.createdAt)).slice(0, 4));
        setRemoteJobs(remoteArray.slice(0, 4));
        setScholarships(sortFeaturedFirst(scholarshipsData || []).slice(0, 6)); // Show top 6 scholarships
        setBlogs((blogsData || []).slice(0, 10)); // Show top 10 blogs
      } catch (error) {
        console.error('Error fetching home ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const Section = ({ title, link, children, linkLabel = 'View All →' }) => (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {children && children.length > 0 && (
          <Link to={link} className="text-primary-600 font-medium hover:underline">{linkLabel}</Link>
        )}
      </div>
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : children && children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <FiAlertCircle className="mx-auto text-3xl text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No {title.toLowerCase()} available yet.</p>
          <p className="text-gray-400 text-sm">Check back later for updates!</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Hero />

      {/* 1. Featured Jobs */}
      <Section title="Featured Jobs" link="/jobs">
        {jobs.map(j => <JobCard key={j.id} job={j} />)}
      </Section>

      {/* 2. Actively Hiring */}
      {(loading || activeJobs.length > 0) && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse inline-block"></span>
              Actively Hiring
            </h2>
            <Link to="/jobs" className="text-primary-600 font-medium hover:underline">View All →</Link>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 -mt-4">Posted within the last 7 days — fresh opportunities only</p>
          {loading ? <LoadingSkeleton count={2} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeJobs.map(j => <JobCard key={j.id} job={j} />)}
            </div>
          )}
        </div>
      )}

      {/* 3. Global Remote Section */}
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
            <Link
              to="/jobs?remote=1"
              className="flex-shrink-0 px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition text-center"
            >
              Browse Remote Jobs →
            </Link>
          </div>
        </div>
        {loading ? <LoadingSkeleton count={2} /> : remoteJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remoteJobs.map(j => <JobCard key={j.id} job={j} />)}
          </div>
        ) : (
          <div className="text-center py-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-blue-600 dark:text-blue-400 text-sm">🌍 Global Remote jobs coming soon!</p>
          </div>
        )}
      </div>

      {/* 4. Scholarships */}
      <Section title="Latest Scholarships" link="/scholarships">
        {scholarships.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
      </Section>

      {/* 5. Student Hub CTA */}
      <div className="mb-12">
        <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎓 Fresh Graduate or Student?</h2>
            <p className="text-primary-100 max-w-xl">
              We have a dedicated hub just for you — internships, NYSC-friendly roles, graduate trainee programmes and entry-level jobs across Africa.
            </p>
          </div>
          <Link to="/students" className="flex-shrink-0 px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition text-center">
            Go to Student Hub →
          </Link>
        </div>
      </div>

      {/* 6. Blog Section (Added This!) */}
      <Section title="Career Insights & Tips" link="/blog" linkLabel="Read All Articles →">
        {blogs.map(b => <BlogCard key={b.id} post={b} />)}
      </Section>
    </>
  );
}
