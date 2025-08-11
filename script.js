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

// Form submission handled by webhook integration below

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize carousel after a short delay to ensure images are loaded
    setTimeout(() => {
        initializeCarousel();
    }, 500);
    
    // Form submission handler
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmission);
    }
});

// Handle form submission and send to both webhook and email
async function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.green-submit');
    const originalText = submitBtn.textContent;
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add timestamp and source
        data.timestamp = new Date().toISOString();
        data.source = 'True Wash Landing Page';
        
        // Create FormData for Web3Forms
        const web3FormsData = new FormData();
        web3FormsData.append('access_key', '9cf6577c-47ec-40f7-b1ad-07fe3b1834db');
        web3FormsData.append('subject', 'New Car Detailing Booking Request - True Wash');
        web3FormsData.append('from_name', 'True Wash Website');
        web3FormsData.append('name', data.fullName);
        web3FormsData.append('email', data.email);
        web3FormsData.append('phone', data.phone);
        web3FormsData.append('postal_code', data.postalCode);
        web3FormsData.append('car_brand', data.carBrand);
        web3FormsData.append('service', data.service);
        web3FormsData.append('callback_time', data.callbackTime);
        web3FormsData.append('timestamp', data.timestamp);
        web3FormsData.append('redirect', 'false');
        
        // Custom message format
        const message = `
New Car Detailing Booking Request

Customer Information:
- Name: ${data.fullName}
- Email: ${data.email}
- Phone: ${data.phone}
- Postal Code: ${data.postalCode}
- Car Brand: ${data.carBrand}
- Service Requested: ${data.service}
- Preferred Callback Time: ${data.callbackTime}
- Submitted: ${data.timestamp}

Source: True Wash Landing Page
        `;
        web3FormsData.append('message', message);
        
        // Send to webhook (existing GoHighLevel)
        const webhookPromise = fetch('https://services.leadconnectorhq.com/hooks/E5NSmqlosXV3qKjMNr3A/webhook-trigger/8185bdf3-da60-41e1-8ba0-fb009dc92f83', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Send to Web3Forms (sends to info@truewash.us)
        const web3FormsPromise = fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: web3FormsData
        });
        
        // Wait for both to complete
        const [webhookResponse, web3FormsResponse] = await Promise.all([webhookPromise, web3FormsPromise]);
        
        if (webhookResponse.ok && web3FormsResponse.ok) {
            // Success - show success message briefly then redirect
            submitBtn.textContent = 'Success! Redirecting...';
            submitBtn.style.backgroundColor = '#28a745';
            
            // Reset form
            form.reset();
            
            // Redirect to thank you page after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'thankyou.html';
            }, 1500);
            
        } else {
            throw new Error('Network response was not ok');
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        // Show error message
        submitBtn.textContent = 'Error - Please try again';
        submitBtn.style.backgroundColor = '#dc3545';
        
        // Reset button after 3 seconds
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.style.backgroundColor = '';
        }, 3000);
    }
}