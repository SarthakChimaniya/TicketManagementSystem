import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Sparkles, Play, Ticket, Shield, ArrowRight, Star } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { movieAPI, showAPI } from '../services/api';

const DEFAULT_MOVIES = [
  {
    movieId: 'MOV-101',
    movieName: 'Oppenheimer',
    genres: ['Biography', 'Drama', 'History'],
    runtime: 180,
    certification: 'A',
    averageRating: 4.9,
    media: {
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80'
    },
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.'
  },
  {
    movieId: 'MOV-102',
    movieName: 'Interstellar',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    runtime: 169,
    certification: 'UA',
    averageRating: 4.8,
    media: {
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80'
    },
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.'
  },
  {
    movieId: 'MOV-103',
    movieName: 'Dune: Part Two',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    runtime: 166,
    certification: 'UA',
    averageRating: 4.7,
    media: {
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80'
    },
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'
  },
  {
    movieId: 'MOV-104',
    movieName: 'The Dark Knight',
    genres: ['Action', 'Crime', 'Drama'],
    runtime: 152,
    certification: 'UA',
    averageRating: 5.0,
    media: {
      poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=80'
    },
    description: 'When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest tests.'
  }
];

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Crime', 'Biography'];

const Home = () => {
  const [movies, setMovies] = useState(DEFAULT_MOVIES);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await movieAPI.getAll();
        if (res.data.success && res.data.data.length > 0) {
          setMovies(res.data.data);
        }
      } catch (err) {
        console.warn('Backend offline or empty, using showcase mock catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const filteredMovies =
    selectedGenre === 'All'
      ? movies
      : movies.filter((m) =>
          Array.isArray(m.genres) && m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
        );

  const heroMovie = movies[0] || DEFAULT_MOVIES[0];

  return (
    <div className="space-y-16">
      
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={heroMovie.media?.banner || heroMovie.media?.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80'}
            alt="Hero Banner"
            className="w-full h-full object-cover opacity-30 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold tracking-wider uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Blockbuster Now Showing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-4">
            {heroMovie.movieName}
          </h1>

          <div className="flex items-center space-x-4 text-xs sm:text-sm text-slate-300 mb-6 font-semibold">
            <span className="flex items-center space-x-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{heroMovie.averageRating || 4.9} Rating</span>
            </span>
            <span>&bull;</span>
            <span>{heroMovie.runtime || 180} Mins</span>
            <span>&bull;</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
              {heroMovie.certification || 'UA'}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 line-clamp-3">
            {heroMovie.description ||
              'Experience the critically acclaimed cinematic triumph with enhanced Dolby Atmos sound and ultra-wide IMAX screens.'}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate(`/movies/${heroMovie.movieId}`)}
              className="flex items-center space-x-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Seats Now</span>
            </button>
            <button
              onClick={() => navigate(`/movies`)}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700/80 transition-all"
            >
              <Play className="w-4 h-4 text-rose-400" />
              <span>Explore All Shows</span>
            </button>
          </div>
        </div>
      </div>

      {/* Genre Filter Bar & Section Header */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Now In Theatres
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Select a movie to browse available showtimes and real-time seat tiers
            </p>
          </div>

          <Link
            to="/movies"
            className="inline-flex items-center space-x-1.5 text-sm font-bold text-rose-400 hover:text-rose-300 group"
          >
            <span>View All Titles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.movieId} movie={movie} />
          ))}
        </div>
      </section>

      {/* Platform Value Propositions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Real-Time Seat Locking</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Powered by WebSockets and Socket.io. When you pick seats, they are instantly locked with an auto-expiring timer to prevent double booking.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Tiered Seat Pricing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Transparent pricing across Balcony, Middle, and Lower tiers. View available seats and live availability status in high resolution.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Ticket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Instant Digital E-Tickets</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Confirmed transactions trigger instant Email and SMS notifications with scanned QR verification codes ready at theatre entrance.
          </p>
        </div>
      </section>

    </div>
  );
};

export default Home;
