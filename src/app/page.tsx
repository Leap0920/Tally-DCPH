'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll animations for VMG cards
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    document.querySelectorAll('.vmg-card').forEach(card => {
      (card as HTMLElement).style.opacity = '0';
      (card as HTMLElement).style.transform = 'translateY(30px)';
      (card as HTMLElement).style.transition = 'all 0.6s ease';
      observer.observe(card);
    });

    // Fade-in sections on scroll
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-section').forEach(el => {
      fadeObserver.observe(el);
    });

    // Pause carousel on hover
    const scrollWrapper = document.querySelector('.scroll-wrapper');
    const scrollTrack = document.querySelector('.scroll-track');

    if (scrollWrapper && scrollTrack) {
      scrollWrapper.addEventListener('mouseenter', () => {
        (scrollTrack as HTMLElement).style.animationPlayState = 'paused';
      });
      scrollWrapper.addEventListener('mouseleave', () => {
        (scrollTrack as HTMLElement).style.animationPlayState = 'running';
      });
    }

    return () => {
      observer.disconnect();
      fadeObserver.disconnect();
    };
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const characters = [
    { src: '/conan.jpg', name: 'Conan Edogawa', role: 'Main Detective' },
    { src: '/shinichi.jpg', name: 'Shinichi Kudo', role: 'High School Detective' },
    { src: '/ran.jpg', name: 'Ran Mouri', role: 'Karate Champion' },
    { src: '/kogoro.jpg', name: 'Kogoro Mouri', role: 'Private Detective' },
    { src: '/ai.jpg', name: 'Ai Haibara', role: 'Former Scientist' },
    { src: '/kazuha.jpg', name: 'Kazuha Toyama', role: 'Aikido Expert' },
    { src: '/heiji.jpg', name: 'Heiji Hattori', role: 'Osaka Detective' },
  ];

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="scroll-progress"></div>

      {/* Character Carousel Hero Section */}
      <section className="character-carousel-section fade-in-section">
        <div className="scroll-wrapper" ref={carouselRef}>
          <div className="scroll-track">
            {/* First set of characters */}
            {characters.map((char, i) => (
              <div key={`first-${i}`} className="character-item stagger-animation">
                <Image src={char.src} alt={char.name} fill className="character-image" priority={i < 3} />
                <div className="character-overlay">
                  <h3 className="character-name">{char.name}</h3>
                  <p className="character-position">{char.role}</p>
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless infinite loop */}
            {characters.map((char, i) => (
              <div key={`second-${i}`} className="character-item stagger-animation">
                <Image src={char.src} alt={char.name} fill className="character-image" />
                <div className="character-overlay">
                  <h3 className="character-name">{char.name}</h3>
                  <p className="character-position">{char.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Title Section */}
      <section className="main-title-section hero-title-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <div className="title-content">
                <div className="badge-container mb-4 scale-in">
                  <span className="badge bg-warning text-dark fs-6 px-4 py-2">🇵🇭 PHILIPPINES CHAPTER 🇵🇭</span>
                </div>
                <h1 className="main-title mb-4 fade-in-section">
                  DETECTIVE CONAN PH: ANIME AND MANGA
                </h1>
                <p className="main-subtitle mb-5 fade-in-section">
                  The leading and the largest organization of Detective Conan fans in the Philippines
                </p>
                <div className="main-buttons fade-in-section">
                  <Link href="/login" className="btn btn-primary btn-lg me-3 mb-3 slide-in-left">
                    <i className="bi bi-play-fill me-2"></i>Start Scoring
                  </Link>
                  <button className="btn btn-outline-light btn-lg mb-3 slide-in-right" onClick={scrollToFeatures}>
                    <i className="bi bi-info-circle me-2"></i>Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Mission Goals Section */}
      <section id="features" className="vmg-section py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="section-title fade-in-section">Our Foundation</h2>
              <p className="section-subtitle fade-in-section">Building the Detective Conan community in the Philippines</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="vmg-card h-100 slide-in-left">
                <div className="vmg-icon">
                  <i className="bi bi-eye"></i>
                </div>
                <h3>Vision</h3>
                <p>To be the premier Detective Conan community in the Philippines, fostering appreciation for the series and connecting fans nationwide.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="vmg-card h-100 scale-in">
                <div className="vmg-icon">
                  <i className="bi bi-bullseye"></i>
                </div>
                <h3>Mission</h3>
                <p>Creating engaging experiences, organizing events, and providing a platform for fans to share their passion for Detective Conan.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="vmg-card h-100 slide-in-right">
                <div className="vmg-icon">
                  <i className="bi bi-trophy"></i>
                </div>
                <h3>Goals</h3>
                <p>Expand our community, promote Detective Conan culture, and create memorable experiences for all Filipino fans.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Movie Section */}
      <section className="movie-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="movie-content slide-in-left">
                <h2 className="movie-title mb-4 fade-in-section">
                  🎬 <span className="text-primary">Detective Conan Movie 28</span>
                </h2>
                <h3 className="movie-subtitle mb-4 fade-in-section">One-Eyed Flashback</h3>
                <p className="movie-description mb-4 fade-in-section">
                  Get ready for the most thrilling Detective Conan movie yet! Join the DCPH community for an exclusive
                  <strong> Block Screening of One-Eyed Flashback</strong>. Experience the mystery, excitement, and
                  camaraderie with fellow Detective Conan fans across the Philippines.
                </p>
                <div className="movie-highlights">
                  <div className="highlight-item stagger-animation">
                    <i className="bi bi-calendar-event text-primary me-3"></i>
                    <span>DCPH Block Screening Event</span>
                  </div>
                  <div className="highlight-item stagger-animation">
                    <i className="bi bi-people-fill text-primary me-3"></i>
                    <span>Community Exclusive Experience</span>
                  </div>
                  <div className="highlight-item stagger-animation">
                    <i className="bi bi-film text-primary me-3"></i>
                    <span>Latest Detective Conan Movie</span>
                  </div>
                  <div className="highlight-item stagger-animation">
                    <i className="bi bi-heart-fill text-primary me-3"></i>
                    <span>Made for Filipino DC Fans</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="movie-video slide-in-right">
                <div className="video-container">
                  <iframe
                    src="https://www.youtube.com/embed/p6h57WqRRl8"
                    title="Detective Conan Movie 28 - One-Eyed Flashback Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-caption mt-3 text-center fade-in-section">
                  <p className="mb-0"><strong>Official Trailer</strong> - Detective Conan Movie 28: One-Eyed Flashback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Links Section */}
      <section className="community-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="community-card text-center">
                <div className="community-content">
                  <h2 className="community-title mb-4 fade-in-section">Join Our DCPH Community!</h2>
                  <p className="community-description mb-4 fade-in-section">
                    Connect with thousands of Detective Conan fans across the Philippines through our official social media channels.
                  </p>
                  <div className="social-links">
                    <a href="https://www.facebook.com/groups/dcphanimeandmanga" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg me-3 mb-3 stagger-animation">
                      <i className="bi bi-facebook me-2"></i>
                      Facebook Group
                    </a>
                    <a href="https://www.facebook.com/search/top?q=detective%20conan%20ph%3A%20anime%20and%20manga" target="_blank" rel="noopener noreferrer" className="btn btn-info btn-lg me-3 mb-3 stagger-animation">
                      <i className="bi bi-facebook me-2"></i>
                      Facebook Page
                    </a>
                    <a href="https://www.instagram.com/conanph0304/?hl=en" target="_blank" rel="noopener noreferrer" className="btn btn-danger btn-lg me-3 mb-3 stagger-animation">
                      <i className="bi bi-instagram me-2"></i>
                      Instagram
                    </a>
                    <a href="https://x.com/conanph0304?lang=en" target="_blank" rel="noopener noreferrer" className="btn btn-dark btn-lg mb-3 stagger-animation">
                      <i className="bi bi-twitter-x me-2"></i>
                      X (Twitter)
                    </a>
                  </div>
                  <div className="mt-4">
                    <Link href="/login" className="btn btn-success btn-lg scale-in">
                      <i className="bi bi-arrow-right-circle me-2"></i>
                      Launch Tally System
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-4 fade-in-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="footer-text mb-0">
                © 2025 DETECTIVE CONAN PH: Anime and Manga.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="footer-links">
                <a href="#features" className="footer-link">About Us</a>
                <span className="footer-divider">|</span>
                <a href="#community" className="footer-link">Community</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
