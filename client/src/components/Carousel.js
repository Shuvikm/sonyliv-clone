import React, { useRef } from 'react';
import './Carousel.css';

const Carousel = ({ items, renderItem, title, viewAllLink }) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    const { current } = carouselRef;
    if (!current) return;
    const scrollAmount = current.offsetWidth * 0.7;
    current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="carousel-section">
      <div className="carousel-header">
        <h2>{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="carousel-view-all">View All</a>
        )}
      </div>
      <div className="carousel-container">
        <button className="carousel-arrow left" onClick={() => scroll('left')}>&lt;</button>
        <div className="carousel-track" ref={carouselRef}>
          {items.map((item, idx) => (
            <div className="carousel-item" key={idx}>
              {renderItem(item)}
            </div>
          ))}
        </div>
        <button className="carousel-arrow right" onClick={() => scroll('right')}>&gt;</button>
      </div>
    </div>
  );
};

export default Carousel; 