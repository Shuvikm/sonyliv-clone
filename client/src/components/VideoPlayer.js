import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaExpand, FaCompress, FaVolumeMute, FaVolumeUp, FaTimes } from 'react-icons/fa';
import './VideoPlayer.css';

const VideoPlayer = ({
  videoUrl,
  title,
  poster,
  onClose,
  autoPlay = true,
  showControls = true
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const overlayTimeoutRef = useRef(null);

  // Check if it's a YouTube URL
  const isYouTube = videoUrl && (
    videoUrl.includes('youtube.com') ||
    videoUrl.includes('youtu.be') ||
    videoUrl.includes('youtube.com/embed')
  );

  // Get proper YouTube embed URL
  const getEmbedUrl = () => {
    if (!videoUrl) return null;

    if (videoUrl.includes('youtube.com/embed')) {
      // Already an embed URL
      const params = new URLSearchParams();
      if (autoPlay) params.append('autoplay', '1');
      if (isMuted) params.append('mute', '1');
      params.append('rel', '0');
      params.append('modestbranding', '1');
      return `${videoUrl.split('?')[0]}?${params.toString()}`;
    }

    if (videoUrl.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(videoUrl).search);
      const videoId = urlParams.get('v');
      if (videoId) {
        const params = new URLSearchParams();
        if (autoPlay) params.append('autoplay', '1');
        if (isMuted) params.append('mute', '1');
        params.append('rel', '0');
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      }
    }

    if (videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.split('/').pop().split('?')[0];
      const params = new URLSearchParams();
      if (autoPlay) params.append('autoplay', '1');
      if (isMuted) params.append('mute', '1');
      params.append('rel', '0');
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }

    return videoUrl;
  };

  const embedUrl = getEmbedUrl();

  useEffect(() => {
    const handleMouseMove = () => {
      setShowOverlay(true);
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
      if (isPlaying) {
        overlayTimeoutRef.current = setTimeout(() => {
          setShowOverlay(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load video');
  };

  if (!videoUrl || !embedUrl) {
    return (
      <div className="video-player-container" ref={containerRef}>
        <div className="video-player-error">
          <div className="error-icon">🎬</div>
          <h3>Video Not Available</h3>
          <p>This content doesn't have a video available yet.</p>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`video-player-container ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="video-player-loading">
          <div className="spinner"></div>
          <p>Loading video...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="video-player-error">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Play</h3>
          <p>{error}</p>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      )}

      {/* Video Player */}
      {/* Treat any URL that doesn't end in typical video extensions as an embed/iframe */}
      {!videoUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
        <div className="video-wrapper">
          <iframe
            src={embedUrl}
            title={title || 'Video Player'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className={isLoading ? 'hidden' : ''}
          />
        </div>
      ) : (
        <video
          src={videoUrl}
          poster={poster}
          autoPlay={autoPlay}
          muted={isMuted}
          controls
          className="native-video-player"
          onLoadedData={() => setIsLoading(false)}
          onError={() => setError('Failed to load video')}
        />
      )}

      {/* Overlay Controls */}
      {showControls && showOverlay && !isLoading && !error && (
        <div className="video-overlay">
          {/* Top Bar */}
          <div className="overlay-top">
            <div className="video-title">{title}</div>
            {onClose && (
              <button className="control-btn close-video-btn" onClick={onClose}>
                <FaTimes />
              </button>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="overlay-bottom">
            <div className="control-group">
              <button
                className="control-btn"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
            </div>

            <div className="control-group">
              <button
                className="control-btn"
                onClick={handleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
