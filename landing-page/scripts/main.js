// CheckCafe Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add background opacity when scrolling
        if (scrollTop > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .section-header, .download-content, .about-content, .contact-info, .contact-form');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Counter animation for stats
    function animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            element.textContent = current + '+';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Animate counters when visible
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const targetValue = parseInt(counter.textContent.replace('+', ''));
                animateCounter(counter, 0, targetValue, 2000);
                counterObserver.unobserve(counter);
            }
        });
    });
    
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
    
    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Basic validation
            if (!name || !email || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            showNotification('Thank you! Your message has been sent.', 'success');
            contactForm.reset();
        });
    }
    
    // Download button interactions
    const downloadButtons = document.querySelectorAll('.download-btn:not(.disabled)');
    downloadButtons.forEach(button => {
        if (button.hasAttribute('download')) {
            // Real download button for Android APK
            button.addEventListener('click', function(e) {
                const btn = this;
                const originalText = btn.querySelector('strong').textContent;
                const originalSpan = btn.querySelector('span').textContent;
                
                btn.querySelector('strong').textContent = 'Downloading...';
                btn.querySelector('span').textContent = 'Please wait';
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
                
                // Show downloading notification
                showNotification('CheckCafe APK download started!', 'info');
                
                // Reset after 3 seconds
                setTimeout(() => {
                    btn.querySelector('strong').textContent = originalText;
                    btn.querySelector('span').textContent = originalSpan;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    
                    // Show success message
                    showDownloadSuccess();
                }, 3000);
            });
        } else {
            // Placeholder for other download buttons
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Download will be available soon!', 'info');
            });
        }
    });
    
    // Phone mockup interaction
    const phoneScreen = document.querySelector('.phone-screen');
    if (phoneScreen) {
        phoneScreen.addEventListener('click', function() {
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        const phoneArea = document.querySelector('.hero-visual');
        
        if (hero && scrolled < hero.offsetHeight) {
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
            if (phoneArea) {
                phoneArea.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        }
    });
    
    // Feature cards hover effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Typing effect for hero title
    function typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }
    
    // Initialize typing effect after a delay
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const originalText = heroTitle.textContent;
            typeWriter(heroTitle, originalText, 30);
        }
    }, 500);
    
    // Utility functions
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        `;
        
        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    // Initialize Swiper for phone mockup
    function initializePhoneSwiper() {
        const swiper = new Swiper('.phone-swiper', {
            loop: true,
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            effect: 'slide',
            speed: 800,
            grabCursor: true,
            touchRatio: 1,
            touchAngle: 45,
            centeredSlides: true,
            on: {
                slideChange: function () {
                    // Add animation effects when slides change
                    const activeSlide = this.slides[this.activeIndex];
                    const elements = activeSlide.querySelectorAll('.demo-section, .cafe-card, .app-ui-element');
                    
                    elements.forEach((el, index) => {
                        el.style.animation = 'none';
                        setTimeout(() => {
                            el.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s both`;
                        }, 50);
                    });
                    
                    // Handle screenshot scroll
                    const screenshotContainer = activeSlide.querySelector('.scrollable-screenshot');
                    if (screenshotContainer) {
                        setupScreenshotScroll(screenshotContainer);
                    }
                }
            }
        });
        
        // Setup initial screenshot scroll
        const initialScreenshot = document.querySelector('.scrollable-screenshot');
        if (initialScreenshot) {
            setupScreenshotScroll(initialScreenshot);
        }
        
        return swiper;
    }
    
    // Setup screenshot scrolling functionality
    function setupScreenshotScroll(container) {
        const img = container.querySelector('.long-screenshot-img');
        const scrollThumb = container.parentElement.querySelector('.scroll-thumb');
        const scrollInstruction = container.parentElement.querySelector('.scroll-instruction');
        
        if (!img || !scrollThumb) return;
        
        let isUserScrolling = false;
        let scrollTimeout;
        
        // Auto-scroll after a delay
        setTimeout(() => {
            if (!isUserScrolling) {
                img.classList.add('auto-scrolling');
                if (scrollInstruction) {
                    scrollInstruction.style.opacity = '0.3';
                }
            }
        }, 2000);
        
        // Handle manual scroll
        container.addEventListener('scroll', () => {
            isUserScrolling = true;
            img.classList.remove('auto-scrolling');
            
            if (scrollInstruction) {
                scrollInstruction.style.opacity = '0';
            }
            
            // Update scroll thumb position
            const scrollPercent = container.scrollTop / (container.scrollHeight - container.clientHeight);
            const thumbPosition = scrollPercent * 70; // 70% max position
            scrollThumb.style.top = `${thumbPosition}%`;
            
            // Clear timeout and reset auto-scroll
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isUserScrolling = false;
                img.classList.add('auto-scrolling');
                if (scrollInstruction) {
                    scrollInstruction.style.opacity = '0.3';
                }
            }, 3000);
        });
        
        // Touch and mouse interaction
        let startY = 0;
        let isDragging = false;
        
        container.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            isUserScrolling = true;
            img.classList.remove('auto-scrolling');
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentY = e.touches[0].clientY;
            const deltaY = startY - currentY;
            container.scrollTop += deltaY * 0.5; // Smooth scroll
            startY = currentY;
            
            e.preventDefault();
        });
        
        container.addEventListener('touchend', () => {
            isDragging = false;
        });
        
        // Mouse wheel support
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            container.scrollTop += e.deltaY * 0.5;
            isUserScrolling = true;
            img.classList.remove('auto-scrolling');
            
            if (scrollInstruction) {
                scrollInstruction.style.opacity = '0';
            }
        });
    }
    
    // Phone interaction effects
    function setupPhoneInteractions() {
        const phoneFrame = document.querySelector('.phone-frame');
        const swipeInstruction = document.querySelector('.swipe-instruction');
        
        if (phoneFrame && swipeInstruction) {
            // Hide instruction after first interaction
            let hasInteracted = false;
            
            phoneFrame.addEventListener('touchstart', () => {
                if (!hasInteracted) {
                    swipeInstruction.style.opacity = '0.5';
                    hasInteracted = true;
                }
            });
            
            phoneFrame.addEventListener('mouseenter', () => {
                if (!hasInteracted) {
                    swipeInstruction.style.opacity = '0.5';
                }
            });
            
            phoneFrame.addEventListener('mouseleave', () => {
                if (!hasInteracted) {
                    swipeInstruction.style.opacity = '1';
                }
            });
        }
    }
    
    // Enhanced hero interactions
    function setupHeroInteractions() {
        const phoneFrame = document.querySelector('.phone-frame');
        const heroContent = document.querySelector('.hero-content');
        
        if (phoneFrame && heroContent) {
            // Parallax effect on mouse move
            heroContent.addEventListener('mousemove', (e) => {
                const rect = heroContent.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                const translateX = (x - 0.5) * 10;
                const translateY = (y - 0.5) * 10;
                
                phoneFrame.style.transform = `translate(${translateX}px, ${translateY}px) scale(1.02)`;
            });
            
            heroContent.addEventListener('mouseleave', () => {
                phoneFrame.style.transform = 'translate(0, 0) scale(1)';
            });
        }
    }
    
    // Initialize all animations and effects
    function init() {
        // Add loaded class to body for CSS animations
        document.body.classList.add('loaded');
        
        // Initialize Swiper after a short delay to ensure DOM is ready
        setTimeout(() => {
            if (typeof Swiper !== 'undefined') {
                initializePhoneSwiper();
                setupPhoneInteractions();
                setupHeroInteractions();
            }
        }, 100);
        
        // Preload critical images
        const images = [
            './assets/mainpage.png'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        
        console.log('CheckCafe Landing Page initialized successfully! ☕');
    }
    
    // Initialize when DOM is ready
    init();
});

