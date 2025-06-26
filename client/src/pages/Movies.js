import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch } from 'react-icons/fa';
import ContentCard from '../components/ContentCard';
import { searchMovies, getMovieDetails } from '../services/api';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    language: '',
    search: ''
  });
  const [genres] = useState([
    'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 
    'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Animation'
  ]);
  const [languages] = useState([
    'All Languages', 'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'
  ]);
  const [years] = useState(Array.from({length: 25}, (_, i) => 2024 - i));
  const navigate = useNavigate();

  useEffect(() => {
    // Require authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const searchResults = await searchMovies(filters.search);
        setMovies(searchResults);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies(mockMoviesData);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(() => {
      fetchMovies();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters.search, navigate]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      year: '',
      language: '',
      search: ''
    });
  };

  const handleMovieClick = async (movie) => {
    if (movie.imdbID) {
      try {
        const details = await getMovieDetails(movie.imdbID);
        if (details) {
          // Navigate to movie details page
          window.location.href = `/content/${movie.imdbID}`;
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    }
  };

  // Filter movies based on current filters
  const filteredMovies = movies.filter(movie => {
    // Language filter
    if (filters.language && filters.language !== 'All Languages') {
      if (!movie.language || !movie.language.toLowerCase().includes(filters.language.toLowerCase())) {
        return false;
      }
    }
    
    // Genre filter
    if (filters.genre) {
      if (!movie.genre || !movie.genre.some(g => g.toLowerCase().includes(filters.genre.toLowerCase()))) {
        return false;
      }
    }
    
    // Year filter
    if (filters.year) {
      if (!movie.releaseYear || movie.releaseYear !== parseInt(filters.year)) {
        return false;
      }
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="movies-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Movies</h1>
          <p className="page-subtitle">
            Discover the latest blockbusters and timeless classics from all languages
          </p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-header">
            <h3><FaFilter /> Filters</h3>
            <button onClick={clearFilters} className="clear-filters">
              Clear All
            </button>
          </div>
          
          <div className="filters-grid">
            {/* Search */}
            <div className="filter-group">
              <label>Search Movies</label>
              <div className="search-input-group">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search for movies (e.g., Avengers, Batman, Inception)..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Language Filter */}
            <div className="filter-group">
              <label>Language</label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Genre Filter */}
            <div className="filter-group">
              <label>Genre</label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="filter-group">
              <label>Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="results-section">
          <div className="results-header">
            <h3>Results ({filteredMovies.length} movies)</h3>
            {filters.search && (
              <p className="search-info">
                Showing results for: <strong>"{filters.search}"</strong>
              </p>
            )}
            {!filters.search && (
              <p className="search-info">
                Showing popular movies
              </p>
            )}
          </div>
          
          {filteredMovies.length > 0 ? (
            <div className="content-grid">
              {filteredMovies.map((movie) => (
                <div key={movie._id} onClick={() => handleMovieClick(movie)}>
                  <ContentCard content={movie} />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🎬</div>
              <h3>No movies found</h3>
              <p>Try searching for a different movie or adjusting your filters</p>
              <div className="search-suggestions">
                <h4>Popular searches:</h4>
                <div className="suggestion-tags">
                  <button onClick={() => handleFilterChange('search', 'Avengers')}>Avengers</button>
                  <button onClick={() => handleFilterChange('search', 'Batman')}>Batman</button>
                  <button onClick={() => handleFilterChange('search', 'Inception')}>Inception</button>
                  <button onClick={() => handleFilterChange('search', 'Titanic')}>Titanic</button>
                  <button onClick={() => handleFilterChange('search', 'The Matrix')}>The Matrix</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for development (fallback)
const mockMoviesData = [
  {
    _id: '1',
    title: 'Avengers: Endgame',
    description: 'The epic conclusion to the Infinity Saga',
    type: 'movie',
    genre: ['Action', 'Adventure'],
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
    rating: 8.4,
    views: 1500000,
    releaseYear: 2019,
    language: 'English'
  },
  {
    _id: '2',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham',
    type: 'movie',
    genre: ['Action', 'Crime', 'Drama'],
    poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop',
    rating: 9.0,
    views: 1200000,
    releaseYear: 2008,
    language: 'English'
  },
  {
    _id: '3',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through dream-sharing technology',
    type: 'movie',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop',
    rating: 8.8,
    views: 980000,
    releaseYear: 2010,
    language: 'English'
  }
];

export default Movies; 