import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModals from './components/AuthModals';

// Page Views
import Home from './pages/Home';
import MovieListings from './pages/MovieListings';
import ShowDetails from './pages/ShowDetails';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import BookingConfirmation from './pages/BookingConfirmation';

function NotFound() {
  return (
    <div className="py-24 text-center space-y-4">
      <h1 className="text-6xl font-black text-rose-500">404</h1>
      <h2 className="text-xl font-bold text-white">Scene Missing! Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">
        The page you are looking for does not exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase"
      >
        Return to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        {/* Navigation Bar */}
        <Navbar />

        {/* Global Auth Modals */}
        <AuthModals />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MovieListings />} />
            <Route path="/movies/:movieId" element={<ShowDetails />} />
            <Route path="/shows/:showId" element={<ShowDetails />} />
            <Route path="/seat-selection/:showId" element={<SeatSelection />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/booking-confirmed" element={<BookingConfirmation />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
