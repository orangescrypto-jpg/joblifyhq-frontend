import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import LiveTicker from '../components/common/LiveTicker';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <LiveTicker />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
