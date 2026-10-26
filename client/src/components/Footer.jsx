import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, Shield, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">
                i<span className="text-rose-500">Movies</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premium movie ticket booking platform with real-time seat locking, instant checkout, and digital QR e-tickets.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-rose-400 transition-colors">Home</Link></li>
              <li><Link to="/movies" className="hover:text-rose-400 transition-colors">Movie Listings</Link></li>
              <li><Link to="/profile?tab=bookings" className="hover:text-rose-400 transition-colors">My Bookings</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Socket.io Real-Time Locks</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Secure Payments Gateway</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Custom Watchlists</span>
              </li>
            </ul>
          </div>

          {/* Admin link & Status */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Administration</h4>
            <p className="text-xs text-slate-400 mb-2">
              Cinema managers & operators can access platform analytics and movie scheduling.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Management Portal &rarr;</span>
            </Link>
          </div>

        </div>

        <div className="border-t border-slate-900 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} iMovies Cinema Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built with React, Express, MongoDB & Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
