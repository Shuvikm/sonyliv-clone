import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaEye, FaPlay, FaArrowLeft } from 'react-icons/fa';
import { getMovieDetails } from '../services/api';
import './ContentDetail.css';

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get movie details from OMDB API
        const movieDetails = await getMovieDetails(id);
        if (movieDetails) {
          setContent(movieDetails);
        } else {
          // Fallback to mock data
          setContent(mockContentData);
        }
      } catch (error) {
        console.error('Error fetching content details:', error);
        setError('Failed to load content details');
        // Fallback to mock data
        setContent(mockContentData);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContentDetails();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePlay = () => {
    // In a real app, this would start the video player
    alert('Video player would start here!');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="error-page">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBack}>Go Back</button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="error-page">
        <h2>Content Not Found</h2>
        <p>The requested content could not be found.</p>
        <button onClick={handleBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="content-detail-page">
      <div className="container">
        {/* Back Button */}
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-poster">
            <img src={content.poster} alt={content.title} />
            <div className="play-overlay" onClick={handlePlay}>
              <FaPlay />
            </div>
          </div>
          
          <div className="hero-info">
            <h1 className="content-title">{content.title}</h1>
            
            <div className="content-meta">
              {content.releaseYear && (
                <span className="year">{content.releaseYear}</span>
              )}
              {content.duration && (
                <span className="duration">{content.duration} min</span>
              )}
              {content.language && (
                <span className="language">{content.language}</span>
              )}
            </div>

            <div className="content-stats">
              <div className="rating">
                <FaStar />
                <span>{content.rating}/10</span>
              </div>
              <div className="views">
                <FaEye />
                <span>{content.views.toLocaleString()} views</span>
              </div>
            </div>

            {content.genre && content.genre.length > 0 && (
              <div className="genres">
                {content.genre.map((genre, index) => (
                  <span key={index} className="genre-tag">{genre}</span>
                ))}
              </div>
            )}

            <p className="description">{content.description}</p>

            <button className="play-button" onClick={handlePlay}>
              <FaPlay /> Watch Now
            </button>
          </div>
        </div>

        {/* Related Video Section */}
        {content.videoUrl && (
          <div className="video-section">
            <h2>Trailer / Related Video</h2>
            <div className="video-player-wrapper">
              <iframe
                width="100%"
                height="400"
                src={content.videoUrl}
                title="Related Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="details-section">
          {content.director && (
            <div className="detail-item">
              <h3>Director</h3>
              <p>{content.director}</p>
            </div>
          )}

          {content.cast && content.cast.length > 0 && (
            <div className="detail-item">
              <h3>Cast</h3>
              <p>{content.cast.join(', ')}</p>
            </div>
          )}

          {content.channel && (
            <div className="detail-item">
              <h3>Channel</h3>
              <p>{content.channel}</p>
            </div>
          )}

          {content.status && (
            <div className="detail-item">
              <h3>Status</h3>
              <p>{content.status}</p>
            </div>
          )}

          {content.season && content.episode && (
            <div className="detail-item">
              <h3>Episode Info</h3>
              <p>Season {content.season}, Episode {content.episode}</p>
              {content.totalEpisodes && (
                <p>Total Episodes: {content.totalEpisodes}</p>
              )}
            </div>
          )}

          {content.teams && content.teams.length > 0 && (
            <div className="detail-item">
              <h3>Teams</h3>
              <p>{content.teams.join(' vs ')}</p>
            </div>
          )}

          {content.venue && (
            <div className="detail-item">
              <h3>Venue</h3>
              <p>{content.venue}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for development (fallback)
const mockContentData = {
  _id: '1',
  title: 'Avengers: Endgame',
  description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
  type: 'movie',
  genre: ['Action', 'Adventure', 'Drama'],
  poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
  rating: 8.4,
  views: 1500000,
  releaseYear: 2019,
  director: 'Anthony Russo, Joe Russo',
  cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth'],
  language: 'English',
  duration: 181
};

export default ContentDetail; 