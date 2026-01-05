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
// TMDB API Key - Free API for movies and TV shows from themoviedb.org
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4YjRlNjRhMmZhMjVlN2E0OTAzN2EyZjNhOTMxMjE0YiIsInN1YiI6IjY0YTI2NDY1ZDRmZTA0MDBlNjk1NGEyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.HGrLxQCBOxGECJNwJu_LpYNH1qGYLuNgqYnDwdJS0q8';
const TMDB_BASE_URL = process.env.REACT_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
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

// Get popular movies - fetches multiple pages for comprehensive results
export const getPopularMovies = async (page = 1, pagesCount = 5) => {
  try {
    // Fetch multiple pages to reach 1000+ items combined with other categories
    // TMDB returns 20 items per page. 
    // We need substantial content, so we'll fetch more pages.
    const maxPages = pagesCount > 20 ? 20 : pagesCount; // Cap at 20 pages per call to avoid rate limits

    // Helper for delay to respect rate limits
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const pagePromises = [];
    for (let i = page; i < page + maxPages; i++) {
      // Add small delay for every 5 requests to be safe
      if (i % 5 === 0) await delay(200);

      pagePromises.push(
        tmdbApi.get('/movie/popular', { params: { page: i } })
          .catch(err => {
            console.warn(`Failed to fetch popular movies page ${i}`, err);
            return { data: { results: [] } };
          })
      );
    }

    const responses = await Promise.all(pagePromises);

    let allMovies = [];
    responses.forEach(response => {
      const movies = response.data.results.map(movie => ({
        _id: movie.id.toString(),
        title: movie.title,
        description: movie.overview,
        type: 'movie',
        genre: movie.genre_ids,
        poster: getTMDBImageUrl(movie.poster_path),
        backdrop: getTMDBImageUrl(movie.backdrop_path, 'w1280'),
        rating: movie.vote_average,
        views: Math.floor(movie.popularity * 1000),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
        imdbID: movie.id.toString(),
        language: movie.original_language,
        videoUrl: `https://www.youtube.com/embed/sample_${movie.id}`
      }));
      allMovies = [...allMovies, ...movies];
    });

    // Remove duplicates by ID
    const uniqueMovies = allMovies.filter((movie, index, self) =>
      index === self.findIndex(m => m._id === movie._id)
    );

    // If API returned movies, return them
    if (uniqueMovies.length > 0) {
      return uniqueMovies;
    }

    // Fallback to comprehensive local data
    return getFallbackMovies();
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
      views: Math.floor(movie.popularity * 1000), // Ensure integer
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

// Get Top Rated Movies (New)
export const getTopRatedMovies = async (page = 1, pagesCount = 10) => {
  try {
    const pagePromises = [];
    for (let i = page; i < page + pagesCount; i++) {
      pagePromises.push(
        tmdbApi.get('/movie/top_rated', { params: { page: i } })
          .catch(() => ({ data: { results: [] } }))
      );
    }

    const responses = await Promise.all(pagePromises);
    let allMovies = [];

    responses.forEach(response => {
      const movies = response.data.results?.map(movie => ({
        _id: movie.id.toString(),
        title: movie.title,
        description: movie.overview,
        type: 'movie',
        genre: movie.genre_ids,
        poster: getTMDBImageUrl(movie.poster_path),
        backdrop: getTMDBImageUrl(movie.backdrop_path, 'w1280'),
        rating: movie.vote_average,
        views: Math.floor(movie.popularity * 1500),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
        imdbID: movie.id.toString(),
        language: movie.original_language,
      })) || [];
      allMovies = [...allMovies, ...movies];
    });

    return allMovies;
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    return [];
  }
};

// Get Action Movies (New)
export const getActionMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        page,
        with_genres: 28, // Action
        sort_by: 'popularity.desc'
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
      views: Math.floor(movie.popularity * 1000),
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
      imdbID: movie.id.toString(),
      language: movie.original_language,
    }));
  } catch (err) {
    console.error("Error fetching action movies", err);
    return [];
  }
}

// Get popular TV series - Expanded
export const getPopularTVSeries = async (page = 1, pagesCount = 10) => {
  try {
    const pagePromises = [];
    for (let i = page; i < page + pagesCount; i++) {
      pagePromises.push(
        tmdbApi.get('/tv/popular', { params: { page: i } })
          .catch(() => ({ data: { results: [] } }))
      );
    }

    const responses = await Promise.all(pagePromises);
    let allSeries = [];

    responses.forEach(response => {
      if (response.data && response.data.results) {
        const shows = response.data.results.map(show => ({
          _id: show.id.toString(),
          title: show.name,
          description: show.overview,
          type: 'series',
          genre: show.genre_ids,
          poster: getTMDBImageUrl(show.poster_path),
          backdrop: getTMDBImageUrl(show.backdrop_path, 'w1280'),
          rating: show.vote_average,
          views: Math.floor(show.popularity * 1000),
          releaseYear: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 0,
          imdbID: show.id.toString(),
          language: show.original_language,
          videoUrl: `https://www.youtube.com/embed/sample_${show.id}`
        }));
        allSeries = [...allSeries, ...shows];
      }
    });

    const uniqueSeries = allSeries.filter((show, index, self) =>
      index === self.findIndex(s => s._id === show._id)
    );

    if (uniqueSeries.length > 0) return uniqueSeries;
    return getFallbackSeries();

  } catch (error) {
    console.error('Error fetching popular TV series:', error);
    return getFallbackSeries();
  }
};


// Get anime (Japanese TV shows and movies) - Expanded
export const getAnime = async (page = 1) => {
  try {
    // Fetch multiple pages for Anime to ensure we have a good library
    // TMDB genre 16 is Animation. Keyword 210024 is 'anime'.

    const fetchAnimePage = async (p, type) => {
      return tmdbApi.get(`/discover/${type}`, {
        params: {
          page: p,
          with_genres: '16',
          with_original_language: 'ja',
          sort_by: 'popularity.desc'
        }
      }).catch(() => null);
    };

    const requests = [];
    // Fetch 3 pages of movies and 3 pages of TV
    for (let i = 1; i <= 3; i++) {
      requests.push(fetchAnimePage(i, 'movie'));
      requests.push(fetchAnimePage(i, 'tv'));
    }

    const responses = await Promise.all(requests);

    let combined = [];

    responses.forEach((res, index) => {
      if (!res || !res.data || !res.data.results) return;

      const isMovie = index % 2 === 0; // Even indices are movies in our loop push order

      const items = res.data.results.map(item => ({
        _id: item.id.toString(),
        title: isMovie ? item.title : item.name,
        description: item.overview,
        type: 'anime',
        genre: item.genre_ids,
        poster: getTMDBImageUrl(item.poster_path),
        backdrop: getTMDBImageUrl(item.backdrop_path, 'w1280'),
        rating: item.vote_average,
        views: Math.floor(item.popularity * 1000),
        releaseYear: (isMovie ? item.release_date : item.first_air_date) ? new Date(isMovie ? item.release_date : item.first_air_date).getFullYear() : 0,
        imdbID: item.id.toString(),
        language: item.original_language,
        videoUrl: `https://www.youtube.com/embed/sample_${item.id}`
      }));
      combined = [...combined, ...items];
    });

    // Sort by rating
    combined.sort((a, b) => b.rating - a.rating);

    // Remove duplicates
    const unique = combined.filter((item, index, self) =>
      index === self.findIndex(i => i._id === item._id)
    );

    return unique.length > 0 ? unique : getFallbackAnime();
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
    }));

    // Return TMDB results or fallback if empty
    const results = response.data.results.map(movie => ({
      _id: movie.id.toString(),
      title: movie.title,
      description: movie.overview,
      type: 'movie',
      genre: movie.genre_ids,
      poster: getTMDBImageUrl(movie.poster_path),
      backdrop: getTMDBImageUrl(movie.backdrop_path, 'w1280'),
      rating: movie.vote_average,
      views: Math.floor(movie.popularity * 1000),
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
      imdbID: movie.id.toString(),
      language: movie.original_language,
      videoUrl: `https://www.youtube.com/embed/sample_${movie.id}`
    }));

    return results.length > 0 ? results : getFallbackMovies();
  } catch (error) {
    console.error('Error searching movies:', error);
    // Always return fallback data - never fail
    const fallback = getFallbackMovies();
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      return fallback.filter(m =>
        m.title.toLowerCase().includes(searchTerm) ||
        m.description?.toLowerCase().includes(searchTerm)
      );
    }
    return fallback;
  }
};

// Search TV series
export const searchTVSeries = async (query, page = 1) => {
  try {
    if (!query || query.trim() === '') {
      // Try API first, fallback to local
      try {
        const result = await getPopularTVSeries(page);
        return result.length > 0 ? result : getFallbackSeries();
      } catch {
        return getFallbackSeries();
      }
    }

    const response = await tmdbApi.get('/search/tv', {
      params: {
        query: query.trim(),
        page
      }
    });

    const results = response.data.results.map(show => ({
      _id: show.id.toString(),
      title: show.name,
      description: show.overview,
      type: 'series',
      genre: show.genre_ids,
      poster: getTMDBImageUrl(show.poster_path),
      backdrop: getTMDBImageUrl(show.backdrop_path, 'w1280'),
      rating: show.vote_average,
      views: Math.floor(show.popularity * 1000),
      releaseYear: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 0,
      imdbID: show.id.toString(),
      language: show.original_language,
      videoUrl: `https://www.youtube.com/embed/sample_${show.id}`
    }));

    return results.length > 0 ? results : getFallbackSeries();
  } catch (error) {
    console.error('Error searching TV series:', error);
    // Always return fallback data - never fail
    const fallback = getFallbackSeries();
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      return fallback.filter(s =>
        s.title.toLowerCase().includes(searchTerm) ||
        s.description?.toLowerCase().includes(searchTerm)
      );
    }
    return fallback;
  }
};

// Get videos/trailers for a movie
export const getMovieVideos = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`);
    const videos = response.data.results;

    // Filter for trailers and teasers from YouTube
    const trailers = videos.filter(v =>
      v.site === 'YouTube' &&
      (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip')
    );

    return trailers.map(video => ({
      id: video.id,
      key: video.key,
      name: video.name,
      type: video.type,
      url: `https://www.youtube.com/embed/${video.key}`,
      thumbnail: `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`
    }));
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    return [];
  }
};

