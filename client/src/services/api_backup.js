import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// External APIs configuration
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'demo';
const TMDB_BASE_URL = process.env.REACT_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = process.env.REACT_APP_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY || 'demo';
const SPORTS_API_KEY = process.env.REACT_APP_SPORTS_API_KEY || 'demo';

// TMDB API for movies and TV shows
export const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TMDB_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// News API
export const newsApi = axios.create({
  baseURL: 'https://newsapi.org/v2/',
});

// Sports API (using a free alternative)
export const sportsApi = axios.create({
  baseURL: 'https://api-football-v1.p.rapidapi.com/v3/',
  headers: {
    'X-RapidAPI-Key': SPORTS_API_KEY,
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  }
});

// Helper function to get TMDB image URL
export const getTMDBImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// TMDB API Functions

// Get popular movies
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/popular', {
      params: { page }
    });
    
    return response.data.results.map(movie => ({
      _id: movie.id.toString(),
      title: movie.title,
      description: movie.overview,
      type: 'movie',
      genre: movie.genre_ids,
      poster: getTMDBImageUrl(movie.poster_path),
      backdrop: getTMDBImageUrl(movie.backdrop_path, 'w1280'),
      rating: movie.vote_average,
      views: movie.popularity * 1000,
      releaseYear: new Date(movie.release_date).getFullYear(),
      imdbID: movie.id.toString(),
      language: movie.original_language,
      videoUrl: `https://www.youtube.com/embed/sample_${movie.id}`
    }));
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return getFallbackMovies();
  }
};

// Get trending movies
export const getTrendingMovies = async () => {
  try {
    const response = await tmdbApi.get('/trending/movie/week');
    
    return response.data.results.map(movie => ({
      _id: movie.id.toString(),
      title: movie.title,
      description: movie.overview,
      type: 'movie',
      genre: movie.genre_ids,
      poster: getTMDBImageUrl(movie.poster_path),
      backdrop: getTMDBImageUrl(movie.backdrop_path, 'w1280'),
      rating: movie.vote_average,
      views: movie.popularity * 1000,
      releaseYear: new Date(movie.release_date).getFullYear(),
      imdbID: movie.id.toString(),
      language: movie.original_language,
      videoUrl: `https://www.youtube.com/embed/sample_${movie.id}`
    }));
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return getFallbackMovies();
  }
};

// Get popular TV series
export const getPopularTVSeries = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/tv/popular', {
      params: { page }
    });
    
    return response.data.results.map(show => ({
      _id: show.id.toString(),
      title: show.name,
      description: show.overview,
      type: 'series',
      genre: show.genre_ids,
      poster: getTMDBImageUrl(show.poster_path),
      backdrop: getTMDBImageUrl(show.backdrop_path, 'w1280'),
      rating: show.vote_average,
      views: show.popularity * 1000,
      releaseYear: new Date(show.first_air_date).getFullYear(),
      imdbID: show.id.toString(),
      language: show.original_language,
      videoUrl: `https://www.youtube.com/embed/sample_${show.id}`
    }));
  } catch (error) {
    console.error('Error fetching popular TV series:', error);
    return getFallbackSeries();
  }
};

// Get anime (Japanese TV shows and movies)
export const getAnime = async (page = 1) => {
  try {
    const [moviesResponse, tvResponse] = await Promise.all([
      tmdbApi.get('/discover/movie', {
        params: {
          page,
          with_original_language: 'ja',
          with_keywords: '210024', // anime keyword ID
          sort_by: 'popularity.desc'
        }
      }),
      tmdbApi.get('/discover/tv', {
        params: {
          page,
          with_original_language: 'ja',
          with_keywords: '210024', // anime keyword ID
          sort_by: 'popularity.desc'
        }
      })
    ]);
    
    const movies = moviesResponse.data.results.map(movie => ({
      _id: movie.id.toString(),
      title: movie.title,
      description: movie.overview,
      type: 'anime',
      genre: movie.genre_ids,
      poster: getTMDBImageUrl(movie.poster_path),
      backdrop: getTMDBImageUrl(movie.backdrop_path, 'w1280'),
      rating: movie.vote_average,
      views: movie.popularity * 1000,
      releaseYear: new Date(movie.release_date).getFullYear(),
      imdbID: movie.id.toString(),
      language: movie.original_language,
      videoUrl: `https://www.youtube.com/embed/sample_${movie.id}`
    }));
    
    const tvShows = tvResponse.data.results.map(show => ({
      _id: show.id.toString(),
      title: show.name,
      description: show.overview,
      type: 'anime',
      genre: show.genre_ids,
      poster: getTMDBImageUrl(show.poster_path),
      backdrop: getTMDBImageUrl(show.backdrop_path, 'w1280'),
      rating: show.vote_average,
      views: show.popularity * 1000,
      releaseYear: new Date(show.first_air_date).getFullYear(),
      imdbID: show.id.toString(),
      language: show.original_language,
      videoUrl: `https://www.youtube.com/embed/sample_${show.id}`
    }));
    
    return [...movies, ...tvShows].sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error('Error fetching anime:', error);
    return getFallbackAnime();
  }
};