// Additional utility functions
window.CheckCafe = {
    scrollToSection: function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = section.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },
    
    openExternalLink: function(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    },
    
    trackEvent: function(eventName, properties = {}) {
        // Analytics tracking placeholder
        console.log('Event tracked:', eventName, properties);
        
        // Integration with analytics services would go here
        // Example: gtag('event', eventName, properties);
    }
};

// Mock Data based on React Native screens
const mockData = {
    user: {
        id: "user123",
        full_name: "Nguyễn Văn An",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        role: "USER",
        vip_status: true
    },
    
    themes: [
        {
            _id: "theme1",
            name: "Espresso",
            theme_image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=80&h=80&fit=crop"
        },
        {
            _id: "theme2", 
            name: "Latte Art",
            theme_image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop"
        },
        {
            _id: "theme3",
            name: "Cold Brew", 
            theme_image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=80&h=80&fit=crop"
        },
        {
            _id: "theme4",
            name: "Dessert",
            theme_image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80&h=80&fit=crop"
        }
    ],
    
    shops: [
        {
            _id: "shop1",
            name: "Highland Coffee",
            rating_avg: 4.8,
            rating_count: 256,
            address: "123 Đường Nguyễn Du, Q1, TP.HCM",
            is_open: true,
            mainImage: {
                url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop"
            },
            location: {
                coordinates: [106.7105107, 10.801588]
            }
        },
        {
            _id: "shop2",
            name: "Forest Coffee & Tea",
            rating_avg: 4.6,
            rating_count: 189,
            address: "59 Nguyễn Trãi, Đà Lạt",
            is_open: false,
            mainImage: {
                url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop"
            },
            location: {
                coordinates: [108.4481679, 11.9443448]
            }
        },
        {
            _id: "shop3",
            name: "Saigon Coffee Roasters",
            rating_avg: 4.9,
            rating_count: 420,
            address: "456 Lê Lợi, Q1, TP.HCM", 
            is_open: true,
            mainImage: {
                url: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=300&fit=crop"
            },
            location: {
                coordinates: [106.6947912, 10.7843889]
            }
        },
        {
            _id: "shop4",
            name: "The Workshop Coffee",
            rating_avg: 4.7,
            rating_count: 312,
            address: "789 Pasteur, Q3, TP.HCM",
            is_open: true,
            mainImage: {
                url: "https://images.unsplash.com/photo-1525811902-f2342640856e?w=400&h=300&fit=crop"
            },
            location: {
                coordinates: [106.6810065, 10.7696522]
            }
        }
    ],
    
    checkins: [
        {
            _id: "checkin1",
            title: "Bắt đầu ngày mới với ly cà phê thơm ngon ☕",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
            user_id: {
                _id: "user456",
                full_name: "Trần Thị Bích",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face"
            },
            location: {
                address: "Highland Coffee - Nguyễn Du"
            },
            likes_count: 24,
            comments_count: 8,
            isLiked: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            _id: "checkin2", 
            title: "Không gian yên tĩnh để đọc sách 📚",
            image: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&h=400&fit=crop",
            user_id: {
                _id: "user789",
                full_name: "Lê Minh Đức",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            },
            location: {
                address: "Forest Coffee - Đà Lạt"
            },
            likes_count: 45,
            comments_count: 12,
            isLiked: true,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
            _id: "checkin3",
            title: "Hẹn hò cà phê cuối tuần 💕",
            image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
            user_id: {
                _id: "user101",
                full_name: "Phạm Thu Hà",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
            },
            location: {
                address: "Saigon Coffee Roasters"
            },
            likes_count: 67,
            comments_count: 23,
            isLiked: false,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
    ],
    
    reservations: [
        {
            _id: "res1",
            status: "Confirmed",
            shop_id: {
                _id: "shop1",
                name: "Highland Coffee",
                shopImages: [{
                    url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop"
                }]
            },
            reservation_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            time_slot_id: {
                start_time: "10:00",
                end_time: "12:00"
            },
            number_of_people: 2,
            qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RES001"
        },
        {
            _id: "res2",
            status: "Pending", 
            shop_id: {
                _id: "shop2",
                name: "Forest Coffee & Tea",
                shopImages: [{
                    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop"
                }]
            },
            reservation_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            time_slot_id: {
                start_time: "14:00",
                end_time: "16:00"
            },
            number_of_people: 4,
            qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RES002"
        },
        {
            _id: "res3",
            status: "Completed",
            shop_id: {
                _id: "shop3", 
                name: "Saigon Coffee Roasters",
                shopImages: [{
                    url: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=300&fit=crop"
                }]
            },
            reservation_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            time_slot_id: {
                start_time: "09:00",
                end_time: "11:00"
            },
            number_of_people: 1,
            qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RES003"
        }
    ]
};

// App State Management
let currentScreen = 'discover';
let activeTab = 'Pending';

// Screen rendering functions
function renderDiscoverScreen() {
    return `
        <div class="app-screen discover-screen">
            <div class="app-header">
                <div class="header-top">
                    <h1 class="screen-title">Khám phá</h1>
                    <div class="notification-btn">
                        <i class="fas fa-bell"></i>
                        <div class="notification-badge">3</div>
                    </div>
                </div>
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Tìm kiếm quán cà phê...">
                </div>
            </div>
            
            <div class="app-content">
                <div class="featured-banner">
                    <div class="banner-content">
                        <h3>☕ Ưu đãi hôm nay</h3>
                        <p>Giảm 20% cho đơn hàng đầu tiên</p>
                    </div>
                </div>
                
                <div class="categories-section">
                    <div class="categories-grid">
                        ${mockData.themes.map(theme => `
                            <div class="category-item">
                                <div class="category-icon">
                                    <img src="${theme.theme_image}" alt="${theme.name}">
                                </div>
                                <span class="category-name">${theme.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="shops-section">
                    <h3 class="section-title">Quán cà phê hot ở Đà Lạt</h3>
                    <div class="shops-grid">
                        ${mockData.shops.map(shop => `
                            <div class="shop-card">
                                <img src="${shop.mainImage.url}" alt="${shop.name}" class="shop-image">
                                <div class="shop-info">
                                    <h4 class="shop-name">${shop.name}</h4>
                                    <div class="shop-rating">
                                        <i class="fas fa-star"></i>
                                        <span>${shop.rating_avg}</span>
                                        <span class="review-count">(${shop.rating_count})</span>
                                        <span class="shop-status ${shop.is_open ? 'open' : 'closed'}">
                                            ${shop.is_open ? 'Mở' : 'Đóng'}
                                        </span>
                                    </div>
                                    <p class="shop-address">${shop.address}</p>
                                    <div class="shop-actions">
                                        <button class="favorite-btn">
                                            <i class="far fa-heart"></i>
                                        </button>
                                        <button class="book-btn">Đặt chỗ</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderMapScreen() {
    return `
        <div class="app-screen map-screen">
            <div class="map-container">
                <div class="map-view">
                    <div class="map-bg">
                        <div class="map-markers">
                            ${mockData.shops.map((shop, index) => `
                                <div class="map-marker" style="top: ${20 + index * 15}%; left: ${30 + index * 20}%;">
                                    <div class="marker-icon">
                                        <img src="${shop.mainImage.url}" alt="${shop.name}">
                                        <div class="marker-status ${shop.is_open ? 'open' : 'closed'}"></div>
                                    </div>
                                </div>
                            `).join('')}
                            <div class="user-location">
                                <div class="user-marker">
                                    <i class="fas fa-user"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="map-controls">
                    <button class="location-btn">
                        <i class="fas fa-crosshairs"></i>
                    </button>
                </div>
                
                <div class="selected-cafe-info">
                    <img src="${mockData.shops[0].mainImage.url}" alt="${mockData.shops[0].name}" class="cafe-image">
                    <div class="cafe-details">
                        <h4>${mockData.shops[0].name}</h4>
                        <div class="cafe-rating">
                            <i class="fas fa-star"></i>
                            <span>${mockData.shops[0].rating_avg}</span>
                            <span>(${mockData.shops[0].rating_count} đánh giá)</span>
                        </div>
                        <div class="route-info">
                            <div class="route-detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>0.5 km</span>
                            </div>
                            <div class="route-detail">
                                <i class="fas fa-clock"></i>
                                <span>2 phút</span>
                            </div>
                        </div>
                        <p class="cafe-address">${mockData.shops[0].address}</p>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        </div>
    `;
}

function renderCheckinScreen() {
    return `
        <div class="app-screen checkin-screen">
            <div class="app-header">
                <h1 class="screen-title">Check-in</h1>
            </div>
            
            <div class="app-content">
                <div class="checkins-list">
                    ${mockData.checkins.map(checkin => `
                        <div class="checkin-card">
                            <div class="checkin-header">
                                <div class="user-info">
                                    <img src="${checkin.user_id.avatar}" alt="${checkin.user_id.full_name}" class="user-avatar">
                                    <div class="user-details">
                                        <h4 class="user-name">${checkin.user_id.full_name}</h4>
                                        <span class="checkin-time">${formatTimestamp(checkin.createdAt)}</span>
                                    </div>
                                </div>
                                <button class="menu-btn">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                            </div>
                            
                            <p class="checkin-title">${checkin.title}</p>
                            
                            <div class="location-info">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${checkin.location.address}</span>
                            </div>
                            
                            <img src="${checkin.image}" alt="Checkin" class="checkin-image">
                            
                            <div class="checkin-actions">
                                <button class="action-btn ${checkin.isLiked ? 'liked' : ''}">
                                    <i class="${checkin.isLiked ? 'fas' : 'far'} fa-heart"></i>
                                    <span>${checkin.likes_count}</span>
                                </button>
                                <button class="action-btn">
                                    <i class="far fa-comment"></i>
                                    <span>${checkin.comments_count}</span>
                                </button>
                                <button class="action-btn">
                                    <i class="fas fa-share"></i>
                                    <span>Chia sẻ</span>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="floating-action-btn">
                <i class="fas fa-camera"></i>
            </div>
        </div>
    `;
}

function renderBookingsScreen() {
    const filteredBookings = mockData.reservations.filter(booking => booking.status === activeTab);
    
    return `
        <div class="app-screen bookings-screen">
            <div class="app-header">
                <h1 class="screen-title">Đặt chỗ của tôi</h1>
            </div>
            
            <div class="tab-container">
                <button class="tab ${activeTab === 'Pending' ? 'active' : ''}" onclick="switchTab('Pending')">
                    Chờ xác nhận
                </button>
                <button class="tab ${activeTab === 'Confirmed' ? 'active' : ''}" onclick="switchTab('Confirmed')">
                    Đã xác nhận
                </button>
                <button class="tab ${activeTab === 'Completed' ? 'active' : ''}" onclick="switchTab('Completed')">
                    Đã hoàn thành
                </button>
            </div>
            
            <div class="app-content">
                <div class="bookings-list">
                    ${filteredBookings.length > 0 ? filteredBookings.map(booking => `
                        <div class="booking-card">
                            <div class="booking-header">
                                <div class="status-indicator">
                                    <div class="status-dot ${booking.status.toLowerCase()}"></div>
                                    <span class="status-text">${
                                        booking.status === 'Pending' ? 'Chờ xác nhận' :
                                        booking.status === 'Confirmed' ? 'Đã xác nhận' : 'Đã hoàn thành'
                                    }</span>
                                </div>
                                <button class="more-btn">
                                    <i class="fas fa-ellipsis-h"></i>
                                </button>
                            </div>
                            
                            <img src="${booking.shop_id.shopImages[0].url}" alt="${booking.shop_id.name}" class="cafe-image">
                            
                            <div class="booking-content">
                                <h4 class="cafe-name">${booking.shop_id.name}</h4>
                                
                                <div class="booking-details">
                                    <div class="detail-row">
                                        <i class="fas fa-calendar"></i>
                                        <span>${formatDate(booking.reservation_date)}</span>
                                    </div>
                                    <div class="detail-row">
                                        <i class="fas fa-clock"></i>
                                        <span>${booking.time_slot_id.start_time} - ${booking.time_slot_id.end_time}</span>
                                    </div>
                                    <div class="detail-row">
                                        <i class="fas fa-users"></i>
                                        <span>${booking.number_of_people} người</span>
                                    </div>
                                </div>
                                
                                <div class="booking-actions">
                                    ${booking.status === 'Pending' ? `
                                        <button class="btn btn-cancel">Hủy đặt chỗ</button>
                                        <button class="btn btn-primary">Chỉnh sửa</button>
                                    ` : booking.status === 'Confirmed' ? `
                                        <button class="btn btn-secondary">Hiện QR code</button>
                                        <button class="btn btn-primary">Xem chi tiết</button>
                                    ` : `
                                        <button class="btn btn-primary">Xem chi tiết</button>
                                    `}
                                </div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <h3>Chưa có đặt chỗ nào</h3>
                            <p>Hãy đặt chỗ tại quán cà phê yêu thích của bạn</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

function renderProfileScreen() {
    return `
        <div class="app-screen profile-screen">
            <div class="profile-header">
                <div class="user-info">
                    <img src="${mockData.user.avatar}" alt="${mockData.user.full_name}" class="user-avatar">
                    <div class="user-details">
                        <h2 class="user-name">${mockData.user.full_name}</h2>
                        <div class="user-badges">
                            ${mockData.user.vip_status ? `
                                <div class="badge premium">
                                    <i class="fas fa-crown"></i>
                                    <span>Premium</span>
                                </div>
                            ` : ''}
                            <div class="badge level">
                                <i class="fas fa-star"></i>
                                <span>${mockData.user.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            
            <div class="app-content">
                <div class="menu-section">
                    <h3 class="menu-title">Tài khoản</h3>
                    <div class="menu-items">
                        <div class="menu-item">
                            <i class="fas fa-user-edit"></i>
                            <span>Chỉnh sửa thông tin</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                        <div class="menu-item">
                            <i class="fas fa-ticket-alt"></i>
                            <span>Voucher của tôi</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                        <div class="menu-item">
                            <i class="fas fa-users"></i>
                            <span>Bạn bè</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                        <div class="menu-item">
                            <i class="fas fa-heart"></i>
                            <span>Yêu thích</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                        <div class="menu-item">
                            <i class="fas fa-history"></i>
                            <span>Lịch sử giao dịch</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
                
                <div class="menu-section">
                    <h3 class="menu-title">Cài đặt</h3>
                    <div class="menu-items">
                        <div class="menu-item">
                            <i class="fas fa-palette"></i>
                            <span>Giao diện</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                        <div class="menu-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>Điều khoản & Bảo mật</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                        <div class="menu-item logout">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Đăng xuất</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Navigation functions
function switchScreen(screen) {
    currentScreen = screen;
    renderCurrentScreen();
    updateNavigation();
}

function switchTab(tab) {
    activeTab = tab;
    if (currentScreen === 'bookings') {
        renderCurrentScreen();
    }
}

function renderCurrentScreen() {
    const phoneScreen = document.querySelector('.phone-screen');
    if (!phoneScreen) return;
    
    // Update screen text
    updateScreenText();
    
    // Update indicators
    updateIndicators();
    
    // Add transition effect
    phoneScreen.style.opacity = '0.7';
    
    setTimeout(() => {
        let screenHTML = '';
        
        switch(currentScreen) {
            case 'discover':
                screenHTML = renderDiscoverScreen();
                break;
            case 'map':
                screenHTML = renderMapScreen();
                break;
            case 'checkin':
                screenHTML = renderCheckinScreen();
                break;
            case 'bookings':
                screenHTML = renderBookingsScreen();
                break;
            case 'profile':
                screenHTML = renderProfileScreen();
                break;
            default:
                screenHTML = renderDiscoverScreen();
        }
        
        phoneScreen.innerHTML = screenHTML + renderBottomNavigation();
        phoneScreen.style.opacity = '1';
    }, 150);
}

function updateScreenText() {
    const textElement = document.getElementById('current-screen-text');
    if (!textElement) return;
    
    const screenTexts = {
        'discover': 'Khám phá quán cà phê',
        'map': 'Xem bản đồ quán',
        'checkin': 'Chia sẻ check-in',
        'bookings': 'Quản lý đặt chỗ',
        'profile': 'Thông tin tài khoản'
    };
    
    textElement.textContent = screenTexts[currentScreen] || 'Tương tác với app demo';
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach(indicator => {
        if (indicator.dataset.screen === currentScreen) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function renderBottomNavigation() {
    return `
        <div class="bottom-navigation">
            <div class="nav-item ${currentScreen === 'discover' ? 'active' : ''}" onclick="switchScreen('discover')">
                <i class="fas fa-compass"></i>
                <span>Khám phá</span>
            </div>
            <div class="nav-item ${currentScreen === 'map' ? 'active' : ''}" onclick="switchScreen('map')">
                <i class="fas fa-map"></i>
                <span>Bản đồ</span>
            </div>
            <div class="nav-item ${currentScreen === 'checkin' ? 'active' : ''}" onclick="switchScreen('checkin')">
                <i class="fas fa-camera"></i>
                <span>Check-in</span>
            </div>
            <div class="nav-item ${currentScreen === 'bookings' ? 'active' : ''}" onclick="switchScreen('bookings')">
                <i class="fas fa-calendar"></i>
                <span>Đặt chỗ</span>
            </div>
            <div class="nav-item ${currentScreen === 'profile' ? 'active' : ''}" onclick="switchScreen('profile')">
                <i class="fas fa-user"></i>
                <span>Tài khoản</span>
            </div>
        </div>
    `;
}

function updateNavigation() {
    const navItems = document.querySelectorAll('.bottom-navigation .nav-item');
    navItems.forEach((item, index) => {
        const screens = ['discover', 'map', 'checkin', 'bookings', 'profile'];
        if (screens[index] === currentScreen) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Utility functions
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return date.toLocaleDateString('vi-VN');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Initialize app simulation immediately
document.addEventListener('DOMContentLoaded', function() {
    let autoSwitchInterval;
    
    // Initialize the phone app simulation with loading effect
    setTimeout(() => {
        renderCurrentScreen();
        
        // Auto-switch screens every 5 seconds to demonstrate features
        let screenIndex = 0;
        const screens = ['discover', 'map', 'checkin', 'bookings', 'profile'];
        
        autoSwitchInterval = setInterval(() => {
            screenIndex = (screenIndex + 1) % screens.length;
            currentScreen = screens[screenIndex];
            renderCurrentScreen();
        }, 5000);
        
        // Add click handlers for indicators
        document.querySelectorAll('.indicator').forEach(indicator => {
            indicator.addEventListener('click', () => {
                const screen = indicator.dataset.screen;
                if (screen && screen !== currentScreen) {
                    // Clear auto-switch temporarily
                    clearInterval(autoSwitchInterval);
                    
                    currentScreen = screen;
                    renderCurrentScreen();
                    
                    // Restart auto-switch after 10 seconds of inactivity
                    setTimeout(() => {
                        screenIndex = screens.indexOf(currentScreen);
                        autoSwitchInterval = setInterval(() => {
                            screenIndex = (screenIndex + 1) % screens.length;
                            currentScreen = screens[screenIndex];
                            renderCurrentScreen();
                        }, 5000);
                    }, 10000);
                }
            });
        });
        
    }, 1500); // Show loading for 1.5 seconds first

    // Add screen transition effects
    let currentScreenElement = null;
    
    function addScreenTransition() {
        const phoneScreen = document.querySelector('.phone-screen');
        if (phoneScreen) {
            phoneScreen.style.transition = 'opacity 0.3s ease';
            phoneScreen.style.opacity = '0';
            
            setTimeout(() => {
                phoneScreen.style.opacity = '1';
            }, 100);
        }
    }
});

// Contact form handling
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Simulate form submission
    alert(`Cảm ơn ${name}! Chúng tôi sẽ phản hồi bạn qua email ${email} trong thời gian sớm nhất.`);
    
    // Reset form
    this.reset();
});

// Smooth scrolling for navigation links
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

// Make functions globally available
window.switchScreen = switchScreen;
window.switchTab = switchTab;

// Show download success notification
function showDownloadSuccess() {
    const notification = document.createElement('div');
    notification.className = 'download-notification success';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <div class="notification-text">
                <strong>CheckCafe APK Downloaded Successfully!</strong>
                <p>File saved to your downloads folder. Install to start exploring amazing cafés!</p>
                <div class="notification-actions">
                    <small>💡 Enable "Install from unknown sources" in Android settings if needed</small>
                </div>
            </div>
            <button class="close-notification" aria-label="Close notification">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 7 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 7000);
    
    // Manual close
    notification.querySelector('.close-notification').addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });
    
    function removeNotification(notif) {
        notif.classList.add('hide');
        setTimeout(() => {
            if (notif.parentNode) {
                notif.remove();
            }
        }, 300);
    }
} 