// Get videos/trailers for a TV show
export const getTVVideos = async (tvId) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/videos`);
    const videos = response.data.results;

    const trailers = videos.filter(v =>
      v.site === 'YouTube' &&
      (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip' || v.type === 'Opening Credits')
    );

    return trailers.map(video => ({
      id: video.id,
      key: video.key,
      name: video.name,
      type: video.type,
      url: `https://www.youtube.com/embed/${video.key}`,
      thumbnail: `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`
    }));
  } catch (error) {
    console.error('Error fetching TV videos:', error);
    return [];
  }
};

// Get content details from TMDB with videos
export const getContentDetails = async (id, type = 'movie') => {
  // First, try to find content in local fallback data
  const findInLocalData = () => {
    const movies = getFallbackMovies();
    const series = getFallbackSeries();
    const anime = getFallbackAnime();

    // Search in all content types
    let found = movies.find(m => m._id === id || m.imdbID === id);
    if (found) return { ...found, type: 'movie' };

    found = series.find(s => s._id === id || s.imdbID === id);
    if (found) return { ...found, type: 'series' };

    found = anime.find(a => a._id === id || a.imdbID === id);
    if (found) return { ...found, type: 'anime' };

    return null;
  };

  try {
    // Check if ID is a local fallback ID (not numeric TMDB ID)
    const isLocalId = id.startsWith('mov_') || id.startsWith('ser_') || id.startsWith('ani_') || id.startsWith('tt');

    if (isLocalId) {
      const localContent = findInLocalData();
      if (localContent) {
        return {
          ...localContent,
          videos: localContent.videoUrl ? [{
            id: '1',
            name: 'Official Trailer',
            type: 'Trailer',
            url: localContent.videoUrl,
            thumbnail: `https://img.youtube.com/vi/${localContent.videoUrl.split('/').pop()}/hqdefault.jpg`
          }] : []
        };
      }
    }

    // Try TMDB API for numeric IDs
    const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
    const [detailsResponse, videosResponse] = await Promise.all([
      tmdbApi.get(endpoint, { params: { append_to_response: 'credits' } }),
      type === 'movie' ? getMovieVideos(id) : getTVVideos(id)
    ]);

    const data = detailsResponse.data;
    const videos = videosResponse || [];

    // Get the main trailer URL
    const mainTrailer = videos.find(v => v.type === 'Trailer') || videos[0];
    const videoUrl = mainTrailer ? mainTrailer.url : getFallbackTrailer(type);

    return {
      _id: data.id.toString(),
      title: data.title || data.name,
      description: data.overview,
      type: type,
      genre: data.genres ? data.genres.map(g => g.name) : [],
      poster: getTMDBImageUrl(data.poster_path),
      backdrop: getTMDBImageUrl(data.backdrop_path, 'w1280'),
      rating: data.vote_average,
      views: Math.floor(data.popularity * 1000),
      releaseYear: data.release_date ? new Date(data.release_date).getFullYear() :
        data.first_air_date ? new Date(data.first_air_date).getFullYear() : 0,
      director: data.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown',
      cast: data.credits?.cast?.slice(0, 5).map(actor => actor.name) || [],
      language: data.original_language,
      duration: data.runtime || (data.episode_run_time && data.episode_run_time[0]) || 0,
      imdbID: data.id.toString(),
      seasons: data.number_of_seasons || undefined,
      episodes: data.number_of_episodes || undefined,
      videoUrl: videoUrl,
      videos: videos, // All available videos
      tagline: data.tagline || '',
      status: data.status || 'Released'
    };
  } catch (error) {
    console.error('Error getting content details:', error);

    // Fallback: search in local data
    const localContent = findInLocalData();
    if (localContent) {
      return {
        ...localContent,
        videos: localContent.videoUrl ? [{
          id: '1',
          name: 'Official Trailer',
          type: 'Trailer',
          url: localContent.videoUrl,
          thumbnail: `https://img.youtube.com/vi/${localContent.videoUrl.split('/').pop()}/hqdefault.jpg`
        }] : []
      };
    }

    return null;
  }
};

// Get a fallback trailer based on content type
const getFallbackTrailer = (type) => {
  const fallbackTrailers = {
    movie: 'https://www.youtube.com/embed/TcMBFSGVi1c', // Avengers trailer
    series: 'https://www.youtube.com/embed/HhesaQXLuRY', // Breaking Bad trailer
    anime: 'https://www.youtube.com/embed/hDZ7y8RP5HE', // Demon Slayer trailer
    sport: 'https://www.youtube.com/embed/PhJHMW7LfCE'  // Sports highlight
  };
  return fallbackTrailers[type] || fallbackTrailers.movie;
};

