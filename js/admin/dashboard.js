/**
 * Admin Dashboard JavaScript for Campus Cafe
 */

import { database, auth } from '../utils/firebase.js';
import storageManager from '../utils/storage.js';

// DOM Elements
const totalMenuItemsEl = document.getElementById('total-menu-items');
const totalOrdersEl = document.getElementById('total-orders');
const totalFeaturedEl = document.getElementById('total-featured');
const totalUsersEl = document.getElementById('total-users');
const recentOrdersBody = document.getElementById('recent-orders-body');
const noOrdersMessage = document.getElementById('no-orders-message');
const adminNameEl = document.getElementById('admin-name');
const logoutBtn = document.getElementById('logout-btn');
const footerLogoutBtn = document.getElementById('footer-logout-btn');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const categoryStats = document.querySelectorAll('.category-stat');

// Check if user is authenticated when the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
});

/**
 * Check if user is authenticated as admin
 */
function checkAdminAuth() {
    auth.onAuthStateChanged((user) => {
        // Check for forced admin authentication (from login-fix)
        const forcedAdminAuth = localStorage.getItem('forced_admin_auth');
        if (forcedAdminAuth === 'true') {
            console.log('Using forced admin authentication on dashboard');
            initDashboard();
            return;
        }
        
        if (user) {
            // Check if user has admin privileges
            const adminSession = JSON.parse(localStorage.getItem('admin_session') || '{}');
            if (adminSession.email === user.email && adminSession.isAdmin) {
                // User is authenticated as admin
                initDashboard();
                
                // Refresh the admin session timestamp
                adminSession.timestamp = Date.now();
                localStorage.setItem('admin_session', JSON.stringify(adminSession));
            } else {
                // User is authenticated but not as admin
                console.error('User is not authorized as admin');
                showUnauthorizedMessage();
            }
        } else {
            // Check for fallback admin session
            const adminSession = JSON.parse(localStorage.getItem('admin_session') || '{}');
            if (adminSession.email === 'campuscafe@embuni.ac.ke' && adminSession.isAdmin) {
                console.log('Using fallback admin session');
                // Set the forced admin auth flag
                localStorage.setItem('forced_admin_auth', 'true');
                initDashboard();
                return;
            }
            
            // User is not authenticated, redirect to login
            window.location.href = 'login.html?error=session_expired';
        }
    });
}

/**
 * Show unauthorized message
 */
function showUnauthorizedMessage() {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-container';
    errorDiv.innerHTML = `
        <div class="error-message">
            <h2>Unauthorized Access</h2>
            <p>You don't have permission to access the admin dashboard.</p>
            <button id="unauthorized-logout" class="btn btn-primary">Return to Login</button>
        </div>
    `;
    
    // Clear page content and show error
    document.body.innerHTML = '';
    document.body.appendChild(errorDiv);
    
    // Add event listener to logout button
    document.getElementById('unauthorized-logout').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
}

/**
 * Initialize the dashboard page
 */
