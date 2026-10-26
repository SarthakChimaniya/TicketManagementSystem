import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Ticket, Heart, Star, Shield, QrCode, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const UserProfile = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'bookings';

  const [bookings, setBookings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile form states
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load bookings
        const bRes = await userAPI.getMyBookings();
        if (bRes.data.success) setBookings(bRes.data.data);

        // Load watchlist
        const wRes = await userAPI.getWatchlist();
        if (wRes.data.success) setWatchlist(wRes.data.data);

        // Load reviews
        const rRes = await userAPI.getReviews();
        if (rRes.data.success) setReviews(rRes.data.data);
      } catch (err) {
        console.warn('Unable to load user history from backend:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setSavingProfile(true);

    try {
      const payload = {};
      if (username) payload.username = username;
      if (password) payload.password = password;

      const res = await userAPI.updateProfile(payload);
      if (res.data.success) {
        setProfileMsg('Profile updated successfully!');
        setPassword('');
      }
    } catch (err) {
      setProfileErr(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveWatchlist = async (movieId) => {
    try {
      await userAPI.removeFromWatchlist(movieId);
      setWatchlist(watchlist.filter((item) => item.movieId !== movieId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-rose-500/20">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user?.username}</h1>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
              {user?.role || 'User'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-8">
          <div>
            <p className="text-2xl font-black text-white">{bookings.length}</p>
            <p className="text-xs text-slate-400 uppercase font-semibold">Bookings</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{watchlist.length}</p>
            <p className="text-xs text-slate-400 uppercase font-semibold">Watchlist</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{reviews.length}</p>
            <p className="text-xs text-slate-400 uppercase font-semibold">Reviews</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setSearchParams({ tab: 'bookings' })}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'bookings'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>My Booking History</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'watchlist' })}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'watchlist'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Watchlist</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'reviews' })}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>My Reviews</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'settings' })}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* TAB CONTENT: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.bookingId || booking._id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {booking.bookingId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-white">
                    Show ID: {booking.showId}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Reserved Seats:{' '}
                    <span className="font-bold text-slate-200">
                      {Array.isArray(booking.ticketsData)
                        ? booking.ticketsData.join(', ')
                        : JSON.stringify(booking.ticketsData)}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Total Paid</p>
                    <p className="text-lg font-black text-white">₹{booking.totalAmount}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    <QrCode className="w-9 h-9" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-900/30 border border-slate-800/80 p-8 space-y-2">
              <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No historical bookings found</h3>
              <p className="text-xs text-slate-400">Your booked movie tickets will appear here with scannable QR tokens.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Watchlist */}
      {activeTab === 'watchlist' && (
        <div>
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {watchlist.map((item) => (
                <div key={item._id} className="relative group">
                  <MovieCard
                    movie={item.movie || { movieId: item.movieId, movieName: `Movie ${item.movieId}` }}
                    isFavorited={true}
                    onWatchlistChange={() => handleRemoveWatchlist(item.movieId)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-900/30 border border-slate-800/80 p-8 space-y-2">
              <Heart className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Your watchlist is empty</h3>
              <p className="text-xs text-slate-400">Click the heart icon on any movie card to save it for later.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">Movie: {rev.movieId}</span>
                    <span className="flex items-center space-x-1 text-xs text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rev.rating}/5</span>
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rev.adminModeration
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {rev.adminModeration ? 'Approved' : 'Pending Moderation'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">"{rev.reviewText}"</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-900/30 border border-slate-800/80 p-8 space-y-2">
              <Star className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No reviews submitted yet</h3>
              <p className="text-xs text-slate-400">Share your ratings and movie feedback with the cinema community.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-md p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-white text-base">Update Profile</h3>

          {profileMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileMsg}</span>
            </div>
          )}

          {profileErr && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{profileErr}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                New Password (leave empty to keep current)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md disabled:opacity-50"
            >
              {savingProfile ? 'Saving Changes...' : 'Update Account'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default UserProfile;
