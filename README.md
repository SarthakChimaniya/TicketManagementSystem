# iMovies Backend API

Node.js and Express.js backend for the **iMovies** movie ticket booking application, strictly following the **Model-View-Controller (MVC)** architecture with **MongoDB** & **Mongoose**, **JWT authentication**, and **bcrypt.js** password encryption.

---

## 📁 Directory Structure

```plaintext
TicketbookingSystem/
├── config/
│   └── db.js                 # MongoDB connection logic via Mongoose
├── controllers/
│   ├── authController.js     # User & Admin registration, login, JWT issuance
│   ├── userController.js     # User profile, watchlist, reviews, booking history
│   ├── adminController.js    # Admin dashboard, CRUD for movies/theatres, reports, moderation
│   ├── movieController.js    # Public/General movie operations
│   ├── theatreController.js  # Public/General theatre operations
│   ├── showController.js     # Show scheduling and queries
│   ├── bookingController.js  # Ticket booking and seat allocation
│   ├── favoriteController.js # Watchlist / favorites management
│   └── reviewController.js   # Movie reviews and admin moderation
├── middleware/
│   ├── authMiddleware.js     # verifyToken and isAdmin role-based access control
│   └── errorHandler.js       # Centralized error-handling middleware
├── models/
│   ├── User.js               # Standard user schema with bcrypt hashing & role field
│   ├── Admin.js              # Admin schema with bcrypt hashing & role field
│   ├── Movie.js              # Movie catalog schema with media and cast
│   ├── Theatre.js            # Theatre schema with capacities and tier pricing
│   ├── Show.js               # Show scheduling schema linking movie and theatre
│   ├── Booking.js            # Booking schema with seat numbers (ticketsData)
│   ├── Favorite.js           # Watchlist schema for user favorites
│   ├── Review.js             # Review and rating schema with moderation flag
│   └── index.js              # Central exporter for all Mongoose models
├── routes/
│   ├── authRoutes.js         # /api/auth endpoints (register, login, me)
│   ├── userRoutes.js         # /api/user endpoints (profile, watchlist, reviews, bookings)
│   ├── adminRoutes.js        # /api/admin endpoints (dashboard, movies, theatres, reports)
│   ├── movieRoutes.js        # /api/movies endpoints
│   ├── theatreRoutes.js      # /api/theatres endpoints
│   ├── showRoutes.js         # /api/shows endpoints
│   ├── bookingRoutes.js      # /api/bookings endpoints
│   ├── favoriteRoutes.js     # /api/favorites endpoints
│   ├── reviewRoutes.js       # /api/reviews endpoints
│   └── index.js              # Unified API router
├── tests/
│   ├── test_system.js        # Integration tests for auth and validation
│   └── test_controllers.js   # Unit & schema validation tests for controllers
├── .env                      # Environment variables
├── .env.example              # Sample environment configuration
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies and npm scripts
└── server.js                 # Application entry point
```

---

## 🔒 Security & Middleware

- **Password Hashing**: Implemented in Mongoose pre-save hooks via `bcryptjs` with salt rounds = 10. `matchPassword` instance method handles timing-safe verification. Passwords are automatically stripped when serializing to JSON.
- **Session Management**: JSON Web Tokens (`jsonwebtoken`) signed with `JWT_SECRET` and configurable expiry (`JWT_EXPIRES_IN`).
- **`verifyToken` Middleware**: Extracts token from `Authorization: Bearer <token>`, decodes claims, verifies user identity against database, and mounts `req.user`.
- **`isAdmin` Middleware**: Enforces that only users with role `'admin'` or `'superadmin'` can access sensitive dashboard and management endpoints (returns `403 Forbidden` otherwise).

---

## 📡 API Endpoints Reference

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register standard user (`role: "user"`) or admin (`role: "admin"`) |
| `POST` | `/api/auth/register-admin` | Public | Explicit admin account registration |
| `POST` | `/api/auth/login` | Public | Login with email and password, returns signed JWT |
| `GET` | `/api/auth/me` | Protected (`verifyToken`) | Fetch authenticated user's current session profile |

### 2. User Controller Endpoints (`/api/user`)
*All endpoints protected with `verifyToken`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/user/profile` | Retrieve current user profile |
| `PUT` | `/api/user/profile` | Update username and/or password (re-hashes password) |
| `GET` | `/api/user/watchlist` | Retrieve user's saved movie watchlist with movie metadata |
| `POST` | `/api/user/watchlist` | Add movie to watchlist by `movieId` |
| `DELETE` | `/api/user/watchlist/:movieId` | Remove movie from watchlist |
| `GET` | `/api/user/reviews` | Retrieve all reviews submitted by the user |
| `POST` | `/api/user/reviews` | Submit movie review and rating (1–5) (pending moderation) |
| `GET` | `/api/user/bookings` | Retrieve user's historical bookings enriched with show details |
| `GET` | `/api/user/bookings/:bookingId` | Get single booking receipt details |

### 3. Admin Controller Endpoints (`/api/admin`)
*All endpoints protected with `verifyToken` and `isAdmin`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Aggregated dashboard overview (counts & total revenue) |
| `POST` | `/api/admin/movies` | Create movie with media, genres, and cast |
| `GET` | `/api/admin/movies` | Read all movies (supports search and genre filter) |
| `GET` | `/api/admin/movies/:movieId` | Read single movie by `movieId` |
| `PUT` | `/api/admin/movies/:movieId` | Update movie details |
| `DELETE` | `/api/admin/movies/:movieId` | Delete movie from platform |
| `POST` | `/api/admin/theatres` | Create theatre with seating capacities and tier pricing |
| `GET` | `/api/admin/theatres` | Read all theatres |
| `GET` | `/api/admin/theatres/:theatreId` | Read single theatre by `theatreId` |
| `PUT` | `/api/admin/theatres/:theatreId` | Update theatre metadata, seats, or pricing |
| `DELETE` | `/api/admin/theatres/:theatreId` | Delete theatre |
| `GET` | `/api/admin/bookings` | Monitor active/cancelled/pending system bookings |
| `PUT` | `/api/admin/bookings/:bookingId/status` | Update booking status (`confirmed`, `cancelled`, `pending`) |
| `GET` | `/api/admin/reports/revenue` | Payment and revenue analytics (aggregation pipeline) |
| `GET` | `/api/admin/reviews` | List reviews with status filters (`pending`, `moderated`) |
| `PUT` | `/api/admin/reviews/:id/moderate` | Approve or un-approve review (`adminModeration: true/false`) |
| `DELETE` | `/api/admin/reviews/:id` | Permanently delete abusive review |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=imovies_super_secret_jwt_key_2026_dev
JWT_EXPIRES_IN=7d
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Start the Application
- **Development Mode** (with Nodemon auto-reload):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```
