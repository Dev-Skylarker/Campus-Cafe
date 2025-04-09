/**
 * Main JavaScript for the Campus Cafe website
 */

import storageManager from './utils/storage.js';
import { database, auth } from './utils/firebase.js';
import { navigationManager } from './utils/navigation.js';

// DOM Elements
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mainNav = document.querySelector('.main-nav');
const contactForm = document.getElementById('contact-form');
const featuredDishesContainer = document.getElementById('featured-dishes-container');

// Authentication check - this should run first to ensure authorized access
function checkAuth() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // User is not signed in, redirect to login page
            storageManager.clearAuthData();
            window.location.href = 'login.html';
        } else {
            // User is signed in, save to local storage and update UI
            storageManager.saveAuthenticatedUser(user);
            updateUIForAuthenticatedUser(user);
        }
    });
}

// Run auth check immediately
checkAuth();

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
    // Add user profile to header if it doesn't exist
    const headerContainer = document.querySelector('header .container');
    if (headerContainer && !document.querySelector('.user-profile')) {
        const userProfileElement = document.createElement('div');
        userProfileElement.className = 'user-profile';
        userProfileElement.innerHTML = `
            <img src="${user.photoURL || 'assets/default-user.png'}" alt="${user.displayName || 'User'}" class="user-avatar">
            <div class="user-dropdown">
                <div class="user-info">
                    <span class="user-name">${user.displayName || 'User'}</span>
                    <span class="user-email">${user.email}</span>
                </div>
                <button id="sign-out-btn" class="btn btn-small">Sign Out</button>
            </div>
        `;
        
        // Insert after theme toggle
        const themeToggle = headerContainer.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.after(userProfileElement);
        } else {
            headerContainer.appendChild(userProfileElement);
        }
        
        // Add event listener for sign out
        document.getElementById('sign-out-btn').addEventListener('click', () => {
            auth.signOut().then(() => {
                // Sign-out successful, clear storage and redirect to login page
                storageManager.clearAuthData();
                window.location.href = 'login.html';
            }).catch((error) => {
                // An error happened
                console.error('Sign out error:', error);
                showAlert('Error signing out', 'error');
            });
        });
        
        // Remove Google sign-in button if it exists
        const googleSigninBtn = document.querySelector('.google-signin');
        if (googleSigninBtn) {
            googleSigninBtn.remove();
        }
    }
}

// Currency utility for KSH formatting
const currencyUtil = {
    formatPrice: (price) => {
        // Format price in KSH
        return `KSH ${price.toFixed(2)}`;
    }
};

// Toggle mobile navigation
if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        
        // Change icon based on menu state
        const icon = mobileNavToggle.querySelector('i');
        if (mainNav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
    if (mainNav && mainNav.classList.contains('active') && !e.target.closest('.mobile-nav-toggle') && !e.target.closest('.main-nav')) {
        mainNav.classList.remove('active');
        const icon = mobileNavToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show alert message to user
 * @param {string} message - Message to display
 * @param {string} type - Alert type ('success' or 'error')
 */
function showAlert(message, type = 'success', container = null) {
    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    
    // Find where to insert it
    if (container) {
        container.insertBefore(alertEl, container.firstChild);
    } else if (contactForm) {
        const formContainer = contactForm.parentElement;
        formContainer.insertBefore(alertEl, contactForm);
    } else {
        // If no container specified and no contact form, add to body
        document.body.appendChild(alertEl);
        alertEl.style.position = 'fixed';
        alertEl.style.top = '20px';
        alertEl.style.left = '50%';
        alertEl.style.transform = 'translateX(-50%)';
        alertEl.style.zIndex = '1000';
    }
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (alertEl.parentNode) {
            alertEl.parentNode.removeChild(alertEl);
        }
    }, 5000);
}

/**
 * Load featured dishes
 */
