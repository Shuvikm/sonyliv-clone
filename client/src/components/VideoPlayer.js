import React, { useState, useRef, useEffect } from 'react';
import {
  FaPlay,
  FaPause,
  FaExpand,
  FaCompress,
  FaVolumeMute,
  FaVolumeUp,
  FaTimes,
  FaRedo,
  FaClone,
  FaArrowLeft,
} from 'react-icons/fa';
import './VideoPlayer.css';

/**
 * VideoPlayer component
 * Supports native video URLs (mp4, webm, ogg) with custom controls and
 * YouTube embed URLs (youtube.com, youtu.be) using an iframe.
 *
 * Props:
 *   videoUrl   - URL of the video or YouTube embed.
 *   title      - Title displayed in the overlay.
 *   poster     - Poster image for native video.
 *   onClose    - Callback when the close button is pressed.
 *   autoPlay   - Whether to start playing automatically.
 *   showControls - Show custom controls (default true).
 */
const VideoPlayer = ({
  videoUrl,
  title,
  poster,
  onClose,
  autoPlay = true,
  showControls = true,
}) => {
  // ---------------------------------------------------------------------------
  // Determine source type
  // ---------------------------------------------------------------------------
  const isYouTube =
    videoUrl &&
    (videoUrl.includes('youtube.com') ||
      videoUrl.includes('youtu.be') ||
      videoUrl.includes('youtube.com/embed'));

  const isVidSrc =
    videoUrl &&
    (videoUrl.includes('vidsrc.xyz') ||
      videoUrl.includes('vidsrc.pro') ||
      videoUrl.includes('vidsrc.me'));

  const isIframe = isYouTube || isVidSrc;

  // ---------------------------------------------------------------------------
  // State for native video playback
  // ---------------------------------------------------------------------------
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const overlayTimeoutRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Helper: Build YouTube embed URL with appropriate params
  // ---------------------------------------------------------------------------
  const getYouTubeEmbedUrl = () => {
    if (!videoUrl) return null;
    // Already an embed URL
    if (videoUrl.includes('youtube.com/embed')) {
      const params = new URLSearchParams();
      if (autoPlay) params.append('autoplay', '1');
      if (isMuted) params.append('mute', '1');
      params.append('rel', '0');
      params.append('modestbranding', '1');
      return `${videoUrl.split('?')[0]}?${params.toString()}`;
    }
    // Standard watch URL
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
    // Short youtu.be URL
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

  const embedUrl = isYouTube ? getYouTubeEmbedUrl() : null;

  // ---------------------------------------------------------------------------
  // Native video event handlers
  // ---------------------------------------------------------------------------
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setCurrentTime(video.currentTime);
    }
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickPos = e.clientX - rect.left;
    const newTime = (clickPos / rect.width) * duration;
    const video = videoRef.current;
    if (video) video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    const video = videoRef.current;
    if (video) video.volume = newVol;
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (!isPiP) {
        await video.requestPictureInPicture();
        setIsPiP(true);
      } else {
        await document.exitPictureInPicture();
        setIsPiP(false);
      }
    } catch (err) {
      console.warn('PiP not supported or failed', err);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
  };

  // ---------------------------------------------------------------------------
  // Overlay visibility handling (mouse move)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleMouseMove = () => {
      setShowOverlay(true);
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      if (isPlaying) {
        overlayTimeoutRef.current = setTimeout(() => setShowOverlay(false), 3000);
      }
    };
    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    };
  }, [isPlaying]);

  // ---------------------------------------------------------------------------
  // Fullscreen change listener (sync state)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const formatTime = (sec) => {
    if (!sec) return '0:00';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // ---------------------------------------------------------------------------
  // Early return for missing video
  // ---------------------------------------------------------------------------
  if (!videoUrl) {
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

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  return (
    <div
      className={`video-player-container ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="video-player-loading">
          <div className="spinner" />
          <p>Loading video...</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="video-player-error">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Play</h3>
          <p>{error}</p>
          <button className="close-btn" onClick={handleRetry}>
            Retry
          </button>
          {onClose && (
            <button className="close-btn" onClick={onClose} style={{ marginLeft: '8px' }}>
              Close
            </button>
          )}
        </div>
      )}

      {/* Video element or iframe */}
      {!isIframe ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          muted={isMuted}
          autoPlay={autoPlay}
          className="native-video-player"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onError={() => setError('Failed to load video')}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        />
      ) : (
        <div className="video-wrapper">
          <iframe
            src={isYouTube ? embedUrl : videoUrl}
            title={title || 'Video Player'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => setError(isVidSrc ? 'Failed to load video. Content may not be available.' : 'Failed to load YouTube video')}
            className={isLoading ? 'hidden' : ''}
          />
        </div>
      )}

      {/* Custom overlay controls – only for native video */}
      {showControls && !isIframe && showOverlay && !isLoading && !error && (
        <div className="video-overlay">
          {/* Top Bar */}
          <div className="overlay-top">
            <div className="video-title" title={title}>
              {title}
            </div>
            {onClose && (
              <button className="control-btn close-video-btn" onClick={onClose} title="Close">
                <FaTimes />
              </button>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="overlay-bottom">
            {/* Play / Pause */}
            <button
              className="control-btn"
              onClick={handlePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            {/* Progress Bar */}
            <div className="progress-bar" onClick={handleProgressClick} style={{ flex: 1, margin: '0 12px' }}>
              <div
                className="progress-filled"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
            <span className="time-label">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume */}
            <button className="control-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume"
            />

            {/* PiP */}
            <button className="control-btn" onClick={togglePiP} title="Picture in Picture">
              <FaClone />
            </button>

            {/* Fullscreen */}
            <button className="control-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
