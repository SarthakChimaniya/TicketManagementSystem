# iMovies Backend API

Node.js and Express.js backend for the **iMovies** movie ticket booking application, strictly following the **Model-View-Controller (MVC)** architecture with **MongoDB** & **Mongoose**, **JWT authentication**, **bcrypt.js** password encryption, **Socket.io** real-time seat management, and **Payment Gateway (Stripe/Sandbox)** checkout integration.

---

## 📁 Directory Structure

```plaintext
TicketbookingSystem/
├── config/
│   ├── db.js                 # MongoDB connection logic (with MongoMemoryServer fallback)
│   └── seedData.js           # Automated seed data for demo users, movies, theatres & shows
├── controllers/
│   ├── authController.js     # User & Admin registration, login, JWT issuance
│   ├── userController.js     # User profile, watchlist, reviews, booking history
│   ├── adminController.js    # Admin dashboard, CRUD for movies/theatres, reports, moderation
│   ├── showController.js     # Filtered show browsing, seat layout & availability
│   ├── bookingController.js  # Seat locking, checkout, payment processing, e-tickets
│   ├── movieController.js    # Public/General movie operations
│   ├── theatreController.js  # Public/General theatre operations
│   ├── favoriteController.js # Watchlist / favorites management
│   └── reviewController.js   # Movie reviews and admin moderation
├── middleware/
│   ├── authMiddleware.js     # verifyToken and isAdmin role-based access control
│   └── errorHandler.js       # Centralized error-handling middleware
├── models/
│   ├── User.js               # User schema with bcrypt hashing & role field
│   ├── Admin.js              # Admin schema with bcrypt hashing & role field
│   ├── Movie.js              # Movie catalog schema with language, rating, cast
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
│   ├── showRoutes.js         # /api/shows endpoints (browse, seats layout, CRUD)
│   ├── bookingRoutes.js      # /api/bookings endpoints (lock, checkout, payment)
│   ├── movieRoutes.js        # /api/movies endpoints
│   ├── theatreRoutes.js      # /api/theatres endpoints
│   ├── favoriteRoutes.js     # /api/favorites endpoints
│   ├── reviewRoutes.js       # /api/reviews endpoints
│   └── index.js              # Unified API router
├── services/
│   ├── seatLockService.js    # In-memory real-time seat locks with TTL & broadcast
│   ├── paymentService.js     # Stripe / Sandbox payment gateway processor
│   └── notificationService.js# Mock Email & SMS e-ticket notification dispatcher
├── tests/
│   ├── test_system.js        # Integration tests for auth and validation
│   ├── test_controllers.js   # Unit & schema validation tests for controllers
│   └── test_prompt3.js       # Core business logic, seat locking, payments & sockets
├── .env                      # Environment variables
├── .env.example              # Sample environment configuration
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies and npm scripts
└── server.js                 # HTTP server bootstrap & Socket.io initialization
```

---

## 🔑 Pre-Seeded Demo Credentials

The backend automatically seeds demo users, movies, theatres, and active showtimes upon first startup (`config/seedData.js`):

| Role | Email | Password | Features & Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@imovies.com` | `AdminPassword123!` | Access Admin Dashboard (`/admin`), Full Movie & Theatre CRUD, Revenue Analytics, Booking Oversight, Review Moderation |
| **Standard User** | `user@imovies.com` | `UserPassword123!` | Ticket Booking, Interactive Seat Locking, Watchlist Management, Review & Rating Submission, Order History |

### 🎬 Pre-Populated Catalog
- **Movies**: *Oppenheimer* (Biography/Drama), *Interstellar* (Sci-Fi/Adventure), *Dune: Part Two* (Sci-Fi/Action), *The Dark Knight* (Action/Crime).
- **Theatres**: `IMAX Forum Cineplex` (New York), `Grand Dolby Cinema` (Los Angeles) with Balcony, Middle, and Lower tier layouts and pricing.
- **Active Shows**: Multiple scheduled shows with real-time seat availability and Socket.io locks.

---

## 🔒 Security & Middleware

- **Password Hashing**: Implemented in Mongoose pre-save hooks via `bcryptjs` with salt rounds = 10. `matchPassword` instance method handles timing-safe verification. Passwords are automatically stripped when serializing to JSON.
- **Session Management**: JSON Web Tokens (`jsonwebtoken`) signed with `JWT_SECRET` and configurable expiry (`JWT_EXPIRES_IN`).
- **`verifyToken` Middleware**: Extracts token from `Authorization: Bearer <token>`, decodes claims, verifies user identity against database, and mounts `req.user`.
- **`isAdmin` Middleware**: Enforces that only users with role `'admin'` or `'superadmin'` can access sensitive dashboard and management endpoints (returns `403 Forbidden` otherwise).

---

## ⚡ Real-Time Seat Management & WebSockets

Real-time seat locking is coordinated by **Socket.io** and [`services/seatLockService.js`](file:///d:/TicketbookingSystem/services/seatLockService.js):

- **Room Partitioning**: Clients join rooms per show: `show_<showId>`.
- **Time-To-Live (TTL)**: When seats are selected, they are locked with a configurable TTL (default 10 minutes = 600s).
- **Conflict Prevention**: If a user attempts to lock a seat already held by another customer, a `409 Conflict` is returned.
- **Real-Time Broadcasts**:
  - `seats-locked`: Broadcast to all room subscribers so they immediately see the seats as unavailable.
  - `seats-released`: Fired automatically upon TTL expiry, user cancellation, or payment failure.
  - `seats-booked`: Fired permanently upon verified transaction success.

---

## 💳 Checkout Flow & Payment Gateway Integration

1. **Lock Seats**: User selects preferred seats -> calls `POST /api/bookings/lock-seats` (or emits `lock-seats` via socket).
2. **Initiate Checkout**: Calls `POST /api/bookings/checkout` -> verifies locks, calculates seat pricing across Balcony, Middle, and Lower tiers, and generates a Payment Intent (`Stripe` / Sandbox test intent).
3. **Process Transaction**: Calls `POST /api/bookings/process-payment` with `paymentIntentId`:
   - **On Success**: Finalizes `Booking` document in MongoDB, marks seats booked in `Show.tickets`, permanently clears lock cache, emits `seats-booked` via WebSocket, and triggers the `NotificationService` (dispatches e-ticket with QR code via Email & SMS).
   - **On Failure**: Automatically releases the temporarily locked seats back to the available pool, emits `seats-released` via WebSocket, and notifies the client with 400.

---

## 📡 API Endpoints Reference

### 1. Show & Seat Layout Endpoints (`/api/shows`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shows/browse` | Public | Search shows filtered by `genre`, `language`, `date` (YYYY-MM-DD), and `ratings` |
| `GET` | `/api/shows/:showId/seats` | Public | Full seat layout (Balcony, Middle, Lower) with prices, and real-time statuses (`available`, `locked`, `booked`) |
| `GET` | `/api/shows` | Public | List all scheduled shows |
| `GET` | `/api/shows/:showId` | Public | Get single show details |

