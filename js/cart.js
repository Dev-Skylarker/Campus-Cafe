/**
 * Cart Page JavaScript for Campus Cafe
 */

import { navigationManager } from './utils/navigation.js';
import { cartManager } from './utils/cart.js';

// DOM Elements
const cartItemsContainer = document.getElementById('cartItemsContainer');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const subtotalElement = document.getElementById('subtotal');
const totalItemsElement = document.getElementById('totalItems');
const totalElement = document.getElementById('total');
const collectionTimeSelect = document.getElementById('collectionTime');
const collectionLocationSelect = document.getElementById('collectionLocation');
const customerNameInput = document.getElementById('customerName');
const customerPhoneInput = document.getElementById('customerPhone');
const specialInstructionsTextarea = document.getElementById('specialInstructions');
const checkoutButton = document.getElementById('checkoutButton');

/**
 * Initialize the cart page
 */
function initCart() {
    loadCartItems();
    loadCollectionTimeSlots();
    updateCartSummary();
    
    // Add event listener to checkout button
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }
}

/**
 * Load and display cart items
 */
function loadCartItems() {
    if (!cartItemsContainer || !emptyCartMessage) return;
    
    const cart = cartManager.getCart();
    
    // Show empty cart message if cart is empty
    if (cartManager.isEmpty()) {
        cartItemsContainer.style.display = 'none';
        emptyCartMessage.style.display = 'flex';
        return;
    }
    
    // Hide empty cart message and show cart items
    emptyCartMessage.style.display = 'none';
    cartItemsContainer.style.display = 'block';
    
    // Clear container
    cartItemsContainer.innerHTML = '';
    
    // Add each item to the cart display
    cart.items.forEach(item => {
        const cartItemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItemElement);
    });
}

/**
 * Create a cart item element
 * @param {Object} item - Cart item
 * @returns {HTMLElement} - Cart item element
 */
