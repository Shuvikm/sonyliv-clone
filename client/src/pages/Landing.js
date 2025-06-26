import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/login');
  };
  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <div className="landing-page">
      <img
        className="landing-bg-img"
        src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1500&q=80"
        alt="Background"
      />
      <div className="landing-overlay"></div>
      <button className="landing-back-btn" onClick={handleGoBack}>
        ← Go Back
      </button>
      <div className="landing-logo">
        {/* Replace with SVG or image if you have a real logo */}
        <span role="img" aria-label="Sony Live" className="sony-logo-emoji">🎬</span>
        <h1 className="sony-live-title">Sony Live</h1>
      </div>
      <button className="get-started-btn landing-btn" onClick={handleGetStarted}>
        Get Started
      </button>
    </div>
  );
};

export default Landing; 