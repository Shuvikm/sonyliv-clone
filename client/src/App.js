import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Sports from './pages/Sports';
import News from './pages/News';
import Serials from './pages/Serials';
import Login from './pages/Login';
import Register from './pages/Register';
import ContentDetail from './pages/ContentDetail';
import Search from './pages/Search';
import './App.css';

function App() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const hideNavbarRoutes = ['/', '/login', '/register'];
  const shouldShowNavbar = token && !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="App">
      {shouldShowNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/news" element={<News />} />
          <Route path="/serials" element={<Serials />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/content/:id" element={<ContentDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/oldhome" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 