// Search movies using TMDB API
export const searchMovies = async (query, page = 1) => {
  try {
    if (!query || query.trim() === '') {
      return await getPopularMovies(page);
    }

    const response = await tmdbApi.get('/search/movie', {
      params: {
        query: query.trim(),
        page
      }
    });
    
    return response.data.results.map(movie => ({
      _id: movie.id.toString(),
      title: movie.title,
      description: movie.overview,
      type: 'movie',
      genre: movie.genre_ids,
      poster: getTMDBImageUrl(movie.poster_path),
      backdrop: getTMDBImageUrl(movie.backdrop_path, 'w1280'),
      rating: movie.vote_average,
      views: movie.popularity * 1000,
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
      imdbID: movie.id.toString(),
      language: movie.original_language,
      videoUrl: `https://www.youtube.com/embed/sample_${movie.id}`
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return await getPopularMovies(page);
  }
};

// Search TV series
export const searchTVSeries = async (query, page = 1) => {
  try {
    if (!query || query.trim() === '') {
      return await getPopularTVSeries(page);
    }

    const response = await tmdbApi.get('/search/tv', {
      params: {
        query: query.trim(),
        page
      }
    });
    
    return response.data.results.map(show => ({
      _id: show.id.toString(),
      title: show.name,
      description: show.overview,
      type: 'series',
      genre: show.genre_ids,
      poster: getTMDBImageUrl(show.poster_path),
      backdrop: getTMDBImageUrl(show.backdrop_path, 'w1280'),
      rating: show.vote_average,
      views: show.popularity * 1000,
      releaseYear: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 0,
      imdbID: show.id.toString(),
      language: show.original_language,
      videoUrl: `https://www.youtube.com/embed/sample_${show.id}`
    }));
  } catch (error) {
    console.error('Error searching TV series:', error);
    return await getPopularTVSeries(page);
  }
};

// Fallback data functions
const getFallbackMovies = () => {
  return [
    // English Movies
    {
      _id: 'tt0848228',
      title: 'The Avengers',
      description: 'Earth\'s mightiest heroes must come together and learn to fight as a team',
      type: 'movie',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
      rating: 8.0,
      views: 1500000,
      releaseYear: 2012,
      imdbID: 'tt0848228',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/eOrNdBpGMv8'
    },
    {
      _id: 'tt0468569',
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham',
      type: 'movie',
      genre: ['Action', 'Crime', 'Drama'],
      poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop',
      rating: 9.0,
      views: 1200000,
      releaseYear: 2008,
      imdbID: 'tt0468569',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY'
    },
    {
      _id: 'tt1375666',
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology',
      type: 'movie',
      genre: ['Action', 'Sci-Fi', 'Thriller'],
      poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop',
      rating: 8.8,
      views: 980000,
      releaseYear: 2010,
      imdbID: 'tt1375666',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0'
    },
    {
      _id: 'tt0133093',
      title: 'The Matrix',
      description: 'A computer programmer discovers that reality as he knows it is a simulation',
      type: 'movie',
      genre: ['Action', 'Sci-Fi'],
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
      rating: 8.7,
      views: 1100000,
      releaseYear: 1999,
      imdbID: 'tt0133093',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8'
    },
    {
      _id: 'tt0111161',
      title: 'The Shawshank Redemption',
      description: 'Two imprisoned men bond over a number of years',
      type: 'movie',
      genre: ['Drama'],
      poster: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=450&fit=crop',
      rating: 9.3,
      views: 1300000,
      releaseYear: 1994,
      imdbID: 'tt0111161',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/6hB3S9bIaco'
    },
    {
      _id: 'tt0110912',
      title: 'Pulp Fiction',
      description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine',
      type: 'movie',
      genre: ['Crime', 'Drama'],
      poster: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=450&fit=crop',
      rating: 8.9,
      views: 850000,
      releaseYear: 1994,
      imdbID: 'tt0110912',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/s7EdQ4FqbhY'
    },
    {
      _id: 'tt0816692',
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space',
      type: 'movie',
      genre: ['Adventure', 'Drama', 'Sci-Fi'],
      poster: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=450&fit=crop',
      rating: 8.6,
      views: 920000,
      releaseYear: 2014,
      imdbID: 'tt0816692',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E'
    },
    {
      _id: 'tt0114369',
      title: 'Se7en',
      description: 'Two detectives track a brilliant serial killer',
      type: 'movie',
      genre: ['Crime', 'Drama', 'Mystery'],
      poster: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=450&fit=crop',
      rating: 8.6,
      views: 750000,
      releaseYear: 1995,
      imdbID: 'tt0114369',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/znmZoVkCjpI'
    },
    // Hindi Movies
    {
      _id: 'tt1187043',
      title: '3 Idiots',
      description: 'Two friends looking for a lost buddy deal with a forgotten bet, a wedding they have to crash, and a funeral that goes impossibly out of control',
      type: 'movie',
      genre: ['Comedy', 'Drama'],
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
      rating: 8.4,
      views: 1800000,
      releaseYear: 2009,
      imdbID: 'tt1187043',
      language: 'Hindi',
      videoUrl: 'https://www.youtube.com/embed/K0eDlFX9GMc'
    },
    {
      _id: 'tt0372784',
      title: 'Lagaan',
      description: 'The people of a small village in Victorian India stake their future on a game of cricket against their ruthless British rulers',
      type: 'movie',
      genre: ['Adventure', 'Drama', 'Musical'],
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
      rating: 8.1,
      views: 950000,
      releaseYear: 2001,
      imdbID: 'tt0372784',
      language: 'Hindi',
      videoUrl: 'https://www.youtube.com/embed/8YI2LSK4pEQ'
    },
    {
      _id: 'tt0292490',
      title: 'Dilwale Dulhania Le Jayenge',
      description: 'When Raj meets Simran in Europe, it isn\'t love at first sight but when Simran moves to India for an arranged marriage, love makes its presence felt',
      type: 'movie',
      genre: ['Drama', 'Romance'],
      poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop',
      rating: 8.0,
      views: 1200000,
      releaseYear: 1995,
      imdbID: 'tt0292490',
      language: 'Hindi',
      videoUrl: 'https://www.youtube.com/embed/6Whn7iA4ef8'
    },
    {
      _id: 'tt0119217',
      title: 'Dil Se',
      description: 'A radio executive falls in love with a mysterious woman who has a dark secret',
      type: 'movie',
      genre: ['Drama', 'Romance', 'Thriller'],
      poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop',
      rating: 7.8,
      views: 850000,
      releaseYear: 1998,
      imdbID: 'tt0119217',
      language: 'Hindi',
      videoUrl: 'https://www.youtube.com/embed/4g1iZ0Yqg1E'
    },
    // Tamil Movies
    {
      _id: 'tt1187043',
      title: 'Kaithi',
      description: 'A recently released prisoner tries to save his daughter from a drug cartel',
      type: 'movie',
      genre: ['Action', 'Crime', 'Thriller'],
      poster: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=450&fit=crop',
      rating: 8.5,
      views: 1100000,
      releaseYear: 2019,
      imdbID: 'tt1187043',
      language: 'Tamil',
      videoUrl: 'https://www.youtube.com/embed/g79l7bGDmQg'
    },
    {
      _id: 'tt1187043',
      title: 'Vikram',
      description: 'A special agent investigates a murder committed by a masked group of serial killers',
      type: 'movie',
      genre: ['Action', 'Crime', 'Thriller'],
      poster: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=450&fit=crop',
      rating: 8.4,
      views: 1300000,
      releaseYear: 2022,
      imdbID: 'tt1187043',
      language: 'Tamil',
      videoUrl: 'https://www.youtube.com/embed/OKBMCL-frPU'
    },
    // Telugu Movies
    {
      _id: 'tt1187043',
      title: 'RRR',
      description: 'A tale of two legendary revolutionaries and their journey far away from home',
      type: 'movie',
      genre: ['Action', 'Drama'],
      poster: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=450&fit=crop',
      rating: 7.8,
      views: 1600000,
      releaseYear: 2022,
      imdbID: 'tt1187043',
      language: 'Telugu',
      videoUrl: 'https://www.youtube.com/embed/f_vbAtFSEc0'
    },
    {
      _id: 'tt1187043',
      title: 'Baahubali: The Beginning',
      description: 'In ancient India, an adventurous and daring man becomes involved in a decades-old feud between two warring peoples',
      type: 'movie',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=450&fit=crop',
      rating: 8.0,
      views: 1400000,
      releaseYear: 2015,
      imdbID: 'tt1187043',
      language: 'Telugu',
      videoUrl: 'https://www.youtube.com/embed/sOEg_YZQsTI'
    },
    // Malayalam Movies
    {
      _id: 'tt1187043',
      title: 'Drishyam',
      description: 'A man goes to extreme lengths to save his family from punishment after the family commits an accidental crime',
      type: 'movie',
      genre: ['Crime', 'Drama', 'Thriller'],
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
      rating: 8.2,
      views: 950000,
      releaseYear: 2013,
      imdbID: 'tt1187043',
      language: 'Malayalam',
      videoUrl: 'https://www.youtube.com/embed/mi5mfJ5jGvY'
    },
    // Bengali Movies
    {
      _id: 'tt1187043',
      title: 'Pather Panchali',
      description: 'Impoverished priest Harihar Ray, dreaming of a better life for himself and his family, leaves his rural Bengal village in search of work',
      type: 'movie',
      genre: ['Drama'],
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
      rating: 8.1,
      views: 650000,
      releaseYear: 1955,
      imdbID: 'tt1187043',
      language: 'Bengali',
      videoUrl: 'https://www.youtube.com/embed/6p3lq4lTn2k'
    }
  ];
};

// Fallback TV Series data
const getFallbackSeries = () => {
  return [
    {
      _id: 'tt0903747',
      title: 'Breaking Bad',
      description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine',
      type: 'series',
      genre: ['Crime', 'Drama', 'Thriller'],
      poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1280&h=720&fit=crop',
      rating: 9.5,
      views: 2000000,
      releaseYear: 2008,
      imdbID: 'tt0903747',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/HhesaQXLuRY'
    },
    {
      _id: 'tt0944947',
      title: 'Game of Thrones',
      description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns',
      type: 'series',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1280&h=720&fit=crop',
      rating: 9.2,
      views: 2500000,
      releaseYear: 2011,
      imdbID: 'tt0944947',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/rlR4PJn8b8I'
    },
    {
      _id: 'tt1475582',
      title: 'Sherlock',
      description: 'A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London',
      type: 'series',
      genre: ['Crime', 'Drama', 'Mystery'],
      poster: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1280&h=720&fit=crop',
      rating: 9.1,
      views: 1800000,
      releaseYear: 2010,
      imdbID: 'tt1475582',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/xK7S9mrFWL4'
    },
    {
      _id: 'tt2356777',
      title: 'True Detective',
      description: 'Seasonal anthology series in which police investigations unearth the personal and professional secrets',
      type: 'series',
      genre: ['Crime', 'Drama', 'Mystery'],
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1280&h=720&fit=crop',
      rating: 8.9,
      views: 1600000,
      releaseYear: 2014,
      imdbID: 'tt2356777',
      language: 'English',
      videoUrl: 'https://www.youtube.com/embed/TXwCoNwBSkQ'
    }
  ];
};

// Fallback Anime data
const getFallbackAnime = () => {
  return [
    {
      _id: 'tt0409591',
      title: 'Spirited Away',
      description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods',
      type: 'anime',
      genre: ['Animation', 'Adventure', 'Family'],
      poster: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1280&h=720&fit=crop',
      rating: 9.3,
      views: 1500000,
      releaseYear: 2001,
      imdbID: 'tt0409591',
      language: 'Japanese',
      videoUrl: 'https://www.youtube.com/embed/ByXuk9QqQkk'
    },
    {
      _id: 'tt0347149',
      title: 'Princess Mononoke',
      description: 'On a journey to find the cure for a Tatarigami\'s curse, Ashitaka finds himself in the middle of a war',
      type: 'anime',
      genre: ['Animation', 'Adventure', 'Drama'],
      poster: 'https://images.unsplash.com/photo-1606899326404-aebcf5c7d1e3?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1606899326404-aebcf5c7d1e3?w=1280&h=720&fit=crop',
      rating: 8.4,
      views: 1200000,
      releaseYear: 1997,
      imdbID: 'tt0347149',
      language: 'Japanese',
      videoUrl: 'https://www.youtube.com/embed/4OiMOHRDs14'
    },
    {
      _id: 'tt0245429',
      title: 'My Hero Academia',
      description: 'A superhero-loving boy without any powers is determined to enroll in a prestigious hero academy',
      type: 'anime',
      genre: ['Animation', 'Action', 'Adventure'],
      poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1280&h=720&fit=crop',
      rating: 8.7,
      views: 1800000,
      releaseYear: 2016,
      imdbID: 'tt0245429',
      language: 'Japanese',
      videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4'
    },
    {
      _id: 'tt0988818',
      title: 'Attack on Titan',
      description: 'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth',
      type: 'anime',
      genre: ['Animation', 'Action', 'Drama'],
      poster: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1280&h=720&fit=crop',
      rating: 9.0,
      views: 2200000,
      releaseYear: 2013,
      imdbID: 'tt0988818',
      language: 'Japanese',
      videoUrl: 'https://www.youtube.com/embed/-GD_qpNDkWU'
    }
  ];
};

// Get content details from TMDB
export const getContentDetails = async (id, type = 'movie') => {
  try {
    const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
    const response = await tmdbApi.get(endpoint);
    const data = response.data;
    
    return {
      _id: data.id.toString(),
      title: data.title || data.name,
      description: data.overview,
      type: type,
      genre: data.genres ? data.genres.map(g => g.name) : [],
      poster: getTMDBImageUrl(data.poster_path),
      backdrop: getTMDBImageUrl(data.backdrop_path, 'w1280'),
      rating: data.vote_average,
      views: data.popularity * 1000,
      releaseYear: data.release_date ? new Date(data.release_date).getFullYear() : 
                  data.first_air_date ? new Date(data.first_air_date).getFullYear() : 0,
      director: data.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown',
      cast: data.credits?.cast?.slice(0, 5).map(actor => actor.name) || [],
      language: data.original_language,
      duration: data.runtime || (data.episode_run_time && data.episode_run_time[0]) || 0,
      imdbID: data.id.toString(),
      seasons: data.number_of_seasons || undefined,
      episodes: data.number_of_episodes || undefined,
      videoUrl: `https://www.youtube.com/embed/sample_${data.id}`
    };
  } catch (error) {
    console.error('Error getting content details:', error);
    return null;
  }
};

// News search using News API
export const searchNews = async (query, category = '') => {
  try {
    const params = {
      apiKey: NEWS_API_KEY,
      q: query || 'technology',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 20
    };
    
    if (category) {
      params.category = category;
    }
    
    const response = await newsApi.get('everything', { params });
    
    if (response.data.status === 'ok') {
      return response.data.articles.map((article, index) => ({
        _id: `news_${index}`,
        title: article.title,
        description: article.description || 'No description available',
        type: 'news',
        genre: [category || 'General'],
        poster: article.urlToImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
        rating: Math.floor(Math.random() * 3) + 7,
        views: Math.floor(Math.random() * 500000) + 50000,
        newsCategory: category || 'General',
        source: article.source.name,
        publishDate: new Date(article.publishedAt),
        url: article.url
      }));
    }
    return getMockNews();
  } catch (error) {
    console.error('Error searching news:', error);
    return getMockNews();
  }
};

// Get mock news data
const getMockNews = () => {
  return [
    {
      _id: '1',
      title: 'Breaking News: Major Tech Breakthrough',
      description: 'Scientists discover revolutionary quantum computing method',
      type: 'news',
      genre: ['Technology'],
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
      rating: 8.5,
      views: 450000,
      newsCategory: 'Technology',
      publishDate: new Date()
    },
    {
      _id: '2',
      title: 'Global Economic Update',
      description: 'Latest developments in world markets and economy',
      type: 'news',
      genre: ['Business'],
      poster: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=450&fit=crop',
      rating: 7.8,
      views: 320000,
      newsCategory: 'Business',
      publishDate: new Date()
    },
    {
      _id: '3',
      title: 'Sports World Roundup',
      description: 'Latest updates from the world of sports',
      type: 'news',
      genre: ['Sports'],
      poster: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=450&fit=crop',
      rating: 8.2,
      views: 280000,
      newsCategory: 'Sports',
      publishDate: new Date()
    }
  ];
};

// TV shows search using TV Maze API
export const searchTVShows = async (query) => {
  try {
    if (!query || query.trim() === '') {
      return getPopularTVShows();
    }

    const response = await tvMazeApi.get(`search/shows?q=${encodeURIComponent(query)}`);
    
    if (response.data && response.data.length > 0) {
      return response.data.map(show => ({
        _id: show.show.id.toString(),
        title: show.show.name,
        description: show.show.summary ? show.show.summary.replace(/<[^>]*>/g, '') : 'No description available',
        type: 'serial',
        genre: show.show.genres || [],
        poster: show.show.image?.medium || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop',
        rating: show.show.rating?.average || 0,
        views: Math.floor(Math.random() * 1000000) + 100000,
        season: 1,
        episode: 1,
        totalEpisodes: show.show.episodes?.length || 0,
        channel: show.show.network?.name || 'Unknown',
        language: show.show.language || 'English',
        status: show.show.status
      }));
    }
    
    return getPopularTVShows().filter(show => 
      show.title.toLowerCase().includes(query.toLowerCase()) ||
      show.description.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching TV shows:', error);
    return getPopularTVShows().filter(show => 
      show.title.toLowerCase().includes(query.toLowerCase()) ||
      show.description.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Get popular TV shows
const getPopularTVShows = () => {
  return [
    {
      _id: '1',
      title: 'Breaking Bad',
      description: 'A high school chemistry teacher turned methamphetamine manufacturer',
      type: 'serial',
      genre: ['Drama', 'Crime'],
      poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop',
      rating: 9.5,
      views: 1800000,
      season: 5,
      episode: 16,
      totalEpisodes: 62,
      channel: 'AMC',
      language: 'English',
      status: 'Ended'
    },
    {
      _id: '2',
      title: 'Friends',
      description: 'Follows the personal and professional lives of six friends living in Manhattan',
      type: 'serial',
      genre: ['Comedy', 'Romance'],
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
      rating: 8.9,
      views: 2200000,
      season: 10,
      episode: 18,
      totalEpisodes: 236,
      channel: 'NBC',
      language: 'English',
      status: 'Ended'
    },
    {
      _id: '3',
      title: 'Game of Thrones',
      description: 'Nine noble families fight for control over the lands of Westeros',
      type: 'serial',
      genre: ['Drama', 'Action', 'Adventure'],
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
      rating: 9.3,
      views: 1600000,
      season: 8,
      episode: 6,
      totalEpisodes: 73,
      channel: 'HBO',
      language: 'English',
      status: 'Ended'
    }
  ];
};

// Sports search (using mock data for now as most sports APIs require paid subscriptions)
export const searchSports = async (query) => {
  // For now, return mock sports data
  const mockSportsData = [
    {
      _id: '1',
      title: 'Premier League Live',
      description: 'Manchester United vs Liverpool',
      type: 'sport',
      genre: ['Football'],
      poster: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=450&fit=crop',
      rating: 9.2,
      views: 850000,
      isLive: true,
      sportType: 'Football',
      teams: ['Manchester United', 'Liverpool'],
      venue: 'Old Trafford'
    },
    {
      _id: '2',
      title: 'NBA Finals',
      description: 'Lakers vs Celtics Game 7',
      type: 'sport',
      genre: ['Basketball'],
      poster: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=450&fit=crop',
      rating: 8.8,
      views: 650000,
      isLive: true,
      sportType: 'Basketball',
      teams: ['Lakers', 'Celtics'],
      venue: 'Staples Center'
    },
    {
      _id: '3',
      title: 'Wimbledon Final',
      description: 'Djokovic vs Nadal',
      type: 'sport',
      genre: ['Tennis'],
      poster: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=450&fit=crop',
      rating: 8.5,
      views: 420000,
      isLive: false,
      sportType: 'Tennis',
      teams: ['Djokovic', 'Nadal'],
      venue: 'Centre Court'
    }
  ];
  
  if (query) {
    return mockSportsData.filter(sport => 
      sport.title.toLowerCase().includes(query.toLowerCase()) ||
      sport.sportType.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  return mockSportsData;
};

export default api; 