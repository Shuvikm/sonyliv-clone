import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaEye, FaPlay, FaList } from 'react-icons/fa';
import VideoPlayer from '../components/VideoPlayer';
import { getContentDetails, searchSports } from '../services/api';
import './Watch.css';

const Watch = () => {
    const { id, type } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [selectedServer, setSelectedServer] = useState('trailer'); // 'trailer' or 'vidsrc'

    useEffect(() => {
        // Require authentication
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchContent = async () => {
            try {
                setLoading(true);
                setError(null);

                let contentData = null;

                // Check if content was passed via navigation state
                // But perform a check: if it's "lite" content (from list), we might need full details
                const stateContent = location.state?.content;
                const isLiteContent = stateContent && (
                    !stateContent.videos ||
                    stateContent.videoUrl?.includes('sample_') ||
                    !stateContent.cast
                );

                if (stateContent && !isLiteContent) {
                    contentData = stateContent;
                } else {
                    // Fetch full details if we don't have them or if we have "lite" content
                    // (We can use stateContent as a temporary placeholder while loading if we wanted, but simplistic approach is cleaner)

                    if (type === 'sport') {
                        // Fetch sport content
                        const sportsData = await searchSports();
                        contentData = sportsData.find(s => s._id === id);
                    } else {
                        // Fetch movie/series content from TMDB
                        contentData = await getContentDetails(id, type || 'movie');
                    }
                }

                if (contentData) {
                    setContent(contentData);
                    // Prioritize full movie URL over trailer if already set, otherwise default to trailer
                    // But we want to give option for Full Movie via VidSrc
                    setSelectedVideo(contentData.videoUrl);
                } else {
                    setError('Content not found');
                }
            } catch (err) {
                console.error('Error fetching content:', err);
                setError('Failed to load content');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [id, type, navigate, location.state]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleVideoSelect = (videoUrl) => {
        setSelectedVideo(videoUrl);
        setSelectedServer('trailer'); // Reset to trailer mode when picking a specific video
    };

    const handleServerChange = (server) => {
        setSelectedServer(server);
        if (server === 'vidsrc') {
            // VidSrc URL construction
            // https://vidsrc.xyz/embed/movie/{tmdb_id}
            // https://vidsrc.xyz/embed/tv/{tmdb_id}
            const embedType = (content.type === 'movie' || content.type === 'anime') ? 'movie' : 'tv';
            // For Anime, if it's a show, it might need 'tv'. TMDB IDs are unique per type.
            // Our 'anime' type maps to either movie or tv in TMDB. 
            // Ideally we should store 'media_type' ('movie' or 'tv') from TMDB separately.
            // But for now let's guess based on seasons presence or fallback.

            let actualType = embedType;
            if (content.type === 'anime') {
                actualType = content.seasons ? 'tv' : 'movie';
            } else if (content.type === 'series') {
                actualType = 'tv';
            }

            const vidSrcUrl = `https://vidsrc.xyz/embed/${actualType}/${content.imdbID || content._id}`;
            setSelectedVideo(vidSrcUrl);
        } else {
            // Revert to trailer
            setSelectedVideo(content.videoUrl);
        }
    };

    if (loading) {
        return (
            <div className="watch-page">
                <div className="watch-loading">
                    <div className="spinner"></div>
                    <p>Loading content...</p>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="watch-page">
                <div className="watch-error">
                    <div className="error-icon">🎬</div>
                    <h2>Unable to Play</h2>
                    <p>{error || 'Content not available'}</p>
                    <button className="back-btn" onClick={handleBack}>
                        <FaArrowLeft /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="watch-page">
            {/* Top Bar */}
            <div className={`watch-top-bar ${showInfo ? 'visible' : ''}`}>
                <button className="back-btn" onClick={handleBack}>
                    <FaArrowLeft />
                    <span>Back</span>
                </button>
                <div className="content-info-mini">
                    <h1>{content.title}</h1>
                    <div className="server-switcher">
                        <button
                            className={`server-btn ${selectedServer === 'trailer' ? 'active' : ''}`}
                            onClick={() => handleServerChange('trailer')}
                        >
                            Trailer
                        </button>
                        <button
                            className={`server-btn ${selectedServer === 'vidsrc' ? 'active' : ''}`}
                            onClick={() => handleServerChange('vidsrc')}
                        >
                            Full Movie / Episode
                        </button>
                    </div>
                </div>
                <button
                    className="info-toggle-btn"
                    onClick={() => setShowInfo(!showInfo)}
                >
                    <FaList />
                </button>
            </div>

            {/* Main Video Player */}
            <div className="watch-video-container">
                <VideoPlayer
                    videoUrl={selectedVideo || content.videoUrl}
                    title={content.title}
                    poster={content.backdrop || content.poster}
                    autoPlay={true}
                    showControls={true}
                />
            </div>

            {/* Content Info Panel */}
            <div className={`watch-info-panel ${showInfo ? 'open' : ''}`}>
                <div className="info-panel-content">
                    <div className="info-header">
                        <img
                            src={content.poster}
                            alt={content.title}
                            className="info-poster"
                        />
                        <div className="info-details">
                            <h2>{content.title}</h2>
                            {content.tagline && <p className="tagline">{content.tagline}</p>}

                            <div className="info-meta">
                                {content.releaseYear && <span>{content.releaseYear}</span>}
                                {content.duration && <span>{content.duration} min</span>}
                                {content.language && <span>{content.language.toUpperCase()}</span>}
                                {content.isLive && <span className="live-badge">LIVE</span>}
                            </div>

                            <div className="info-stats">
                                <div className="stat">
                                    <FaStar className="star" />
                                    <span>{content.rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                                <div className="stat">
                                    <FaEye />
                                    <span>{content.views?.toLocaleString() || 0} views</span>
                                </div>
                            </div>

                            {content.genre && content.genre.length > 0 && (
                                <div className="info-genres">
                                    {content.genre.map((g, i) => (
                                        <span key={i} className="genre-tag">{g}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="info-description">{content.description}</p>

                    {/* Video Selection (if multiple videos available) */}
                    {content.videos && content.videos.length > 1 && (
                        <div className="video-selection">
                            <h3><FaPlay /> Available Videos</h3>
                            <div className="video-list">
                                {content.videos.map((video, index) => (
                                    <button
                                        key={video.id || index}
                                        className={`video-item ${selectedVideo === video.url ? 'active' : ''}`}
                                        onClick={() => handleVideoSelect(video.url)}
                                    >
                                        <img
                                            src={video.thumbnail}
                                            alt={video.name}
                                            className="video-thumb"
                                        />
                                        <div className="video-item-info">
                                            <span className="video-name">{video.name}</span>
                                            <span className="video-type">{video.type}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sports specific info */}
                    {content.teams && content.teams.length > 0 && (
                        <div className="teams-info">
                            <h3>Teams</h3>
                            <p>{content.teams.join(' vs ')}</p>
                        </div>
                    )}

                    {content.venue && (
                        <div className="venue-info">
                            <h3>Venue</h3>
                            <p>{content.venue}</p>
                        </div>
                    )}

                    {/* Cast & Crew */}
                    {content.cast && content.cast.length > 0 && (
                        <div className="cast-info">
                            <h3>Cast</h3>
                            <p>{content.cast.join(', ')}</p>
                        </div>
                    )}

                    {content.director && content.director !== 'Unknown' && (
                        <div className="director-info">
                            <h3>Director</h3>
                            <p>{content.director}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Watch;
