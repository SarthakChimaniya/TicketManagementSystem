import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  Ticket,
  Heart,
  Star,
  Shield,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Plus,
  Send,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'bookings';

  const [bookings, setBookings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [availableMovies, setAvailableMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewMovieId, setReviewMovieId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewErr, setReviewErr] = useState('');

  // Selected Booking for E-Ticket Modal View
  const [selectedTicket, setSelectedTicket] = useState(null);

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

        const [bRes, wRes, rRes, mRes] = await Promise.allSettled([
          userAPI.getMyBookings(),
          userAPI.getWatchlist(),
          userAPI.getReviews(),
          movieAPI.getAll()
        ]);

        if (bRes.status === 'fulfilled' && bRes.value.data.success) {
          setBookings(bRes.value.data.data);
        }
        if (wRes.status === 'fulfilled' && wRes.value.data.success) {
          setWatchlist(wRes.value.data.data);
        }
        if (rRes.status === 'fulfilled' && rRes.value.data.success) {
          setReviews(rRes.value.data.data);
        }
        if (mRes.status === 'fulfilled' && mRes.value.data.success) {
          setAvailableMovies(mRes.value.data.data);
          if (mRes.value.data.data.length > 0) {
            setReviewMovieId(mRes.value.data.data[0].movieId);
          }
        }
      } catch (err) {
        console.warn('Unable to load user history from backend:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Separate Bookings into Upcoming vs Past
  const now = new Date();
  const upcomingBookings = bookings.filter((b) => {
    if (!b.showDetails?.showdate) return true; // default to upcoming
    return new Date(b.showDetails.showdate) >= now;
  });

  const pastBookings = bookings.filter((b) => {
    if (!b.showDetails?.showdate) return false;
    return new Date(b.showDetails.showdate) < now;
  });

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewMsg('');
    setReviewErr('');

    if (!reviewMovieId || !reviewText.trim()) {
      setReviewErr('Please choose a movie and enter your review text.');
      return;
    }

    setReviewSubmitting(true);

    try {
      const res = await userAPI.submitReview({
        movieId: reviewMovieId,
        rating: Number(reviewRating),
        reviewText: reviewText.trim()
      });

      if (res.data.success) {
        setReviewMsg('Your review has been submitted for admin approval!');
        setReviews([res.data.data, ...reviews]);
        setReviewText('');
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewMsg('');
        }, 1500);
      }
    } catch (err) {
      setReviewErr(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
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
            <p className="text-2xl font-black text-rose-400">{upcomingBookings.length}</p>
            <p className="text-[11px] text-slate-400 uppercase font-bold">Upcoming</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{watchlist.length}</p>
            <p className="text-[11px] text-slate-400 uppercase font-bold">Watchlist</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{reviews.length}</p>
            <p className="text-[11px] text-slate-400 uppercase font-bold">Reviews</p>
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
          <span>My Shows & Bookings</span>
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

      {/* TAB CONTENT: Bookings & Tracking Upcoming Shows */}
      {activeTab === 'bookings' && (
        <div className="space-y-8">
          
          {/* 1. Track Upcoming Shows Section */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-rose-400" />
              <span>Track Upcoming Shows ({upcomingBookings.length})</span>
            </h3>

            {upcomingBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.bookingId || b._id}
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-500/50 shadow-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Upcoming &bull; Confirmed
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">{b.bookingId}</span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-white">
                        {b.showDetails?.theatreName || 'iMovies Cinema'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {b.showDetails?.showtime || '07:30 PM'} &bull; {b.showDetails?.showdate ? new Date(b.showDetails.showdate).toLocaleDateString() : 'Today'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Seats</span>
                        <p className="font-extrabold text-rose-400">
                          {Array.isArray(b.ticketsData) ? b.ticketsData.join(', ') : JSON.stringify(b.ticketsData)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Paid</span>
                        <p className="font-extrabold text-white">₹{b.totalAmount}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTicket(b)}
                      className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Digital E-Ticket Pass</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 text-center text-xs text-slate-400">
                No upcoming movies scheduled. Browse now-showing titles to reserve tickets!
              </div>
            )}
          </div>

          {/* 2. Historical Past Bookings */}
          {pastBookings.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-extrabold text-slate-300 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Past Bookings History</span>
              </h3>

              <div className="space-y-3">
                {pastBookings.map((b) => (
                  <div
                    key={b.bookingId || b._id}
                    className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400"
                  >
                    <div>
                      <p className="font-bold text-slate-200">{b.bookingId}</p>
                      <p className="text-[11px]">Show ID: {b.showId}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-300">₹{b.totalAmount}</span>
                      <p className="text-[10px] text-slate-500">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: Watchlist */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Saved Movies ({watchlist.length})</span>
            </h3>
          </div>

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

      {/* TAB CONTENT: Reviews & Write a Review */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Movie Reviews ({reviews.length})</span>
              </h3>
              <p className="text-xs text-slate-400">Manage your ratings and submit community feedback</p>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase shadow-md shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-white text-sm">Movie: {rev.movieId}</span>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-900/30 border border-slate-800/80 p-8 space-y-2">
              <Star className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No reviews submitted yet</h3>
              <p className="text-xs text-slate-400">Share your thoughts on movies you have watched!</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Account Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-md p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-white text-base">Update Account</h3>

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

      {/* MODAL: Write a Movie Review */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-lg">Submit Movie Review</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                {reviewMsg}
              </div>
            )}

            {reviewErr && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {reviewErr}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Select Movie</label>
                <select
                  value={reviewMovieId}
                  onChange={(e) => setReviewMovieId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
                >
                  {availableMovies.map((m) => (
                    <option key={m.movieId} value={m.movieId}>
                      {m.movieName} ({m.movieId})
                    </option>
                  ))}
                  {availableMovies.length === 0 && (
                    <option value="MOV-101">Oppenheimer (MOV-101)</option>
                  )}
                </select>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-amber-400 ml-2">{reviewRating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Your Review</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your cinema experience, acting, storyline..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30"
              >
                {reviewSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Review</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Digital E-Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 text-center">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-extrabold text-rose-400">{selectedTicket.bookingId}</span>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-md">
              <QrCode className="w-32 h-32 text-slate-950" />
            </div>

            <div className="text-xs text-left space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-slate-400">Show ID: <span className="text-white font-bold">{selectedTicket.showId}</span></p>
              <p className="text-slate-400">Seats: <span className="text-rose-400 font-bold">{Array.isArray(selectedTicket.ticketsData) ? selectedTicket.ticketsData.join(', ') : selectedTicket.ticketsData}</span></p>
              <p className="text-slate-400">Amount Paid: <span className="text-emerald-400 font-bold">₹{selectedTicket.totalAmount}</span></p>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
            >
              Close E-Ticket
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;
