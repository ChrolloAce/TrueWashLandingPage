// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Carousel functionality - Complete rewrite
let currentSlide = 0;
let totalSlides = 0;
let wrapper = null;
let dotsContainer = null;
let autoPlayInterval = null;

function initializeCarousel() {
    wrapper = document.getElementById('carouselWrapper');
    dotsContainer = document.getElementById('carouselDots');
    
    if (!wrapper || !dotsContainer) return;
    
    // Get all slides
    const slides = document.querySelectorAll('.carousel-slide');
    totalSlides = slides.length;
    
    // Clear existing dots
    dotsContainer.innerHTML = '';
    
    // Create dots for all slides
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    
    // Reset to first slide
    currentSlide = 0;
    updateCarousel();
    
    // Start auto-play
    startAutoPlay();
}

function updateCarousel() {
    if (!wrapper || totalSlides === 0) return;
    
    // Update transform - each slide is 12.5% of the wrapper width
    const translateX = -currentSlide * 12.5;
    wrapper.style.transform = `translateX(${translateX}%)`;
    
    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function moveSlide(direction) {
    if (totalSlides === 0) return;
    
    currentSlide += direction;
    
    // Handle wrapping
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    updateCarousel();
    
    // Restart auto-play
    restartAutoPlay();
}

function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
        currentSlide = index;
        updateCarousel();
        restartAutoPlay();
    }
}

function startAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(() => {
        moveSlide(1);
    }, 4000);
}

function restartAutoPlay() {
    startAutoPlay();
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .price-card').forEach(el => {
    observer.observe(el);
});

// Form submission (for future enhancement)
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // In a real application, you would send this data to a server
    console.log('Form submitted:', data);
    
    // Show success message (for demo purposes)
    alert('Thank you for your booking request! We will contact you shortly.');
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add name attributes to form inputs for proper form submission
    const formInputs = document.querySelectorAll('.form-input');
    const fieldNames = ['fullName', 'phone', 'email', 'postalCode', 'carBrand', 'service', 'callbackTime'];
    
    formInputs.forEach((input, index) => {
        if (index < fieldNames.length) {
            input.name = fieldNames[index];
        }
    });
    
    // Initialize carousel after a short delay to ensure images are loaded
    setTimeout(() => {
        initializeCarousel();
    }, 500);
}); 