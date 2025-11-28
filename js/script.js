// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing carousels...');
    
    // Get elements
    const heroVideo = document.getElementById('heroVideo');
    
    // Photo carousel functionality - handles multiple carousels
    function initPhotoCarousels() {
        const carousels = document.querySelectorAll('.photo-carousel');
        console.log(`Found ${carousels.length} carousels`);
        
        carousels.forEach((carousel, carouselIndex) => {
            const slides = carousel.querySelectorAll('.photo-slide');
            console.log(`Carousel ${carouselIndex + 1} has ${slides.length} slides`);
            
            let currentSlide = 0;
            
            if (slides.length > 0) {
                if (carousel.intervalId) {
                    clearInterval(carousel.intervalId);
                }
                
                slides.forEach(slide => slide.classList.remove('active'));
                slides[0].classList.add('active');
                
                function showNextSlide() {
                    console.log(`Carousel ${carouselIndex + 1}: showing slide ${currentSlide} -> ${(currentSlide + 1) % slides.length}`);
                    
                    slides[currentSlide].classList.remove('active');
                    currentSlide = (currentSlide + 1) % slides.length;
                    slides[currentSlide].classList.add('active');
                }
                
                carousel.intervalId = setInterval(showNextSlide, 2000);
                console.log(`Carousel ${carouselIndex + 1} initialized with ${slides.length} slides`);
            } else {
                console.error(`Carousel ${carouselIndex + 1} has no slides!`);
            }
        });
    }
    
    // Initialize carousels
    initPhotoCarousels();

    // Drag/Touch Carousel functionality with fluid motion and boundaries
    function initDragCarousel(wrapperId, carouselId, itemSelector, dotsId, centerClass = 'center') {
        const wrapper = document.getElementById(wrapperId) || document.querySelector('.event-carousel-wrapper');
        const carousel = document.getElementById(carouselId);
        const dotsContainer = document.getElementById(dotsId);
        if (!carousel || !wrapper) return;

        const items = carousel.querySelectorAll(itemSelector);
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
        if (items.length === 0) return;

        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;

        // Calculate item width dynamically
        function getItemWidth() {
            return items[0].offsetWidth + parseInt(getComputedStyle(carousel).gap || 0);
        }

        // Calculate boundaries
        function getBoundaries() {
            const itemWidth = getItemWidth();
            const wrapperWidth = wrapper.offsetWidth;
            const offset = (wrapperWidth / 2) - (itemWidth / 2);
    
            const maxTranslate = offset;
            const minTranslate = offset - ((items.length - 1) * itemWidth);
    
            return { maxTranslate, minTranslate };
        }

        // Update dots
        function updateDots(centerIndex) {
            if (dots.length > 0) {
                dots.forEach((dot, i) => {
                    dot.classList.remove('active');
                    if (i === centerIndex) {
                        dot.classList.add('active');
                    }
                });
            }
        }

        // Update which item is in center
        function updateCenterItem() {
            const itemWidth = getItemWidth();
            const wrapperWidth = wrapper.offsetWidth;
            const centerPoint = wrapperWidth / 2;
            let centerIndex = 0;
    
            items.forEach((item, i) => {
                const itemLeft = currentTranslate + (i * itemWidth);
                const itemCenter = itemLeft + (itemWidth / 2);
                const distanceFromCenter = Math.abs(itemCenter - centerPoint);
        
                if (centerClass) {
                    item.classList.remove(centerClass);
                    if (distanceFromCenter < itemWidth / 2) {
                        item.classList.add(centerClass);
                        centerIndex = i;
                    }
                }
            });
    
            updateDots(centerIndex);
        }

        function setSliderPosition() {
            carousel.style.transform = `translateX(${currentTranslate}px)`;
            updateCenterItem();
        }

        function scrollToIndex(index) {
            const itemWidth = getItemWidth();
            const wrapperWidth = wrapper.offsetWidth;
            const offset = (wrapperWidth / 2) - (itemWidth / 2);
            const targetTranslate = offset - (index * itemWidth);
    
            carousel.style.transition = 'transform 0.3s ease';
            currentTranslate = targetTranslate;
            prevTranslate = currentTranslate;
            setSliderPosition();
        }

        function animation() {
            setSliderPosition();
            if (isDragging) requestAnimationFrame(animationID);
        }

        function touchStart(event) {
            isDragging = true;
            startPos = getPositionX(event);
            animationID = requestAnimationFrame(animation);
            wrapper.style.cursor = 'grabbing';
            carousel.style.transition = 'none';
        }

        function touchMove(event) {
            if (isDragging) {
                event.preventDefault();
                const currentPosition = getPositionX(event);
                const diff = currentPosition - startPos;
                let newTranslate = prevTranslate + diff;
        
                const { maxTranslate, minTranslate } = getBoundaries();
        
                if (newTranslate > maxTranslate) {
                    const overDrag = newTranslate - maxTranslate;
                    newTranslate = maxTranslate + (overDrag * 0.3);
                } else if (newTranslate < minTranslate) {
                    const overDrag = minTranslate - newTranslate;
                    newTranslate = minTranslate - (overDrag * 0.3);
                }
        
                currentTranslate = newTranslate;
            }
        }

        function touchEnd() {
            isDragging = false;
            cancelAnimationFrame(animationID);
            wrapper.style.cursor = 'grab';
            carousel.style.transition = 'transform 0.3s ease';
    
            const itemWidth = getItemWidth();
            const wrapperWidth = wrapper.offsetWidth;
            const offset = (wrapperWidth / 2) - (itemWidth / 2);
            const { maxTranslate, minTranslate } = getBoundaries();
    
            const relativePosition = currentTranslate - offset;
            let targetIndex = Math.round(-relativePosition / itemWidth);
    
            targetIndex = Math.max(0, Math.min(targetIndex, items.length - 1));
    
            const targetTranslate = offset - (targetIndex * itemWidth);
    
            currentTranslate = Math.max(minTranslate, Math.min(maxTranslate, targetTranslate));
            prevTranslate = currentTranslate;
            setSliderPosition();
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        // Add event listeners to wrapper
        wrapper.addEventListener('mousedown', touchStart);
        wrapper.addEventListener('mouseup', touchEnd);
        wrapper.addEventListener('mouseleave', touchEnd);
        wrapper.addEventListener('mousemove', touchMove);

        wrapper.addEventListener('touchstart', touchStart, { passive: false });
        wrapper.addEventListener('touchend', touchEnd);
        wrapper.addEventListener('touchmove', touchMove, { passive: false });

        wrapper.addEventListener('contextmenu', (e) => e.preventDefault());
        wrapper.addEventListener('dragstart', (e) => e.preventDefault());

        // Dots click handlers
        if (dots.length > 0) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    scrollToIndex(index);
                });
            });
        }

        // Initialize position
        const itemWidth = getItemWidth();
        const wrapperWidth = wrapper.offsetWidth;
        const offset = (wrapperWidth / 2) - (itemWidth / 2);
        currentTranslate = offset;
        prevTranslate = currentTranslate;
        setSliderPosition();

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const itemWidth = getItemWidth();
                const wrapperWidth = wrapper.offsetWidth;
                const offset = (wrapperWidth / 2) - (itemWidth / 2);
                currentTranslate = offset;
                prevTranslate = currentTranslate;
                setSliderPosition();
            }, 250);
        });
    }

    // Initialize Event Carousel with dots
    const eventWrapper = document.querySelector('.event-carousel-wrapper');
    if (eventWrapper) {
        eventWrapper.id = 'eventCarouselWrapper';
        initDragCarousel('eventCarouselWrapper', 'eventCarousel', '.event-item', 'eventDots', 'center');
    }

    // Content Showcase Carousel with alternating image rotation and crossfade
    function initShowcaseCarousel() {
        const wrapper = document.querySelector('.showcase-carousel-wrapper');
        const carousel = document.getElementById('showcaseCarousel');
        const dotsContainer = document.getElementById('showcaseDots');
        const showcaseTitle = document.getElementById('showcaseTitle');
        if (!carousel || !wrapper) return;

        const items = carousel.querySelectorAll('.showcase-item');
        const contentDisplays = document.querySelectorAll('.content-display');
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
        if (items.length === 0) return;

        // Image rotation data
        const imageData = {
            music: ['images/theodds2.jpg', 'images/heyday3.jpg','images/theodds3.jpg','images/heyday1.jpg'],
            food: ['images/food1.jpg', 'images/food2.jpg', 'images/food3.jpg'],
            contribute: ['images/community1.jpg', 'images/community2.jpg', 'images/community3.jpg', 'images/community4.jpg']
        };

        const currentImageIndex = {
            music: 0,
            food: 0,
            contribute: 0
        };

        // Prepare items with two image layers for crossfade
        items.forEach(item => {
            const existingImg = item.querySelector('img');
            const category = item.dataset.category;
    
            // Create two image elements for crossfade
            const img1 = document.createElement('img');
            const img2 = document.createElement('img');
    
            img1.src = imageData[category][0];
            img2.src = imageData[category][0];
    
            img1.style.opacity = '1';
            img2.style.opacity = '0';
            img1.style.zIndex = '1';
            img2.style.zIndex = '2';
    
            // Remove existing img and add both layers
            if (existingImg) existingImg.remove();
            item.appendChild(img1);
            item.appendChild(img2);
    
            item.dataset.activeLayer = '1';
        });

        // Rotate images alternately (one at a time) with crossfade
        let currentRotatingIndex = 0;
        function rotateImagesAlternately() {
            const itemsArray = Array.from(items);
            const item = itemsArray[currentRotatingIndex];
            const category = item.dataset.category;
    
            if (imageData[category]) {
                currentImageIndex[category] = (currentImageIndex[category] + 1) % imageData[category].length;
        
                const activeLayer = item.dataset.activeLayer;
                const img1 = item.children[0];
                const img2 = item.children[1];
        
                // Crossfade effect
                if (activeLayer === '1') {
                    // Fade to img2
                    img2.src = imageData[category][currentImageIndex[category]];
                    img2.style.opacity = '1';
                    img1.style.opacity = '0';
                    item.dataset.activeLayer = '2';
                } else {
                    // Fade to img1
                    img1.src = imageData[category][currentImageIndex[category]];
                    img1.style.opacity = '1';
                    img2.style.opacity = '0';
                    item.dataset.activeLayer = '1';
                }
            }
    
            // Move to next item
            currentRotatingIndex = (currentRotatingIndex + 1) % items.length;
        }

        // Start alternating rotation every 3 seconds
        setInterval(rotateImagesAlternately, 3000);

        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;

        function getItemWidth() {
            return items[0].offsetWidth + parseInt(getComputedStyle(carousel).gap || 0);
        }

        function getBoundaries() {
            const itemWidth = getItemWidth();
            const wrapperWidth = wrapper.offsetWidth;
            const offset = (wrapperWidth / 2) - (itemWidth / 2);
    
            const maxTranslate = offset;
            const minTranslate = offset - ((items.length - 1) * itemWidth);
    
            return { maxTranslate, minTranslate };
        }

        function updateDots(activeIndex) {
            if (dots.length > 0) {
                dots.forEach((dot, i) => {
                    dot.classList.remove('active');
                    if (i === activeIndex) {
                        dot.classList.add('active');
                    }
                });
            }
        }

        function updateActiveItem() {
            const itemWidth = getItemWidth();
            const wrapperWidth = wrapper.offsetWidth;
            const centerPoint = wrapperWidth / 2;
    
            let closestIndex = 0;
            let closestDistance = Infinity;
    
            items.forEach((item, i) => {
                const itemLeft = currentTranslate + (i * itemWidth);
                const itemCenter = itemLeft + (itemWidth / 2);
                const distanceFromCenter = Math.abs(itemCenter - centerPoint);
        
                item.classList.remove('active');
        
                if (distanceFromCenter < closestDistance) {
                    closestDistance = distanceFromCenter;
                    closestIndex = i;
                }
            });
    
            items[closestIndex].classList.add('active');
            updateDots(closestIndex);
    
            // Update content and title
            const category = items[closestIndex].dataset.category;
            
            // Update the title
            if (showcaseTitle) {
                showcaseTitle.textContent = category;
            }
            
            contentDisplays.forEach(display => {
                display.classList.remove('active');
                if (display.dataset.category === category) {
                    display.classList.add('active');
                }
            });
        }

        function setSliderPosition() {
            carousel.style.transform = `translateX(${currentTranslate}px)`;
            updateActiveItem();
        }

        function scrollToIndex(index) {
            const itemWidth = getItemWidth();
            const wrapperWidth = wrapper.offsetWidth;
            const offset = (wrapperWidth / 2) - (itemWidth / 2);
            const targetTranslate = offset - (index * itemWidth);
    
            carousel.style.transition = 'transform 0.3s ease';
            currentTranslate = targetTranslate;
            prevTranslate = currentTranslate;
            setSliderPosition();
        }

        function animation() {
            setSliderPosition();
            if (isDragging) requestAnimationFrame(animation);
        }

        function touchStart(event) {
            isDragging = true;
            startPos = getPositionX(event);
            animationID = requestAnimationFrame(animation);
            wrapper.style.cursor = 'grabbing';
            carousel.style.transition = 'none';
        }

        function touchMove(event) {
            if (isDragging) {
                event.preventDefault();
                const currentPosition = getPositionX(event);
                const diff = currentPosition - startPos;
                let newTranslate = prevTranslate + diff;
        
                const { maxTranslate, minTranslate } = getBoundaries();
        
                if (newTranslate > maxTranslate) {
                    const overDrag = newTranslate - maxTranslate;
                    newTranslate = maxTranslate + (overDrag * 0.3);
                } else if (newTranslate < minTranslate) {
                    const overDrag = minTranslate - newTranslate;
                    newTranslate = minTranslate - (overDrag * 0.3);
                }
        
                currentTranslate = newTranslate;
            }
        }

        function touchEnd() {
            isDragging = false;
            cancelAnimationFrame(animationID);
            wrapper.style.cursor = 'grab';
            carousel.style.transition = 'transform 0.3s ease';
    
            const itemWidth = getItemWidth();
            const wrapperWidth = wrapper.offsetWidth;
            const offset = (wrapperWidth / 2) - (itemWidth / 2);
            const { maxTranslate, minTranslate } = getBoundaries();
    
            const relativePosition = currentTranslate - offset;
            let targetIndex = Math.round(-relativePosition / itemWidth);
    
            targetIndex = Math.max(0, Math.min(targetIndex, items.length - 1));
    
            const targetTranslate = offset - (targetIndex * itemWidth);
    
            currentTranslate = Math.max(minTranslate, Math.min(maxTranslate, targetTranslate));
            prevTranslate = currentTranslate;
            setSliderPosition();
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        wrapper.addEventListener('mousedown', touchStart);
        wrapper.addEventListener('mouseup', touchEnd);
        wrapper.addEventListener('mouseleave', touchEnd);
        wrapper.addEventListener('mousemove', touchMove);

        wrapper.addEventListener('touchstart', touchStart, { passive: false });
        wrapper.addEventListener('touchend', touchEnd);
        wrapper.addEventListener('touchmove', touchMove, { passive: false });

        wrapper.addEventListener('contextmenu', (e) => e.preventDefault());
        wrapper.addEventListener('dragstart', (e) => e.preventDefault());

        // Dots click handlers
        if (dots.length > 0) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    scrollToIndex(index);
                });
            });
        }

        const itemWidth = getItemWidth();
        const wrapperWidth = wrapper.offsetWidth;
        const offset = (wrapperWidth / 2) - (itemWidth / 2);
        currentTranslate = offset;
        prevTranslate = currentTranslate;
        setSliderPosition();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const itemWidth = getItemWidth();
                const wrapperWidth = wrapper.offsetWidth;
                const offset = (wrapperWidth / 2) - (itemWidth / 2);
                currentTranslate = offset;
                prevTranslate = currentTranslate;
                setSliderPosition();
            }, 250);
        });
    }

    initShowcaseCarousel();

    // Video optimization for mobile
    function optimizeVideoForDevice() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
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
    
    // Form submission to Google Sheets
    const contactForm = document.getElementById('contactForm');
    const bringFoodCheckbox = document.getElementById('bringFood');
    const foodDetailsGroup = document.getElementById('foodDetailsGroup');
    const foodDetailsInput = document.getElementById('foodDetails');
    
    // Show/hide food details input based on checkbox
    if (bringFoodCheckbox && foodDetailsGroup) {
        bringFoodCheckbox.addEventListener('change', function() {
            if (this.checked) {
                foodDetailsGroup.style.display = 'block';
                foodDetailsInput.setAttribute('required', 'required');
            } else {
                foodDetailsGroup.style.display = 'none';
                foodDetailsInput.removeAttribute('required');
                foodDetailsInput.value = '';
            }
        });
    }
    
    // Load food contributions on page load
    function loadFoodContributions() {
        const googleAppsScriptURL = 'https://script.google.com/macros/s/AKfycby6KzR9722eVUXf-yMBgu5hKOdcPsyq5mYixtvo-A0SWybAKSZWSwHdM3GDRIY4zyUH/exec';
        
        fetch(googleAppsScriptURL + '?action=getFoodContributions')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('contributionsBody');
                if (data.contributions && data.contributions.length > 0) {
                    tbody.innerHTML = '';
                    data.contributions.forEach(item => {
                        const row = tbody.insertRow();
                        row.insertCell(0).textContent = item.name;
                        row.insertCell(1).textContent = item.food;
                    });
                }
            })
            .catch(error => {
                console.log('Could not load contributions:', error);
            });
    }
    
    // Load contributions on page load
    loadFoodContributions();
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const classValue = document.getElementById('class').value;
            const message = document.getElementById('message').value;
            const bringFood = document.getElementById('bringFood').checked ? 'Yes' : 'No';
            const foodDetails = document.getElementById('bringFood').checked ? document.getElementById('foodDetails').value : 'N/A';
            
            if (name && classValue) {
                // Additional validation
                if (document.getElementById('bringFood').checked && !document.getElementById('foodDetails').value.trim()) {
                    alert('Please specify what food you will be bringing.');
                    return;
                }
                
                // Disable submit button
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
                
                const googleAppsScriptURL = 'https://script.google.com/macros/s/AKfycby6KzR9722eVUXf-yMBgu5hKOdcPsyq5mYixtvo-A0SWybAKSZWSwHdM3GDRIY4zyUH/exec';
                
                // Prepare data as FormData - MATCHING GOOGLE SHEET COLUMNS EXACTLY
                const formData = new FormData();
                formData.append('Name', name);              // Column A
                formData.append('Class', classValue);       // Column B
                formData.append('Message', message);        // Column C
                formData.append('Bring Own Food', bringFood);  // Column D
                formData.append('Food Details', foodDetails);  // Column E
                formData.append('Timestamp', new Date().toLocaleString());  // Column F
                
                console.log('Submitting data:', {name, classValue, message, bringFood, foodDetails});
                
                fetch(googleAppsScriptURL, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    console.log('Response status:', response.status);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(data => {
                    console.log('Response data:', data);
                    
                    const parsedData = JSON.parse(data);
                    
                    if (parsedData.status === 'success') {
                        // Redirect to confirmation page with data
                        const params = new URLSearchParams({
                            name: name,
                            class: classValue,
                            bringFood: bringFood,
                            foodDetails: foodDetails
                        });
                        window.location.href = `confirmation.html?${params.toString()}`;
                    } else {
                        throw new Error(parsedData.message || 'Submission failed');
                    }
                })
                .catch(error => {
                    console.error('Submission error:', error);
                    
                    let errorMessage = 'There was an error submitting your registration. ';
                    
                    if (error.message.includes('404')) {
                        errorMessage += 'The submission URL is not found. Please check the Google Apps Script deployment.';
                    } else if (error.message.includes('400')) {
                        errorMessage += 'Bad request - there may be an issue with the data format.';
                    } else if (error.message.includes('403')) {
                        errorMessage += 'Permission denied - please check the Google Apps Script permissions.';
                    } else if (error.message.includes('Failed to fetch')) {
                        errorMessage += 'Network error - please check your internet connection.';
                    } else {
                        errorMessage += 'Please try again or contact support.';
                    }
                    
                    alert(errorMessage);
                })
                .finally(() => {
                    // Re-enable submit button
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                });
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
    
    // Handle window resize AND orientation changes
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            console.log('Window resized/orientation changed, reinitializing carousels...');
            optimizeVideoForDevice();
            initPhotoCarousels();
        }, 500);
    });
    
    // Touch-friendly interactions
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
});