// Fallback data functions - Comprehensive Movie Library
// Note: fullMovieUrl contains links to legally free movies on YouTube
const getFallbackMovies = () => {
  return [
    // Hollywood Blockbusters
    {
      _id: 'mov_1',
      title: 'Avengers: Endgame',
      description: 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos\' actions and restore balance.',
      type: 'movie',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
      rating: 8.4,
      views: 15000000,
      releaseYear: 2019,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c',
      fullMovieUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c' // Trailer (premium subscription required for full movie)
    },
    {
      _id: 'mov_2',
      title: 'The Dark Knight',
      description: 'When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests of his ability to fight injustice.',
      type: 'movie',
      genre: ['Action', 'Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
      rating: 9.0,
      views: 12000000,
      releaseYear: 2008,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY'
    },
    {
      _id: 'mov_3',
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
      type: 'movie',
      genre: ['Action', 'Sci-Fi', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
      rating: 8.8,
      views: 9800000,
      releaseYear: 2010,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0'
    },
    {
      _id: 'mov_4',
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      type: 'movie',
      genre: ['Adventure', 'Drama', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      rating: 8.6,
      views: 8500000,
      releaseYear: 2014,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E'
    },
    {
      _id: 'mov_5',
      title: 'Spider-Man: No Way Home',
      description: 'Peter Parker seeks help from Doctor Strange, accidentally opening the multiverse with villains from alternate realities.',
      type: 'movie',
      genre: ['Action', 'Adventure', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
      rating: 8.2,
      views: 11000000,
      releaseYear: 2021,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/JfVOs4VSpmA'
    },
    {
      _id: 'mov_6',
      title: 'Oppenheimer',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      type: 'movie',
      genre: ['Biography', 'Drama', 'History'],
      poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
      rating: 8.5,
      views: 7500000,
      releaseYear: 2023,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/uYPbbksJxIg'
    },
    // Bollywood Movies
    {
      _id: 'mov_7',
      title: 'Jawan',
      description: 'A prison warden embarks on a mission to rectify social injustices, seeking revenge against a ruthless businessman.',
      type: 'movie',
      genre: ['Action', 'Thriller', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/jitH0qopYIZC0RjvH9MgGkixAn6.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/1H5SA0SxjYQMwVzBetmvmfVy8DF.jpg',
      rating: 7.9,
      views: 18000000,
      releaseYear: 2023,
      language: 'hi',
      videoUrl: 'https://www.youtube.com/embed/MWOlnLMPrG4'
    },
    {
      _id: 'mov_8',
      title: 'Pathaan',
      description: 'An Indian spy takes on the nefarious villains who are planning to attack India with a deadly virus.',
      type: 'movie',
      genre: ['Action', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/lptctJJqrlkMhKnrSVBQyCdgpTj.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/y3AeW220VY9Dq1rmT5RzjhOTL5Q.jpg',
      rating: 7.1,
      views: 20000000,
      releaseYear: 2023,
      language: 'hi',
      videoUrl: 'https://www.youtube.com/embed/vqu4z34wENw'
    },
    {
      _id: 'mov_9',
      title: 'RRR',
      description: 'A tale of two legendary revolutionaries and their journey away from home before they began fighting for their country.',
      type: 'movie',
      genre: ['Action', 'Drama', 'History'],
      poster: 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/x35fZEXbWarXqVGXcsxD8zy3rSI.jpg',
      rating: 8.0,
      views: 25000000,
      releaseYear: 2022,
      language: 'te',
      videoUrl: 'https://www.youtube.com/embed/GY4BgdUSpME'
    },
    {
      _id: 'mov_10',
      title: 'KGF Chapter 2',
      description: 'Rocky takes control of the Kolar Gold Fields and becomes a feared overlord, but his enemies from the past seek revenge.',
      type: 'movie',
      genre: ['Action', 'Drama', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/7zQJYV02yehWrQN6NjKsBorqUBR.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/lL6N6qsxhiKqZ2DjUPT8kKsLdVw.jpg',
      rating: 8.4,
      views: 22000000,
      releaseYear: 2022,
      language: 'kn',
      videoUrl: 'https://www.youtube.com/embed/JKa9O1wSgl8'
    },
    {
      _id: 'mov_11',
      title: '3 Idiots',
      description: 'Two friends search for their long-lost companion who inspired them to think differently about life and education.',
      type: 'movie',
      genre: ['Comedy', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/bLJTjfbZ1XpogfPer0gq6SkZXYR.jpg',
      rating: 8.4,
      views: 15000000,
      releaseYear: 2009,
      language: 'hi',
      videoUrl: 'https://www.youtube.com/embed/K0eDlFX9GMc',
      fullMovieUrl: 'https://www.youtube.com/embed/xvszmNXdM4w' // Full movie (free on YouTube)
    },
    {
      _id: 'mov_12',
      title: 'Dangal',
      description: 'Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become world-class wrestlers.',
      type: 'movie',
      genre: ['Action', 'Biography', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/fM4WVl4XYYosnUPfvAGMPfuqAjU.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/lN22BgwzPWfZ4XJBW9LLCTI4KTV.jpg',
      rating: 8.4,
      views: 19000000,
      releaseYear: 2016,
      language: 'hi',
      videoUrl: 'https://www.youtube.com/embed/x_7YlGv9u1g',
      fullMovieUrl: 'https://www.youtube.com/embed/pu2K8ckZdLw' // Full movie (free on YouTube)
    },
    {
      _id: 'mov_13',
      title: 'Drishyam 2',
      description: 'Vijay Salgaonkar must protect his family again when new evidence emerges in the murder case he covered up years ago.',
      type: 'movie',
      genre: ['Crime', 'Drama', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/eJWGqmJTwHO1z8vDlnVvQ7MJSYY.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/sP0e3bFxsoiO8l4m74wGlCDdHsM.jpg',
      rating: 7.6,
      views: 12000000,
      releaseYear: 2022,
      language: 'hi',
      videoUrl: 'https://www.youtube.com/embed/ooBksgNB1HM'
    },
    {
      _id: 'mov_14',
      title: 'Bajrangi Bhaijaan',
      description: 'A man with a simple nature attempts to reunite a lost mute Pakistani girl with her family across the border.',
      type: 'movie',
      genre: ['Action', 'Comedy', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/9snnZ8SJOQR3m2e7HjG8X4nt6nZ.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/fIlxMOqLNBGaqaNLyRnLdBWqvKP.jpg',
      rating: 8.1,
      views: 17000000,
      releaseYear: 2015,
      language: 'hi',
      videoUrl: 'https://www.youtube.com/embed/4nwAra0mz_s',
      fullMovieUrl: 'https://www.youtube.com/embed/9gH1zJDgNS0' // Full movie (free on YouTube)
    },
    {
      _id: 'mov_15',
      title: 'Animal',
      description: 'A son undergoes a remarkable transformation as his love for his father becomes all-consuming.',
      type: 'movie',
      genre: ['Action', 'Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/mYM2ODMNCxNxuVYB4K5HVADQ8wk.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/sK7MymBGqr0jDxXCm1Y6Zk2wODM.jpg',
      rating: 7.2,
      views: 16000000,
      releaseYear: 2023,
      language: 'hi',
      videoUrl: 'https://www.youtube.com/embed/Ttu-6HvJefs'
    },
    // South Indian Movies
    {
      _id: 'mov_16',
      title: 'Vikram',
      description: 'A special agent investigates a case of serial killings connected to a drug syndicate.',
      type: 'movie',
      genre: ['Action', 'Crime', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/n1kGGopXvSeyRfXGnwtQ8V1c5Gl.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/lnWkyG3LLgbbrIEeHrBpuEMevnH.jpg',
      rating: 8.3,
      views: 14000000,
      releaseYear: 2022,
      language: 'ta',
      videoUrl: 'https://www.youtube.com/embed/OKBMCL-frPU'
    },
    {
      _id: 'mov_17',
      title: 'Pushpa: The Rise',
      description: 'A laborer rises through the ranks of a red sandalwood smuggling syndicate, battling both rivals and the law.',
      type: 'movie',
      genre: ['Action', 'Drama', 'Crime'],
      poster: 'https://image.tmdb.org/t/p/w500/pWsD91G2R1Da3AKM3ymr3UoIRQB.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/1aGCN7a0bI1r5DXxiQnCIeIjEr4.jpg',
      rating: 7.6,
      views: 21000000,
      releaseYear: 2021,
      language: 'te',
      videoUrl: 'https://www.youtube.com/embed/pKctjlxbFDQ'
    },
    {
      _id: 'mov_18',
      title: 'Kantara',
      description: 'A Kambala champion locks horns with an upright forest officer in a battle of man vs. nature.',
      type: 'movie',
      genre: ['Action', 'Drama', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/vZ1YUaOqGY7HhyRPfxfwT4vhOYK.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/lRRxAkXMaF41fXjKGLnv1iqk56d.jpg',
      rating: 8.3,
      views: 13000000,
      releaseYear: 2022,
      language: 'kn',
      videoUrl: 'https://www.youtube.com/embed/bxbD6aUpCsk'
    },
    // Hollywood Classics
    {
      _id: 'mov_19',
      title: 'The Shawshank Redemption',
      description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      type: 'movie',
      genre: ['Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
      rating: 9.3,
      views: 8000000,
      releaseYear: 1994,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/6hB3S9bIaco'
    },
    {
      _id: 'mov_20',
      title: 'The Godfather',
      description: 'The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.',
      type: 'movie',
      genre: ['Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
      rating: 9.2,
      views: 7500000,
      releaseYear: 1972,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/sY1S34973zA'
    },
    {
      _id: 'mov_21',
      title: 'Pulp Fiction',
      description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
      type: 'movie',
      genre: ['Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
      rating: 8.9,
      views: 6500000,
      releaseYear: 1994,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/s7EdQ4FqbhY'
    },
    {
      _id: 'mov_22',
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family.',
      type: 'movie',
      genre: ['Sci-Fi', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
      rating: 8.5,
      views: 9000000,
      releaseYear: 2024,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/Way9Dexny3w'
    },
    {
      _id: 'mov_23',
      title: 'Avatar: The Way of Water',
      description: 'Jake Sully and Neytiri have formed a family and are doing everything to stay together.',
      type: 'movie',
      genre: ['Action', 'Adventure', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
      rating: 7.7,
      views: 13000000,
      releaseYear: 2022,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/d9MyW72ELq0'
    },
    {
      _id: 'mov_24',
      title: 'John Wick: Chapter 4',
      description: 'John Wick uncovers a path to defeating the High Table, but must face new enemies worldwide.',
      type: 'movie',
      genre: ['Action', 'Crime', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/h8gHn0OzBoaefsYseUByqsmEDMY.jpg',
      rating: 7.7,
      views: 8500000,
      releaseYear: 2023,
      language: 'en',
      videoUrl: 'https://www.youtube.com/embed/qEVUtrk8_B4'
    },
    {
      _id: 'mov_25',
      title: 'Top Gun: Maverick',
      description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must face ghosts of his past.',
      type: 'movie',
      genre: ['Action', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/AaV1YIdWKhxX5Imi7B1KU9VFwv6.jpg',
      rating: 8.3,
      views: 11000000,
      releaseYear: 2022,
      language: 'en',
      imdbID: 'tt1745960',
      videoUrl: 'https://www.youtube.com/embed/qSqVVswa420'
    },
    // More Hollywood with IMDB IDs
    {
      _id: 'tt4154796',
      title: 'Avengers: Infinity War',
      description: 'The Avengers must stop Thanos from collecting all six Infinity Stones.',
      type: 'movie',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg',
      rating: 8.4,
      views: 14000000,
      releaseYear: 2018,
      language: 'en',
      imdbID: 'tt4154796',
      videoUrl: 'https://www.youtube.com/embed/6ZfuNTqbHE8'
    },
    {
      _id: 'tt0111161',
      title: 'The Shawshank Redemption',
      description: 'Two imprisoned men bond over years, finding solace through acts of common decency.',
      type: 'movie',
      genre: ['Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
      rating: 9.3,
      views: 8000000,
      releaseYear: 1994,
      language: 'en',
      imdbID: 'tt0111161',
      videoUrl: 'https://www.youtube.com/embed/6hB3S9bIaco'
    },
    {
      _id: 'tt0068646',
      title: 'The Godfather',
      description: 'The aging patriarch transfers control of his empire to his reluctant son.',
      type: 'movie',
      genre: ['Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
      rating: 9.2,
      views: 7500000,
      releaseYear: 1972,
      language: 'en',
      imdbID: 'tt0068646',
      videoUrl: 'https://www.youtube.com/embed/sY1S34973zA'
    },
    {
      _id: 'tt0167260',
      title: 'The Lord of the Rings: Return of the King',
      description: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army.',
      type: 'movie',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/lXhgCODAbBXL5buk9yEmTpOoOgR.jpg',
      rating: 9.0,
      views: 9000000,
      releaseYear: 2003,
      language: 'en',
      imdbID: 'tt0167260',
      videoUrl: 'https://www.youtube.com/embed/r5X-hFf6Bwo'
    },
    {
      _id: 'tt0137523',
      title: 'Fight Club',
      description: 'An insomniac office worker forms an underground fight club.',
      type: 'movie',
      genre: ['Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg',
      rating: 8.8,
      views: 7000000,
      releaseYear: 1999,
      language: 'en',
      imdbID: 'tt0137523',
      videoUrl: 'https://www.youtube.com/embed/qtRKdVHc-cE'
    },
    {
      _id: 'tt0109830',
      title: 'Forrest Gump',
      description: 'The story of a man with low IQ who accomplishes great things.',
      type: 'movie',
      genre: ['Drama', 'Romance'],
      poster: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/7c9UVPPiTPltouxRVY6N9uugaVA.jpg',
      rating: 8.8,
      views: 8500000,
      releaseYear: 1994,
      language: 'en',
      imdbID: 'tt0109830',
      videoUrl: 'https://www.youtube.com/embed/bLvqoHBptjg'
    },
    {
      _id: 'tt0133093',
      title: 'The Matrix',
      description: 'A hacker discovers the true nature of reality and his role in the war against controllers.',
      type: 'movie',
      genre: ['Action', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/l4QHerTSbMI7qgvasqxP36pqjN6.jpg',
      rating: 8.7,
      views: 9500000,
      releaseYear: 1999,
      language: 'en',
      imdbID: 'tt0133093',
      videoUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8'
    },
    {
      _id: 'tt0816692',
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space.',
      type: 'movie',
      genre: ['Adventure', 'Drama', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      rating: 8.6,
      views: 8500000,
      releaseYear: 2014,
      language: 'en',
      imdbID: 'tt0816692',
      videoUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E'
    },
    {
      _id: 'tt1375666',
      title: 'Inception',
      description: 'A thief who steals secrets through dream-sharing technology.',
      type: 'movie',
      genre: ['Action', 'Sci-Fi', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
      rating: 8.8,
      views: 9800000,
      releaseYear: 2010,
      language: 'en',
      imdbID: 'tt1375666',
      videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0'
    },
    {
      _id: 'tt0120737',
      title: 'The Lord of the Rings: Fellowship',
      description: 'A hobbit inherits a ring that must be destroyed in the fires of Mount Doom.',
      type: 'movie',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/x2RS3uTcsJJ9IfjNPcgDmukoEcQ.jpg',
      rating: 8.8,
      views: 8000000,
      releaseYear: 2001,
      language: 'en',
      imdbID: 'tt0120737',
      videoUrl: 'https://www.youtube.com/embed/V75dMMIW2B4'
    },
    {
      _id: 'tt0110912',
      title: 'Pulp Fiction',
      description: 'The lives of two mob hitmen intertwine in tales of violence.',
      type: 'movie',
      genre: ['Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
      rating: 8.9,
      views: 6500000,
      releaseYear: 1994,
      language: 'en',
      imdbID: 'tt0110912',
      videoUrl: 'https://www.youtube.com/embed/s7EdQ4FqbhY'
    },
    {
      _id: 'tt6751668',
      title: 'Parasite',
      description: 'A poor family schemes to infiltrate a wealthy household.',
      type: 'movie',
      genre: ['Drama', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
      rating: 8.5,
      views: 7000000,
      releaseYear: 2019,
      language: 'ko',
      imdbID: 'tt6751668',
      videoUrl: 'https://www.youtube.com/embed/5xH0HfJHsaY'
    },
    {
      _id: 'tt0088763',
      title: 'Back to the Future',
      description: 'A teenager travels back in time in a DeLorean.',
      type: 'movie',
      genre: ['Adventure', 'Comedy', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      rating: 8.5,
      views: 7500000,
      releaseYear: 1985,
      language: 'en',
      imdbID: 'tt0088763',
      videoUrl: 'https://www.youtube.com/embed/qvsgGtivCgs'
    },
    {
      _id: 'tt0114369',
      title: 'Se7en',
      description: 'Two detectives hunt a serial killer who uses seven deadly sins.',
      type: 'movie',
      genre: ['Crime', 'Drama', 'Mystery'],
      poster: 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/bSqt9rhDZx1Q7UZ86dBPKdNomp2.jpg',
      rating: 8.6,
      views: 6000000,
      releaseYear: 1995,
      language: 'en',
      imdbID: 'tt0114369',
      videoUrl: 'https://www.youtube.com/embed/znmZoVkCjpI'
    },
    {
      _id: 'tt0102926',
      title: 'The Silence of the Lambs',
      description: 'FBI trainee seeks help from imprisoned cannibal killer.',
      type: 'movie',
      genre: ['Crime', 'Drama', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/rplLJ2hPcOQmkFhTqUte0MkEaO2.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/mfwq2nMBzArzQ7Y9RKE8SKeeTkg.jpg',
      rating: 8.6,
      views: 5500000,
      releaseYear: 1991,
      language: 'en',
      imdbID: 'tt0102926',
      videoUrl: 'https://www.youtube.com/embed/W6Mm8Sbe__o'
    },
    {
      _id: 'tt0482571',
      title: 'The Prestige',
      description: 'Two magicians engage in a competitive battle of illusions.',
      type: 'movie',
      genre: ['Drama', 'Mystery', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/bdN3gXuIZYaJP7ftKK2sU0nPtEA.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/jb9k3pRZVEqK9TI5bRH8qMilT7a.jpg',
      rating: 8.5,
      views: 6000000,
      releaseYear: 2006,
      language: 'en',
      imdbID: 'tt0482571',
      videoUrl: 'https://www.youtube.com/embed/ijXruSzfGEc'
    },
    {
      _id: 'tt0993846',
      title: 'The Wolf of Wall Street',
      description: 'The true story of Jordan Belfort\'s rise and fall on Wall Street.',
      type: 'movie',
      genre: ['Biography', 'Comedy', 'Crime'],
      poster: 'https://image.tmdb.org/t/p/w500/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/cWUOv3H7YFwvKeaQhoAQTLLpo9Z.jpg',
      rating: 8.2,
      views: 7000000,
      releaseYear: 2013,
      language: 'en',
      imdbID: 'tt0993846',
      videoUrl: 'https://www.youtube.com/embed/iszwuX1AK6A'
    },
    {
      _id: 'tt0407887',
      title: 'The Departed',
      description: 'An undercover cop and a mole in the police try to identify each other.',
      type: 'movie',
      genre: ['Crime', 'Drama', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/8Od5zV7Q7zNOX0y9tyNgpTmoiGA.jpg',
      rating: 8.5,
      views: 5500000,
      releaseYear: 2006,
      language: 'en',
      imdbID: 'tt0407887',
      videoUrl: 'https://www.youtube.com/embed/iQpb1LoeVUc'
    },
    {
      _id: 'tt0172495',
      title: 'Gladiator',
      description: 'A former Roman General seeks revenge against the emperor.',
      type: 'movie',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/Ar7QuJ8a3kKKmS9MrGkO8q6jMB3.jpg',
      rating: 8.5,
      views: 6500000,
      releaseYear: 2000,
      language: 'en',
      imdbID: 'tt0172495',
      videoUrl: 'https://www.youtube.com/embed/owK1qxDselE'
    },
    {
      _id: 'tt0361748',
      title: 'Inglourious Basterds',
      description: 'Jewish soldiers plan to assassinate Nazi leaders in WWII.',
      type: 'movie',
      genre: ['Adventure', 'Drama', 'War'],
      poster: 'https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/gLhHHZUzeseRXShoDyC4VqLgs90.jpg',
      rating: 8.3,
      views: 5000000,
      releaseYear: 2009,
      language: 'en',
      imdbID: 'tt0361748',
      videoUrl: 'https://www.youtube.com/embed/KnrRy6kSFF0'
    },
    {
      _id: 'tt1853728',
      title: 'Django Unchained',
      description: 'A freed slave sets out to rescue his wife from a plantation.',
      type: 'movie',
      genre: ['Drama', 'Western'],
      poster: 'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/2oZklIzUbvZXXzIFzv7Hi68d6xf.jpg',
      rating: 8.4,
      views: 6000000,
      releaseYear: 2012,
      language: 'en',
      imdbID: 'tt1853728',
      videoUrl: 'https://www.youtube.com/embed/0fUCuvNlOCg'
    },
    {
      _id: 'tt0120815',
      title: 'Saving Private Ryan',
      description: 'A group of soldiers search for a paratrooper in WWII.',
      type: 'movie',
      genre: ['Drama', 'War'],
      poster: 'https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/bdD39MpSVhKjxarTxLSfX6baoMP.jpg',
      rating: 8.6,
      views: 7000000,
      releaseYear: 1998,
      language: 'en',
      imdbID: 'tt0120815',
      videoUrl: 'https://www.youtube.com/embed/zwhP5b4tD6g'
    },
    {
      _id: 'tt0253474',
      title: 'The Pianist',
      description: 'A Jewish pianist survives the destruction of the Warsaw ghetto.',
      type: 'movie',
      genre: ['Biography', 'Drama', 'Music'],
      poster: 'https://image.tmdb.org/t/p/w500/2hFvxCCWrTmCYwfy7yum0GKRi3Y.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/qVjEFgEIvL4QVVMn30vHVpPPFIb.jpg',
      rating: 8.5,
      views: 4500000,
      releaseYear: 2002,
      language: 'en',
      imdbID: 'tt0253474',
      videoUrl: 'https://www.youtube.com/embed/u1qWkbYfGXs'
    },
    {
      _id: 'tt0078748',
      title: 'Alien',
      description: 'A commercial space crew encounters a deadly life form.',
      type: 'movie',
      genre: ['Horror', 'Sci-Fi'],
      poster: 'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg',
      rating: 8.5,
      views: 5000000,
      releaseYear: 1979,
      language: 'en',
      imdbID: 'tt0078748',
      videoUrl: 'https://www.youtube.com/embed/LjLamj-b0I8'
    },
    {
      _id: 'tt0245429',
      title: 'Spirited Away',
      description: 'A girl enters a world ruled by gods and spirits.',
      type: 'movie',
      genre: ['Animation', 'Adventure', 'Family'],
      poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/bSXfU4dwZyBA1vMmXvejdg2Kf9T.jpg',
      rating: 8.6,
      views: 6000000,
      releaseYear: 2001,
      language: 'ja',
      imdbID: 'tt0245429',
      videoUrl: 'https://www.youtube.com/embed/ByXuk9QqQkk'
    },
    {
      _id: 'tt2380307',
      title: 'Coco',
      description: 'A boy journeys to the Land of the Dead seeking his great-great-grandfather.',
      type: 'movie',
      genre: ['Animation', 'Adventure', 'Family'],
      poster: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZS2UdURvR.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/askg3SMvhqEl4OL52YuvdtY40Yb.jpg',
      rating: 8.4,
      views: 7000000,
      releaseYear: 2017,
      language: 'en',
      imdbID: 'tt2380307',
      videoUrl: 'https://www.youtube.com/embed/Rvr68u6k5sI'
    },
    {
      _id: 'tt0317248',
      title: 'City of God',
      description: 'Two boys growing up in Rio de Janeiro take different paths.',
      type: 'movie',
      genre: ['Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/gLhHHZUzeseRXShoDyC4VqLgs90.jpg',
      rating: 8.6,
      views: 4000000,
      releaseYear: 2002,
      language: 'pt',
      imdbID: 'tt0317248',
      videoUrl: 'https://www.youtube.com/embed/dcUOO4Itgmw'
    },
    {
      _id: 'tt0119217',
      title: 'Good Will Hunting',
      description: 'A janitor at MIT has a gift for mathematics.',
      type: 'movie',
      genre: ['Drama', 'Romance'],
      poster: 'https://image.tmdb.org/t/p/w500/bABCBKYBK7A5G1x0FzoeoNNuj2x.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/o8u0NyEigCEaZHBdCYTRfXR8U4i.jpg',
      rating: 8.3,
      views: 5500000,
      releaseYear: 1997,
      language: 'en',
      imdbID: 'tt0119217',
      videoUrl: 'https://www.youtube.com/embed/PaZVjZEFkRs'
    },
    // More Bollywood with IMDB IDs
    {
      _id: 'tt15354916',
      title: 'Jawan',
      description: 'A man is driven by a personal vendetta to rectify social injustices.',
      type: 'movie',
      genre: ['Action', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/jitH0qopYIZC0RjvH9MgGkixAn6.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/1H5SA0SxjYQMwVzBetmvmfVy8DF.jpg',
      rating: 7.9,
      views: 18000000,
      releaseYear: 2023,
      language: 'hi',
      imdbID: 'tt15354916',
      videoUrl: 'https://www.youtube.com/embed/MWOlnLMPrG4'
    },
    {
      _id: 'tt12844910',
      title: 'Pathaan',
      description: 'An Indian spy takes on villains planning to attack India.',
      type: 'movie',
      genre: ['Action', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/lptctJJqrlkMhKnrSVBQyCdgpTj.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/y3AeW220VY9Dq1rmT5RzjhOTL5Q.jpg',
      rating: 7.1,
      views: 20000000,
      releaseYear: 2023,
      language: 'hi',
      imdbID: 'tt12844910',
      videoUrl: 'https://www.youtube.com/embed/vqu4z34wENw'
    },
    {
      _id: 'tt8178634',
      title: 'RRR',
      description: 'Two legendary revolutionaries journey before fighting for India.',
      type: 'movie',
      genre: ['Action', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/x35fZEXbWarXqVGXcsxD8zy3rSI.jpg',
      rating: 8.0,
      views: 25000000,
      releaseYear: 2022,
      language: 'te',
      imdbID: 'tt8178634',
      videoUrl: 'https://www.youtube.com/embed/GY4BgdUSpME'
    },
    {
      _id: 'tt10954984',
      title: 'KGF: Chapter 2',
      description: 'Rocky\'s reign begins and his enemies plot against him.',
      type: 'movie',
      genre: ['Action', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/7zQJYV02yehWrQN6NjKsBorqUBR.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/lL6N6qsxhiKqZ2DjUPT8kKsLdVw.jpg',
      rating: 8.4,
      views: 22000000,
      releaseYear: 2022,
      language: 'kn',
      imdbID: 'tt10954984',
      videoUrl: 'https://www.youtube.com/embed/JKa9O1wSgl8'
    },
    {
      _id: 'tt1187043',
      title: '3 Idiots',
      description: 'Two friends search for their long-lost companion.',
      type: 'movie',
      genre: ['Comedy', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/bLJTjfbZ1XpogfPer0gq6SkZXYR.jpg',
      rating: 8.4,
      views: 15000000,
      releaseYear: 2009,
      language: 'hi',
      imdbID: 'tt1187043',
      videoUrl: 'https://www.youtube.com/embed/K0eDlFX9GMc'
    },
    {
      _id: 'tt5074352',
      title: 'Dangal',
      description: 'A wrestler trains his daughters to be world-class wrestlers.',
      type: 'movie',
      genre: ['Action', 'Biography', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/fM4WVl4XYYosnUPfvAGMPfuqAjU.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/lN22BgwzPWfZ4XJBW9LLCTI4KTV.jpg',
      rating: 8.4,
      views: 19000000,
      releaseYear: 2016,
      language: 'hi',
      imdbID: 'tt5074352',
      videoUrl: 'https://www.youtube.com/embed/x_7YlGv9u1g'
    },
    {
      _id: 'tt4972582',
      title: 'Bajrangi Bhaijaan',
      description: 'A man reunites a mute Pakistani girl with her family.',
      type: 'movie',
      genre: ['Action', 'Comedy', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/9snnZ8SJOQR3m2e7HjG8X4nt6nZ.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/fIlxMOqLNBGaqaNLyRnLdBWqvKP.jpg',
      rating: 8.1,
      views: 17000000,
      releaseYear: 2015,
      language: 'hi',
      imdbID: 'tt4972582',
      videoUrl: 'https://www.youtube.com/embed/4nwAra0mz_s'
    }
  ];
};

// Comprehensive TV Series Library
const getFallbackSeries = () => {
  return [
    // Indian Web Series
    {
      _id: 'ser_1',
      title: 'Scam 1992: The Harshad Mehta Story',
      description: 'The rise and fall of Harshad Mehta, a stockbroker who single-handedly took the stock market to dizzying heights.',
      type: 'series',
      genre: ['Biography', 'Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/sJ6K4mLqVQMIpN71N9iJQnF28Ck.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/lDYTKE7tMJ0YoR92lFpTuPZc73K.jpg',
      rating: 9.3,
      views: 25000000,
      releaseYear: 2020,
      language: 'hi',
      seasons: 1,
      episodes: 10,
      videoUrl: 'https://www.youtube.com/embed/sOv5yFhQsJA'
    },
    {
      _id: 'ser_2',
      title: 'The Family Man',
      description: 'A middle-class man who works for a special cell of the National Investigation Agency, while trying to balance family life.',
      type: 'series',
      genre: ['Action', 'Comedy', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/eBJEvkxlRFtAkunISm4CPSNzLOz.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/1F4EG97yw9FnXSjjQr9rQFvmZz9.jpg',
      rating: 8.7,
      views: 30000000,
      releaseYear: 2019,
      language: 'hi',
      seasons: 2,
      episodes: 19,
      videoUrl: 'https://www.youtube.com/embed/Ji8vLuAHbmo'
    },
    {
      _id: 'ser_3',
      title: 'Sacred Games',
      description: 'A link in their pasts leads a cop to a criminal, whose cryptic warning of something sinister starts a chain of events.',
      type: 'series',
      genre: ['Action', 'Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/pkkNpKPshpjgEXy1IeZwMQBo8Nh.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/akVv4dftMZFIhmQV6o6X3X0ddD.jpg',
      rating: 8.6,
      views: 22000000,
      releaseYear: 2018,
      language: 'hi',
      seasons: 2,
      episodes: 16,
      videoUrl: 'https://www.youtube.com/embed/bQxUaMkHqhY'
    },
    {
      _id: 'ser_4',
      title: 'Mirzapur',
      description: 'A shocking incident at a wedding propels a family into the world of guns, drugs, and lawlessness in Mirzapur.',
      type: 'series',
      genre: ['Action', 'Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/wdF5geiJBZblXHZTfhVLWdhX37v.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/aH0LqThXAOMjnT3KyUvzLzh7txN.jpg',
      rating: 8.5,
      views: 28000000,
      releaseYear: 2018,
      language: 'hi',
      seasons: 3,
      episodes: 28,
      videoUrl: 'https://www.youtube.com/embed/pVLtYHNdqaE'
    },
    {
      _id: 'ser_5',
      title: 'Panchayat',
      description: 'A comedy-drama about an engineering graduate working as a secretary in a village panchayat office.',
      type: 'series',
      genre: ['Comedy', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/zspxqgGlHbmN5YLMPfxXWKqq45d.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/ynQEVKBHNJorxLU3lXQaF1Xvxpe.jpg',
      rating: 8.9,
      views: 20000000,
      releaseYear: 2020,
      language: 'hi',
      seasons: 3,
      episodes: 24,
      videoUrl: 'https://www.youtube.com/embed/NfuiB52K0PQ'
    },
    {
      _id: 'ser_6',
      title: 'Aspirants',
      description: 'Three UPSC aspirants navigate the challenging world of civil services examination while dealing with life and friendship.',
      type: 'series',
      genre: ['Drama'],
      poster: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1280&h=720&fit=crop',
      rating: 9.1,
      views: 18000000,
      releaseYear: 2021,
      language: 'hi',
      seasons: 2,
      episodes: 10,
      videoUrl: 'https://www.youtube.com/embed/9MAswBOlJuk'
    },
    // International Series
    {
      _id: 'ser_7',
      title: 'Breaking Bad',
      description: 'A high school chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine.',
      type: 'series',
      genre: ['Crime', 'Drama', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7AQDQ.jpg',
      rating: 9.5,
      views: 35000000,
      releaseYear: 2008,
      language: 'en',
      seasons: 5,
      episodes: 62,
      videoUrl: 'https://www.youtube.com/embed/HhesaQXLuRY'
    },
    {
      _id: 'ser_8',
      title: 'Game of Thrones',
      description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns.',
      type: 'series',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
      rating: 9.2,
      views: 40000000,
      releaseYear: 2011,
      language: 'en',
      seasons: 8,
      episodes: 73,
      videoUrl: 'https://www.youtube.com/embed/KPLWWIOCOOQ'
    },
    {
      _id: 'ser_9',
      title: 'Stranger Things',
      description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
      type: 'series',
      genre: ['Drama', 'Fantasy', 'Horror'],
      poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/56v2RONwf2bpD7lZ0W2RcQZ3v3V.jpg',
      rating: 8.7,
      views: 32000000,
      releaseYear: 2016,
      language: 'en',
      seasons: 4,
      episodes: 34,
      videoUrl: 'https://www.youtube.com/embed/b9EkMc79ZSU'
    },
    {
      _id: 'ser_10',
      title: 'Money Heist',
      description: 'A criminal mastermind recruits eight people with special abilities to carry out the perfect heist.',
      type: 'series',
      genre: ['Action', 'Crime', 'Mystery'],
      poster: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/xGexTKCJDkl12dTW4YCBDXWb1AD.jpg',
      rating: 8.3,
      views: 28000000,
      releaseYear: 2017,
      language: 'es',
      seasons: 5,
      episodes: 41,
      videoUrl: 'https://www.youtube.com/embed/_InqQJRqGW4'
    },
    {
      _id: 'ser_11',
      title: 'The Witcher',
      description: 'Geralt of Rivia, a mutated monster-hunter, struggles to find his place in a world full of evil.',
      type: 'series',
      genre: ['Action', 'Adventure', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/e1YEr3kBgSQtdr1N6RUe0DQo1Kv.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg',
      rating: 8.2,
      views: 25000000,
      releaseYear: 2019,
      language: 'en',
      seasons: 3,
      episodes: 24,
      videoUrl: 'https://www.youtube.com/embed/ndl1W4ltcmg'
    },
    {
      _id: 'ser_12',
      title: 'Squid Game',
      description: 'Hundreds of cash-strapped players accept an invitation to compete in children\'s games for a tempting prize.',
      type: 'series',
      genre: ['Action', 'Drama', 'Mystery'],
      poster: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/qw3J9cNeLioOLoR68WX7z79aCdK.jpg',
      rating: 8.0,
      views: 45000000,
      releaseYear: 2021,
      language: 'ko',
      seasons: 2,
      episodes: 16,
      videoUrl: 'https://www.youtube.com/embed/oqxAJKy0ii4'
    },
    {
      _id: 'ser_13',
      title: 'Wednesday',
      description: 'Wednesday Addams investigates a murder spree while making new friends at Nevermore Academy.',
      type: 'series',
      genre: ['Comedy', 'Crime', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg',
      rating: 8.1,
      views: 35000000,
      releaseYear: 2022,
      language: 'en',
      seasons: 1,
      episodes: 8,
      videoUrl: 'https://www.youtube.com/embed/Di310WS8zLk'
    },
    {
      _id: 'ser_14',
      title: 'The Last of Us',
      description: 'Joel and Ellie must survive a brutal journey across post-pandemic America in search of a cure.',
      type: 'series',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
      rating: 8.8,
      views: 30000000,
      releaseYear: 2023,
      language: 'en',
      seasons: 2,
      episodes: 16,
      videoUrl: 'https://www.youtube.com/embed/uLtkt8BonwM'
    },
    {
      _id: 'ser_15',
      title: 'Dark',
      description: 'A family saga with a supernatural twist, set in a German town where the disappearance of two children exposes secrets.',
      type: 'series',
      genre: ['Crime', 'Drama', 'Mystery'],
      poster: 'https://image.tmdb.org/t/p/w500/5LoHuHWA4H8jElFlZDvsmU2n63b.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/3lBDg3i6nn5R2NKFCJ6oKyUo2j5.jpg',
      rating: 8.8,
      views: 18000000,
      releaseYear: 2017,
      language: 'de',
      seasons: 3,
      episodes: 26,
      videoUrl: 'https://www.youtube.com/embed/rrwycJ08PSA'
    }
  ];
};

// Comprehensive Anime Library
const getFallbackAnime = () => {
  return [
    {
      _id: 'ani_1',
      title: 'Demon Slayer: Kimetsu no Yaiba',
      description: 'A boy raised by boars joins the Demon Slayer Corps to turn his sister back into a human after she becomes a demon.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/nGlktdEmzzwPtcWsYJMGvY5IqXP.jpg',
      rating: 8.7,
      views: 45000000,
      releaseYear: 2019,
      language: 'ja',
      seasons: 4,
      episodes: 55,
      videoUrl: 'https://www.youtube.com/embed/VQGCKyvzIM4'
    },
    {
      _id: 'ani_2',
      title: 'Attack on Titan',
      description: 'Humanity lives in cities surrounded by walls due to the Titans, gigantic humanoid beings who devour humans.',
      type: 'anime',
      genre: ['Action', 'Drama', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfi8rhPH8bQq5sLX.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg',
      rating: 9.0,
      views: 55000000,
      releaseYear: 2013,
      language: 'ja',
      seasons: 4,
      episodes: 87,
      videoUrl: 'https://www.youtube.com/embed/MGRm4IzK1SQ'
    },
    {
      _id: 'ani_3',
      title: 'One Piece',
      description: 'Monkey D. Luffy and his pirate crew explore the Grand Line in search of the world\'s ultimate treasure.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Comedy'],
      poster: 'https://image.tmdb.org/t/p/w500/fcXdJlbSdUEeMSJFsXKsznGwwok.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg',
      rating: 8.9,
      views: 70000000,
      releaseYear: 1999,
      language: 'ja',
      seasons: 21,
      episodes: 1100,
      videoUrl: 'https://www.youtube.com/embed/MCb13lbVGE0'
    },
    {
      _id: 'ani_4',
      title: 'Jujutsu Kaisen',
      description: 'A boy swallows a cursed talisman and becomes host to a powerful curse, joining a secret organization of Jujutsu Sorcerers.',
      type: 'anime',
      genre: ['Action', 'Fantasy', 'Horror'],
      poster: 'https://image.tmdb.org/t/p/w500/fNg1j3I8aLCZlnSNYW2jJIXBxan.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/doAzov2bZNUlkZWycKCqHqdPG3P.jpg',
      rating: 8.6,
      views: 40000000,
      releaseYear: 2020,
      language: 'ja',
      seasons: 2,
      episodes: 47,
      videoUrl: 'https://www.youtube.com/embed/4A_X-Dvl0ws'
    },
    {
      _id: 'ani_5',
      title: 'My Hero Academia',
      description: 'In a world where most people have superpowers, a powerless boy dreams of becoming a hero.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Comedy'],
      poster: 'https://image.tmdb.org/t/p/w500/ivOLM47yJt90P19RH1Fw79AkfMI.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/9RqliZcoDEjSEISeA0LY7kQiZzG.jpg',
      rating: 8.4,
      views: 38000000,
      releaseYear: 2016,
      language: 'ja',
      seasons: 7,
      episodes: 138,
      videoUrl: 'https://www.youtube.com/embed/D5fYOnwYkj4'
    },
    {
      _id: 'ani_6',
      title: 'Naruto Shippuden',
      description: 'Naruto Uzumaki continues his journey to become the greatest ninja and save his friend Sasuke.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/zAYRe2bJxpWTVrwxmgCvG2Fmz8R.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/t0xbbuNJqGwRhTIZC6IQLRsGC0U.jpg',
      rating: 8.6,
      views: 60000000,
      releaseYear: 2007,
      language: 'ja',
      seasons: 21,
      episodes: 500,
      videoUrl: 'https://www.youtube.com/embed/1dy2zPPrKj0'
    },
    {
      _id: 'ani_7',
      title: 'Death Note',
      description: 'A high school student discovers a supernatural notebook that allows him to kill anyone by writing their name.',
      type: 'anime',
      genre: ['Mystery', 'Psychological', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/iigTJJdTkmpjWZAYpuURcKBqsWo.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/A2ua1znEeY2X7LQ5KLZM2ggw5GV.jpg',
      rating: 9.0,
      views: 50000000,
      releaseYear: 2006,
      language: 'ja',
      seasons: 1,
      episodes: 37,
      videoUrl: 'https://www.youtube.com/embed/NlJZ-YgAt-c'
    },
    {
      _id: 'ani_8',
      title: 'Fullmetal Alchemist: Brotherhood',
      description: 'Two brothers use alchemy to search for the Philosopher\'s Stone to restore their bodies after a failed transmutation.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/1E2p8fcgcjy6CCZXAOO5g8fGBDH.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/a6ptrTUH1c5OdWanjyYtAkLHkcA.jpg',
      rating: 9.1,
      views: 42000000,
      releaseYear: 2009,
      language: 'ja',
      seasons: 1,
      episodes: 64,
      videoUrl: 'https://www.youtube.com/embed/ANn9NpaAo_U'
    },
    {
      _id: 'ani_9',
      title: 'Dragon Ball Super',
      description: 'Goku and friends face new threats from across the multiverse in this continuation of the Dragon Ball saga.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Comedy'],
      poster: 'https://image.tmdb.org/t/p/w500/fj5QUv4GXNQ4cdMw0A4P9kMlNvm.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/7cXWfyWWIVwVHqLIf9FDWC5VHPZ.jpg',
      rating: 8.3,
      views: 48000000,
      releaseYear: 2015,
      language: 'ja',
      seasons: 5,
      episodes: 131,
      videoUrl: 'https://www.youtube.com/embed/AN23tniEKUU'
    },
    {
      _id: 'ani_10',
      title: 'Spy x Family',
      description: 'A spy must build a fake family to execute a mission, not realizing his wife is an assassin and his daughter is a telepath.',
      type: 'anime',
      genre: ['Action', 'Comedy', 'Family'],
      poster: 'https://image.tmdb.org/t/p/w500/pxgPLQExbPcGQfyDJy4r5ASOV1p.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/1CnrXhsaAL8Ug2yCaQKpMsZdEHb.jpg',
      rating: 8.5,
      views: 35000000,
      releaseYear: 2022,
      language: 'ja',
      seasons: 2,
      episodes: 37,
      videoUrl: 'https://www.youtube.com/embed/ofXigq9aIpo'
    },
    {
      _id: 'ani_11',
      title: 'Chainsaw Man',
      description: 'Denji, a poor young man, merges with his pet devil Pochita to become the Chainsaw Man.',
      type: 'anime',
      genre: ['Action', 'Comedy', 'Horror'],
      poster: 'https://image.tmdb.org/t/p/w500/npdB6eFzizki0WaZ1OvKcJrWe97.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/5DXFCwMtx92vTPQM9euCiMJiQPg.jpg',
      rating: 8.5,
      views: 30000000,
      releaseYear: 2022,
      language: 'ja',
      seasons: 1,
      episodes: 12,
      videoUrl: 'https://www.youtube.com/embed/dFlDRhvM4L0'
    },
    {
      _id: 'ani_12',
      title: 'Tokyo Revengers',
      description: 'A young man travels back in time to save his girlfriend by infiltrating a dangerous gang.',
      type: 'anime',
      genre: ['Action', 'Drama', 'Supernatural'],
      poster: 'https://image.tmdb.org/t/p/w500/xsmIaVZlqvxAULT6ao7ZRCNlNrp.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/cIr8dVYnkcqSi5zr2CzPxM7AEhj.jpg',
      rating: 8.2,
      views: 25000000,
      releaseYear: 2021,
      language: 'ja',
      seasons: 3,
      episodes: 50,
      videoUrl: 'https://www.youtube.com/embed/u3HNQLAO4Kg'
    },
    {
      _id: 'ani_13',
      title: 'Spirited Away',
      description: 'A young girl enters a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
      type: 'anime',
      genre: ['Adventure', 'Animation', 'Family'],
      poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/bSXfU4dwZyBA1vMmXvejdg2Kf9T.jpg',
      rating: 8.6,
      views: 35000000,
      releaseYear: 2001,
      language: 'ja',
      videoUrl: 'https://www.youtube.com/embed/ByXuk9QqQkk'
    },
    {
      _id: 'ani_14',
      title: 'Your Name',
      description: 'Two strangers find themselves linked in a bizarre way as they inexplicably swap bodies.',
      type: 'anime',
      genre: ['Animation', 'Drama', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/dIWwZW7dJJtqC6CgWzYkNVKIUm8.jpg',
      rating: 8.4,
      views: 40000000,
      releaseYear: 2016,
      language: 'ja',
      videoUrl: 'https://www.youtube.com/embed/xU47nhruN-Q'
    },
    {
      _id: 'ani_15',
      title: 'One Punch Man',
      description: 'A superhero who can defeat any opponent with a single punch seeks to find a worthy foe.',
      type: 'anime',
      genre: ['Action', 'Comedy', 'Parody'],
      poster: 'https://image.tmdb.org/t/p/w500/iE3s0lG5QVdEHOEZnoAxjmMtvnr.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/kh2cz3m8GQpzPzV4VYHobUKOvJQ.jpg',
      rating: 8.7,
      views: 38000000,
      releaseYear: 2015,
      language: 'ja',
      seasons: 2,
      episodes: 24,
      videoUrl: 'https://www.youtube.com/embed/2JAElThbKrI'
    },
    {
      _id: 'ani_16',
      title: 'Bleach: Thousand-Year Blood War',
      description: 'Ichigo Kurosaki and the Soul Reapers face their greatest threat yet in the final arc of Bleach.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/8PoAMQhJ0WuYqPQoIqQySnuwmb2.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/zZVLrFMCm7J2mM6GX1TKlgGP1Nm.jpg',
      rating: 9.0,
      views: 28000000,
      releaseYear: 2022,
      language: 'ja',
      seasons: 2,
      episodes: 26,
      videoUrl: 'https://www.youtube.com/embed/1pbHjGV4-xM'
    },
    {
      _id: 'ani_17',
      title: 'Solo Leveling',
      description: 'The weakest hunter of all mankind awakens the ability to level up and becomes the strongest.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/geCRueV3EqfoTKw8DulPFFMC4u7.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/4H4QR2KCDHA6dGqjahqsGMb9ByV.jpg',
      rating: 8.6,
      views: 20000000,
      releaseYear: 2024,
      language: 'ja',
      seasons: 1,
      episodes: 12,
      videoUrl: 'https://www.youtube.com/embed/e3TYVT-Awlk'
    },
    {
      _id: 'ani_18',
      title: 'Hunter x Hunter',
      description: 'Gon Freecss aspires to become a Hunter to find his father who abandoned him.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Fantasy'],
      poster: 'https://image.tmdb.org/t/p/w500/wMPNNq6F9s9uUjA21jIqZqmLQI4.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/bq3F0r0BhujL7r3L6r7P0dFxgPI.jpg',
      rating: 9.0,
      views: 35000000,
      releaseYear: 2011,
      language: 'ja',
      seasons: 6,
      episodes: 148,
      videoUrl: 'https://www.youtube.com/embed/d6kBeJjTGnY'
    },
    {
      _id: 'ani_19',
      title: 'Vinland Saga',
      description: 'Thorfinn pursues revenge against his father\'s killer while navigating the brutal world of Vikings.',
      type: 'anime',
      genre: ['Action', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/oVYyA6KFOLqd7DfNsP1YNsDyq8C.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/9r3sW1FWcnBTMQMKLxSVJFVJK1a.jpg',
      rating: 8.8,
      views: 22000000,
      releaseYear: 2019,
      language: 'ja',
      seasons: 2,
      episodes: 48,
      videoUrl: 'https://www.youtube.com/embed/7U7BDn-gU18'
    },
    {
      _id: 'ani_20',
      title: 'Mob Psycho 100',
      description: 'A psychic middle school boy tries to live a normal life while keeping his growing powers under control.',
      type: 'anime',
      genre: ['Action', 'Comedy', 'Supernatural'],
      poster: 'https://image.tmdb.org/t/p/w500/4fDzLOMhHrpk7pO0siVNMNRMi7J.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/j9oNPrJ8JGy8lM6dPSZL4vvhMbD.jpg',
      rating: 8.6,
      views: 20000000,
      releaseYear: 2016,
      language: 'ja',
      seasons: 3,
      episodes: 37,
      videoUrl: 'https://www.youtube.com/embed/Bw-5Lka-7Lk'
    }
  ];
};

// Music search function with comprehensive library
export const searchMusic = async (query = '') => {
  const allMusic = [
    // Bollywood Songs
    {
      _id: 'mus_1',
      title: 'Kesariya - Brahmastra',
      description: 'A soulful love song from the movie Brahmastra, sung by Arijit Singh.',
      type: 'music',
      genre: ['Bollywood', 'Romantic', 'Pop'],
      poster: 'https://i.ytimg.com/vi/BddP6PYo2gs/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/BddP6PYo2gs/maxresdefault.jpg',
      rating: 9.2,
      views: 850000000,
      releaseYear: 2022,
      language: 'hi',
      artist: 'Arijit Singh',
      duration: '4:27',
      videoUrl: 'https://www.youtube.com/embed/BddP6PYo2gs'
    },
    {
      _id: 'mus_2',
      title: 'Tum Hi Ho - Aashiqui 2',
      description: 'One of the most loved romantic songs from Aashiqui 2, sung by Arijit Singh.',
      type: 'music',
      genre: ['Bollywood', 'Romantic'],
      poster: 'https://i.ytimg.com/vi/IJq0yyWug1k/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/IJq0yyWug1k/maxresdefault.jpg',
      rating: 9.5,
      views: 1200000000,
      releaseYear: 2013,
      language: 'hi',
      artist: 'Arijit Singh',
      duration: '4:22',
      videoUrl: 'https://www.youtube.com/embed/IJq0yyWug1k'
    },
    {
      _id: 'mus_3',
      title: 'Naatu Naatu - RRR',
      description: 'Oscar-winning energetic dance song from RRR movie.',
      type: 'music',
      genre: ['Tollywood', 'Dance', 'Folk'],
      poster: 'https://i.ytimg.com/vi/OsU0CGZoV8E/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/OsU0CGZoV8E/maxresdefault.jpg',
      rating: 9.8,
      views: 500000000,
      releaseYear: 2022,
      language: 'te',
      artist: 'Rahul Sipligunj, Kaala Bhairava',
      duration: '4:08',
      videoUrl: 'https://www.youtube.com/embed/OsU0CGZoV8E'
    },
    {
      _id: 'mus_4',
      title: 'Oo Antava - Pushpa',
      description: 'Viral dance number from Pushpa: The Rise featuring Samantha.',
      type: 'music',
      genre: ['Tollywood', 'Item Song', 'Dance'],
      poster: 'https://i.ytimg.com/vi/xXpFU9T1E3Q/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/xXpFU9T1E3Q/maxresdefault.jpg',
      rating: 8.8,
      views: 600000000,
      releaseYear: 2021,
      language: 'te',
      artist: 'Indravathi Chauhan',
      duration: '3:54',
      videoUrl: 'https://www.youtube.com/embed/xXpFU9T1E3Q'
    },
    {
      _id: 'mus_5',
      title: 'Jhoome Jo Pathaan',
      description: 'High-energy dance track from the blockbuster movie Pathaan.',
      type: 'music',
      genre: ['Bollywood', 'Dance', 'Party'],
      poster: 'https://i.ytimg.com/vi/Bt2mWUcN7v4/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/Bt2mWUcN7v4/maxresdefault.jpg',
      rating: 8.5,
      views: 300000000,
      releaseYear: 2023,
      language: 'hi',
      artist: 'Arijit Singh, Sukriti Kakar',
      duration: '3:18',
      videoUrl: 'https://www.youtube.com/embed/Bt2mWUcN7v4'
    },
    // International Pop
    {
      _id: 'mus_6',
      title: 'Blinding Lights - The Weeknd',
      description: 'Chart-topping synth-pop hit from The Weeknds After Hours album.',
      type: 'music',
      genre: ['Pop', 'Synth-pop', 'Electronic'],
      poster: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg',
      rating: 9.3,
      views: 3800000000,
      releaseYear: 2020,
      language: 'en',
      artist: 'The Weeknd',
      duration: '3:22',
      videoUrl: 'https://www.youtube.com/embed/4NRXx6U8ABQ'
    },
    {
      _id: 'mus_7',
      title: 'Shape of You - Ed Sheeran',
      description: 'One of the most streamed songs of all time by Ed Sheeran.',
      type: 'music',
      genre: ['Pop', 'Dancehall'],
      poster: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
      rating: 9.0,
      views: 6200000000,
      releaseYear: 2017,
      language: 'en',
      artist: 'Ed Sheeran',
      duration: '4:23',
      videoUrl: 'https://www.youtube.com/embed/JGwWNGJdvx8'
    },
    {
      _id: 'mus_8',
      title: 'Uptown Funk - Bruno Mars',
      description: 'Funky disco-pop hit by Mark Ronson featuring Bruno Mars.',
      type: 'music',
      genre: ['Funk', 'Pop', 'Soul'],
      poster: 'https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg',
      rating: 9.1,
      views: 4700000000,
      releaseYear: 2014,
      language: 'en',
      artist: 'Mark Ronson ft. Bruno Mars',
      duration: '4:30',
      videoUrl: 'https://www.youtube.com/embed/OPf0YbXqDm0'
    },
    // K-Pop
    {
      _id: 'mus_9',
      title: 'Dynamite - BTS',
      description: 'BTS first all-English song that broke multiple records worldwide.',
      type: 'music',
      genre: ['K-Pop', 'Disco', 'Pop'],
      poster: 'https://i.ytimg.com/vi/gdZLi9oWNZg/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/gdZLi9oWNZg/maxresdefault.jpg',
      rating: 9.4,
      views: 1700000000,
      releaseYear: 2020,
      language: 'en',
      artist: 'BTS',
      duration: '3:43',
      videoUrl: 'https://www.youtube.com/embed/gdZLi9oWNZg'
    },
    {
      _id: 'mus_10',
      title: 'Pink Venom - BLACKPINK',
      description: 'Powerful comeback single from the K-pop girl group BLACKPINK.',
      type: 'music',
      genre: ['K-Pop', 'Hip Hop', 'EDM'],
      poster: 'https://i.ytimg.com/vi/gQlMMD8auMs/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/gQlMMD8auMs/maxresdefault.jpg',
      rating: 9.0,
      views: 800000000,
      releaseYear: 2022,
      language: 'ko',
      artist: 'BLACKPINK',
      duration: '3:04',
      videoUrl: 'https://www.youtube.com/embed/gQlMMD8auMs'
    },
    {
      _id: 'mus_11',
      title: 'Super Shy - NewJeans',
      description: 'Viral summer hit from the rising K-pop group NewJeans.',
      type: 'music',
      genre: ['K-Pop', 'Pop', 'R&B'],
      poster: 'https://i.ytimg.com/vi/ArmDp-zijuc/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/ArmDp-zijuc/maxresdefault.jpg',
      rating: 8.9,
      views: 400000000,
      releaseYear: 2023,
      language: 'en',
      artist: 'NewJeans',
      duration: '2:54',
      videoUrl: 'https://www.youtube.com/embed/ArmDp-zijuc'
    },
    // EDM/Electronic
    {
      _id: 'mus_12',
      title: 'Faded - Alan Walker',
      description: 'Iconic electronic dance music hit by Norwegian DJ Alan Walker.',
      type: 'music',
      genre: ['EDM', 'Electronic', 'House'],
      poster: 'https://i.ytimg.com/vi/60ItHLz5WEA/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/60ItHLz5WEA/maxresdefault.jpg',
      rating: 9.2,
      views: 3500000000,
      releaseYear: 2015,
      language: 'en',
      artist: 'Alan Walker',
      duration: '3:32',
      videoUrl: 'https://www.youtube.com/embed/60ItHLz5WEA'
    },
    {
      _id: 'mus_13',
      title: 'Titanium - David Guetta ft. Sia',
      description: 'Powerful electronic dance anthem featuring Sias powerful vocals.',
      type: 'music',
      genre: ['EDM', 'House', 'Pop'],
      poster: 'https://i.ytimg.com/vi/JRfuAukYTKg/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/JRfuAukYTKg/maxresdefault.jpg',
      rating: 9.0,
      views: 1500000000,
      releaseYear: 2011,
      language: 'en',
      artist: 'David Guetta ft. Sia',
      duration: '4:05',
      videoUrl: 'https://www.youtube.com/embed/JRfuAukYTKg'
    },
    // Latin Music
    {
      _id: 'mus_14',
      title: 'Despacito - Luis Fonsi ft. Daddy Yankee',
      description: 'One of the most viewed YouTube videos of all time.',
      type: 'music',
      genre: ['Reggaeton', 'Latin Pop'],
      poster: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
      rating: 9.1,
      views: 8200000000,
      releaseYear: 2017,
      language: 'es',
      artist: 'Luis Fonsi ft. Daddy Yankee',
      duration: '4:42',
      videoUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk'
    },
    {
      _id: 'mus_15',
      title: 'Calm Down - Rema & Selena Gomez',
      description: 'Viral Afrobeats remix featuring Selena Gomez.',
      type: 'music',
      genre: ['Afrobeats', 'Pop', 'Dance'],
      poster: 'https://i.ytimg.com/vi/WcIcVapfqXw/maxresdefault.jpg',
      backdrop: 'https://i.ytimg.com/vi/WcIcVapfqXw/maxresdefault.jpg',
      rating: 8.7,
      views: 1000000000,
      releaseYear: 2022,
      language: 'en',
      artist: 'Rema & Selena Gomez',
      duration: '3:59',
      videoUrl: 'https://www.youtube.com/embed/WcIcVapfqXw'
    }
  ];

  // Filter by search query if provided
  if (query && query.trim() !== '') {
    const searchTerm = query.toLowerCase();
    return allMusic.filter(music =>
      music.title.toLowerCase().includes(searchTerm) ||
      music.description.toLowerCase().includes(searchTerm) ||
      music.artist.toLowerCase().includes(searchTerm) ||
      music.genre.some(g => g.toLowerCase().includes(searchTerm))
    );
  }

  return allMusic;
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
    }
  ];
};

// Enhanced Sports search with comprehensive data
export const searchSports = async (query = '') => {
  const allSports = [
    {
      _id: 'sport_1',
      title: 'UEFA Champions League Final',
      description: 'Real Madrid vs Manchester City - The biggest club football match of the year',
      type: 'sport',
      genre: ['Sports', 'Football'],
      poster: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1280&h=720&fit=crop',
      rating: 9.5,
      views: 5000000,
      isLive: true,
      sportType: 'Football',
      teams: ['Real Madrid', 'Manchester City'],
      venue: 'Wembley Stadium',
      videoUrl: 'https://www.youtube.com/embed/hWGMuSRWsso'
    },
    {
      _id: 'sport_2',
      title: 'Premier League - Arsenal vs Liverpool',
      description: 'Top of the table clash in the English Premier League',
      type: 'sport',
      genre: ['Sports', 'Football'],
      poster: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1280&h=720&fit=crop',
      rating: 9.2,
      views: 3500000,
      isLive: true,
      sportType: 'Football',
      teams: ['Arsenal', 'Liverpool'],
      venue: 'Emirates Stadium',
      videoUrl: 'https://www.youtube.com/embed/PhJHMW7LfCE'
    },
    {
      _id: 'sport_3',
      title: 'NBA Finals Game 7',
      description: 'Lakers vs Celtics - The most historic rivalry in basketball',
      type: 'sport',
      genre: ['Sports', 'Basketball'],
      poster: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1280&h=720&fit=crop',
      rating: 9.8,
      views: 4200000,
      isLive: true,
      sportType: 'Basketball',
      teams: ['Los Angeles Lakers', 'Boston Celtics'],
      venue: 'Crypto.com Arena',
      videoUrl: 'https://www.youtube.com/embed/XpKxHcZMRk4'
    },
    {
      _id: 'sport_4',
      title: 'Wimbledon Men\'s Final',
      description: 'Djokovic vs Alcaraz - Battle for the grass court crown',
      type: 'sport',
      genre: ['Sports', 'Tennis'],
      poster: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1280&h=720&fit=crop',
      rating: 9.4,
      views: 2800000,
      isLive: false,
      sportType: 'Tennis',
      teams: ['Novak Djokovic', 'Carlos Alcaraz'],
      venue: 'Centre Court, Wimbledon',
      videoUrl: 'https://www.youtube.com/embed/L8Wl2HhTF-E'
    },
    {
      _id: 'sport_5',
      title: 'ICC Cricket World Cup Final',
      description: 'India vs Australia - The ultimate cricket showdown',
      type: 'sport',
      genre: ['Sports', 'Cricket'],
      poster: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1280&h=720&fit=crop',
      rating: 9.6,
      views: 8000000,
      isLive: true,
      sportType: 'Cricket',
      teams: ['India', 'Australia'],
      venue: 'Narendra Modi Stadium',
      videoUrl: 'https://www.youtube.com/embed/U8XhZ7ykR-Y'
    },
    {
      _id: 'sport_6',
      title: 'IPL Final - MI vs CSK',
      description: 'El Clasico of Indian Premier League - Mumbai Indians vs Chennai Super Kings',
      type: 'sport',
      genre: ['Sports', 'Cricket'],
      poster: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1280&h=720&fit=crop',
      rating: 9.3,
      views: 7500000,
      isLive: true,
      sportType: 'Cricket',
      teams: ['Mumbai Indians', 'Chennai Super Kings'],
      venue: 'Wankhede Stadium',
      videoUrl: 'https://www.youtube.com/embed/y7PQhFqKCQY'
    },
    {
      _id: 'sport_7',
      title: 'F1 Monaco Grand Prix',
      description: 'The crown jewel of Formula 1 racing through the streets of Monte Carlo',
      type: 'sport',
      genre: ['Sports', 'Racing', 'F1'],
      poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1280&h=720&fit=crop',
      rating: 9.1,
      views: 3200000,
      isLive: false,
      sportType: 'Racing',
      teams: ['Red Bull Racing', 'Ferrari', 'Mercedes'],
      venue: 'Circuit de Monaco',
      videoUrl: 'https://www.youtube.com/embed/EGUZJVY-sHo'
    },
    {
      _id: 'sport_8',
      title: 'UFC 300 Main Event',
      description: 'Championship bout with the world\'s best fighters',
      type: 'sport',
      genre: ['Sports', 'MMA', 'Fighting'],
      poster: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1280&h=720&fit=crop',
      rating: 8.9,
      views: 2100000,
      isLive: false,
      sportType: 'MMA',
      teams: ['Champion', 'Challenger'],
      venue: 'T-Mobile Arena, Las Vegas',
      videoUrl: 'https://www.youtube.com/embed/3CClOsC26Lw'
    },
    {
      _id: 'sport_9',
      title: 'Super Bowl LVIII',
      description: 'The biggest game in American football - NFL Championship',
      type: 'sport',
      genre: ['Sports', 'American Football'],
      poster: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1280&h=720&fit=crop',
      rating: 9.7,
      views: 12000000,
      isLive: false,
      sportType: 'American Football',
      teams: ['Kansas City Chiefs', 'San Francisco 49ers'],
      venue: 'Allegiant Stadium, Las Vegas',
      videoUrl: 'https://www.youtube.com/embed/W9NQCrZCqvE'
    },
    {
      _id: 'sport_10',
      title: 'MLB World Series Game 7',
      description: 'The deciding game for the baseball championship',
      type: 'sport',
      genre: ['Sports', 'Baseball'],
      poster: 'https://images.unsplash.com/photo-1566479179817-c0d5dc88c446?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1566479179817-c0d5dc88c446?w=1280&h=720&fit=crop',
      rating: 8.8,
      views: 1800000,
      isLive: false,
      sportType: 'Baseball',
      teams: ['New York Yankees', 'Los Angeles Dodgers'],
      venue: 'Yankee Stadium',
      videoUrl: 'https://www.youtube.com/embed/QyYbGcihlSc'
    },
    {
      _id: 'sport_11',
      title: 'Golf Masters Tournament',
      description: 'The most prestigious golf tournament at Augusta National',
      type: 'sport',
      genre: ['Sports', 'Golf'],
      poster: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1280&h=720&fit=crop',
      rating: 8.6,
      views: 1500000,
      isLive: true,
      sportType: 'Golf',
      teams: ['Tiger Woods', 'Rory McIlroy', 'Scottie Scheffler'],
      venue: 'Augusta National Golf Club',
      videoUrl: 'https://www.youtube.com/embed/6eFN-uJT_nU'
    },
    {
      _id: 'sport_12',
      title: 'Boxing Heavyweight Championship',
      description: 'Tyson Fury vs Anthony Joshua - Battle of British Heavyweights',
      type: 'sport',
      genre: ['Sports', 'Boxing'],
      poster: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=300&h=450&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1280&h=720&fit=crop',
      rating: 9.0,
      views: 4500000,
      isLive: false,
      sportType: 'Boxing',
      teams: ['Tyson Fury', 'Anthony Joshua'],
      venue: 'Wembley Stadium',
      videoUrl: 'https://www.youtube.com/embed/AzJHY10UBWQ'
    }
  ];

  // Filter by search query if provided
  if (query && query.trim() !== '') {
    const searchTerm = query.toLowerCase();
    return allSports.filter(sport =>
      sport.title.toLowerCase().includes(searchTerm) ||
      sport.description.toLowerCase().includes(searchTerm) ||
      sport.sportType.toLowerCase().includes(searchTerm) ||
      sport.teams.some(team => team.toLowerCase().includes(searchTerm))
    );
  }

  return allSports;
};

// Legacy exports for compatibility
export const searchTVShows = searchTVSeries;

export default api;