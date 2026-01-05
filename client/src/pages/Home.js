import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Carousel from '../components/Carousel';
import { getTrendingMovies, getPopularTVSeries, getAnime, searchNews } from '../services/api';
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
  
  const [trendingMovies, setTrendingMovies] = useState(sampleMovies);
  const [popularSeries, setPopularSeries] = useState(sampleSerials);
  const [animeList, setAnimeList] = useState([]);
  const [news, setNews] = useState(sampleNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (location.pathname === '/') {
      navigate('/home');
    }
  }, [token, navigate, location.pathname]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [moviesData, seriesData, animeData, newsData] = await Promise.all([
          getTrendingMovies().catch(() => sampleMovies),
          getPopularTVSeries().catch(() => sampleSerials),
          getAnime().catch(() => []),
          searchNews('entertainment').catch(() => sampleNews)
        ]);

        setTrendingMovies(moviesData.slice(0, 8));
        setPopularSeries(seriesData.slice(0, 8));
        setAnimeList(animeData.slice(0, 8));
        setNews(newsData.slice(0, 8));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHomeData();
    }
  }, [token]);

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
            items={trendingMovies}
            title="🎬 Trending Movies"
            viewAllLink="/movies"
            renderItem={item => (
              <div className="carousel-sample-card">
                <img 
                  src={item.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop'} 
                  alt={item.title} 
                  className="carousel-sample-img" 
                />
                <div className="carousel-sample-title">{item.title}</div>
                {item.rating && (
                  <div className="carousel-sample-rating">★ {item.rating.toFixed(1)}</div>
                )}
              </div>
            )}
          />
          
          <Carousel
            items={popularSeries}
            title="📺 Popular TV Series"
            viewAllLink="/serials"
            renderItem={item => (
              <div className="carousel-sample-card">
                <img 
                  src={item.poster || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop'} 
                  alt={item.title} 
                  className="carousel-sample-img" 
                />
                <div className="carousel-sample-title">{item.title}</div>
                {item.rating && (
                  <div className="carousel-sample-rating">★ {item.rating.toFixed(1)}</div>
                )}
              </div>
            )}
          />
          
          {animeList.length > 0 && (
            <Carousel
              items={animeList}
              title="🍥 Popular Anime"
              viewAllLink="/anime"
              renderItem={item => (
                <div className="carousel-sample-card">
                  <img 
                    src={item.poster || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop'} 
                    alt={item.title} 
                    className="carousel-sample-img" 
                  />
                  <div className="carousel-sample-title">{item.title}</div>
                  {item.rating && (
                    <div className="carousel-sample-rating">★ {item.rating.toFixed(1)}</div>
                  )}
                </div>
              )}
            />
          )}
          
          <Carousel
            items={news}
            title="📰 Latest News"
            viewAllLink="/news"
            renderItem={item => (
              <div className="carousel-sample-card">
                <img 
                  src={item.poster || item.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop'} 
                  alt={item.title} 
                  className="carousel-sample-img" 
                />
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