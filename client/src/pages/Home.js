import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Carousel from '../components/Carousel';
import './Home.css';

const HOME_BG = 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1500&q=80';

const sampleMovies = [
  { title: 'Jawan', poster: 'https://m.media-amazon.com/images/M/MV5BMjA2YjYwYjUtYjQwZi00YjQwLTg2YjMtYjQwYjQwYjQwYjQwXkEyXkFqcGdeQXVyMTYzMDM0NTU@._V1_.jpg' },
  { title: 'Pathaan', poster: 'https://m.media-amazon.com/images/M/MV5BZTc2YjQwYjQtYjQwZi00YjQwLTg2YjMtYjQwYjQwYjQwYjQwXkEyXkFqcGdeQXVyMTYzMDM0NTU@._V1_.jpg' },
  { title: 'RRR', poster: 'https://m.media-amazon.com/images/M/MV5BMjA2YjYwYjUtYjQwZi00YjQwLTg2YjMtYjQwYjQwYjQwYjQwXkEyXkFqcGdeQXVyMTYzMDM0NTU@._V1_.jpg' },
  { title: 'KGF', poster: 'https://m.media-amazon.com/images/M/MV5BMjA2YjYwYjUtYjQwZi00YjQwLTg2YjMtYjQwYjQwYjQwYjQwXkEyXkFqcGdeQXVyMTYzMDM0NTU@._V1_.jpg' },
  { title: 'Drishyam', poster: 'https://m.media-amazon.com/images/M/MV5BMjA2YjYwYjUtYjQwZi00YjQwLTg2YjMtYjQwYjQwYjQwYjQwXkEyXkFqcGdeQXVyMTYzMDM0NTU@._V1_.jpg' },
];
const sampleNews = [
  { title: 'India wins cricket series', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80' },
  { title: 'Tech innovation in 2024', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80' },
  { title: 'Bollywood box office', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80' },
];
const sampleSports = [
  { title: 'Football Finals', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80' },
  { title: 'Cricket World Cup', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80' },
  { title: 'Olympics 2024', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80' },
];
const sampleSerials = [
  { title: 'Sacred Games', poster: 'https://m.media-amazon.com/images/M/MV5BMjA2YjYwYjUtYjQwZi00YjQwLTg2YjMtYjQwYjQwYjQwYjQwXkEyXkFqcGdeQXVyMTYzMDM0NTU@._V1_.jpg' },
  { title: 'Mirzapur', poster: 'https://m.media-amazon.com/images/M/MV5BMjA2YjYwYjUtYjQwZi00YjQwLTg2YjMtYjQwYjQwYjQwYjQwXkEyXkFqcGdeQXVyMTYzMDM0NTU@._V1_.jpg' },
  { title: 'The Family Man', poster: 'https://m.media-amazon.com/images/M/MV5BMjA2YjYwYjUtYjQwZi00YjQwLTg2YjMtYjQwYjQwYjQwYjQwXkEyXkFqcGdeQXVyMTYzMDM0NTU@._V1_.jpg' },
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (location.pathname === '/') {
      navigate('/home');
    }
  }, [token, navigate, location.pathname]);

  return (
    <div className="home-page">
      <img
        className="home-bg-img"
        src={HOME_BG}
        alt="Background"
      />
      <div className="home-overlay"></div>
      <div className="home-center-content" style={{paddingTop: '2rem', paddingBottom: '2rem'}}>
        <div className="center-stack" style={{width: '100%', maxWidth: '1200px'}}>
          {user && (
            <div className="welcome-message">
              Welcome, {user.username || user.email}!
            </div>
          )}
          <Carousel
            items={sampleMovies}
            title="Movies"
            viewAllLink="/movies"
            renderItem={item => (
              <div className="carousel-sample-card">
                <img src={item.poster} alt={item.title} className="carousel-sample-img" />
                <div className="carousel-sample-title">{item.title}</div>
              </div>
            )}
          />
          <Carousel
            items={sampleNews}
            title="News"
            viewAllLink="/news"
            renderItem={item => (
              <div className="carousel-sample-card">
                <img src={item.image} alt={item.title} className="carousel-sample-img" />
                <div className="carousel-sample-title">{item.title}</div>
              </div>
            )}
          />
          <Carousel
            items={sampleSerials}
            title="Serials"
            viewAllLink="/serials"
            renderItem={item => (
              <div className="carousel-sample-card">
                <img src={item.poster} alt={item.title} className="carousel-sample-img" />
                <div className="carousel-sample-title">{item.title}</div>
              </div>
            )}
          />
          <Carousel
            items={sampleSports}
            title="Sports"
            viewAllLink="/sports"
            renderItem={item => (
              <div className="carousel-sample-card">
                <img src={item.image} alt={item.title} className="carousel-sample-img" />
                <div className="carousel-sample-title">{item.title}</div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Home; 