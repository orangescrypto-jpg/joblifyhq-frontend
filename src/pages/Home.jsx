import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/common/Hero';
import JobCard from '../components/job/JobCard';
import ScholarshipCard from '../components/scholarship/ScholarshipCard';
import BlogCard from '../components/blog/BlogCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { fetchJobs, fetchScholarships, fetchBlogs } from '../services/mockData';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchJobs(), fetchScholarships(), fetchBlogs()])
      .then(([j, s, b]) => {
        setJobs(j.slice(0, 3));
        setScholarships(s.slice(0, 3));
        setBlogs(b.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  const Section = ({ title, link, children }) => (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
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
