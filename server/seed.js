const mongoose = require('mongoose');
const Content = require('./models/Content');
const User = require('./models/User');
require('dotenv').config();

const sampleContent = [
  {
    title: 'Avengers: Endgame',
    description: 'The epic conclusion to the Infinity Saga',
    type: 'movie',
    genre: ['Action', 'Adventure'],
    language: 'English',
    duration: 181,
    releaseYear: 2019,
    rating: 8.4,
    poster: 'https://via.placeholder.com/300x450/ff6b6b/ffffff?text=Avengers',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isFeatured: true,
    isTrending: true,
    status: 'active',
    cast: [
      { name: 'Robert Downey Jr.', role: 'Tony Stark / Iron Man' },
      { name: 'Chris Evans', role: 'Steve Rogers / Captain America' }
    ],
    director: 'Anthony Russo, Joe Russo',
    producer: 'Kevin Feige',
    tags: ['Marvel', 'Superhero', 'Action'],
    views: 1500000
  },
  {
    title: 'Premier League Live',
    description: 'Manchester United vs Liverpool',
    type: 'sport',
    genre: ['Football'],
    language: 'English',
    rating: 9.2,
    poster: 'https://via.placeholder.com/300x450/4CAF50/ffffff?text=Football',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isLive: true,
    isFeatured: true,
    status: 'active',
    sportType: 'Football',
    teams: ['Manchester United', 'Liverpool'],
    venue: 'Old Trafford',
    matchDate: new Date(),
    views: 850000
  },
  {
    title: 'Breaking News',
    description: 'Latest world news and updates',
    type: 'news',
    genre: ['News'],
    language: 'English',
    rating: 7.8,
    poster: 'https://via.placeholder.com/300x450/2196F3/ffffff?text=News',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    newsCategory: 'Breaking',
    source: 'Sony News',
    status: 'active',
    publishDate: new Date(),
    views: 320000
  },
  {
    title: 'Stranger Things',
    description: 'Supernatural thriller series about kids and monsters',
    type: 'serial',
    genre: ['Drama', 'Horror', 'Sci-Fi'],
    language: 'English',
    rating: 8.7,
    poster: 'https://via.placeholder.com/300x450/9C27B0/ffffff?text=Stranger+Things',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isTrending: true,
    status: 'active',
    season: 4,
    episode: 9,
    totalEpisodes: 34,
    channel: 'Netflix',
    views: 1200000
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham',
    type: 'movie',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'English',
    duration: 152,
    releaseYear: 2008,
    rating: 9.0,
    poster: 'https://via.placeholder.com/300x450/333333/ffffff?text=Dark+Knight',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'active',
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne / Batman' },
      { name: 'Heath Ledger', role: 'Joker' }
    ],
    director: 'Christopher Nolan',
    producer: 'Christopher Nolan',
    tags: ['Batman', 'DC', 'Superhero'],
    views: 1200000
  },
  {
    title: 'NBA Finals',
    description: 'Lakers vs Celtics Game 7',
    type: 'sport',
    genre: ['Basketball'],
    language: 'English',
    rating: 8.8,
    poster: 'https://via.placeholder.com/300x450/FF9800/ffffff?text=NBA',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isLive: true,
    status: 'active',
    sportType: 'Basketball',
    teams: ['Lakers', 'Celtics'],
    venue: 'Staples Center',
    matchDate: new Date(),
    views: 650000
  }
];

const sampleUsers = [
  {
    username: 'demo_user',
    email: 'demo@example.com',
    password: 'password123',
    profilePicture: '',
    preferences: {
      favoriteGenres: ['Action', 'Drama'],
      language: 'English'
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sony-live-clone', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Content.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample content
    const contentResult = await Content.insertMany(sampleContent);
    console.log(`Inserted ${contentResult.length} content items`);

    // Insert sample users
    const userResult = await User.insertMany(sampleUsers);
    console.log(`Inserted ${userResult.length} users`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 