### 2. Booking & Payment Endpoints (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings/lock-seats` | Protected | Temporarily lock seats with TTL (broadcasts `seats-locked` via Socket.io) |
| `POST` | `/api/bookings/release-seats`| Protected | Manually release locked seats (broadcasts `seats-released`) |
| `POST` | `/api/bookings/checkout` | Protected | Calculate tier pricing and generate payment intent |
| `POST` | `/api/bookings/process-payment`| Protected | Process payment, confirm booking or auto-release seats upon decline, send e-ticket |
| `GET` | `/api/bookings` | Public/Auth | Query bookings by `userEmail` or `showId` |
| `GET` | `/api/bookings/:bookingId` | Public/Auth | Get specific booking receipt |

### 3. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register standard user (`role: "user"`) or admin (`role: "admin"`) |
| `POST` | `/api/auth/register-admin` | Public | Explicit admin account registration |
| `POST` | `/api/auth/login` | Public | Login with email and password, returns signed JWT |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user's current session profile |

### 4. User Controller Endpoints (`/api/user`)
*Protected with `verifyToken`.*
- `GET/PUT /api/user/profile` - Profile management
- `GET/POST /api/user/watchlist`, `DELETE /api/user/watchlist/:movieId` - Favorites management
- `GET/POST /api/user/reviews` - Ratings and reviews
- `GET /api/user/bookings` - Historical bookings

### 5. Admin Controller Endpoints (`/api/admin`)
*Protected with `verifyToken` and `isAdmin`.*
- `GET /api/admin/dashboard` - Platform metrics & total revenue
- `GET/POST/PUT/DELETE /api/admin/movies` - Full CRUD on movies
- `GET/POST/PUT/DELETE /api/admin/theatres` - Full CRUD on theatres & tier pricing
- `GET/PUT /api/admin/bookings` - Monitor active bookings & update status
- `GET /api/admin/reports/revenue` - Revenue analytics
- `GET/PUT/DELETE /api/admin/reviews` - Review moderation & deletion

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
STRIPE_SECRET_KEY=sk_test_imovies_mock_secret_key_2026
SEAT_LOCK_TTL_SECONDS=600
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Start the Application
- **Backend Development Mode** (Nodemon auto-reload):
  ```bash
  npm run dev
  ```
- **Frontend Development Mode** (Vite HMR):
  ```bash
  npm run client
  # or from client directory:
  cd client && npm run dev
  ```
- **Build Frontend for Production**:
  ```bash
  npm run client:build
  ```
- **Production Server (Backend + Built Frontend)**:
  ```bash
  npm start
  ```

---

## 🎨 Frontend View Layer (`client/`)

- **Framework**: React 19 + Vite with Tailwind CSS.
- **Routing**: React Router with responsive routes:
  - `/`: Modern Home page with blockbuster showcase, now-showing grid, and genre filters.
  - `/movies`: Movie Listings with live search, genre filters, and sort options.
  - `/movies/:movieId`: Movie details, upcoming dates, and theatre showtimes.
  - `/seat-selection/:showId`: Real-time interactive seat grid with Balcony, Middle, Lower tier pricing and Socket.io locks.
  - `/checkout`: Summary breakdown, payment simulation (success/decline), and e-ticket QR token generation.
  - `/profile`: User Profile, historical bookings, watchlist, and submitted reviews.
  - `/admin`: Responsive Admin Dashboard with Movies CRUD, Theatres, Revenue Analytics, and Review Moderation.
- **Shared Components**:
  - `Navbar`: Cinema branding, navigation links, user dropdown, and mobile drawer menu.
  - `MovieCard`: Poster image, rating badge, genre tags, certification, and watchlist toggle.
  - `AuthModals`: Sign In and Register modals with client validation and user/admin role selection.
  - `Footer`: Branding, features summary, and quick links.
- **HTTP Client**: Axios instance with request/response interceptors to attach JWT tokens (`Authorization: Bearer <token>`) and handle 401 expiration.

