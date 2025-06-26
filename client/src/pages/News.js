import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch } from 'react-icons/fa';
import ContentCard from '../components/ContentCard';
import { searchNews } from '../services/api';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });
  const [categories] = useState([
    'Politics', 'Technology', 'Business', 'Entertainment', 'Sports',
    'Health', 'Science', 'World', 'Local', 'Breaking'
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    // Require authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchNews = async () => {
      try {
        setLoading(true);
        const searchResults = await searchNews(filters.search, filters.category);
        setNews(searchResults);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews(mockNewsData);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(() => {
      fetchNews();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters.search, filters.category, navigate]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
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
    <div className="news-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">News</h1>
          <p className="page-subtitle">
            Stay updated with the latest breaking news and updates
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
              <label>Search News</label>
              <div className="search-input-group">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search for news (e.g., technology, politics, sports)..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h3>Results ({news.length} articles)</h3>
            {filters.search && (
              <p className="search-info">
                Showing results for: <strong>"{filters.search}"</strong>
              </p>
            )}
          </div>
          
          {news.length > 0 ? (
            <div className="content-grid">
              {news.map((article) => (
                <ContentCard key={article._id} content={article} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">📰</div>
              <h3>No news articles found</h3>
              <p>Try searching for different topics or adjusting your filters</p>
              <div className="search-suggestions">
                <h4>Popular searches:</h4>
                <div className="suggestion-tags">
                  <button onClick={() => handleFilterChange('search', 'technology')}>Technology</button>
                  <button onClick={() => handleFilterChange('search', 'politics')}>Politics</button>
                  <button onClick={() => handleFilterChange('search', 'sports')}>Sports</button>
                  <button onClick={() => handleFilterChange('search', 'business')}>Business</button>
                  <button onClick={() => handleFilterChange('search', 'health')}>Health</button>
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
const mockNewsData = [
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

export default News; 