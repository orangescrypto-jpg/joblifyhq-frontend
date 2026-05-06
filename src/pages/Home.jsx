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

function isWithin7Days(createdAt) {
  if (!createdAt) return false;
  const posted = createdAt?.seconds
    ? new Date(createdAt.seconds * 1000)
    : new Date(createdAt);
  return (Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24) <= 7;
}

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResult, scholarshipsData, blogsData] = await Promise.all([
          getJobs(),
          getScholarships(),
          getBlogs()
        ]);

        const jobsArray = Array.isArray(jobsResult)
          ? jobsResult
          : (jobsResult?.jobs || []);

        // Featured = only boosted jobs (isFeatured === true), max 5
        const featured = jobsArray
          .filter(j => j.isFeatured === true)
          .slice(0, 5);

        // Latest = most recent 3 jobs by createdAt (any job, boosted or not)
        // sorted newest first — Firebase already returns newest first
        const latest = jobsArray.slice(0, 3);

        setFeaturedJobs(featured);
        setLatestJobs(latest);

        // Scholarships — latest 5, no featured filter
        setScholarships((scholarshipsData || []).slice(0, 5));

        // Blog — latest 10
        setBlogs((blogsData || []).slice(0, 10));

      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      {loading ? (
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

      {/* ── Featured Jobs (boosted only, max 5) ── */}
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

      {/* ── Latest Jobs (newest 3 posts, with active hiring badge if within 7 days) ── */}
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

      {/* ── Latest Scholarships (5) ── */}
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

      {/* ── Latest Blog Posts (10) ── */}
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
