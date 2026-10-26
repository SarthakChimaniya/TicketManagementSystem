const { User, Admin, Movie, Theatre, Show } = require('../models');

async function seedInitialData() {
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount > 0) {
      console.log(`[Seed] Database already contains ${movieCount} movies. Skipping seeding.`);
      return;
    }

    console.log('[Seed] Database is empty. Seeding initial demo data...');

    // 1. Create Admin & User
    const existingAdmin = await Admin.findOne({ email: 'admin@imovies.com' });
    if (!existingAdmin) {
      await Admin.create({
        username: 'Admin',
        email: 'admin@imovies.com',
        password: 'AdminPassword123!',
        role: 'admin'
      });
      console.log('[Seed] Admin created: admin@imovies.com / AdminPassword123!');
    }

    const existingUser = await User.findOne({ email: 'user@imovies.com' });
    if (!existingUser) {
      await User.create({
        username: 'Demo User',
        email: 'user@imovies.com',
        password: 'UserPassword123!',
        role: 'user'
      });
      console.log('[Seed] Demo User created: user@imovies.com / UserPassword123!');
    }

    // 2. Create Theatres
    const theatres = [
      {
        theatreId: 'THTR-01',
        theatreName: 'IMAX Forum Cineplex',
        adminName: 'Admin',
        location: 'Downtown Plaza, New York',
        lowerSeats: 20,
        middleSeats: 30,
        balconySeats: 15,
        lowerSeatPrice: 150,
        middleSeatPrice: 250,
        balconySeatPrice: 380
      },
      {
        theatreId: 'THTR-02',
        theatreName: 'Grand Dolby Cinema',
        adminName: 'Admin',
        location: 'Westside Galleria, Los Angeles',
        lowerSeats: 15,
        middleSeats: 25,
        balconySeats: 10,
        lowerSeatPrice: 120,
        middleSeatPrice: 200,
        balconySeatPrice: 320
      }
    ];

    for (const t of theatres) {
      await Theatre.findOneAndUpdate({ theatreId: t.theatreId }, t, { upsert: true, returnDocument: 'after' });
    }
    console.log('[Seed] Theatres created');

    // 3. Create Movies
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const movies = [
      {
        movieId: 'MOV-101',
        movieName: 'Oppenheimer',
        genres: ['Biography', 'Drama', 'History'],
        runtime: 180,
        certification: 'A',
        language: 'English',
        averageRating: 4.9,
        releaseDate: new Date('2023-07-21'),
        media: {
          poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
          trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg'
        },
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
        shows: ['SHOW-101-1', 'SHOW-101-2']
      },
      {
        movieId: 'MOV-102',
        movieName: 'Interstellar',
        genres: ['Sci-Fi', 'Adventure', 'Drama'],
        runtime: 169,
        certification: 'UA',
        language: 'English',
        averageRating: 4.8,
        releaseDate: new Date('2014-11-07'),
        media: {
          poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80'
        },
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
        shows: ['SHOW-102-1']
      },
      {
        movieId: 'MOV-103',
        movieName: 'Dune: Part Two',
        genres: ['Sci-Fi', 'Action', 'Adventure'],
        runtime: 166,
        certification: 'UA',
        language: 'English',
        averageRating: 4.7,
        releaseDate: new Date('2024-03-01'),
        media: {
          poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80'
        },
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        shows: ['SHOW-103-1']
      },
      {
        movieId: 'MOV-104',
        movieName: 'The Dark Knight',
        genres: ['Action', 'Crime', 'Drama'],
        runtime: 152,
        certification: 'UA',
        language: 'English',
        averageRating: 5.0,
        releaseDate: new Date('2008-07-18'),
        media: {
          poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80'
        },
        description: 'When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest tests.',
        shows: ['SHOW-104-1']
      }
    ];

    for (const m of movies) {
      await Movie.findOneAndUpdate({ movieId: m.movieId }, m, { upsert: true, returnDocument: 'after' });
    }
    console.log('[Seed] Movies created');

    // 4. Create Shows
    const shows = [
      {
        showId: 'SHOW-101-1',
        adminEmail: 'admin@imovies.com',
        movieId: 'MOV-101',
        theatreName: 'IMAX Forum Cineplex',
        showtime: '10:30 AM',
        showdate: tomorrow,
        tickets: []
      },
      {
        showId: 'SHOW-101-2',
        adminEmail: 'admin@imovies.com',
        movieId: 'MOV-101',
        theatreName: 'IMAX Forum Cineplex',
        showtime: '06:45 PM',
        showdate: tomorrow,
        tickets: []
      },
      {
        showId: 'SHOW-102-1',
        adminEmail: 'admin@imovies.com',
        movieId: 'MOV-102',
        theatreName: 'IMAX Forum Cineplex',
        showtime: '02:15 PM',
        showdate: tomorrow,
        tickets: []
      },
      {
        showId: 'SHOW-103-1',
        adminEmail: 'admin@imovies.com',
        movieId: 'MOV-103',
        theatreName: 'Grand Dolby Cinema',
        showtime: '07:30 PM',
        showdate: tomorrow,
        tickets: []
      },
      {
        showId: 'SHOW-104-1',
        adminEmail: 'admin@imovies.com',
        movieId: 'MOV-104',
        theatreName: 'Grand Dolby Cinema',
        showtime: '09:15 PM',
        showdate: tomorrow,
        tickets: []
      }
    ];

    for (const s of shows) {
      await Show.findOneAndUpdate({ showId: s.showId }, s, { upsert: true, new: true });
    }
    console.log('[Seed] Shows created');
    console.log('[Seed] Demo database seeding completed successfully!');
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
}

module.exports = seedInitialData;
