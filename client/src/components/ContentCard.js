import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaStar, FaEye, FaCircle } from 'react-icons/fa';
import './ContentCard.css';

const ContentCard = ({ content }) => {
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'movie':
        return '🎬';
      case 'sport':
        return '⚽';
      case 'news':
        return '📰';
      case 'serial':
      case 'show':
        return '📺';
      default:
        return '🎬';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'movie':
        return '#ff6b6b';
      case 'sport':
        return '#4CAF50';
      case 'news':
        return '#2196F3';
      case 'serial':
      case 'show':
        return '#9C27B0';
      default:
        return '#ff6b6b';
    }
  };

  return (
    <Link to={`/content/${content._id}`} className="content-card">
      <div className="card-image-container">
        <img 
          src={content.poster} 
          alt={content.title}
          className="card-image"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/300x450/${getTypeColor(content.type).replace('#', '')}/ffffff?text=${encodeURIComponent(content.title)}`;
          }}
        />
        
        {/* Live indicator */}
        {content.isLive && (
          <div className="live-indicator">
            <FaCircle className="live-dot" />
            <span>LIVE</span>
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="play-overlay">
          <FaPlay />
        </div>
        
        {/* Type indicator */}
        <div 
          className="type-indicator"
          style={{ backgroundColor: getTypeColor(content.type) }}
        >
          {getTypeIcon(content.type)}
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{content.title}</h3>
        <p className="card-description">{content.description}</p>
        
        <div className="card-meta">
          <div className="card-genres">
            {content.genre && content.genre.slice(0, 2).map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>
          
          <div className="card-stats">
            {content.rating && (
              <div className="rating">
                <FaStar className="star-icon" />
                <span>{content.rating}</span>
              </div>
            )}
            
            {content.views && (
              <div className="views">
                <FaEye />
                <span>{formatViews(content.views)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ContentCard; 