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

const sortFeaturedFirst = (arr) =>
  [...arr].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

export default function Home() {
  const [jobs, setJobs] = useState([]);
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

        const jobsArray = Array.isArray(jobsResult) ? jobsResult : (jobsResult?.jobs || []);

        setJobs(sortFeaturedFirst(jobsArray).slice(0, 5));
        setScholarships(sortFeaturedFirst(scholarshipsData || []).slice(0, 5));
        setBlogs((blogsData || []).slice(0, 10));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const Section = ({ title, link, children }) => (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <Link to={link} className="text-primary-600 font-medium hover:underline">View All →</Link>
      </div>
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Hero />

      <Section title="Featured Jobs" link="/jobs">
        {jobs.map(j => <JobCard key={j.id} job={j} />)}
      </Section>

      <Section title="Latest Scholarships" link="/scholarships">
        {scholarships.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
      </Section>

      {/* Student Hub CTA */}
      <div className="mb-12">
        <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎓 Fresh Graduate or Student?</h2>
            <p className="text-primary-100 max-w-xl">
              We have a dedicated hub just for you — internships, NYSC-friendly roles, graduate trainee programmes and entry-level jobs across Africa.
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

      <Section title="Recent Articles" link="/blog">
        {blogs.map(b => <BlogCard key={b.id} post={b} />)}
      </Section>
    </>
  );
}
