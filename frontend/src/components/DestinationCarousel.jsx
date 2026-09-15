import { useEffect, useRef, useState } from 'react';
import { carouselSlides, carouselSubtitle } from '../data/carouselData.js';
import './DestinationCarousel.css';

const AUTO_ADVANCE_MS = 5000;

export default function DestinationCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const total = carouselSlides.length;

  const goTo = (nextIndex) => {
    setIndex(((nextIndex % total) + total) % total);
    resetTimer();
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, AUTO_ADVANCE_MS);
  }

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="carousel">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {carouselSlides.map((slide) => (
          <div className="carousel-slide" key={slide.id}>
            <div
              className="carousel-bg"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="carousel-scrim" />
            <div className="carousel-content container">
              <span className="carousel-badge">📍 {slide.location}</span>
              <h1 className="carousel-title">{slide.title}</h1>
              <p className="carousel-subtitle">{carouselSubtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-arrow carousel-arrow-left" onClick={prev} aria-label="Previous destination">
        ‹
      </button>
      <button className="carousel-arrow carousel-arrow-right" onClick={next} aria-label="Next destination">
        ›
      </button>

      <div className="carousel-dots">
        {carouselSlides.map((slide, i) => (
          <button
            key={slide.id}
            className={`carousel-dot ${i === index ? 'carousel-dot-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to ${slide.location}`}
          />
        ))}
      </div>
    </div>
  );
}
