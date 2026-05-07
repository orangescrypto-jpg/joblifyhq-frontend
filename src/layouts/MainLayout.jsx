import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import LiveTicker from '../components/common/LiveTicker';

export default function MainLayout() {
  const location = useLocation();
  // Only show ticker on the home page
  const showTicker = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showTicker && <LiveTicker />}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
