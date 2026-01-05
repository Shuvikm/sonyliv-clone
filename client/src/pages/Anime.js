import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch } from 'react-icons/fa';
import ContentCard from '../components/ContentCard';
import { getAnime } from '../services/api';
import './Anime.css';

const Anime = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    search: ''
  });
  const [genres] = useState([
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Romance', 'Sci-Fi', 'Thriller', 'Horror', 'Slice of Life',
    'Mecha', 'Supernatural', 'Sports', 'Music'
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    // Require authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAnime = async () => {
      try {
        setLoading(true);
        const results = await getAnime();
        setAnimeList(results);
      } catch (error) {
        console.error('Error fetching anime:', error);
        setAnimeList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [navigate]);

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

  // Filter anime based on current filters
  const filteredAnime = animeList.filter(anime => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (!anime.title.toLowerCase().includes(searchTerm) &&
          !anime.description.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }
    
    // Genre filter
    if (filters.genre) {
      if (!anime.genre || !anime.genre.some(g => 
        typeof g === 'string' ? 
          g.toLowerCase().includes(filters.genre.toLowerCase()) :
          g.name && g.name.toLowerCase().includes(filters.genre.toLowerCase())
      )) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="anime-page">
      <div className="anime-header">
        <div className="header-content">
          <h1 className="page-title">Anime Collection</h1>
          <p className="page-subtitle">Discover amazing Japanese animation</p>
        </div>
        <div className="header-image">
          <img 
            src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop" 
            alt="Anime Banner"
          />
        </div>
      </div>

      <div className="anime-content">
        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-container">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search anime..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="filter-select"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {(filters.genre || filters.search) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            )}
          </div>

          <div className="results-info">
            <span>{filteredAnime.length} anime found</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading amazing anime...</p>
          </div>
        )}

        {/* Anime Grid */}
        {!loading && (
          <div className="anime-grid">
            {filteredAnime.map(anime => (
              <ContentCard key={anime._id} content={anime} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredAnime.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🍥</div>
            <h3>No anime found</h3>
            <p>Try adjusting your search criteria or browse all anime</p>
            <button onClick={clearFilters} className="browse-all-btn">
              Browse All Anime
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Anime;