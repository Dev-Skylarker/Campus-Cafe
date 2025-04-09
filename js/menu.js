/**
 * Menu Page JavaScript for Campus Cafe
 */

// Import the storage manager
import storageManager from './utils/storage.js';
import { cartManager } from './utils/cart.js';
import { auth } from './utils/firebase.js';

// DOM Elements
const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('menu-search');
const searchBtn = document.getElementById('search-btn');
const menuTabs = document.querySelectorAll('.menu-tab');
const noResultsMessage = document.querySelector('.no-results');
const modal = document.getElementById('item-modal');
const modalItemName = document.getElementById('modal-item-name');
const modalItemImage = document.getElementById('modal-item-image');
const modalItemDescription = document.getElementById('modal-item-description');
const modalItemPrice = document.getElementById('modal-item-price');
const modalItemCategory = document.getElementById('modal-item-category');
const modalItemIngredients = document.getElementById('modal-item-ingredients');
const orderItemBtn = document.getElementById('order-item-btn');
const closeModalBtn = modal ? modal.querySelector('.close-modal') : null;
const cartBtn = document.querySelector('.cart-btn');
const cartBadge = cartBtn ? cartBtn.querySelector('.cart-badge') : null;
const orderConfirmationModal = document.getElementById('order-confirmation-modal');
const orderNumberSpan = document.getElementById('order-number');

// Current filter state
let currentCategory = 'all';
let currentSearchTerm = '';
let currentItem = null;
let allMenuItems = []; // Store all menu items for efficient filtering
let debounceTimeout = null; // For search debounce

// Currency utility for KSH formatting
const currencyUtil = {
    formatPrice: (price) => {
        // Format price in KSH
        return `KSH ${price.toFixed(2)}`;
    }
};

/**
 * Initialize menu page
 */
