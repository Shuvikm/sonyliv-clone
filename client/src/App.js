import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Sports from './pages/Sports';
import News from './pages/News';
import Serials from './pages/Serials';
import Anime from './pages/Anime';
import Login from './pages/Login';
import Register from './pages/Register';
import ContentDetail from './pages/ContentDetail';
import Search from './pages/Search';
import Watch from './pages/Watch';
import './App.css';
import './styles/premium.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const hideNavbarRoutes = ['/', '/login', '/register'];
  const isWatchPage = location.pathname.startsWith('/watch');
  const shouldShowNavbar = token && !hideNavbarRoutes.includes(location.pathname) && !isWatchPage;

  return (
    <div className="App">
      {shouldShowNavbar && <Navbar />}
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/news" element={<News />} />
            <Route path="/serials" element={<Serials />} />
            <Route path="/anime" element={<Anime />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/content/:id" element={<ContentDetail />} />
            <Route path="/watch/:id/:type" element={<Watch />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/oldhome" element={<Navigate to="/home" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App; 