async function loadFeaturedDishes() {
    if (!featuredDishesContainer) return;
    
    try {
        // Get menu items from storage
        const menuItems = await storageManager.getMenuItems();
        
        // Filter featured dishes that are available
        const featuredDishes = menuItems.filter(item => 
            item.featured && (!item.availability || item.availability === 'available')
        );
        
        // Display featured dishes
        if (featuredDishes.length > 0) {
            featuredDishesContainer.innerHTML = '';
            
            // Limit to 3 featured dishes
            const displayDishes = featuredDishes.slice(0, 3);
            
            displayDishes.forEach(dish => {
                const dishCard = createDishCard(dish);
                featuredDishesContainer.appendChild(dishCard);
            });
            
            // Add animation effects with staggered delays
            const dishCards = featuredDishesContainer.querySelectorAll('.dish-card');
            dishCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        } else {
            featuredDishesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <p>No featured dishes available at the moment.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading featured dishes:', error);
        featuredDishesContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load featured dishes. Please try again later.</p>
            </div>
        `;
    }
}

/**
 * Create a dish card element
 * @param {Object} dish - Dish data
 * @returns {HTMLElement} Dish card element
 */
function createDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    
    // Create image section
    const imageSection = document.createElement('div');
    imageSection.className = 'dish-image';
    
    if (dish.imageUrl) {
        const img = document.createElement('img');
        img.src = dish.imageUrl;
        img.alt = dish.name;
        imageSection.appendChild(img);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = '<i class="fas fa-utensils"></i><span>No image available</span>';
        imageSection.appendChild(placeholder);
    }
    
    // Create info section
    const infoSection = document.createElement('div');
    infoSection.className = 'dish-info';
    
    const category = document.createElement('span');
    category.className = 'dish-category';
    category.textContent = formatCategoryLabel(dish.category);
    
    const name = document.createElement('h3');
    name.className = 'dish-name';
    name.textContent = dish.name;
    
    const price = document.createElement('div');
    price.className = 'dish-price';
    price.textContent = currencyUtil.formatPrice(dish.price);
    
    const description = document.createElement('p');
    description.className = 'dish-description';
    description.textContent = dish.description;
    
    const viewButton = document.createElement('div');
    viewButton.className = 'view-dish';
    viewButton.innerHTML = `<a href="#" class="btn btn-secondary" onclick="viewDish('${dish.id}')">View Details</a>`;
    
    // Assemble the card
    infoSection.appendChild(category);
    infoSection.appendChild(name);
    infoSection.appendChild(price);
    infoSection.appendChild(description);
    infoSection.appendChild(viewButton);
    
    card.appendChild(imageSection);
    card.appendChild(infoSection);
    
    return card;
}

/**
 * Format category label for display
 * @param {string} category - Category key
 * @returns {string} - Formatted category label
 */
function formatCategoryLabel(category) {
    const categories = {
        'appetizers': 'Breakfast',
        'main-courses': 'Main Course',
        'desserts': 'Dessert',
        'drinks': 'Drink'
    };
    
    return categories[category] || 'Other';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Unsafe string
 * @returns {string} - Escaped string
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Check if the device is a mobile device
 * @returns {boolean} - Whether the device is mobile
 */
function isMobileDevice() {
    return window.innerWidth < 768 || 
           navigator.userAgent.match(/Android/i) || 
           navigator.userAgent.match(/iPhone|iPad|iPod/i);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize storage
        await storageManager.initStorage();
        
        // Initialize navigation
        navigationManager.init();
        
        // Load featured dishes
        loadFeaturedDishes();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Display featured dishes in the grid
function displayFeaturedDishes(dishes) {
    const container = document.getElementById('featured-dishes-container');
    if (!container) return;
    
    // Remove loader if present
    const loader = container.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
    
    if (dishes.length === 0) {
        container.innerHTML = '<p class="empty-state">No featured dishes available</p>';
        return;
    }
    
    container.innerHTML = dishes.map(dish => `
        <div class="dish-card">
            <div class="dish-image">
                ${dish.imageUrl ? `
                    <img src="${dish.imageUrl}" alt="${dish.name}" loading="lazy">
                ` : `
                    <div class="image-placeholder">
                        <i class="fas fa-utensils"></i>
                    </div>
                `}
            </div>
            <div class="dish-info">
                <h3>${dish.name}</h3>
                <p class="price">KSH ${dish.price.toFixed(2)}</p>
                <p class="description">${dish.description}</p>
                <button class="btn btn-primary add-to-cart" data-id="${dish.id}">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to Add to Cart buttons
    container.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.dataset.id;
            addToCart(itemId);
        });
    });
}