function initDashboard() {
    // Display admin name
    if (adminNameEl && auth.currentUser) {
        adminNameEl.textContent = auth.currentUser.email || 'Admin';
    }

    // Add event listeners
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (footerLogoutBtn) {
        footerLogoutBtn.addEventListener('click', handleLogout);
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Load dashboard data
    loadDashboardData();
    
    // Set up real-time order syncing
    setupOrderSyncing();
}

/**
 * Set up real-time order syncing
 */
function setupOrderSyncing() {
    try {
        // Listen for database changes
        const ordersRef = database.ref('orders');
        ordersRef.on('value', (snapshot) => {
            loadDashboardData();
        });
    } catch (error) {
        console.error('Error setting up order syncing:', error);
        showAlert('Error connecting to database. Some features may not work.', 'error');
    }
}

/**
 * Handle logout
 * @param {Event} e - Click event
 */
function handleLogout(e) {
    e.preventDefault();
    
    // Clear admin session from localStorage
    localStorage.removeItem('admin_session');
    
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
        // Force redirect even if signOut fails
        window.location.href = 'login.html';
    });
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('active');

    // Change icon based on menu state
    const icon = mobileMenuToggle.querySelector('i');
    if (sidebar.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

/**
 * Show alert message
 * @param {string} message - Message to display
 * @param {string} type - Alert type (success, error, warning)
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Add to top of container
    const mainContent = document.querySelector('.admin-content');
    if (mainContent) {
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
    } else {
        document.body.insertBefore(alertDiv, document.body.firstChild);
    }
    
    // Remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    try {
        // Get menu items
        const menuItems = await storageManager.getMenuItems();
        
        // Get orders
        const orders = await storageManager.getOrders();
        
        // Get users (fallback to count from orders if users collection doesn't exist)
        let userCount = 0;
        try {
            const usersSnapshot = await database.ref('users').once('value');
            const users = usersSnapshot.val() || {};
            userCount = Object.keys(users).length;
        } catch (error) {
            console.log('No users collection found, calculating from orders');
            // Count unique user IDs from orders
            const userIds = new Set();
            orders.forEach(order => {
                if (order.userId) {
                    userIds.add(order.userId);
                }
            });
            userCount = userIds.size;
        }
        
        updateStats(menuItems, orders, userCount);
        updateRecentOrders(orders);
        updateMenuStats(menuItems);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Error loading dashboard data. Please try again later.', 'error');
    }
}

/**
 * Update dashboard statistics
 * @param {Array} menuItems - Array of menu items
 * @param {Array} orders - Array of orders
 * @param {number} userCount - Count of registered users
 */
function updateStats(menuItems, orders, userCount) {
    if (totalMenuItemsEl) {
        totalMenuItemsEl.textContent = menuItems.length;
    }
    
    if (totalOrdersEl) {
        totalOrdersEl.textContent = orders.length;
    }
    
    if (totalFeaturedEl) {
        const featuredItems = menuItems.filter(item => item.featured);
        totalFeaturedEl.textContent = featuredItems.length;
    }
    
    if (totalUsersEl) {
        totalUsersEl.textContent = userCount;
    }
}

/**
 * Update recent orders table
 * @param {Array} orders - Array of orders
 */
function updateRecentOrders(orders) {
    if (!recentOrdersBody) return;
    
    // Clear existing rows
    recentOrdersBody.innerHTML = '';
    
    if (orders.length === 0) {
        if (noOrdersMessage) {
            noOrdersMessage.style.display = 'block';
        }
        return;
    }
    
    if (noOrdersMessage) {
        noOrdersMessage.style.display = 'none';
    }
    
    // Sort orders by timestamp (newest first)
    const sortedOrders = [...orders].sort((a, b) => {
        return (b.timestamp || 0) - (a.timestamp || 0);
    });
    
    // Display up to 10 most recent orders
    const recentOrders = sortedOrders.slice(0, 10);
    
    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        
        const timestamp = order.timestamp ? new Date(order.timestamp) : new Date();
        const formattedDate = timestamp.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Calculate total if not present
        let total = order.total;
        if (!total && order.items) {
            total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${formattedDate}</td>
            <td>${order.items ? order.items.length : 0} items</td>
            <td>KSH ${total ? total.toFixed(2) : '0.00'}</td>
            <td>
                <span class="status-badge ${order.status || 'pending'}">${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</span>
            </td>
            <td>
                <button class="btn btn-small view-order" data-id="${order.id}">View</button>
                <button class="btn btn-small update-status" data-id="${order.id}">Update</button>
            </td>
        `;
        
        recentOrdersBody.appendChild(row);
    });
    
    // Add event listeners to view and update buttons
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.dataset.id;
            viewOrderDetails(orderId);
        });
    });
    
    document.querySelectorAll('.update-status').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.dataset.id;
            showStatusUpdateModal(orderId);
        });
    });
}

/**
 * View order details
 * @param {string} orderId - Order ID
 */
function viewOrderDetails(orderId) {
    const orders = storageManager.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Create and show modal with order details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Order #${order.id}</h2>
            <div class="order-details">
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></p>
                <p><strong>Collection Time:</strong> ${order.collectionTime}</p>
                <p><strong>Total:</strong> KSH ${order.total.toFixed(2)}</p>
            </div>
            <div class="order-items">
                <h3>Items</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>KSH ${item.unitPrice.toFixed(2)}</td>
                                <td>KSH ${item.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${order.specialInstructions ? `
                <div class="special-instructions">
                    <h3>Special Instructions</h3>
                    <p>${order.specialInstructions}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';
    
    // Close modal when clicking the close button or outside the modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Show status update modal
 * @param {string} orderId - Order ID
 */
function showStatusUpdateModal(orderId) {
    const orders = storageManager.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Create and show modal with status update options
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Update Order Status</h2>
            <p>Order #${order.id}</p>
            <div class="status-options">
                <button class="status-btn ${order.status === 'pending' ? 'active' : ''}" data-status="pending">Pending</button>
                <button class="status-btn ${order.status === 'preparing' ? 'active' : ''}" data-status="preparing">Preparing</button>
                <button class="status-btn ${order.status === 'ready' ? 'active' : ''}" data-status="ready">Ready for Collection</button>
                <button class="status-btn ${order.status === 'completed' ? 'active' : ''}" data-status="completed">Completed</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';
    
    // Add event listeners to status buttons
    const statusBtns = modal.querySelectorAll('.status-btn');
    statusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const newStatus = btn.dataset.status;
            updateOrderStatus(orderId, newStatus);
            document.body.removeChild(modal);
        });
    });
    
    // Close modal when clicking the close button or outside the modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status
 */
function updateOrderStatus(orderId, newStatus) {
    const result = storageManager.updateOrderStatus(orderId, newStatus);
    
    if (result) {
        // Refresh dashboard data
        loadDashboardData();
        
        // Show success message
        alert(`Order #${orderId} status updated to ${newStatus}`);
    } else {
        alert('Error updating order status. Please try again.');
    }
}

/**
 * Update menu statistics
 * @param {Array} menuItems - Array of menu items
 */
function updateMenuStats(menuItems) {
    // Count items by category
    const categoryCounts = {};
    menuItems.forEach(item => {
        if (!categoryCounts[item.category]) {
            categoryCounts[item.category] = 0;
        }
        categoryCounts[item.category]++;
    });
    
    // Update category stats
    categoryStats.forEach(stat => {
        const category = stat.dataset.category;
        const count = categoryCounts[category] || 0;
        stat.textContent = count;
    });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Unsafe HTML string
 * @returns {string} - Escaped HTML string
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}