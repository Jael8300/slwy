// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Get elements
    const clickButton = document.getElementById('clickMe');
    const contactForm = document.getElementById('contactForm');
    const heroVideo = document.getElementById('heroVideo');
    const header = document.querySelector('header');
    
    // Photo carousel functionality for music section
    function initPhotoCarousel() {
        const slides = document.querySelectorAll('.photo-slide');
        let currentSlide = 0;
        
        function showNextSlide() {
            // Remove active class from current slide
            slides[currentSlide].classList.remove('active');
            
            // Move to next slide
            currentSlide = (currentSlide + 1) % slides.length;
            
            // Add active class to new slide
            slides[currentSlide].classList.add('active');
        }
        
        // Change slide every 3 seconds
        if (slides.length > 0) {
            setInterval(showNextSlide, 3000);
        }
    }
    
    // Initialize carousel
    initPhotoCarousel();
    
    // Video optimization for mobile
    function optimizeVideoForDevice() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            if (window.innerWidth <= 768) {
                video.style.filter = 'brightness(0.9)';
            }
            
            // Pause video if not visible (performance optimization)
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.play();
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
    
    // Header background change on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
        } else {
            header.style.backgroundColor = 'rgba(44, 62, 80, 0.7)';
        }
    });
    
    // Button click event
    clickButton.addEventListener('click', function() {
        alert('Hello! You clicked the button!');
        
        if (clickButton.textContent === 'Get Started') {
            clickButton.textContent = 'Thanks for clicking!';
            clickButton.style.backgroundColor = '#27ae60';
        } else {
            clickButton.textContent = 'Get Started';
            clickButton.style.backgroundColor = '#3498db';
        }
    });
    
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
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: elementPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animations when sections come into view
    const sections = document.querySelectorAll('section:not(.hero-section)');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        optimizeVideoForDevice();
    });
    
    // Touch-friendly interactions
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
});