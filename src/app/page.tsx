'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Page load animation
    setIsLoaded(true);

    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Scroll animations for all animated elements
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay based on element index
          setTimeout(() => {
            entry.target.classList.add('animate-visible');
          }, index * 100);
        }
      });
    }, observerOptions);

    // Animate VMG cards with stagger
    document.querySelectorAll('.vmg-card-horizontal').forEach((card, index) => {
      card.classList.add('animate-on-scroll');
      (card as HTMLElement).style.transitionDelay = `${index * 0.15}s`;
      animateOnScroll.observe(card);
    });

    // Animate section titles
    document.querySelectorAll('.section-title, .section-subtitle, .community-title, .community-description').forEach(el => {
      el.classList.add('animate-on-scroll');
      animateOnScroll.observe(el);
    });

    // Animate buttons with stagger
    document.querySelectorAll('.social-links .btn').forEach((btn, index) => {
      btn.classList.add('animate-on-scroll');
      (btn as HTMLElement).style.transitionDelay = `${index * 0.1}s`;
      animateOnScroll.observe(btn);
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
      window.removeEventListener('scroll', handleScroll);
      animateOnScroll.disconnect();
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
    <div className={`page-wrapper ${isLoaded ? 'page-loaded' : ''}`}>
      {/* Animated Background Gradient */}
      <div className="animated-bg"></div>

      {/* Floating Particles - Fixed positions to avoid hydration mismatch */}
      <div className="particles">
        <div className="particle" style={{ left: '5%', animationDelay: '0s', animationDuration: '18s' }}></div>
        <div className="particle" style={{ left: '15%', animationDelay: '2s', animationDuration: '22s' }}></div>
        <div className="particle" style={{ left: '25%', animationDelay: '1s', animationDuration: '16s' }}></div>
        <div className="particle" style={{ left: '35%', animationDelay: '3s', animationDuration: '20s' }}></div>
        <div className="particle" style={{ left: '45%', animationDelay: '0.5s', animationDuration: '19s' }}></div>
        <div className="particle" style={{ left: '55%', animationDelay: '2.5s', animationDuration: '17s' }}></div>
        <div className="particle" style={{ left: '65%', animationDelay: '1.5s', animationDuration: '21s' }}></div>
        <div className="particle" style={{ left: '75%', animationDelay: '4s', animationDuration: '18s' }}></div>
        <div className="particle" style={{ left: '85%', animationDelay: '3.5s', animationDuration: '23s' }}></div>
        <div className="particle" style={{ left: '95%', animationDelay: '0.8s', animationDuration: '16s' }}></div>
        <div className="particle" style={{ left: '10%', animationDelay: '1.2s', animationDuration: '20s' }}></div>
        <div className="particle" style={{ left: '30%', animationDelay: '2.8s', animationDuration: '17s' }}></div>
        <div className="particle" style={{ left: '50%', animationDelay: '0.3s', animationDuration: '22s' }}></div>
        <div className="particle" style={{ left: '70%', animationDelay: '3.2s', animationDuration: '19s' }}></div>
        <div className="particle" style={{ left: '90%', animationDelay: '1.8s', animationDuration: '21s' }}></div>
      </div>

      {/* Character Carousel Hero Section */}
      <section
        className="character-carousel-section"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <div className="scroll-wrapper" ref={carouselRef}>
          <div className="scroll-track">
            {[...characters, ...characters].map((char, i) => (
              <div key={i} className="character-item">
                <Image src={char.src} alt={char.name} fill className="character-image" priority={i < 7} />
                <div className="character-overlay">
                  <h3 className="character-name">{char.name}</h3>
                  <p className="character-position">{char.role}</p>
                </div>
                <div className="character-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Title Section */}
      <section className="main-title-section hero-title-section">
        <div className="hero-bg-animation"></div>
        <div className="container">
          <div className="title-content text-center">
            <div className={`badge-container mb-4 ${isLoaded ? 'animate-pop' : ''}`}>
              <span className="hero-badge-animated">🇵🇭 PHILIPPINES CHAPTER 🇵🇭</span>
            </div>
            <h1 className={`main-title-animated mb-4 ${isLoaded ? 'animate-title' : ''}`}>
              <span className="title-word">DETECTIVE</span>{' '}
              <span className="title-word">CONAN</span>{' '}
              <span className="title-word title-highlight">PH</span>
            </h1>
            <p className={`main-subtitle-animated mb-5 ${isLoaded ? 'animate-fade-up' : ''}`}>
              The leading and the largest organization of Detective Conan fans in the Philippines
            </p>
            <div className={`main-buttons ${isLoaded ? 'animate-fade-up-delay' : ''}`}>
              <Link href="/login" className="btn-animated-primary">
                <span className="btn-bg"></span>
                <span className="btn-content">
                  <i className="bi bi-box-arrow-in-right"></i> Start
                </span>
              </Link>
              <button className="btn-animated-outline" onClick={scrollToFeatures}>
                <span className="btn-content">
                  <i className="bi bi-chevron-down"></i> Explore
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Vision Mission Goals Section - Horizontal */}
      <section id="features" className="vmg-section-horizontal">
        <div className="section-bg-pattern"></div>
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">What We Stand For</span>
            <h2 className="section-title">Our Foundation</h2>
            <p className="section-subtitle">Building the Detective Conan community in the Philippines</p>
          </div>
          <div className="vmg-horizontal-grid">
            <div className="vmg-card-horizontal">
              <div className="card-shine"></div>
              <div className="vmg-icon">
                <i className="bi bi-eye"></i>
              </div>
              <h3>Vision</h3>
              <p>To be the premier Detective Conan community in the Philippines, fostering appreciation for the series and connecting fans nationwide.</p>
            </div>
            <div className="vmg-card-horizontal featured">
              <div className="card-shine"></div>
              <div className="vmg-icon">
                <i className="bi bi-bullseye"></i>
              </div>
              <h3>Mission</h3>
              <p>Creating engaging experiences, organizing events, and providing a platform for fans to share their passion for Detective Conan.</p>
            </div>
            <div className="vmg-card-horizontal">
              <div className="card-shine"></div>
              <div className="vmg-icon">
                <i className="bi bi-trophy"></i>
              </div>
              <h3>Goals</h3>
              <p>Expand our community, promote Detective Conan culture, and create memorable experiences for all Filipino fans.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Links Section */}
      <section className="community-section-enhanced">
        <div className="community-bg-glow"></div>
        <div className="container">
          <div className="community-card-enhanced text-center">
            <div className="community-icon-ring">
              <i className="bi bi-people-fill"></i>
            </div>
            <h2 className="community-title">Join Our DCPH Community!</h2>
            <p className="community-description">
              Connect with thousands of Detective Conan fans across the Philippines through our official social media channels.
            </p>
            <div className="social-links-enhanced">
              <a href="https://www.facebook.com/groups/dcphanimeandmanga" target="_blank" rel="noopener noreferrer" className="social-btn-enhanced facebook">
                <i className="bi bi-facebook"></i>
                <span>Facebook Group</span>
              </a>
              <a href="https://www.facebook.com/search/top?q=detective%20conan%20ph%3A%20anime%20and%20manga" target="_blank" rel="noopener noreferrer" className="social-btn-enhanced page">
                <i className="bi bi-facebook"></i>
                <span>Facebook Page</span>
              </a>
              <a href="https://www.instagram.com/conanph0304/?hl=en" target="_blank" rel="noopener noreferrer" className="social-btn-enhanced instagram">
                <i className="bi bi-instagram"></i>
                <span>Instagram</span>
              </a>
              <a href="https://x.com/conanph0304?lang=en" target="_blank" rel="noopener noreferrer" className="social-btn-enhanced twitter">
                <i className="bi bi-twitter-x"></i>
                <span>X (Twitter)</span>
              </a>
            </div>
            <div className="cta-wrapper">
              <Link href="/login" className="btn-cta-enhanced">
                <span className="btn-glow"></span>
                <span className="btn-text">
                  <i className="bi bi-compass"></i> Explore the System
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-enhanced">
        <div className="container">
          <div className="footer-content-enhanced">
            <div className="footer-brand-enhanced">
              <div className="footer-logo">DC<span>PH</span></div>
              <p>Detective Conan PH: Anime and Manga</p>
            </div>
            <div className="footer-links-enhanced">
              <a href="#features">About Us</a>
              <a href="https://www.facebook.com/groups/dcphanimeandmanga" target="_blank" rel="noopener noreferrer">Community</a>
              <Link href="/login">Tally System</Link>
            </div>
          </div>
          <div className="footer-bottom-enhanced">
            <p>© 2025 DETECTIVE CONAN PH: Anime and Manga. Made with ❤️ by Filipino DC Fans.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