// Add item to cart
async function addToCart(itemId) {
    try {
        const item = await storageManager.getMenuItemById(itemId);
        if (!item) {
            console.error('Item not found');
            return;
        }
        
        // Get current cart
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if item already exists in cart
        const existingItem = cart.find(i => i.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart badge
        updateCartBadge();
        
        // Show success message
        showAlert('Item added to cart!');
        
    } catch (error) {
        console.error('Error adding item to cart:', error);
        showAlert('Failed to add item to cart', 'error');
    }
}

// Update cart badge with current number of items
function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    badge.textContent = itemCount;
    badge.style.display = itemCount > 0 ? 'block' : 'none';
}

// Initialize navigation elements
function initNavigation() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // User dropdown toggle
    const userDropdownToggle = document.querySelector('.user-dropdown-toggle');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');
    
    if (userDropdownToggle && userDropdownMenu) {
        userDropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            userDropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdownToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }

    // Check authentication and update navigation
    updateNavigation();

    // Listen for auth state changes (login/logout)
    window.addEventListener('auth-state-changed', updateNavigation);
}

// Update navigation based on authentication status
function updateNavigation() {
    const isAuthenticated = localStorage.getItem('user') !== null;
    const currentPath = window.location.pathname;
    
    // Elements to show/hide based on auth state
    const loginOption = document.querySelector('.nav-login');
    const logoutOption = document.querySelector('.nav-logout');
    const userDropdown = document.querySelector('.user-dropdown');
    const restrictedPages = ['/orders.html', '/profile.html', '/cart.html', '/checkout.html'];
    
    if (loginOption) loginOption.style.display = isAuthenticated ? 'none' : 'block';
    if (logoutOption) logoutOption.style.display = isAuthenticated ? 'block' : 'none';
    if (userDropdown) userDropdown.style.display = isAuthenticated ? 'flex' : 'none';
    
    // If user is not authenticated and tries to access a restricted page, redirect to login
    if (!isAuthenticated) {
        const isRestrictedPage = restrictedPages.some(page => 
            currentPath.endsWith(page) || currentPath.includes(page));
        
        if (isRestrictedPage) {
            window.location.href = 'login.html';
        }
    } else {
        // Update user info in the navigation if available
        const userData = JSON.parse(localStorage.getItem('user'));
        const userNameElement = document.querySelector('.user-name');
        
        if (userData && userNameElement) {
            userNameElement.textContent = userData.name || 'User';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    
    // Initialize navigation and auth-related elements
    initNavigation();
    
    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
        // Set initial state based on localStorage
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
    }

    // Initialize quantity inputs
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        const minusBtn = input.previousElementSibling;
        const plusBtn = input.nextElementSibling;
        
        if (minusBtn && minusBtn.classList.contains('quantity-btn-minus')) {
            minusBtn.addEventListener('click', () => {
                if (input.value > 1) {
                    input.value = parseInt(input.value) - 1;
                    input.dispatchEvent(new Event('change'));
                }
            });
        }
        
        if (plusBtn && plusBtn.classList.contains('quantity-btn-plus')) {
            plusBtn.addEventListener('click', () => {
                input.value = parseInt(input.value) + 1;
                input.dispatchEvent(new Event('change'));
            });
        }
    });

    // Scroll to top button
    const scrollTopBtn = document.getElementById('scroll-to-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Toggle dark mode
function toggleDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        if (darkModeToggle) darkModeToggle.checked = true;
    } else {
        localStorage.setItem('darkMode', 'disabled');
        if (darkModeToggle) darkModeToggle.checked = false;
    }
}

// Function to toggle password visibility
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.querySelector(`#${inputId} + .toggle-password`);
    
    if (passwordInput) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
}

// Handle user logout
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('campus_cafe_cart');
    
    // Dispatch auth state change event
    window.dispatchEvent(new Event('auth-state-changed'));
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto close after 3 seconds
    const autoCloseTimeout = setTimeout(() => {
        closeToast(toast);
    }, 3000);
    
    // Close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoCloseTimeout);
        closeToast(toast);
    });
}

// Close toast with animation
function closeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 300);
}
