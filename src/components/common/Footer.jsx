import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} JoblifyHQ. All rights reserved.</p>
          <div className="flex space-x-6 text-sm text-gray-600">
            <Link to="/privacy-policy" className="hover:text-primary-600">Privacy</Link>
            <Link to="/terms" className="hover:text-primary-600">Terms</Link>
            <Link to="/contact" className="hover:text-primary-600">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
