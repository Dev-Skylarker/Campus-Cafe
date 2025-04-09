/**
 * Main JavaScript for the Campus Cafe website
 */

import storageManager from './utils/storage.js';
import { database, auth } from './utils/firebase.js';
import { navigationManager } from './utils/navigation.js';

// DOM Elements
const contactForm = document.getElementById('contact-form');
const featuredDishesContainer = document.getElementById('featured-dishes-container');

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    navigationManager.init();
    
    // Initialize other components
    loadFeaturedDishes();
});

// Authentication check - this should run first to ensure authorized access
function checkAuth() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // User is not signed in, redirect to login page if on a protected page
            const protectedPages = ['orders.html', 'admin.html'];
            const currentPage = window.location.pathname.split('/').pop();
            
            if (protectedPages.includes(currentPage)) {
                storageManager.clearAuthData();
                window.location.href = 'login.html';
            }
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
                    <p>No featured dishes yet. Check back soon!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading featured dishes:', error);
        featuredDishesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Could not load featured dishes. Please try again later.</p>
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
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize storage
        await storageManager.initStorage();
        
        // Load featured dishes
        const menuItems = await storageManager.getMenuItems();
        const featuredDishes = menuItems.filter(item => item.featured);
        displayFeaturedDishes(featuredDishes);
        
        // Update cart badge
        updateCartBadge();
        
    } catch (error) {
        console.error('Error initializing app:', error);
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