async function initMenuPage() {
    try {
        // Initialize storage first
        await storageManager.initStorage();
        
        // Load all menu items and store them for efficient filtering
        allMenuItems = await storageManager.getMenuItems();
        
        // Check if we got menu items
        if (!allMenuItems || allMenuItems.length === 0) {
            console.warn("No menu items found or storage not initialized properly");
            allMenuItems = [];
        }
        
        // Filter out unavailable items
        allMenuItems = allMenuItems.filter(item => 
            !item.availability || item.availability === 'available'
        );
        
        // Initialize cart manager
        if (typeof cartManager.init === 'function') {
            cartManager.init();
        }
        
        displayMenuItems(allMenuItems); // Display all items initially
        setupEventListeners();
    } catch (error) {
        console.error("Error loading menu items:", error);
        if (menuContainer) {
            menuContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load menu items. Please try again later.</p>
                    <button id="retry-btn" class="btn btn-primary mt-3">Retry</button>
                </div>
            `;
            
            // Add retry button functionality
            const retryBtn = document.getElementById('retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    menuContainer.innerHTML = `<div class="loader"></div>`;
                    setTimeout(initMenuPage, 1000); // Retry after a short delay
                });
            }
        }
    }
}

/**
 * Add all event listeners for the menu page
 */
function setupEventListeners() {
    // Dynamic search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Clear previous timeout
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            
            // Debounce to avoid too many updates
            debounceTimeout = setTimeout(() => {
                const searchTerm = e.target.value.trim().toLowerCase();
                currentSearchTerm = searchTerm;
                filterMenuItems(currentCategory, searchTerm);
            }, 200); // 200ms debounce time
        });
        
        // Also handle Enter key
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.trim().toLowerCase();
                currentSearchTerm = searchTerm;
                filterMenuItems(currentCategory, searchTerm);
            }
        });
    }
    
    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            currentSearchTerm = searchTerm;
            filterMenuItems(currentCategory, searchTerm);
        });
    }

    // Category tabs
    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            setActiveTab(tab);
            filterMenuItems(category, currentSearchTerm);
        });
    });

    // Close modals
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeItemModal);
    }

    // Order button
    if (orderItemBtn) {
        orderItemBtn.addEventListener('click', placeOrder);
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeItemModal();
        } else if (e.target === orderConfirmationModal) {
            orderConfirmationModal.style.display = 'none';
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal && modal.style.display === 'block') {
                closeItemModal();
            } else if (orderConfirmationModal && orderConfirmationModal.style.display === 'block') {
                orderConfirmationModal.style.display = 'none';
            }
        }
    });

    // Handle hash in URL for direct item access
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
        handleHashChange();
    }
    
    // Close confirmation button
    const closeConfirmationBtn = document.getElementById('close-confirmation');
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', () => {
            orderConfirmationModal.style.display = 'none';
        });
    }
}

/**
 * Set the active tab
 * @param {HTMLElement} activeTab - The tab to set as active
 */
function setActiveTab(activeTab) {
    menuTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    activeTab.classList.add('active');
    currentCategory = activeTab.dataset.category;
}

/**
 * Filter menu items by category and search term
 * @param {string} category - Category to filter by
 * @param {string} searchTerm - Search term to filter by
 */
function filterMenuItems(category, searchTerm = '') {
    // Use the cached menu items for filtering
    let filteredItems = [...allMenuItems];

    // Filter by category
    if (category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === category);
    }

    // Filter by search term
    if (searchTerm) {
        filteredItems = filteredItems.filter(item => {
            return (
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                (item.ingredients && item.ingredients.some(ing => 
                    ing.toLowerCase().includes(searchTerm)
                ))
            );
        });
    }

    // Filter out unavailable items
    filteredItems = filteredItems.filter(item => 
        !item.availability || item.availability === 'available'
    );

    // Display filtered items with animation for new items
    displayMenuItems(filteredItems);
}

/**
 * Display menu items in the container
 * @param {Array} items - Array of menu items to display
 */
function displayMenuItems(items) {
    if (!menuContainer) return;

    // Store current items IDs to identify new ones
    const currentItemIds = Array.from(menuContainer.querySelectorAll('.menu-item'))
        .map(el => el.dataset.id);
    
    // Clear container
    menuContainer.innerHTML = '';

    // Show loading indicator first
    if (items.length === 0) {
        if (noResultsMessage) {
            noResultsMessage.style.display = 'block';
        }
        return;
    }

    // Hide "no results" message
    if (noResultsMessage) {
        noResultsMessage.style.display = 'none';
    }

    // Check if items is valid array
    if (!Array.isArray(items)) {
        console.error('Invalid menu items data:', items);
        menuContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading menu items. Please try refreshing the page.</p>
            </div>
        `;
        return;
    }

    // Create and append menu item elements
    items.forEach(item => {
        try {
            const menuItem = createMenuItem(item);
            // Add 'new-item' class to items that weren't in the previous set
            if (!currentItemIds.includes(item.id)) {
                menuItem.classList.add('new-item');
            }
            menuContainer.appendChild(menuItem);
        } catch (error) {
            console.error(`Error creating menu item for ${item?.id || 'unknown'}:`, error);
        }
    });

    // Add animation effects with staggered delays
    const menuElements = menuContainer.querySelectorAll('.menu-item');
    menuElements.forEach((el, index) => {
        // Only animate new items
        if (el.classList.contains('new-item')) {
            setTimeout(() => {
                el.classList.add('animate');
            }, index * 50); // Stagger animations by 50ms
        }
    });
}

/**
 * Create a menu item element
 * @param {Object} item - Menu item data
 * @returns {HTMLElement} - Menu item element
 */
function createMenuItem(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.dataset.id = item.id;
    menuItem.dataset.category = item.category;

    // Get the correct image URL and handle fallback
    const imageUrl = item.imageUrl || (item.image ? item.image : '');
    const imageHtml = imageUrl 
        ? `<img src="${imageUrl}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null; this.src='assets/placeholder-food.png';">`
        : `<div class="image-placeholder"><i class="fas fa-utensils"></i><span>${item.name}</span></div>`;

    menuItem.innerHTML = `
        <div class="menu-item-image">
            ${imageHtml}
        </div>
        <div class="menu-item-info">
            <h3 class="menu-item-name">${escapeHtml(item.name)}</h3>
            <div class="menu-item-price">${currencyUtil.formatPrice(item.price)}</div>
            <p class="menu-item-description">${escapeHtml(item.description)}</p>
            <div class="menu-item-actions">
                <button class="btn btn-secondary view-details-btn" data-id="${item.id}">
                    <i class="fas fa-eye"></i> Details
                </button>
                <div class="quantity-control">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="item-quantity" data-id="${item.id}">1</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
                <button class="btn btn-primary add-to-cart-btn" data-id="${item.id}">
                    <i class="fas fa-shopping-cart"></i> Add
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const viewDetailsBtn = menuItem.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', () => {
        openItemModal(item);
    });
    
    // Quantity control
    const decreaseBtn = menuItem.querySelector('.decrease');
    const increaseBtn = menuItem.querySelector('.increase');
    const quantitySpan = menuItem.querySelector('.item-quantity');
    
    decreaseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity > 1) {
            quantity--;
            quantitySpan.textContent = quantity;
        }
    });
    
    increaseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity < 10) { // Set a reasonable maximum
            quantity++;
            quantitySpan.textContent = quantity;
        }
    });

    // Add to cart button
    const addToCartBtn = menuItem.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const quantity = parseInt(quantitySpan.textContent);
        
        // Use cartManager to add the item
        cartManager.addItem(item, quantity);
        
        // Reset quantity to 1
        quantitySpan.textContent = "1";
        
        // Show added feedback
        addToCartBtn.classList.add('added');
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added';
        
        // Show notification via cartManager (or reuse local notification)
        showAddToCartNotification(item, quantity);
        
        setTimeout(() => {
            addToCartBtn.classList.remove('added');
            addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add';
        }, 1500);
    });

    // Make card clickable for details but not when clicking controls
    menuItem.addEventListener('click', (e) => {
        // Only open modal if not clicking on a button or control
        if (!e.target.closest('button') && !e.target.closest('.quantity-control')) {
            openItemModal(item);
        }
    });

    return menuItem;
}

/**
 * Show notification when item is added to cart
 * @param {Object} item - Item added to cart
 * @param {number} quantity - Quantity added
 */
function showAddToCartNotification(item, quantity) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('cart-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.className = 'cart-notification';
        document.body.appendChild(notification);
    }
    
    // Update notification content
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <div class="notification-text">
                <p><strong>${quantity}x ${escapeHtml(item.name)}</strong> added to cart</p>
                <a href="cart.html" class="view-cart-link">View Cart</a>
            </div>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Add event listener to close button
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('active');
    });
    
    // Show notification
    notification.classList.add('active');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

/**
 * Open item modal
 * @param {Object} item - Menu item data
 */
function openItemModal(item) {
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <span class="close-modal">&times;</span>
        <div class="modal-item-details">
            <div class="modal-item-image">
                <img src="${item.image || item.imageUrl}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null; this.src='assets/placeholder-food.png';">
            </div>
            <div class="modal-item-info">
                <h2>${escapeHtml(item.name)}</h2>
                <div class="modal-item-price">${currencyUtil.formatPrice(item.price)}</div>
                <div class="modal-item-category">${formatCategoryLabel(item.category)}</div>
                <p>${escapeHtml(item.description)}</p>
                <div class="modal-item-ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                        ${item.ingredients && item.ingredients.length ? item.ingredients.map(ingredient => `<li>${escapeHtml(ingredient)}</li>`).join('') : '<li>No ingredients listed</li>'}
                    </ul>
                </div>
                <div class="modal-item-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn minus" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">1</span>
                        <button class="quantity-btn plus" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn btn-primary add-to-cart-modal" data-id="${item.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    // Store current item reference
    currentItem = item;

    // Update URL hash
    window.location.hash = item.id;

    // Show modal
    modal.style.display = 'block';

    // Apply entrance animation
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        modalContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    }, 10);
    
    // Add event listeners for the quantity selectors
    const minusBtn = modalContent.querySelector('.minus');
    const plusBtn = modalContent.querySelector('.plus');
    const quantitySpan = modalContent.querySelector('.quantity');
    const addToCartBtnModal = modalContent.querySelector('.add-to-cart-modal'); // Renamed variable
    
    minusBtn.addEventListener('click', () => {
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity > 1) {
            quantity--;
            quantitySpan.textContent = quantity;
        }
    });
    
    plusBtn.addEventListener('click', () => {
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity < 10) {
            quantity++;
            quantitySpan.textContent = quantity;
        }
    });
    
    addToCartBtnModal.addEventListener('click', () => { // Use renamed variable
        const quantity = parseInt(quantitySpan.textContent);
        // Use cartManager to add the item
        cartManager.addItem(item, quantity);
        
        // Show added feedback
        addToCartBtnModal.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
        addToCartBtnModal.disabled = true;
        
        // Show notification
        showAddToCartNotification(item, quantity);
        
        // Close modal after a delay
        setTimeout(() => {
            closeItemModal();
            
            // Reset button state
            setTimeout(() => {
                addToCartBtnModal.innerHTML = 'Add to Cart';
                addToCartBtnModal.disabled = false;
            }, 500);
        }, 1500);
    });
    
    // Add close event listener
    const closeBtn = modalContent.querySelector('.close-modal');
    closeBtn.addEventListener('click', closeItemModal);
}

/**
 * Close the item modal
 */
function closeItemModal() {
    if (!modal) return;

    // Update URL hash
    history.pushState('', document.title, window.location.pathname + window.location.search);

    // Apply exit animation
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        modal.style.display = 'none';
        // Reset animation
        modalContent.style.transition = '';
    }, 300);
}

/**
 * Place an order for the current item
 */
function placeOrder() {
    if (!currentItem) return;

    // Get user information from Firebase auth
    const user = auth.currentUser;
    const userName = user ? (user.displayName || user.email || 'Guest') : 'Guest';

    // Create order object
    const order = {
        id: generateOrderId(),
        item: currentItem,
        quantity: 1,
        status: 'pending',
        orderTime: new Date().toISOString(),
        estimatedPickupTime: getEstimatedPickupTime(),
        customerName: userName, // Use user's name from Google auth
        userId: user ? user.uid : 'guest',
    };

    // Save order to storage
    saveOrder(order);

    // Close item modal
    closeItemModal();

    // Show confirmation
    showOrderConfirmation(order);
}

/**
 * Show order confirmation modal
 * @param {Object} order - Order object
 */
function showOrderConfirmation(order) {
    if (!orderConfirmationModal || !orderNumberSpan) return;

    // Set order number
    orderNumberSpan.textContent = order.id;

    // Get the modal body
    const modalBody = orderConfirmationModal.querySelector('.modal-body');
    
    // Update the modal content with user info and pickup time
    modalBody.innerHTML = `
        <i class="fas fa-check-circle success-icon"></i>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you, ${order.customerName}!</p>
        <p>Your order has been placed and will be ready for pickup.</p>
        <p><strong>Order #:</strong> <span id="order-number">${order.id}</span></p>
        <p><strong>Estimated Pickup:</strong> ${formatPickupTime(order.estimatedPickupTime)}</p>
        <button id="close-confirmation" class="btn btn-primary">Continue</button>
    `;

    // Add event listener to the new close button
    const closeConfirmationBtn = modalBody.querySelector('#close-confirmation');
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', () => {
            orderConfirmationModal.style.display = 'none';
        });
    }

    // Show modal
    orderConfirmationModal.style.display = 'block';

    // Apply entrance animation
    const modalContent = orderConfirmationModal.querySelector('.modal-content');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        modalContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    }, 10);
}

/**
 * Format pickup time for display
 * @param {string} isoTimeString - ISO time string
 * @returns {string} - Formatted time string
 */
function formatPickupTime(isoTimeString) {
    const date = new Date(isoTimeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

/**
 * Handle hash change to open item modal
 */
async function handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    
    try {
        // Show loading state in modal
        if (modalItemName && modalItemImage && modalItemDescription && modalItemPrice) {
            modalItemName.textContent = 'Loading...';
            modalItemImage.innerHTML = '<div class="loader"></div>';
            modalItemDescription.textContent = '';
            modalItemPrice.textContent = '';
            modal.style.display = 'block';
        }
        
        // Get item by ID from Firebase
        const item = await storageManager.getMenuItemById(hash);
        
        if (item) {
            openItemModal(item);
        } else {
            closeItemModal();
            console.error('Item not found:', hash);
        }
    } catch (error) {
        console.error('Error loading item details:', error);
        closeItemModal();
    }
}

/**
 * Load all menu items from storage
 */
async function loadMenuItems(category) {
    try {
        // Get menu items
        const menuItems = await storageManager.getMenuItems();

        // Update category labels for Campus Cafe
        menuItems.forEach(item => {
            if (item.category === 'appetizers') {
                item.category = 'appetizers'; // Keeping as is, but could change to 'breakfast'
            }
        });

        // Display all items
        displayMenuItems(menuItems);
    } catch (error) {
        console.error('Error loading menu items:', error);
        if (menuContainer) {
            menuContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Could not load menu items. Please try again later.</p>
                </div>
            `;
        }
    }
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
 * Generate a unique order ID
 * @returns {string} - Unique order ID
 */
