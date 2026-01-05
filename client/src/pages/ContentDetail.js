import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaStar, FaEye, FaPlay, FaArrowLeft, FaFilm, FaPlus, FaHeart } from 'react-icons/fa';
import { getContentDetails, searchSports } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import './ContentDetail.css';

const ContentDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contentType = searchParams.get('type') || 'movie';
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    // Require authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchContentDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        let contentDetails = null;

        // Check if it's a sport content
        if (contentType === 'sport' || id.startsWith('sport_')) {
          const sportsData = await searchSports();
          contentDetails = sportsData.find(s => s._id === id);
        } else {
          // Try to get content details from TMDB API
          contentDetails = await getContentDetails(id, contentType);
        }

        if (contentDetails) {
          setContent(contentDetails);
          setActiveVideo(contentDetails.videoUrl);
        } else {
          // Fallback to mock data
          setContent(mockContentData);
          setActiveVideo(mockContentData.videoUrl);
        }
      } catch (error) {
        console.error('Error fetching content details:', error);
        setError('Failed to load content details');
        // Fallback to mock data
        setContent(mockContentData);
        setActiveVideo(mockContentData.videoUrl);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContentDetails();
    }
  }, [id, contentType, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleWatchNow = () => {
    // Navigate to full-screen watch page
    navigate(`/watch/${id}/${content.type || contentType}`, {
      state: { content }
    });
  };

  const handlePlayTrailer = () => {
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
  };

  const handleVideoSelect = (videoUrl) => {
    setActiveVideo(videoUrl);
    setShowPlayer(true);
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
      {/* Backdrop */}
      {content.backdrop && (
        <div
          className="content-backdrop"
          style={{ backgroundImage: `url(${content.backdrop})` }}
        />
      )}

      <div className="container">
        {/* Back Button */}
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-poster">
            <img src={content.poster} alt={content.title} />
            <div className="play-overlay" onClick={handlePlayTrailer}>
              <FaPlay />
            </div>
            {content.isLive && <span className="live-badge-poster">LIVE</span>}
          </div>

          <div className="hero-info">
            <h1 className="content-title">{content.title}</h1>
            {content.tagline && <p className="content-tagline">{content.tagline}</p>}

            <div className="content-meta">
              {content.releaseYear && (
                <span className="year">{content.releaseYear}</span>
              )}
              {content.duration && (
                <span className="duration">{content.duration} min</span>
              )}
              {content.language && (
                <span className="language">{content.language.toUpperCase()}</span>
              )}
              {content.status && content.status !== 'Released' && (
                <span className="status">{content.status}</span>
              )}
              {content.isLive && (
                <span className="live-badge">LIVE</span>
              )}
            </div>

            <div className="content-stats">
              <div className="rating">
                <FaStar />
                <span>{content.rating?.toFixed(1) || 'N/A'}/10</span>
              </div>
              <div className="views">
                <FaEye />
                <span>{content.views?.toLocaleString() || 0} views</span>
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

            <div className="action-buttons">
              <button className="watch-button primary" onClick={handleWatchNow}>
                <FaPlay /> {content.fullMovieUrl ? 'Watch Full Movie' : 'Watch Now'}
              </button>
              <button className="watch-button secondary" onClick={handlePlayTrailer}>
                <FaFilm /> Play Trailer
              </button>
              <button className="icon-button">
                <FaPlus />
              </button>
              <button className="icon-button">
                <FaHeart />
              </button>
            </div>
          </div>
        </div>

        {/* Inline Video Player (when trailer is clicked) */}
        {showPlayer && (
          <div className="inline-player-section">
            <div className="inline-player-header">
              <h2>Now Playing: {content.title}</h2>
              <button className="close-player-btn" onClick={handleClosePlayer}>×</button>
            </div>
            <VideoPlayer
              videoUrl={activeVideo}
              title={content.title}
              poster={content.backdrop || content.poster}
              autoPlay={true}
              showControls={true}
              onClose={handleClosePlayer}
            />
          </div>
        )}

        {/* Video Gallery (if multiple videos available) */}
        {content.videos && content.videos.length > 0 && (
          <div className="video-gallery-section">
            <h2><FaFilm /> Trailers & Clips</h2>
            <div className="video-gallery">
              {content.videos.map((video, index) => (
                <div
                  key={video.id || index}
                  className={`video-gallery-item ${activeVideo === video.url ? 'active' : ''}`}
                  onClick={() => handleVideoSelect(video.url)}
                >
                  <div className="video-thumb-container">
                    <img src={video.thumbnail} alt={video.name} />
                    <div className="video-thumb-overlay">
                      <FaPlay />
                    </div>
                  </div>
                  <div className="video-gallery-info">
                    <h4>{video.name}</h4>
                    <span className="video-type-badge">{video.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="details-section">
          {content.director && content.director !== 'Unknown' && (
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

          {content.seasons && (
            <div className="detail-item">
              <h3>Seasons</h3>
              <p>{content.seasons} seasons, {content.episodes || 'N/A'} episodes</p>
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
  backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1280&h=720&fit=crop',
  rating: 8.4,
  views: 1500000,
  releaseYear: 2019,
  director: 'Anthony Russo, Joe Russo',
  cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth'],
  language: 'English',
  duration: 181,
  tagline: 'Avenge the fallen.',
  videoUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c',
  videos: [
    {
      id: '1',
      name: 'Official Trailer',
      type: 'Trailer',
      url: 'https://www.youtube.com/embed/TcMBFSGVi1c',
      thumbnail: 'https://img.youtube.com/vi/TcMBFSGVi1c/hqdefault.jpg'
    }
  ]
};

export default ContentDetail;