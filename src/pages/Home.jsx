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

        // FIXED: getJobs() returns { jobs, lastDoc, hasMore } not an array
        const jobsArray = Array.isArray(jobsResult) ? jobsResult : (jobsResult?.jobs || []);

        setJobs(jobsArray.slice(0, 3));
        setScholarships((scholarshipsData || []).slice(0, 3));
        setBlogs((blogsData || []).slice(0, 6));
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
      {loading ? <LoadingSkeleton count={3} /> : (
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
      <Section title="Recent Articles" link="/blog">
        {blogs.map(b => <BlogCard key={b.id} post={b} />)}
      </Section>
    </>
  );
}
