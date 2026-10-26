import React, { useState, useEffect } from 'react';
import {
  Film,
  TrendingUp,
  Ticket,
  Building,
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  DollarSign,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState({
    totalMovies: 4,
    totalTheatres: 2,
    totalShows: 6,
    totalBookings: 12,
    totalRevenue: 34500,
    pendingReviewsToModerate: 1
  });

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal: Add Movie
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [movieForm, setMovieForm] = useState({
    movieId: '',
    movieName: '',
    genres: '',
    runtime: '',
    certification: 'UA',
    releaseDate: new Date().toISOString().split('T')[0],
    description: '',
    cast: '',
    poster: ''
  });
  const [movieFormLoading, setMovieFormLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [dashRes, moviesRes, theatresRes, revRes, revsRes] = await Promise.allSettled([
        adminAPI.getDashboard(),
        adminAPI.getMovies(),
        adminAPI.getTheatres(),
        adminAPI.getRevenueReport(),
        adminAPI.getReviews()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data.success) {
        setDashboardStats(dashRes.value.data.data);
      }
      if (moviesRes.status === 'fulfilled' && moviesRes.value.data.success) {
        setMovies(moviesRes.value.data.data);
      }
      if (theatresRes.status === 'fulfilled' && theatresRes.value.data.success) {
        setTheatres(theatresRes.value.data.data);
      }
      if (revRes.status === 'fulfilled' && revRes.value.data.success) {
        setRevenueReport(revRes.value.data.report);
      }
      if (revsRes.status === 'fulfilled' && revsRes.value.data.success) {
        setReviews(revsRes.value.data.data);
      }
    } catch (err) {
      console.warn('Backend admin sync failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setMovieFormLoading(true);

    try {
      const payload = {
        movieId: movieForm.movieId.trim(),
        movieName: movieForm.movieName.trim(),
        genres: movieForm.genres.split(',').map((g) => g.trim()).filter(Boolean),
        runtime: Number(movieForm.runtime),
        certification: movieForm.certification,
        releaseDate: movieForm.releaseDate,
        description: movieForm.description,
        cast: movieForm.cast.split(',').map((c) => c.trim()).filter(Boolean),
        media: { poster: movieForm.poster }
      };

      const res = await adminAPI.createMovie(payload);
      if (res.data.success) {
        setActionMsg('Movie created successfully!');
        setIsAddMovieModalOpen(false);
        setMovieForm({
          movieId: '',
          movieName: '',
          genres: '',
          runtime: '',
          certification: 'UA',
          releaseDate: new Date().toISOString().split('T')[0],
          description: '',
          cast: '',
          poster: ''
        });
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create movie.');
    } finally {
      setMovieFormLoading(false);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm(`Are you sure you want to delete movie ${movieId}?`)) return;

    try {
      await adminAPI.deleteMovie(movieId);
      setMovies(movies.filter((m) => m.movieId !== movieId));
      setActionMsg('Movie deleted successfully.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete movie.');
    }
  };

  const handleModerateReview = async (id, approve) => {
    try {
      await adminAPI.moderateReview(id, { adminModeration: approve });
      setReviews(
        reviews.map((r) => (r._id === id ? { ...r, adminModeration: approve } : r))
      );
      setActionMsg(approve ? 'Review approved.' : 'Review set to pending.');
    } catch (err) {
      alert('Failed to update review moderation status.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Permanently delete this user review?')) return;
    try {
      await adminAPI.deleteReview(id);
      setReviews(reviews.filter((r) => r._id !== id));
      setActionMsg('Review permanently deleted.');
    } catch (err) {
      alert('Failed to delete review.');
    }
  };

  // If unauthenticated or standard user without admin rights
  if (!isAdmin) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The dashboard is restricted to authorized platform administrators. Please log in with administrator credentials to manage catalog and reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Admin Console
            </span>
            <span className="text-xs text-slate-400">Operator: {user?.username}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">Platform Management</h1>
        </div>

        {activeTab === 'movies' && (
          <button
            onClick={() => setIsAddMovieModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Movie</span>
          </button>
        )}
      </div>

      {/* Notification Toast */}
      {actionMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 gap-2 sm:gap-4">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
          { id: 'movies', label: 'Manage Movies', icon: Film },
          { id: 'theatres', label: 'Manage Theatres', icon: Building },
          { id: 'revenue', label: 'Revenue Reports', icon: DollarSign },
          { id: 'reviews', label: 'Review Moderation', icon: Star }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
                isActive
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <p className="text-2xl font-black text-rose-400">₹{dashboardStats.totalRevenue?.toLocaleString() || '0'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Bookings</span>
              <p className="text-2xl font-black text-white">{dashboardStats.totalBookings || '0'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Movies</span>
              <p className="text-2xl font-black text-white">{dashboardStats.totalMovies || '0'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Theatres</span>
              <p className="text-2xl font-black text-white">{dashboardStats.totalTheatres || '0'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE MOVIES TAB */}
      {activeTab === 'movies' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">Movie ID</th>
                  <th className="p-4 font-bold">Title</th>
                  <th className="p-4 font-bold">Genres</th>
                  <th className="p-4 font-bold">Runtime</th>
                  <th className="p-4 font-bold">Rating</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {movies.map((m) => (
                  <tr key={m.movieId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-rose-400">{m.movieId}</td>
                    <td className="p-4 font-extrabold text-white">{m.movieName}</td>
                    <td className="p-4 text-slate-300">{Array.isArray(m.genres) ? m.genres.join(', ') : m.genres}</td>
                    <td className="p-4">{m.runtime}m</td>
                    <td className="p-4 text-amber-400 font-bold flex items-center space-x-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{m.averageRating || 4.5}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteMovie(m.movieId)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MANAGE THEATRES TAB */}
      {activeTab === 'theatres' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">Theatre ID</th>
                  <th className="p-4 font-bold">Theatre Name</th>
                  <th className="p-4 font-bold">Location</th>
                  <th className="p-4 font-bold">Capacities (B / M / L)</th>
                  <th className="p-4 font-bold">Tier Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {theatres.map((t) => (
                  <tr key={t.theatreId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">{t.theatreId}</td>
                    <td className="p-4 font-extrabold text-white">{t.theatreName}</td>
                    <td className="p-4 text-slate-300">{t.location}</td>
                    <td className="p-4">{t.balconySeats} / {t.middleSeats} / {t.lowerSeats}</td>
                    <td className="p-4 text-rose-400 font-bold">
                      ₹{t.balconySeatPrice} / ₹{t.middleSeatPrice} / ₹{t.lowerSeatPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. REVENUE REPORTS TAB */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Gross Ticket Sales</span>
              <p className="text-3xl font-black text-emerald-400 mt-1">
                ₹{revenueReport?.summary?.totalRevenue?.toLocaleString() || dashboardStats.totalRevenue || 0}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Confirmed Bookings</span>
              <p className="text-3xl font-black text-white mt-1">
                {revenueReport?.summary?.confirmedBookings || dashboardStats.totalBookings || 0}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Avg Transaction Value</span>
              <p className="text-3xl font-black text-rose-400 mt-1">
                ₹{Math.round(revenueReport?.summary?.averageBookingValue || 650)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. REVIEW MODERATION TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-300">{rev.userEmail}</span>
                    <span className="text-xs text-slate-500">&bull; Movie: {rev.movieId}</span>
                    <span className="flex items-center text-xs text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{rev.rating}/5</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 italic">"{rev.reviewText}"</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleModerateReview(rev._id, !rev.adminModeration)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      rev.adminModeration
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {rev.adminModeration ? 'Revoke Approval' : 'Approve Review'}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev._id)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10"
                    title="Delete abusive review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-900/30 border border-slate-800 p-8 space-y-2">
              <Star className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No reviews pending moderation</h3>
            </div>
          )}
        </div>
      )}

      {/* CREATE MOVIE MODAL */}
      {isAddMovieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-lg">Add New Movie</h3>
              <button
                onClick={() => setIsAddMovieModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMovie} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Movie ID</label>
                  <input
                    type="text"
                    required
                    placeholder="MOV-105"
                    value={movieForm.movieId}
                    onChange={(e) => setMovieForm({ ...movieForm, movieId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Movie Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Avatar 3"
                    value={movieForm.movieName}
                    onChange={(e) => setMovieForm({ ...movieForm, movieName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Action, Sci-Fi"
                    value={movieForm.genres}
                    onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Runtime (minutes)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={movieForm.runtime}
                    onChange={(e) => setMovieForm({ ...movieForm, runtime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Poster Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={movieForm.poster}
                  onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Cast Members (comma separated)</label>
                <input
                  type="text"
                  placeholder="Actor A, Actor B"
                  value={movieForm.cast}
                  onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={movieFormLoading}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  {movieFormLoading ? 'Creating Movie...' : 'Save & Publish Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