function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.dataset.id = item.id;
    
    cartItem.innerHTML = `
        <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p class="cart-item-price">KSH ${item.unitPrice.toFixed(2)}</p>
            ${item.specialInstructions ? `
                <p class="cart-item-instructions">${item.specialInstructions}</p>
            ` : ''}
        </div>
        <div class="cart-item-actions">
            <div class="quantity-control">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
            </div>
            <p class="cart-item-subtotal">KSH ${item.subtotal.toFixed(2)}</p>
            <button class="remove-item-btn" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    const decreaseBtn = cartItem.querySelector('.decrease');
    const increaseBtn = cartItem.querySelector('.increase');
    const removeBtn = cartItem.querySelector('.remove-item-btn');
    
    decreaseBtn.addEventListener('click', () => {
        if (item.quantity > 1) {
            cartManager.updateQuantity(item.id, item.quantity - 1);
            loadCartItems();
            updateCartSummary();
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        cartManager.updateQuantity(item.id, item.quantity + 1);
        loadCartItems();
        updateCartSummary();
    });
    
    removeBtn.addEventListener('click', () => {
        cartManager.removeItem(item.id);
        loadCartItems();
        updateCartSummary();
    });
    
    return cartItem;
}

/**
 * Update the cart summary (total items, subtotal, total)
 */
function updateCartSummary() {
    const cart = cartManager.getCart();
    
    if (totalItemsElement) {
        totalItemsElement.textContent = cart.totalItems;
    }
    
    if (subtotalElement) {
        subtotalElement.textContent = `KSH ${cart.totalAmount.toFixed(2)}`;
    }
    
    if (totalElement) {
        totalElement.textContent = `KSH ${cart.totalAmount.toFixed(2)}`;
    }
    
    // If checkout button exists, disable it if cart is empty
    if (checkoutButton) {
        checkoutButton.disabled = cartManager.isEmpty();
    }
}

/**
 * Load collection time slots
 */
function loadCollectionTimeSlots() {
    if (!collectionTimeSelect) return;
    
    // Clear existing options except the default
    while (collectionTimeSelect.options.length > 1) {
        collectionTimeSelect.remove(1);
    }
    
    // Generate time slots from 30 minutes from now, every 15 minutes until closing time
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    startTime.setMinutes(Math.ceil(startTime.getMinutes() / 15) * 15); // Round to next 15-minute interval
    
    const closingTime = new Date(now);
    closingTime.setHours(20, 0, 0); // Closing time at 8:00 PM
    
    // If current time is past closing time, use tomorrow's times
    if (now.getHours() >= 20) {
        closingTime.setDate(closingTime.getDate() + 1);
        startTime.setDate(startTime.getDate() + 1);
        startTime.setHours(8, 0, 0); // Opening time at 8:00 AM
    }
    
    // Generate time slots
    for (let time = startTime; time <= closingTime; time = new Date(time.getTime() + 15 * 60000)) {
        const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const option = document.createElement('option');
        option.value = timeString;
        option.textContent = timeString;
        collectionTimeSelect.appendChild(option);
    }
}

/**
 * Handle checkout process
 */
function handleCheckout() {
    if (cartManager.isEmpty()) {
        alert('Your cart is empty. Please add items before checkout.');
        return;
    }
    
    // Validate required fields
    if (!customerNameInput.value.trim()) {
        alert('Please enter your name.');
        customerNameInput.focus();
        return;
    }
    
    if (!customerPhoneInput.value.trim()) {
        alert('Please enter your phone number.');
        customerPhoneInput.focus();
        return;
    }
    
    // Validate collection time
    if (!collectionTimeSelect.value) {
        alert('Please select a collection time.');
        collectionTimeSelect.focus();
        return;
    }
    
    // Validate collection location
    if (!collectionLocationSelect.value) {
        alert('Please select where you want to collect your order.');
        collectionLocationSelect.focus();
        return;
    }
    
    // Get cart data
    const cart = cartManager.getCart();
    
    // Create order object
    const order = {
        id: generateOrderId(),
        date: new Date().toISOString(),
        customerName: customerNameInput.value.trim(),
        customerPhone: customerPhoneInput.value.trim(),
        items: cart.items,
        total: cart.totalAmount,
        collectionTime: collectionTimeSelect.value,
        collectionLocation: collectionLocationSelect.value,
        specialInstructions: specialInstructionsTextarea ? specialInstructionsTextarea.value : '',
        status: 'pending'
    };
    
    // Save order to storage
    saveOrder(order);
    
    // Clear cart
    cartManager.clearCart();
    
    // Show confirmation and redirect
    showOrderConfirmation(order);
}

/**
 * Generate a unique order ID
 * @returns {string} - Order ID
 */
function generateOrderId() {
    return 'ORD' + Math.floor(Math.random() * 900000 + 100000);
}

/**
 * Save order to localStorage
 * @param {Object} order - Order data
 */
function saveOrder(order) {
    // Get existing orders
    const orders = JSON.parse(localStorage.getItem('campus_cafe_orders') || '[]');
    
    // Add new order
    orders.push(order);
    
    // Save to localStorage
    localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
}

/**
 * Show order confirmation after successful checkout
 * @param {Object} order - The order that was placed
 */
function showOrderConfirmation(order) {
    // Create confirmation modal if it doesn't exist
    let confirmationModal = document.getElementById('order-confirmation-modal');
    if (!confirmationModal) {
        confirmationModal = document.createElement('div');
        confirmationModal.id = 'order-confirmation-modal';
        confirmationModal.className = 'modal';
        document.body.appendChild(confirmationModal);
    }
    
    // Build confirmation content
    confirmationModal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-body text-center">
                <i class="fas fa-check-circle success-icon"></i>
                <h2>Order Placed Successfully!</h2>
                <p>Thank you, ${order.customerName}!</p>
                <p>Your order #${order.id} has been placed and will be ready for collection at ${formatCollectionTime(order.collectionTime)}.</p>
                <p><strong>Collection Location:</strong> ${formatCollectionLocation(order.collectionLocation)}</p>
                <div class="order-status-link">
                    <p>Track your order status in real-time:</p>
                    <a href="orders.html?order=${order.id}" class="btn btn-primary order-status-btn">
                        <i class="fas fa-clipboard-check"></i> View Order Status
                    </a>
                </div>
                <div class="order-confirmation-actions">
                    <a href="menu.html" class="btn btn-secondary">Continue Shopping</a>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners to the modal
    const closeBtn = confirmationModal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
        window.location.href = 'orders.html?order=' + order.id;
    });
    
    // Show modal
    confirmationModal.style.display = 'block';
    
    // Add click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            confirmationModal.style.display = 'none';
            window.location.href = 'orders.html?order=' + order.id;
        }
    });
}

/**
 * Format collection location for display
 * @param {string} location - Collection location code
 * @returns {string} - Formatted location
 */
function formatCollectionLocation(location) {
    if (location.startsWith('counter-')) {
        return `Counter ${location.split('-')[1]}`;
    } else if (location.startsWith('table-')) {
        return `Table ${location.split('-')[1].toUpperCase()}`;
    }
    return location;
}

/**
 * Format collection time for display
 * @param {string} time - Collection time value
 * @returns {string} - Formatted time
 */
function formatCollectionTime(time) {
    try {
        // Try to parse the time value
        if (time.includes(':')) {
            // It's already a time string like "12:30"
            return time;
        } else {
            // It might be a timestamp, try to format it
            const date = new Date(time);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    } catch (error) {
        // Just return the original value if there's an error
        return time;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    navigationManager.init();
    
    // Initialize cart
    initCart();
}); 