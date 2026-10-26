const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: [true, 'Movie ID is required'],
      unique: true,
      trim: true
    },
    movieName: {
      type: String,
      required: [true, 'Movie name is required'],
      trim: true
    },
    media: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        banner: '',
        poster: '',
        trailerUrl: ''
      }
    },
    shows: [
      {
        type: String,
        trim: true
      }
    ],
    genres: [
      {
        type: String,
        trim: true
      }
    ],
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    runtime: {
      type: Number,
      required: [true, 'Runtime in minutes is required']
    },
    certification: {
      type: String,
      trim: true,
      default: 'U'
    },
    cast: [
      {
        type: String,
        trim: true
      }
    ],
    castMembers: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Synchronize cast and castMembers if one of them is provided
movieSchema.pre('save', function (next) {
  if (this.cast && this.cast.length > 0 && (!this.castMembers || this.castMembers.length === 0)) {
    this.castMembers = this.cast;
  } else if (this.castMembers && this.castMembers.length > 0 && (!this.cast || this.cast.length === 0)) {
    this.cast = this.castMembers;
  }
  next();
});

module.exports = mongoose.model('Movie', movieSchema);
