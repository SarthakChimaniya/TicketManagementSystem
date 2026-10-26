import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, MapPin, Ticket, Shield, Users, ArrowLeft } from 'lucide-react';
import { movieAPI, showAPI } from '../services/api';

const DEFAULT_SHOWS = [
  {
    showId: 'SHOW-101',
    movieId: 'MOV-101',
    theatreName: 'PVR IMAX Grand Screen',
    location: 'Downtown Mall, Screen 1',
    showtime: '04:30 PM',
    showdate: new Date().toISOString(),
    pricing: { lower: 150, middle: 250, balcony: 400 }
  },
  {
    showId: 'SHOW-102',
    movieId: 'MOV-101',
    theatreName: 'PVR IMAX Grand Screen',
    location: 'Downtown Mall, Screen 1',
    showtime: '08:00 PM',
    showdate: new Date().toISOString(),
    pricing: { lower: 180, middle: 280, balcony: 450 }
  },
  {
    showId: 'SHOW-103',
    movieId: 'MOV-101',
    theatreName: 'Cinepolis 4DX Experience',
    location: 'Orion City Center',
    showtime: '06:15 PM',
    showdate: new Date().toISOString(),
    pricing: { lower: 200, middle: 300, balcony: 500 }
  }
];

const ShowDetails = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [loading, setLoading] = useState(true);

  // Generate 4 upcoming dates
  const upcomingDates = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      index: i,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      isoString: d.toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      try {
        setLoading(true);
        // Fetch movie details
        const movieRes = await movieAPI.getById(movieId);
        if (movieRes.data.success) {
          setMovie(movieRes.data.data);
        }

        // Fetch shows for this movie
        const showsRes = await showAPI.browse({ movieId });
        if (showsRes.data.success && showsRes.data.data.length > 0) {
          setShows(showsRes.data.data);
        } else {
          setShows(DEFAULT_SHOWS);
        }
      } catch (err) {
        console.warn('Backend unavailable, using showcase show info');
        setMovie({
          movieId: movieId || 'MOV-101',
          movieName: 'Oppenheimer',
          genres: ['Biography', 'Drama', 'History'],
          runtime: 180,
          certification: 'A',
          averageRating: 4.9,
          description:
            'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
          cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
          media: {
            banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&auto=format&fit=crop&q=80',
            poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80'
          }
        });
        setShows(DEFAULT_SHOWS);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [movieId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="animate-pulse">Loading showtimes and cinema screen information...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Movie not found</h2>
        <button
          onClick={() => navigate('/movies')}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
        >
          Back to Movie Listings
        </button>
      </div>
    );
  }

  // Group shows by Theatre Name
  const theatreMap = {};
  shows.forEach((show) => {
    const tName = show.theatreName || 'iMovies Cineplex';
    if (!theatreMap[tName]) {
      theatreMap[tName] = {
        name: tName,
        location: show.theatreDetails?.location || show.location || 'Main Auditorium',
        shows: []
      };
    }
    theatreMap[tName].shows.push(show);
  });

  return (
    <div className="space-y-10">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Movie Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-6 sm:p-10 flex flex-col md:flex-row gap-8 shadow-2xl">
        {/* Movie Poster */}
        <div className="w-full md:w-56 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-950 flex-shrink-0 shadow-lg border border-slate-800">
          <img
            src={movie.media?.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80'}
            alt={movie.movieName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Movie Meta Information */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {movie.certification || 'UA'}
            </span>
            {Array.isArray(movie.genres) &&
              movie.genres.map((g, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {g}
                </span>
              ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {movie.movieName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
            <span className="flex items-center space-x-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{movie.averageRating || 4.8} / 5.0</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1 text-slate-400">
              <Clock className="w-4 h-4" />
              <span>{movie.runtime || 160} mins</span>
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            {movie.description}
          </p>

          {/* Cast Members */}
          {Array.isArray(movie.cast) && movie.cast.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span>Starring Cast</span>
              </p>
              <p className="text-xs text-slate-200 font-medium">
                {movie.cast.join(' • ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-rose-400" />
          <span>Select Date</span>
        </h2>

        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {upcomingDates.map((item) => (
            <button
              key={item.index}
              onClick={() => setSelectedDate(item.index)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl border text-center transition-all ${
                selectedDate === item.index
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{item.dayName}</p>
              <p className="text-base font-extrabold mt-0.5">{item.dateFormatted}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Theatres & Showtimes Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Ticket className="w-5 h-5 text-rose-400" />
          <span>Available Theatres & Showtimes</span>
        </h2>

        <div className="space-y-4">
          {Object.values(theatreMap).map((theatre, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{theatre.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{theatre.location}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Instant Seat Confirmation</span>
                </div>
              </div>

              {/* Showtimes Grid */}
              <div className="flex flex-wrap gap-3 pt-1">
                {theatre.shows.map((show) => (
                  <button
                    key={show.showId}
                    onClick={() => navigate(`/seat-selection/${show.showId}`)}
                    className="group relative px-5 py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500 hover:bg-rose-500/10 transition-all text-left"
                  >
                    <p className="text-sm font-extrabold text-white group-hover:text-rose-400 transition-colors">
                      {show.showtime}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      From ₹{show.pricing?.lower || show.theatreDetails?.pricing?.lower || 150}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ShowDetails;
