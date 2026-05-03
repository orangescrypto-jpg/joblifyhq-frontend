import { useState } from 'react';
import SearchBar from './SearchBar';

export default function Hero({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl p-8 md:p-12 mb-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-3">Find Your Next Opportunity</h1>
      <p className="text-primary-100 mb-6 max-w-xl">Discover jobs, scholarships, and career insights tailored to your goals.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
        <SearchBar 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search jobs, scholarships, or articles..." 
          className="bg-white text-gray-900 placeholder:text-gray-500 border-0" 
        />
        <button type="submit" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 px-6 whitespace-nowrap">
          Search
        </button>
      </form>
    </section>
  );
}
