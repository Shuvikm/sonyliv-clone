import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import ContentCard from '../components/ContentCard';
import * as api from '../services/api';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Use real TMDB search functions
      const [movies, series] = await Promise.all([
        api.searchMovies(query),
        api.searchTVSeries(query)
      ]);

      // Combine and interleave results for variety
      const combined = [];
      const maxLength = Math.max(movies.length, series.length);

      for (let i = 0; i < maxLength; i++) {
        if (i < movies.length) combined.push(movies[i]);
        if (i < series.length) combined.push(series[i]);
      }

      setResults(combined);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local mock results if API fails completely
      setResults(mockSearchResults);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Search</h1>
          <p className="page-subtitle">
            Find your favorite movies, sports, news, and shows
          </p>
        </div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form-large">
            <div className="search-input-group-large">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for movies, sports, news, shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-large"
              />
              <button type="submit" className="search-btn-large">
                Search
              </button>
            </div>
          </form>
        </div>

        {searchQuery && (
          <div className="results-section">
            <div className="results-header">
              <h3>
                Search Results for "{searchQuery}" ({results.length} items)
              </h3>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="content-grid">
                {results.map((item) => (
                  <ContentCard key={item._id} content={item} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try different keywords or check your spelling</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const mockSearchResults = [
  {
    _id: '1',
    title: 'Avengers: Endgame',
    description: 'The epic conclusion to the Infinity Saga',
    type: 'movie',
    genre: ['Action', 'Adventure'],
    poster: 'https://via.placeholder.com/300x450/ff6b6b/ffffff?text=Avengers',
    rating: 8.4,
    views: 1500000
  },
  {
    _id: '2',
    title: 'Premier League Live',
    description: 'Manchester United vs Liverpool',
    type: 'sport',
    genre: ['Football'],
    poster: 'https://via.placeholder.com/300x450/4CAF50/ffffff?text=Football',
    rating: 9.2,
    views: 850000,
    isLive: true
  },
  {
    _id: '3',
    title: 'Breaking News',
    description: 'Latest world news and updates',
    type: 'news',
    genre: ['News'],
    poster: 'https://via.placeholder.com/300x450/2196F3/ffffff?text=News',
    rating: 7.8,
    views: 320000
  }
];

export default Search; 