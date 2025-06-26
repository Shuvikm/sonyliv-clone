import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch } from 'react-icons/fa';
import ContentCard from '../components/ContentCard';
import { searchSports } from '../services/api';
import './Sports.css';

const Sports = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    sportType: '',
    search: ''
  });
  const [sportTypes] = useState([
    'Football', 'Basketball', 'Tennis', 'Cricket', 'Baseball',
    'Soccer', 'Hockey', 'Golf', 'Boxing', 'MMA'
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    // Require authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchSports = async () => {
      try {
        setLoading(true);
        const searchResults = await searchSports(filters.search);
        setSports(searchResults);
      } catch (error) {
        console.error('Error fetching sports:', error);
        // Fallback to mock data
        setSports(mockSportsData);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(() => {
      fetchSports();
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
      sportType: '',
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
    <div className="sports-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Sports</h1>
          <p className="page-subtitle">
            Watch live sports events and highlights
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
              <label>Search Sports</label>
              <div className="search-input-group">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search for sports events (e.g., Premier League, NBA, Tennis)..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sport Type</label>
              <select
                value={filters.sportType}
                onChange={(e) => handleFilterChange('sportType', e.target.value)}
              >
                <option value="">All Sports</option>
                {sportTypes.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h3>Results ({sports.length} events)</h3>
            {filters.search && (
              <p className="search-info">
                Showing results for: <strong>"{filters.search}"</strong>
              </p>
            )}
          </div>
          
          {sports.length > 0 ? (
            <div className="content-grid">
              {sports.map((sport) => (
                <ContentCard key={sport._id} content={sport} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">⚽</div>
              <h3>No sports events found</h3>
              <p>Try searching for different sports or adjusting your filters</p>
              <div className="search-suggestions">
                <h4>Popular searches:</h4>
                <div className="suggestion-tags">
                  <button onClick={() => handleFilterChange('search', 'Premier League')}>Premier League</button>
                  <button onClick={() => handleFilterChange('search', 'NBA')}>NBA</button>
                  <button onClick={() => handleFilterChange('search', 'Tennis')}>Tennis</button>
                  <button onClick={() => handleFilterChange('search', 'Cricket')}>Cricket</button>
                  <button onClick={() => handleFilterChange('search', 'Football')}>Football</button>
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

export default Sports; 