import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

export default function Hero() {
  const [query, setQuery] = useState('');

  return (
    <section className="relative bg-white dark:bg-gray-900 pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        
        {/* "New" Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 mb-8 animate-fade-in-up">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">New: Scholarships portal live</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
          Find your next <span className="text-primary-600">job</span> or <br className="hidden md:block" />
          <span className="text-primary-600">scholarship</span> faster
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          JoblifyHQ curates verified opportunities and career guides to help you reach your goals.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, scholarships, or topics..."
            className="w-full pl-11 pr-32 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-sm hover:shadow-md"
          />
          <button className="absolute right-2 top-2 bottom-2 px-5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition flex items-center gap-2">
            Search <FiArrowRight />
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          <span>Popular:</span>
          <Link to="/jobs" className="hover:text-primary-600 underline decoration-2 decoration-primary-200 underline-offset-4">Remote Jobs</Link>
          <Link to="/scholarships" className="hover:text-primary-600 underline decoration-2 decoration-primary-200 underline-offset-4">STEM Scholarships</Link>
          <Link to="/blog" className="hover:text-primary-600 underline decoration-2 decoration-primary-200 underline-offset-4">CV Templates</Link>
        </div>
      </div>
    </section>
  );
}