function generateOrderId() {
    // Simple order number format: current timestamp + random chars
    return Math.floor(Math.random() * 900 + 100).toString();
}

/**
 * Calculate estimated pickup time (15-30 minutes from now)
 * @returns {string} - ISO string of estimated pickup time
 */
function getEstimatedPickupTime() {
    const now = new Date();
    // Random time between 15-30 minutes from now
    const minutesToAdd = Math.floor(Math.random() * 16) + 15;
    const pickupTime = new Date(now.getTime() + minutesToAdd * 60000);
    return pickupTime.toISOString();
}

/**
 * Save order to Firebase
 * @param {Object} order - Order to save
 */
async function saveOrder(order) {
    try {
        // First try to save to Firebase if the user is logged in
        if (auth.currentUser) {
            await storageManager.saveOrder({
                ...order,
                userId: auth.currentUser.uid,
                items: [{ id: order.item.id, name: order.item.name, quantity: order.quantity, price: order.item.price }],
                total: order.item.price * order.quantity
            });
        }
        
        // Also save to localStorage as backup
        const orders = getOrders();
        orders.push(order);
        localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
    } catch (error) {
        console.error('Error saving order:', error);
        // Fallback to localStorage only
        const orders = getOrders();
        orders.push(order);
        localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
    }
}

/**
 * Get all orders from localStorage
 * @returns {Array} - Array of orders
 */
function getOrders() {
    return JSON.parse(localStorage.getItem('campus_cafe_orders')) || [];
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

// Initialize menu page
document.addEventListener('DOMContentLoaded', () => {
    // Show loading state
    if (menuContainer) {
        menuContainer.innerHTML = `
            <div class="loader"></div>
        `;
    }
    
    // Auth state listener to ensure proper initialization
    auth.onAuthStateChanged((user) => {
        console.log("Auth state changed:", user ? "User logged in" : "User not logged in");
        // Initialize the page regardless of login state - we'll show all items even to non-logged in users
        initMenuPage();
    });
});