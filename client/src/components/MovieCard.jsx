import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Heart, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const MovieCard = ({ movie, isFavorited: initialFavorited = false, onWatchlistChange }) => {
  const navigate = useNavigate();
  const { isAuthenticated, openLogin } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [favLoading, setFavLoading] = useState(false);

  // Extract poster image
  const posterUrl =
    (typeof movie.media === 'object' && movie.media?.poster)
      ? movie.media.poster
      : typeof movie.media === 'string' && movie.media.length > 5
      ? movie.media
      : `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80`;

  const genres = Array.isArray(movie.genres) ? movie.genres : [];
  const rating = movie.averageRating || 4.5;
  const runtime = movie.runtime ? `${movie.runtime} min` : '120 min';

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    try {
      setFavLoading(true);
      if (isFavorited) {
        await userAPI.removeFromWatchlist(movie.movieId);
        setIsFavorited(false);
        if (onWatchlistChange) onWatchlistChange(movie.movieId, false);
      } else {
        await userAPI.addToWatchlist({ movieId: movie.movieId });
        setIsFavorited(true);
        if (onWatchlistChange) onWatchlistChange(movie.movieId, true);
      }
    } catch (err) {
      console.error('Error toggling watchlist:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/movies/${movie.movieId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/40 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-rose-950/20 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={posterUrl}
          alt={movie.movieName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          {/* Certification */}
          <span className="px-2 py-0.5 rounded-lg text-[11px] font-black tracking-wider uppercase bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md">
            {movie.certification || 'UA'}
          </span>

          {/* Favorite Toggle Button */}
          <button
            onClick={handleToggleFavorite}
            disabled={favLoading}
            className={`p-2 rounded-xl backdrop-blur-md transition-all active:scale-90 ${
              isFavorited
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                : 'bg-slate-950/70 text-slate-300 hover:text-rose-400 border border-slate-700/60'
            }`}
            title={isFavorited ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Poster Badges: Rating & Runtime */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-slate-300 text-xs font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{runtime}</span>
          </div>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1">
            {movie.movieName}
          </h3>

          {/* Genres Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {genres.slice(0, 3).map((genre, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800/90 text-slate-300 border border-slate-700/60"
              >
                {genre}
              </span>
            ))}
            {genres.length === 0 && (
              <span className="text-xs text-slate-400">Cinema Experience</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-800/70">
          <button
            onClick={handleCardClick}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 group-hover:shadow-md group-hover:shadow-rose-600/30"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book Tickets</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
