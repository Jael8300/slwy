// // Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing carousels...');
    
    // Get elements
    const clickButton = document.getElementById('clickMe');
    const contactForm = document.getElementById('contactForm');
    const heroVideo = document.getElementById('heroVideo');
    const header = document.querySelector('header');
    
    // Photo carousel functionality - handles multiple carousels
    function initPhotoCarousels() {
        // Find all photo carousels on the page
        const carousels = document.querySelectorAll('.photo-carousel');
        console.log(`Found ${carousels.length} carousels`);
        
        carousels.forEach((carousel, carouselIndex) => {
            const slides = carousel.querySelectorAll('.photo-slide');
            console.log(`Carousel ${carouselIndex + 1} has ${slides.length} slides`);
            
            let currentSlide = 0;
            
            // Only initialize carousel if there are slides
            if (slides.length > 0) {
                // Clear any existing intervals for this carousel
                if (carousel.intervalId) {
                    clearInterval(carousel.intervalId);
                }
                
                // Make sure first slide is active
                slides.forEach(slide => slide.classList.remove('active'));
                slides[0].classList.add('active');
                
                function showNextSlide() {
                    console.log(`Carousel ${carouselIndex + 1}: showing slide ${currentSlide} -> ${(currentSlide + 1) % slides.length}`);
                    
                    // Remove active class from current slide
                    slides[currentSlide].classList.remove('active');
                    
                    // Move to next slide
                    currentSlide = (currentSlide + 1) % slides.length;
                    
                    // Add active class to new slide
                    slides[currentSlide].classList.add('active');
                }
                
                // Change slide every 2 seconds (faster for testing)
                carousel.intervalId = setInterval(showNextSlide, 2000);
                
                console.log(`Carousel ${carouselIndex + 1} initialized with ${slides.length} slides`);
            } else {
                console.error(`Carousel ${carouselIndex + 1} has no slides!`);
            }
        });
    }
    
    // Initialize carousels
    initPhotoCarousels();
    
    // Video optimization for mobile
    function optimizeVideoForDevice() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            if (window.innerWidth <= 768) {
                // Remove any existing filters on mobile if needed
            }
            
            // Pause video if not visible (performance optimization)
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.play().catch(e => console.log('Video play failed:', e));
                    } else {
                        video.pause();
                    }
                });
            });
            
            observer.observe(video);
        });
    }
    
    // Initialize video optimizations
    optimizeVideoForDevice();
    
    // Header background change on scroll (only if header exists)
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
            } else {
                header.style.backgroundColor = 'rgba(44, 62, 80, 0.7)';
            }
        });
    }
    
    // Button click event
    if (clickButton) {
        clickButton.addEventListener('click', function() {
            alert('Hello! You clicked the button!');
            
            if (clickButton.textContent === 'Get Started') {
                clickButton.textContent = 'Thanks for clicking!';
                clickButton.style.backgroundColor = '#27ae60';
            } else {
                clickButton.textContent = 'Get Started';
                clickButton.style.backgroundColor = '#f1cb32';
            }
        });
    }
    
    // Form submission event
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (name && email && message) {
                alert(`Thank you, ${name}! Your message has been received.`);
                contactForm.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
    
    // Smooth scrolling for navigation links (only if navigation exists)
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const elementPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Handle window resize AND orientation changes
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            console.log('Window resized/orientation changed, reinitializing carousels...');
            optimizeVideoForDevice();
            initPhotoCarousels(); // Reinitialize carousels on orientation change
        }, 500);
    });
    
    // Touch-friendly interactions
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
});
