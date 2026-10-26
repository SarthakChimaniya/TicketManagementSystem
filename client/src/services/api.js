import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // For HTTP-only cookie support if backend sets them
});

// Request Interceptor: Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error & 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear stored authentication credentials
      const currentUrl = window.location.pathname;
      if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
        // Clear token on unauthorized if not on public landing
        const token = localStorage.getItem('imovies_token');
        if (token) {
          localStorage.removeItem('imovies_token');
          localStorage.removeItem('imovies_user');
          window.dispatchEvent(new Event('auth-change'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// API Helper Modules
// ==========================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const movieAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (movieId) => api.get(`/movies/${movieId}`)
};

export const showAPI = {
  browse: (params) => api.get('/shows/browse', { params }),
  getAll: (params) => api.get('/shows', { params }),
  getById: (showId) => api.get(`/shows/${showId}`),
  getSeats: (showId) => api.get(`/shows/${showId}/seats`)
};

export const bookingAPI = {
  lockSeats: (data) => api.post('/bookings/lock-seats', data),
  releaseSeats: (data) => api.post('/bookings/release-seats', data),
  checkout: (data) => api.post('/bookings/checkout', data),
  processPayment: (data) => api.post('/bookings/process-payment', data),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (bookingId) => api.get(`/bookings/${bookingId}`)
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getWatchlist: () => api.get('/user/watchlist'),
  addToWatchlist: (data) => api.post('/user/watchlist', data),
  removeFromWatchlist: (movieId) => api.delete(`/user/watchlist/${movieId}`),
  getReviews: () => api.get('/user/reviews'),
  submitReview: (data) => api.post('/user/reviews', data),
  getMyBookings: () => api.get('/user/bookings'),
  getBookingDetails: (bookingId) => api.get(`/user/bookings/${bookingId}`)
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Movies
  getMovies: (params) => api.get('/admin/movies', { params }),
  getMovieById: (movieId) => api.get(`/admin/movies/${movieId}`),
  createMovie: (data) => api.post('/admin/movies', data),
  updateMovie: (movieId, data) => api.put(`/admin/movies/${movieId}`, data),
  deleteMovie: (movieId) => api.delete(`/admin/movies/${movieId}`),
  // Theatres
  getTheatres: () => api.get('/admin/theatres'),
  getTheatreById: (theatreId) => api.get(`/admin/theatres/${theatreId}`),
  createTheatre: (data) => api.post('/admin/theatres', data),
  updateTheatre: (theatreId, data) => api.put(`/admin/theatres/${theatreId}`, data),
  deleteTheatre: (theatreId) => api.delete(`/admin/theatres/${theatreId}`),
  // Bookings & Revenue
  getBookings: (params) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (bookingId, data) => api.put(`/admin/bookings/${bookingId}/status`, data),
  getRevenueReport: () => api.get('/admin/reports/revenue'),
  // Moderation
  getReviews: (params) => api.get('/admin/reviews', { params }),
  moderateReview: (id, data) => api.put(`/admin/reviews/${id}/moderate`, data),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`)
};

export default api;
