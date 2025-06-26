import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch } from 'react-icons/fa';
import ContentCard from '../components/ContentCard';
import { searchTVShows } from '../services/api';
import './Serials.css';

const Serials = () => {
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    search: ''
  });
  const [genres] = useState([
    'Drama', 'Comedy', 'Action', 'Thriller', 'Romance', 
    'Sci-Fi', 'Horror', 'Documentary', 'Animation', 'Reality'
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    // Require authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchSerials = async () => {
      try {
        setLoading(true);
        const searchResults = await searchTVShows(filters.search);
        setSerials(searchResults);
      } catch (error) {
        console.error('Error fetching TV shows:', error);
        setSerials(mockSerialsData);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(() => {
      fetchSerials();
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
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="serials-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">TV Shows & Serials</h1>
          <p className="page-subtitle">
            Discover amazing TV series and binge-worthy content
          </p>
        </div>

        <div className="filters-section">
          <div className="filters-header">
            <h3><FaFilter /> Filters</h3>
            <button onClick={clearFilters} className="clear-filters">
              Clear All
            </button>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search TV Shows</label>
              <div className="search-input-group">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search for TV shows (e.g., Breaking Bad, Friends, Game of Thrones)..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

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
          </div>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h3>Results ({serials.length} shows)</h3>
            {filters.search && (
              <p className="search-info">
                Showing results for: <strong>"{filters.search}"</strong>
              </p>
            )}
          </div>
          
          {serials.length > 0 ? (
            <div className="content-grid">
              {serials.map((serial) => (
                <ContentCard key={serial._id} content={serial} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">📺</div>
              <h3>No TV shows found</h3>
              <p>Try searching for different shows or adjusting your filters</p>
              <div className="search-suggestions">
                <h4>Popular searches:</h4>
                <div className="suggestion-tags">
                  <button onClick={() => handleFilterChange('search', 'Breaking Bad')}>Breaking Bad</button>
                  <button onClick={() => handleFilterChange('search', 'Friends')}>Friends</button>
                  <button onClick={() => handleFilterChange('search', 'Game of Thrones')}>Game of Thrones</button>
                  <button onClick={() => handleFilterChange('search', 'The Office')}>The Office</button>
                  <button onClick={() => handleFilterChange('search', 'Stranger Things')}>Stranger Things</button>
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
const mockSerialsData = [
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

export default Serials; 