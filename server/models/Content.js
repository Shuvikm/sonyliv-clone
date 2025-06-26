const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['movie', 'sport', 'news', 'serial', 'show']
  },
  genre: [{
    type: String,
    required: true
  }],
  language: {
    type: String,
    default: 'English'
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  releaseYear: {
    type: Number
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  poster: {
    type: String,
    required: true
  },
  banner: {
    type: String
  },
  trailer: {
    type: String
  },
  streamUrl: {
    type: String,
    required: true
  },
  isLive: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  cast: [{
    name: String,
    role: String,
    image: String
  }],
  director: {
    type: String
  },
  producer: {
    type: String
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'coming_soon'],
    default: 'active'
  },
  // For sports content
  sportType: {
    type: String
  },
  teams: [String],
  venue: String,
  matchDate: Date,
  
  // For news content
  newsCategory: {
    type: String
  },
  source: String,
  publishDate: Date,
  
  // For serials/shows
  season: Number,
  episode: Number,
  totalEpisodes: Number,
  airTime: String,
  channel: String
}, {
  timestamps: true
});

// Index for better search performance
contentSchema.index({ title: 'text', description: 'text', tags: 'text' });
contentSchema.index({ type: 1, genre: 1 });
contentSchema.index({ isFeatured: 1, isTrending: 1 });

module.exports = mongoose.model('Content', contentSchema); 