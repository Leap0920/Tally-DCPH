// Theme Management
function toggleTheme() {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Smooth scroll to features section
function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth'
    });
}

// --- AUTOMATIC CHARACTER CAROUSEL LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme on page load
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }

    // --- Automatic Character Carousel ---
    const slides = document.querySelectorAll('.character-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;
    let isTransitioning = false;

    function showSlide(index) {
        if (isTransitioning) return;
        
        isTransitioning = true;
        
        // Remove active class from all slides and dots
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (dots[i]) dots[i].classList.remove('active');
        });
        
        // Add active class to current slide and dot
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        
        currentSlide = index;
        
        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        let prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    // Auto-advance slides
    function startAutoSlide() {
        if (slides.length > 1) {
            slideInterval = setInterval(nextSlide, 4000); // Change slide every 4 seconds
        }
    }

    function stopAutoSlide() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Initialize carousel if slides exist
    if (slides.length > 0) {
        showSlide(0);
        startAutoSlide();
        
        // Pause auto-slide on hover
        const carouselContainer = document.querySelector('.slideshow-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoSlide);
            carouselContainer.addEventListener('mouseleave', startAutoSlide);
        }
    }

    // Dot indicators click event
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            showSlide(i);
            stopAutoSlide();
            setTimeout(startAutoSlide, 5000); // Restart auto-slide after 5 seconds
        });
    });

    // Responsive image handling
    function handleResponsiveImages() {
        const characterImages = document.querySelectorAll('.character-image');
        const screenWidth = window.innerWidth;
        
        characterImages.forEach(img => {
            // Ensure images maintain aspect ratio and fill container
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.objectPosition = 'center';
            
            // Adjust based on screen size
            if (screenWidth <= 480) {
                img.style.minHeight = '300px';
            } else if (screenWidth <= 768) {
                img.style.minHeight = '400px';
            } else if (screenWidth <= 1024) {
                img.style.minHeight = '500px';
            } else {
                img.style.minHeight = '600px';
            }
        });
    }

    // Handle image loading errors
    function handleImageErrors() {
        const characterImages = document.querySelectorAll('.character-image');
        
        characterImages.forEach((img, index) => {
            img.addEventListener('error', function() {
                // Create fallback image with character name
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 800;
                canvas.height = 600;
                
                // Create gradient background
                const gradient = ctx.createLinearGradient(0, 0, 800, 600);
                gradient.addColorStop(0, '#1e40af');
                gradient.addColorStop(1, '#3b82f6');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 800, 600);
                
                // Add character name text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 48px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.alt || 'Character', 400, 300);
                
                // Convert canvas to data URL and set as image source
                this.src = canvas.toDataURL();
            });
        });
    }

    // Initialize responsive handling
    handleResponsiveImages();
    handleImageErrors();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResponsiveImages();
        }, 250);
    });

    // --- Scroll Animations for VMG cards ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.vmg-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

    // --- Typing effect for hero title ---
    const heroTitle = document.querySelector('.main-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        setTimeout(typeWriter, 1000);
    }

    // --- Touch/Swipe support for mobile ---
    let touchStartX = 0;
    let touchEndX = 0;
    
    const carouselContainer = document.querySelector('.slideshow-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                stopAutoSlide();
                
                if (diff > 0) {
                    // Swipe left - next slide
                    nextSlide();
                } else {
                    // Swipe right - previous slide
                    prevSlide();
                }
                
                setTimeout(startAutoSlide, 5000);
            }
        }
    }

    // --- Keyboard navigation ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopAutoSlide();
            prevSlide();
            setTimeout(startAutoSlide, 5000);
        } else if (e.key === 'ArrowRight') {
            stopAutoSlide();
            nextSlide();
            setTimeout(startAutoSlide, 5000);
        }
    });
});

// --- Parallax effect for hero background ---
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.character-carousel-section');
    if (parallax) {
        const speed = scrolled * 0.3;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// --- Stats hover effect ---
document.querySelectorAll('.stat-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        const number = item.querySelector('.stat-number');
        if (number) {
            number.style.transform = 'scale(1.2)';
            number.style.color = '#fbbf24';
        }
    });
    
    item.addEventListener('mouseleave', () => {
        const number = item.querySelector('.stat-number');
        if (number) {
            number.style.transform = 'scale(1)';
            number.style.color = 'var(--accent-color)';
        }
    });
});

// --- Social links hover effect ---
document.querySelectorAll('.social-links .btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0) scale(1)';
    });
});

// --- Movie section animations ---
window.addEventListener('scroll', () => {
    const movieSection = document.querySelector('.movie-section');
    if (movieSection) {
        const rect = movieSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            movieSection.style.opacity = '1';
            movieSection.style.transform = 'translateY(0)';
        }
    }
});

// --- Community floating badges animation ---
document.querySelectorAll('.floating-badge').forEach((badge, index) => {
    const delay = index * 0.5;
    badge.style.animationDelay = `${delay}s`;
});

// --- Performance optimization ---
let ticking = false;

function updateOnScroll() {
    // Throttle scroll events for better performance
    if (!ticking) {
        requestAnimationFrame(() => {
            // Add any scroll-based animations here
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', updateOnScroll);

// --- Preload images for better performance ---
function preloadImages() {
    const imageUrls = [
        'conan.jpg',
        'shinichi.jpg', 
        'ran.jpg',
        'kogoro.jpg',
        'ai.jpg'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Start preloading after page load
window.addEventListener('load', preloadImages);
