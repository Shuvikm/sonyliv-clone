import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaInfoCircle, FaStar, FaPlus, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import './HeroBanner.css';

const HeroBanner = ({ items = [], autoPlayInterval = 8000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const navigate = useNavigate();

    // Featured content for hero banner
    const featuredContent = items.length > 0 ? items.slice(0, 5) : [
        {
            _id: 'featured_1',
            title: 'The Latest Blockbuster',
            description: 'Experience the most anticipated movie of the year with stunning visuals and an incredible story.',
            backdrop: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
            rating: 8.5,
            type: 'movie',
            genre: ['Action', 'Adventure'],
            releaseYear: 2024
        }
    ];

    const currentItem = featuredContent[currentIndex] || featuredContent[0];

    // Auto-rotate hero content
    useEffect(() => {
        if (featuredContent.length <= 1) return;

        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
                setIsTransitioning(false);
            }, 500);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [featuredContent.length, autoPlayInterval]);

    const goToSlide = (index) => {
        if (index === currentIndex) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 300);
    };

    const handleWatchNow = () => {
        navigate(`/watch/${currentItem._id}/${currentItem.type || 'movie'}`, {
            state: { content: currentItem }
        });
    };

    const handleMoreInfo = () => {
        navigate(`/content/${currentItem._id}?type=${currentItem.type || 'movie'}`);
    };

    if (!currentItem) return null;

    return (
        <div className="hero-banner">
            {/* Background Image with Parallax Effect */}
            <div
                className={`hero-backdrop ${isTransitioning ? 'transitioning' : ''}`}
                style={{ backgroundImage: `url(${currentItem.backdrop || currentItem.poster})` }}
            >
                <div className="hero-gradient-overlay" />
                <div className="hero-side-gradient" />
            </div>

            {/* Hero Content */}
            <div className={`hero-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                {/* Ranking Badge */}
                {currentIndex < 3 && (
                    <div className="hero-rank">
                        <span className="rank-number">#{currentIndex + 1}</span>
                        <span className="rank-text">Trending Now</span>
                    </div>
                )}

                {/* Title */}
                <h1 className="hero-title">{currentItem.title}</h1>

                {/* Meta Info */}
                <div className="hero-meta">
                    {currentItem.rating && (
                        <span className="hero-rating">
                            <FaStar /> {currentItem.rating.toFixed(1)}
                        </span>
                    )}
                    {currentItem.releaseYear && (
                        <span className="hero-year">{currentItem.releaseYear}</span>
                    )}
                    {currentItem.genre?.slice(0, 2).map((g, i) => (
                        <span key={i} className="hero-genre">{g}</span>
                    ))}
                    <span className="hero-quality">4K</span>
                    <span className="hero-dolby">Dolby Atmos</span>
                </div>

                {/* Description */}
                <p className="hero-description">{currentItem.description}</p>

                {/* Action Buttons */}
                <div className="hero-buttons">
                    <button className="hero-btn primary" onClick={handleWatchNow}>
                        <FaPlay /> Watch Now
                    </button>
                    <button className="hero-btn secondary" onClick={handleMoreInfo}>
                        <FaInfoCircle /> More Info
                    </button>
                    <button className="hero-btn icon-only" title="Add to My List">
                        <FaPlus />
                    </button>
                    <button
                        className="hero-btn icon-only mute-btn"
                        onClick={() => setIsMuted(!isMuted)}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                </div>
            </div>

            {/* Slide Indicators */}
            {featuredContent.length > 1 && (
                <div className="hero-indicators">
                    {featuredContent.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                        >
                            <span className="indicator-progress" />
                        </button>
                    ))}
                </div>
            )}

            {/* Bottom Fade */}
            <div className="hero-bottom-fade" />
        </div>
    );
};

export default HeroBanner;
