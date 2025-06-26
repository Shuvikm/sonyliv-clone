import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('token');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-text">Sony Live</span>
          </Link>

          {/* Desktop Menu */}
          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/movies" className="nav-link">Movies</Link>
            <Link to="/sports" className="nav-link">Sports</Link>
            <Link to="/news" className="nav-link">News</Link>
            <Link to="/serials" className="nav-link">Serials</Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search movies, sports, news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
          </form>

          {/* Auth Buttons */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <button className="btn btn-secondary" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            ) : (
              <Link to="/login" className="btn btn-secondary">
                <FaUser />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>Home</Link>
          <Link to="/movies" className="mobile-nav-link" onClick={toggleMenu}>Movies</Link>
          <Link to="/sports" className="mobile-nav-link" onClick={toggleMenu}>Sports</Link>
          <Link to="/news" className="mobile-nav-link" onClick={toggleMenu}>News</Link>
          <Link to="/serials" className="mobile-nav-link" onClick={toggleMenu}>Serials</Link>
          {!isAuthenticated && (
            <Link to="/login" className="mobile-nav-link" onClick={toggleMenu}>Login</Link>
          )}
          {isAuthenticated && (
            <button className="mobile-nav-link logout-link" onClick={() => { toggleMenu(); handleLogout(); }}>
              <FaSignOutAlt style={{ marginRight: '0.5rem' }} /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 