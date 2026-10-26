import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Film } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { movieAPI } from '../services/api';

const DEFAULT_MOVIES = [
  {
    movieId: 'MOV-101',
    movieName: 'Oppenheimer',
    genres: ['Biography', 'Drama', 'History'],
    runtime: 180,
    certification: 'A',
    averageRating: 4.9,
    language: 'English',
    media: { poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80' }
  },
  {
    movieId: 'MOV-102',
    movieName: 'Interstellar',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    runtime: 169,
    certification: 'UA',
    averageRating: 4.8,
    language: 'English',
    media: { poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80' }
  },
  {
    movieId: 'MOV-103',
    movieName: 'Dune: Part Two',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    runtime: 166,
    certification: 'UA',
    averageRating: 4.7,
    language: 'English',
    media: { poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80' }
  },
  {
    movieId: 'MOV-104',
    movieName: 'The Dark Knight',
    genres: ['Action', 'Crime', 'Drama'],
    runtime: 152,
    certification: 'UA',
    averageRating: 5.0,
    language: 'English',
    media: { poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=80' }
  }
];

const MovieListings = () => {
  const [movies, setMovies] = useState(DEFAULT_MOVIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await movieAPI.getAll();
        if (res.data.success && res.data.data.length > 0) {
          setMovies(res.data.data);
        }
      } catch (err) {
        console.warn('Backend unavailable, using fallback movie catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Filter & Search Logic
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.movieName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre =
      selectedGenre === 'All' ||
      (Array.isArray(movie.genres) && movie.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));
    const matchesLanguage =
      selectedLanguage === 'All' ||
      (movie.language && movie.language.toLowerCase() === selectedLanguage.toLowerCase());

    return matchesSearch && matchesGenre && matchesLanguage;
  });

  // Sort Logic
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.averageRating || 0) - (a.averageRating || 0);
    }
    if (sortBy === 'runtime') {
      return (b.runtime || 0) - (a.runtime || 0);
    }
    return a.movieName.localeCompare(b.movieName);
  });

  const allGenres = ['All', ...new Set(movies.flatMap((m) => m.genres || []))];
  const allLanguages = ['All', ...new Set(movies.map((m) => m.language || 'English'))];

  return (
    <div className="space-y-8">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Movie Listings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse currently showing cinematic releases and reserve your preferred seats
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search movies by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm"
          />
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Genre Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
            >
              {allGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
            >
              {allLanguages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="runtime">Longest Runtime</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Movie Grid */}
      {sortedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedMovies.map((movie) => (
            <MovieCard key={movie.movieId} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No movies match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, genre, or language filters to find what you are looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGenre('All');
              setSelectedLanguage('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-rose-400 text-xs font-bold hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieListings;
