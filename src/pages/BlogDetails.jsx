import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiShare2, FiArrowLeft } from 'react-icons/fi';
import { fetchBlogs } from '../services/mockData';
import BlogCard from '../components/blog/BlogCard';

export default function BlogDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs().then(data => {
      setPost(data.find(p => p.id === id) || null);
      setRelated(data.filter(p => p.id !== id).slice(0, 2));
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="animate-pulse space-y-6 p-10"><div className="h-64 bg-gray-200 rounded-xl"></div><div className="h-8 w-2/3 bg-gray-200 rounded"></div><div className="h-4 w-1/3 bg-gray-200 rounded"></div></div>;
  if (!post) return <div className="text-center py-20"><h2 className="text-2xl font-bold mb-2">Article Not Found</h2><Link to="/blog" className="btn-primary">Back to Blog</Link></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/blog" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition">
        <FiArrowLeft /> Back to Articles
      </Link>

      <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-64 md:h-80 object-cover" />
        <div className="p-6 md:p-8">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-3">{post.category}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
            <span className="flex items-center gap-2"><FiUser /> {post.author}</span>
            <span className="flex items-center gap-2"><FiCalendar /> {post.date}</span>
            <button className="ml-auto flex items-center gap-2 hover:text-primary-600 transition"><FiShare2 /> Share Article</button>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">{post.excerpt}</p>
            <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-8">Key Takeaways</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Focus on consistent skill development</li>
              <li>Build a strong professional network</li>
              <li>Track your applications systematically</li>
            </ul>
            <p>Start applying today and take the next step in your career journey.</p>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map(p => <BlogCard key={p.id} post={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
