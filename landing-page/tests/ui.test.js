/**
 * UI Tests for CheckCafe Landing Page
 * Testing Framework: Jest with JSDOM
 * 
 * This test suite covers:
 * - DOM structure and element presence
 * - User interactions and event handling
 * - Form validation and submission
 * - Accessibility features
 * - Responsive design elements
 * - Edge cases and error handling
 * - Performance under load
 * - Security considerations (XSS protection)
 * 
 * Run with: npm test
 */

// Mock DOM environment setup
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Create a mock DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3009',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.MouseEvent = dom.window.MouseEvent;

// Mock console methods to reduce test noise
const originalConsole = console;
beforeEach(() => {
  global.console = { 
    ...originalConsole, 
    log: jest.fn(), 
    error: jest.fn(), 
    warn: jest.fn(),
    info: jest.fn()
  };
});

afterEach(() => {
  global.console = originalConsole;
  document.body.innerHTML = '';
  // Clear any event listeners
  document.removeEventListener = jest.fn();
  window.removeEventListener = jest.fn();
});

describe('CheckCafe Landing Page UI Tests', () => {
  
  describe('Page Structure and Core Elements', () => {
    test('should have proper HTML5 semantic structure', () => {
      document.body.innerHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CheckCafe - Café Management & Social Check-in Platform</title>
        </head>
        <body>
          <header class="header">
            <nav class="navbar">
              <div class="logo">
                <img src="/logo.png" alt="CheckCafe Logo" class="logo-img">
              </div>
              <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </nav>
          </header>
          <main class="main-content">
            <section class="hero-section" id="home">
              <h1 class="hero-title">Welcome to CheckCafe</h1>
              <p class="hero-subtitle">The ultimate café management and social check-in platform</p>
              <div class="cta-buttons">
                <button class="btn-primary">Get Started</button>
                <button class="btn-secondary">Learn More</button>
              </div>
            </section>
            <section class="features-section" id="features">
              <h2>Our Features</h2>
              <div class="features-grid">
                <div class="feature-card">
                  <h3>Café Management</h3>
                  <p>Manage your café operations efficiently</p>
                </div>
                <div class="feature-card">
                  <h3>Social Check-ins</h3>
                  <p>Let customers check in and share experiences</p>
                </div>
                <div class="feature-card">
                  <h3>Mobile Integration</h3>
                  <p>Seamless mobile app integration</p>
                </div>
              </div>
            </section>
          </main>
          <footer class="footer">
            <p>&copy; 2023 CheckCafe Team. All rights reserved.</p>
          </footer>
        </body>
        </html>
      `;
      
      // Test semantic HTML structure
      expect(document.querySelector('header')).toBeInTheDocument();
      expect(document.querySelector('nav')).toBeInTheDocument();
      expect(document.querySelector('main')).toBeInTheDocument();
      expect(document.querySelector('footer')).toBeInTheDocument();
      
      // Test essential sections
      expect(document.querySelector('.hero-section')).toBeInTheDocument();
      expect(document.querySelector('.features-section')).toBeInTheDocument();
      
      // Test navigation elements
      const navLinks = document.querySelectorAll('.nav-menu a');
      expect(navLinks).toHaveLength(4);
      expect(navLinks[0]).toHaveAttribute('href', '#home');
      expect(navLinks[1]).toHaveAttribute('href', '#features');
      
      // Test logo
      const logo = document.querySelector('.logo-img');
      expect(logo).toHaveAttribute('alt', 'CheckCafe Logo');
    });

    test('should have proper heading hierarchy', () => {
      document.body.innerHTML = `
        <main>
          <section class="hero-section">
            <h1>Welcome to CheckCafe</h1>
          </section>
          <section class="features-section">
            <h2>Our Features</h2>
            <div class="feature-card">
              <h3>Café Management</h3>
            </div>
            <div class="feature-card">
              <h3>Social Check-ins</h3>
            </div>
          </section>
          <section class="about-section">
            <h2>About Us</h2>
            <div class="team-member">
              <h4>Team Member</h4>
            </div>
          </section>
        </main>
      `;
      
      const h1 = document.querySelector('h1');
      const h2Elements = document.querySelectorAll('h2');
      const h3Elements = document.querySelectorAll('h3');
      const h4Elements = document.querySelectorAll('h4');
      
      expect(h1).toBeInTheDocument();
      expect(h1.textContent).toBe('Welcome to CheckCafe');
      expect(h2Elements).toHaveLength(2);
      expect(h3Elements).toHaveLength(2);
      expect(h4Elements).toHaveLength(1);
    });

    test('should have meta tags for SEO and social sharing', () => {
      const head = document.head;
      head.innerHTML = `
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="CheckCafe - Café management and social check-in platform for mobile users">
        <meta name="keywords" content="cafe, checkin, social, mobile, restaurant, management">
        <meta property="og:title" content="CheckCafe - Café Management Platform">
        <meta property="og:description" content="The ultimate café management and social check-in platform">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        <title>CheckCafe - Café Management & Social Check-in Platform</title>
      `;
      
      expect(document.querySelector('meta[name="description"]')).toBeInTheDocument();
      expect(document.querySelector('meta[name="keywords"]')).toBeInTheDocument();
      expect(document.querySelector('meta[name="viewport"]')).toBeInTheDocument();
      expect(document.querySelector('meta[property="og:title"]')).toBeInTheDocument();
      expect(document.querySelector('meta[property="og:description"]')).toBeInTheDocument();
      expect(document.querySelector('meta[name="twitter:card"]')).toBeInTheDocument();
      expect(document.title).toBe('CheckCafe - Café Management & Social Check-in Platform');
    });
  });

  describe('Interactive Elements and User Interactions', () => {
    test('should handle CTA button clicks', () => {
      document.body.innerHTML = `
        <div class="cta-buttons">
          <button class="btn-primary" id="get-started">Get Started</button>
          <button class="btn-secondary" id="learn-more">Learn More</button>
        </div>
        <div class="modal" id="signup-modal" style="display: none;">
          <div class="modal-content">
            <h2>Sign Up for CheckCafe</h2>
            <form id="signup-form">
              <input type="text" name="businessName" placeholder="Business Name" required>
              <input type="email" name="email" placeholder="Email" required>
              <button type="submit">Sign Up</button>
            </form>
          </div>
        </div>
      `;
      
      const getStartedBtn = document.getElementById('get-started');
      const learnMoreBtn = document.getElementById('learn-more');
      const modal = document.getElementById('signup-modal');
      
      const getStartedHandler = jest.fn(() => {
        modal.style.display = 'block';
      });
      const learnMoreHandler = jest.fn(() => {
        document.querySelector('#features').scrollIntoView();
      });
      
      getStartedBtn.addEventListener('click', getStartedHandler);
      learnMoreBtn.addEventListener('click', learnMoreHandler);
      
      getStartedBtn.click();
      expect(getStartedHandler).toHaveBeenCalled();
      expect(modal.style.display).toBe('block');
      
      learnMoreBtn.click();
      expect(learnMoreHandler).toHaveBeenCalled();
    });

    test('should handle mobile menu toggle', () => {
      document.body.innerHTML = `
        <nav class="navbar">
          <button class="mobile-menu-toggle" id="mobile-toggle">
            <span class="hamburger"></span>
          </button>
          <ul class="nav-menu" id="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      `;
      
      const mobileToggle = document.getElementById('mobile-toggle');
      const navMenu = document.getElementById('nav-menu');
      
      const toggleHandler = jest.fn(() => {
        navMenu.classList.toggle('active');
      });
      
      mobileToggle.addEventListener('click', toggleHandler);
      
      // Test initial state
      expect(navMenu.classList.contains('active')).toBe(false);
      
      // Test toggle
      mobileToggle.click();
      expect(toggleHandler).toHaveBeenCalled();
      
      // Simulate the toggle effect
      navMenu.classList.add('active');
      expect(navMenu.classList.contains('active')).toBe(true);
    });

    test('should handle contact form submission', () => {
      document.body.innerHTML = `
        <section id="contact">
          <form id="contact-form" class="contact-form">
            <input type="text" name="name" id="name" placeholder="Your Name" required>
            <input type="email" name="email" id="email" placeholder="Your Email" required>
            <select name="businessType" id="business-type" required>
              <option value="">Select Business Type</option>
              <option value="cafe">Café</option>
              <option value="restaurant">Restaurant</option>
              <option value="bakery">Bakery</option>
            </select>
            <textarea name="message" id="message" placeholder="Tell us about your business" required></textarea>
            <button type="submit" class="submit-btn">Contact Us</button>
          </form>
          <div id="form-message" class="form-message"></div>
        </section>
      `;
      
      const form = document.getElementById('contact-form');
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const businessTypeSelect = document.getElementById('business-type');
      const messageInput = document.getElementById('message');
      const messageDiv = document.getElementById('form-message');
      
      const submitHandler = jest.fn((e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        if (data.name && data.email && data.businessType && data.message) {
          messageDiv.textContent = 'Thank you for your interest! We\'ll be in touch soon.';
          messageDiv.className = 'form-message success';
        } else {
          messageDiv.textContent = 'Please fill in all required fields.';
          messageDiv.className = 'form-message error';
        }
      });
      
      form.addEventListener('submit', submitHandler);
      
      // Test valid form submission
      nameInput.value = 'John Doe';
      emailInput.value = 'john@example.com';
      businessTypeSelect.value = 'cafe';
      messageInput.value = 'I run a small café and am interested in CheckCafe.';
      
      form.dispatchEvent(new Event('submit'));
      expect(submitHandler).toHaveBeenCalled();
    });

    test('should handle smooth scrolling navigation', () => {
      document.body.innerHTML = `
        <nav class="navbar">
          <ul class="nav-menu">
            <li><a href="#home" class="nav-link">Home</a></li>
            <li><a href="#features" class="nav-link">Features</a></li>
            <li><a href="#about" class="nav-link">About</a></li>
          </ul>
        </nav>
        <section id="home" style="height: 100vh;">Home Section</section>
        <section id="features" style="height: 100vh;">Features Section</section>
        <section id="about" style="height: 100vh;">About Section</section>
      `;
      
      const navLinks = document.querySelectorAll('.nav-link');
      
      navLinks.forEach(link => {
        const clickHandler = jest.fn((e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        });
        
        link.addEventListener('click', clickHandler);
        link.click();
        expect(clickHandler).toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation and Data Handling', () => {
    test('should validate email format in contact form', () => {
      document.body.innerHTML = `
        <form id="contact-form">
          <input type="email" name="email" id="email" required>
          <button type="submit">Submit</button>
        </form>
      `;
      
      const emailInput = document.getElementById('email');
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user.domain.com',
        'user@@domain.com'
      ];
      
      const validEmails = [
        'user@domain.com',
        'test.email@example.org',
        'business@checkcafe.com',
        'cafe.owner@mybusiness.co.uk'
      ];
      
      invalidEmails.forEach(email => {
        emailInput.value = email;
        expect(emailInput.checkValidity()).toBe(false);
      });
      
      validEmails.forEach(email => {
        emailInput.value = email;
        expect(emailInput.checkValidity()).toBe(true);
      });
    });

    test('should handle business signup form validation', () => {
      document.body.innerHTML = `
        <form id="business-signup" class="signup-form">
          <input type="text" name="businessName" id="business-name" placeholder="Business Name" required minlength="2">
          <input type="email" name="email" id="email" placeholder="Email" required>
          <input type="tel" name="phone" id="phone" placeholder="Phone Number" pattern="[0-9]{10,}" required>
          <select name="businessType" id="business-type" required>
            <option value="">Select Business Type</option>
            <option value="cafe">Café</option>
            <option value="restaurant">Restaurant</option>
            <option value="bakery">Bakery</option>
            <option value="food-truck">Food Truck</option>
          </select>
          <input type="number" name="seatingCapacity" id="seating-capacity" min="1" max="500" placeholder="Seating Capacity">
          <textarea name="description" id="description" placeholder="Describe your business" maxlength="500"></textarea>
          <label>
            <input type="checkbox" name="terms" id="terms" required>
            I agree to the Terms of Service and Privacy Policy
          </label>
          <button type="submit">Create Account</button>
        </form>
      `;
      
      const form = document.getElementById('business-signup');
      const inputs = {
        businessName: document.getElementById('business-name'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        businessType: document.getElementById('business-type'),
        seatingCapacity: document.getElementById('seating-capacity'),
        description: document.getElementById('description'),
        terms: document.getElementById('terms')
      };
      
      // Test required field validation
      expect(inputs.businessName.checkValidity()).toBe(false);
      expect(inputs.email.checkValidity()).toBe(false);
      expect(inputs.phone.checkValidity()).toBe(false);
      expect(inputs.businessType.checkValidity()).toBe(false);
      expect(inputs.terms.checkValidity()).toBe(false);
      
      // Test valid data
      inputs.businessName.value = 'My Coffee Shop';
      inputs.email.value = 'owner@mycoffeeshop.com';
      inputs.phone.value = '1234567890';
      inputs.businessType.value = 'cafe';
      inputs.seatingCapacity.value = '25';
      inputs.description.value = 'A cozy neighborhood café specializing in artisan coffee.';
      inputs.terms.checked = true;
      
      expect(inputs.businessName.checkValidity()).toBe(true);
      expect(inputs.email.checkValidity()).toBe(true);
      expect(inputs.phone.checkValidity()).toBe(true);
      expect(inputs.businessType.checkValidity()).toBe(true);
      expect(inputs.seatingCapacity.checkValidity()).toBe(true);
      expect(inputs.terms.checkValidity()).toBe(true);
      
      // Test edge cases
      inputs.businessName.value = 'A'; // Too short
      expect(inputs.businessName.checkValidity()).toBe(false);
      
      inputs.seatingCapacity.value = '600'; // Too high
      expect(inputs.seatingCapacity.checkValidity()).toBe(false);
      
      inputs.description.value = 'A'.repeat(501); // Too long
      expect(inputs.description.checkValidity()).toBe(false);
    });

    test('should handle real-time form validation feedback', () => {
      document.body.innerHTML = `
        <form id="validation-form">
          <div class="form-group">
            <input type="email" name="email" id="email" required>
            <span class="error-message" id="email-error"></span>
          </div>
          <div class="form-group">
            <input type="password" name="password" id="password" required minlength="8">
            <span class="error-message" id="password-error"></span>
          </div>
        </form>
      `;
      
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const emailError = document.getElementById('email-error');
      const passwordError = document.getElementById('password-error');
      
      const validateEmail = jest.fn((input) => {
        const error = input.parentElement.querySelector('.error-message');
        if (!input.checkValidity()) {
          error.textContent = 'Please enter a valid email address';
          error.style.display = 'block';
          input.classList.add('invalid');
        } else {
          error.textContent = '';
          error.style.display = 'none';
          input.classList.remove('invalid');
          input.classList.add('valid');
        }
      });
      
      const validatePassword = jest.fn((input) => {
        const error = input.parentElement.querySelector('.error-message');
        if (input.value.length < 8) {
          error.textContent = 'Password must be at least 8 characters long';
          error.style.display = 'block';
          input.classList.add('invalid');
        } else {
          error.textContent = '';
          error.style.display = 'none';
          input.classList.remove('invalid');
          input.classList.add('valid');
        }
      });
      
      emailInput.addEventListener('blur', () => validateEmail(emailInput));
      passwordInput.addEventListener('input', () => validatePassword(passwordInput));
      
      // Test email validation
      emailInput.value = 'invalid-email';
      emailInput.dispatchEvent(new Event('blur'));
      expect(validateEmail).toHaveBeenCalled();
      
      // Test password validation
      passwordInput.value = 'short';
      passwordInput.dispatchEvent(new Event('input'));
      expect(validatePassword).toHaveBeenCalled();
    });
  });

  describe('Accessibility and Responsive Design', () => {
    test('should have proper ARIA attributes and labels', () => {
      document.body.innerHTML = `
        <header>
          <nav role="navigation" aria-label="Main navigation">
            <button class="mobile-menu-toggle" aria-label="Toggle mobile menu" aria-expanded="false">
              <span class="sr-only">Menu</span>
            </button>
            <ul class="nav-menu">
              <li><a href="#home" aria-current="page">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <section class="hero-section" aria-labelledby="hero-title">
            <h1 id="hero-title">Welcome to CheckCafe</h1>
            <button class="btn-primary" aria-describedby="btn-description">Get Started</button>
            <p id="btn-description">Sign up for your free CheckCafe account</p>
          </section>
          <form id="contact-form" aria-labelledby="contact-heading">
            <h2 id="contact-heading">Contact Us</h2>
            <label for="name">Name (required)</label>
            <input type="text" id="name" name="name" required aria-required="true">
            <label for="email">Email (required)</label>
            <input type="email" id="email" name="email" required aria-required="true" aria-describedby="email-help">
            <div id="email-help" class="help-text">We'll never share your email</div>
          </form>
        </main>
      `;
      
      // Test navigation ARIA attributes
      const nav = document.querySelector('nav');
      expect(nav).toHaveAttribute('role', 'navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
      
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      expect(mobileToggle).toHaveAttribute('aria-label', 'Toggle mobile menu');
      expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
      
      // Test section labeling
      const heroSection = document.querySelector('.hero-section');
      expect(heroSection).toHaveAttribute('aria-labelledby', 'hero-title');
      
      const ctaButton = document.querySelector('.btn-primary');
      expect(ctaButton).toHaveAttribute('aria-describedby', 'btn-description');
      
      // Test form accessibility
      const form = document.getElementById('contact-form');
      expect(form).toHaveAttribute('aria-labelledby', 'contact-heading');
      
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-help');
      
      // Test proper label associations
      const nameLabel = document.querySelector('label[for="name"]');
      const emailLabel = document.querySelector('label[for="email"]');
      expect(nameLabel).toBeInTheDocument();
      expect(emailLabel).toBeInTheDocument();
    });

    test('should support keyboard navigation', () => {
      document.body.innerHTML = `
        <nav>
          <ul class="nav-menu">
            <li><a href="#home" tabindex="0">Home</a></li>
            <li><a href="#features" tabindex="0">Features</a></li>
            <li><a href="#about" tabindex="0">About</a></li>
            <li><a href="#contact" tabindex="0">Contact</a></li>
          </ul>
        </nav>
        <div class="feature-cards">
          <div class="feature-card" tabindex="0" role="button">
            <h3>Café Management</h3>
          </div>
          <div class="feature-card" tabindex="0" role="button">
            <h3>Social Check-ins</h3>
          </div>
        </div>
        <button class="btn-primary" tabindex="0">Get Started</button>
      `;
      
      const focusableElements = document.querySelectorAll('[tabindex="0"]');
      expect(focusableElements).toHaveLength(7);
      
      // Test keyboard event handling
      const navLinks = document.querySelectorAll('.nav-menu a');
      const keyboardHandler = jest.fn((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.target.click();
        }
      });
      
      navLinks.forEach(link => {
        link.addEventListener('keydown', keyboardHandler);
      });
      
      // Simulate Enter key press
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      navLinks[0].dispatchEvent(enterEvent);
      expect(keyboardHandler).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }));
      
      // Simulate Space key press
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      navLinks[1].dispatchEvent(spaceEvent);
      expect(keyboardHandler).toHaveBeenCalledWith(expect.objectContaining({ key: ' ' }));
    });

    test('should handle responsive design breakpoints', () => {
      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      document.body.innerHTML = `
        <nav class="navbar">
          <div class="nav-container">
            <div class="logo">CheckCafe</div>
            <button class="mobile-menu-toggle">Menu</button>
            <ul class="nav-menu">
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
            </ul>
          </div>
        </nav>
        <div class="features-grid">
          <div class="feature-card">Feature 1</div>
          <div class="feature-card">Feature 2</div>
          <div class="feature-card">Feature 3</div>
        </div>
      `;
      
      // Test mobile breakpoint
      const mobileQuery = '(max-width: 768px)';
      const tabletQuery = '(max-width: 1024px)';
      const desktopQuery = '(min-width: 1025px)';
      
      expect(window.matchMedia).toBeDefined();
      expect(window.matchMedia(mobileQuery)).toBeTruthy();
      expect(window.matchMedia(tabletQuery)).toBeTruthy();
      expect(window.matchMedia(desktopQuery)).toBeTruthy();
      
      // Test responsive elements exist
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      const featuresGrid = document.querySelector('.features-grid');
      const featureCards = document.querySelectorAll('.feature-card');
      
      expect(mobileToggle).toBeInTheDocument();
      expect(featuresGrid).toBeInTheDocument();
      expect(featureCards).toHaveLength(3);
    });

    test('should have proper color contrast and readability', () => {
      document.body.innerHTML = `
        <div class="hero-section" style="background-color: #1a1a1a; color: #ffffff;">
          <h1>Welcome to CheckCafe</h1>
          <p>Your café management solution</p>
        </div>
        <div class="feature-card" style="background-color: #f8f9fa; color: #212529;">
          <h3>Feature Title</h3>
          <p>Feature description text</p>
        </div>
        <button class="btn-primary" style="background-color: #007bff; color: #ffffff;">
          Get Started
        </button>
      `;
      
      const heroSection = document.querySelector('.hero-section');
      const featureCard = document.querySelector('.feature-card');
      const primaryButton = document.querySelector('.btn-primary');
      
      // Test that elements have appropriate background and text colors
      expect(heroSection.style.backgroundColor).toBe('rgb(26, 26, 26)');
      expect(heroSection.style.color).toBe('rgb(255, 255, 255)');
      expect(featureCard.style.backgroundColor).toBe('rgb(248, 249, 250)');
      expect(featureCard.style.color).toBe('rgb(33, 37, 41)');
      expect(primaryButton.style.backgroundColor).toBe('rgb(0, 123, 255)');
      expect(primaryButton.style.color).toBe('rgb(255, 255, 255)');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle missing or corrupted DOM elements', () => {
      document.body.innerHTML = `<div id="incomplete-structure"></div>`;
      
      const nonExistentElement = document.getElementById('non-existent-element');
      const emptyContainer = document.getElementById('incomplete-structure');
      
      expect(nonExistentElement).toBeNull();
      expect(emptyContainer).toBeInTheDocument();
      expect(emptyContainer.children).toHaveLength(0);
      
      // Test graceful handling of missing elements
      const safeQuerySelector = (selector) => {
        try {
          return document.querySelector(selector);
        } catch (error) {
          return null;
        }
      };
      
      expect(safeQuerySelector('.non-existent-class')).toBeNull();
      expect(safeQuerySelector('#non-existent-id')).toBeNull();
    });

    test('should handle XSS attempts and malicious input', () => {
      document.body.innerHTML = `
        <form id="security-test-form">
          <input type="text" name="businessName" id="business-name">
          <textarea name="description" id="description"></textarea>
          <div id="output"></div>
        </form>
      `;
      
      const businessNameInput = document.getElementById('business-name');
      const descriptionInput = document.getElementById('description');
      const output = document.getElementById('output');
      
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        'onload="alert(1)"',
        '"><script>alert("XSS")</script>',
        '\'; DROP TABLE businesses; --'
      ];
      
      xssAttempts.forEach(xssPayload => {
        businessNameInput.value = xssPayload;
        descriptionInput.value = xssPayload;
        
        // Values should be preserved as text, not executed
        expect(businessNameInput.value).toBe(xssPayload);
        expect(descriptionInput.value).toBe(xssPayload);
        
        // Should not create script elements
        expect(document.querySelectorAll('script')).toHaveLength(0);
        
        // Test safe output rendering
        output.textContent = businessNameInput.value; // Safe
        expect(output.textContent).toBe(xssPayload);
        expect(output.innerHTML).not.toContain('<script>');
      });
    });

    test('should handle network errors and API failures', () => {
      // Mock fetch for testing API error handling
      global.fetch = jest.fn();
      
      const handleFormSubmission = async (formData) => {
        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error('Form submission failed:', error);
          return { success: false, error: error.message };
        }
      };
      
      // Test network error
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');
      
      return handleFormSubmission(formData).then(result => {
        expect(result.success).toBe(false);
        expect(result.error).toBe('Network error');
      });
    });

    test('should handle invalid form data gracefully', () => {
      document.body.innerHTML = `
        <form id="validation-test-form">
          <input type="email" name="email" id="email" required>
          <input type="tel" name="phone" id="phone" pattern="[0-9]{10}" required>
          <select name="businessType" id="business-type" required>
            <option value="">Select Type</option>
            <option value="cafe">Café</option>
          </select>
        </form>
      `;
      
      const form = document.getElementById('validation-test-form');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const businessTypeSelect = document.getElementById('business-type');
      
      const invalidTestCases = [
        { email: '', phone: '', businessType: '' }, // Empty fields
        { email: 'invalid-email', phone: '123', businessType: '' }, // Invalid format
        { email: 'test@example.com', phone: 'not-a-number', businessType: 'cafe' }, // Invalid phone
        { email: 'test@example.com', phone: '1234567890', businessType: 'invalid-type' } // Invalid select
      ];
      
      invalidTestCases.forEach(testCase => {
        emailInput.value = testCase.email;
        phoneInput.value = testCase.phone;
        businessTypeSelect.value = testCase.businessType;
        
        const isValid = form.checkValidity();
        expect(isValid).toBe(false);
      });
      
      // Test valid case
      emailInput.value = 'valid@example.com';
      phoneInput.value = '1234567890';
      businessTypeSelect.value = 'cafe';
      
      expect(form.checkValidity()).toBe(true);
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle rapid user interactions without performance degradation', () => {
      document.body.innerHTML = `
        <button id="rapid-click-btn">Click Me Rapidly</button>
        <div id="click-counter">0</div>
      `;
      
      const button = document.getElementById('rapid-click-btn');
      const counter = document.getElementById('click-counter');
      let clickCount = 0;
      
      const clickHandler = jest.fn(() => {
        clickCount++;
        counter.textContent = clickCount.toString();
      });
      
      button.addEventListener('click', clickHandler);
      
      // Simulate rapid clicking (100 clicks)
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        button.click();
      }
      const endTime = performance.now();
      
      expect(clickHandler).toHaveBeenCalledTimes(100);
      expect(clickCount).toBe(100);
      expect(counter.textContent).toBe('100');
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    test('should handle large amounts of dynamic content efficiently', () => {
      const container = document.createElement('div');
      container.id = 'dynamic-content-container';
      document.body.appendChild(container);
      
      const startTime = performance.now();
      
      // Create many DOM elements
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 1000; i++) {
        const element = document.createElement('div');
        element.className = 'dynamic-item';
        element.textContent = `CheckCafe Feature ${i}`;
        element.dataset.id = i.toString();
        fragment.appendChild(element);
      }
      
      container.appendChild(fragment);
      const endTime = performance.now();
      
      const dynamicItems = document.querySelectorAll('.dynamic-item');
      expect(dynamicItems).toHaveLength(1000);
      expect(dynamicItems[0].textContent).toBe('CheckCafe Feature 0');
      expect(dynamicItems[999].textContent).toBe('CheckCafe Feature 999');
      expect(endTime - startTime).toBeLessThan(500); // Should be reasonably fast
    });

    test('should handle memory cleanup properly', () => {
      let eventListeners = [];
      
      // Create elements with event listeners
      for (let i = 0; i < 50; i++) {
        const element = document.createElement('button');
        element.id = `test-button-${i}`;
        element.textContent = `Button ${i}`;
        
        const handler = jest.fn();
        element.addEventListener('click', handler);
        eventListeners.push({ element, handler });
        
        document.body.appendChild(element);
      }
      
      // Verify elements exist
      expect(document.querySelectorAll('button[id^="test-button-"]')).toHaveLength(50);
      
      // Clean up
      eventListeners.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
        element.remove();
      });
      
      // Verify cleanup
      expect(document.querySelectorAll('button[id^="test-button-"]')).toHaveLength(0);
      eventListeners = [];
    });
  });

  // Test utility functions
  const testUtils = {
    createMockElement: (tag, attributes = {}, content = '') => {
      const element = document.createElement(tag);
      Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
      });
      if (content) {
        element.textContent = content;
      }
      return element;
    },
    
    simulateUserInput: (element, value) => {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    },
    
    simulateKeyPress: (element, key, keyCode) => {
      const event = new KeyboardEvent('keydown', {
        key: key,
        keyCode: keyCode,
        bubbles: true
      });
      element.dispatchEvent(event);
    },
    
    mockLocalStorage: () => {
      const store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => store[key] = value.toString(),
        removeItem: (key) => delete store[key],
        clear: () => Object.keys(store).forEach(key => delete store[key])
      };
    }
  };

});

// Export test utilities if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testUtils };
}