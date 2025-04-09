/**
 * Orders Page JavaScript for Campus Cafe
 */

// DOM Elements
const ordersContainer = document.getElementById('ordersContainer');
const noOrdersMessage = document.getElementById('noOrdersMessage');
const orderTabs = document.querySelectorAll('.order-tab');

// Order status colors and icons
const STATUS_CONFIGS = {
    pending: {
        color: '#f2ae00',
        icon: 'fa-clock'
    },
    preparing: {
        color: '#0066cc',
        icon: 'fa-fire'
    },
    ready: {
        color: '#28a745',
        icon: 'fa-check-circle'
    },
    completed: {
        color: '#6c757d',
        icon: 'fa-check-double'
    }
};

/**
 * Initialize the orders page
 */
function initOrdersPage() {
    setupEventListeners();
    loadOrders('all'); // Load all orders initially
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Order tabs for filtering
    orderTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const status = tab.dataset.status;
            
            // Update active tab
            orderTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Load orders with selected status
            loadOrders(status);
        });
    });
}

/**
 * Load orders from localStorage
 * @param {string} statusFilter - Status to filter by ('all' for all orders)
 */
function loadOrders(statusFilter = 'all') {
    if (!ordersContainer || !noOrdersMessage) return;
    
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('campus_cafe_orders') || '[]');
    
    // Show no orders message if there are no orders
    if (orders.length === 0) {
        ordersContainer.innerHTML = '';
        noOrdersMessage.style.display = 'flex';
        return;
    }
    
    // Filter orders by status if not 'all'
    let filteredOrders = orders;
    if (statusFilter !== 'all') {
        filteredOrders = orders.filter(order => order.status === statusFilter);
    }
    
    // Show no orders message if there are no orders with the selected status
    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = '';
        noOrdersMessage.style.display = 'flex';
        return;
    }
    
    // Hide no orders message
    noOrdersMessage.style.display = 'none';
    
    // Sort orders by date (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear container and display orders
    ordersContainer.innerHTML = '';
    sortedOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

/**
 * Create an order card element
 * @param {Object} order - Order data
 * @returns {HTMLElement} - Order card element
 */
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.dataset.id = order.id;
    orderCard.dataset.status = order.status;
    
    // Get status config
    const statusConfig = STATUS_CONFIGS[order.status] || {
        color: '#6c757d',
        icon: 'fa-question-circle'
    };
    
    // Format date
    const date = new Date(order.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Calculate total items
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Format collection time if available
    let collectionTime = '';
    if (order.collectionTime) {
        collectionTime = order.collectionTime.includes(':') 
            ? order.collectionTime 
            : new Date(order.collectionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Get customer name
    const customerName = order.customerName || 'Guest';
    
    orderCard.innerHTML = `
        <div class="order-header">
            <h3>Order #${order.id}</h3>
            <div class="order-status" style="color: ${statusConfig.color}">
                <i class="fas ${statusConfig.icon}"></i>
                <span>${capitalizeFirstLetter(order.status)}</span>
            </div>
        </div>
        <div class="order-details">
            <p><i class="far fa-calendar"></i> ${formattedDate} at ${formattedTime}</p>
            <p><i class="far fa-user"></i> ${customerName}</p>
            <p><i class="fas fa-shopping-basket"></i> ${totalItems} item${totalItems !== 1 ? 's' : ''}</p>
            <p><i class="far fa-clock"></i> Collection: ${collectionTime}</p>
            ${order.collectionLocation ? `<p><i class="fas fa-map-marker-alt"></i> ${formatCollectionLocation(order.collectionLocation)}</p>` : ''}
            <p class="order-total"><i class="fas fa-money-bill-wave"></i> Total: KSH ${order.total.toFixed(2)}</p>
        </div>
        <div class="order-actions">
            <button class="btn btn-primary view-details-btn" data-id="${order.id}">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
    `;
    
    // Add event listener to view details button
    const viewDetailsBtn = orderCard.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', () => {
        showOrderDetails(order);
    });
    
    return orderCard;
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
 * Show order details in a modal
 * @param {Object} order - Order data
 */
function showOrderDetails(order) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Format dates
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Format collection time
    let collectionTime = 'Not specified';
    if (order.collectionTime) {
        collectionTime = order.collectionTime.includes(':') 
            ? order.collectionTime 
            : new Date(order.collectionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Get status config
    const statusConfig = STATUS_CONFIGS[order.status] || {
        color: '#6c757d',
        icon: 'fa-question-circle'
    };
    
    // Build modal content
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-body">
                <h2>Order Details #${order.id}</h2>
                
                <div class="order-status-large" style="color: ${statusConfig.color}">
                    <i class="fas ${statusConfig.icon} fa-2x"></i>
                    <span>${capitalizeFirstLetter(order.status)}</span>
                </div>
                
                <div class="order-info-grid">
                    <div class="order-info-section">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.customerName || 'Guest'}</p>
                        ${order.customerPhone ? `<p><strong>Phone:</strong> ${order.customerPhone}</p>` : ''}
                    </div>
                    
                    <div class="order-info-section">
                        <h3>Order Information</h3>
                        <p><strong>Order Date:</strong> ${formattedDate}</p>
                        <p><strong>Order Time:</strong> ${formattedTime}</p>
                        <p><strong>Collection Time:</strong> ${collectionTime}</p>
                        ${order.collectionLocation ? `<p><strong>Collection Location:</strong> ${formatCollectionLocation(order.collectionLocation)}</p>` : ''}
                    </div>
                </div>
                
                <h3>Order Items</h3>
                <table class="order-items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
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
                
                <div class="order-total-section">
                    <h3>Total: KSH ${order.total.toFixed(2)}</h3>
                </div>
                
                ${order.specialInstructions ? `
                    <div class="special-instructions">
                        <h3>Special Instructions</h3>
                        <p>${order.specialInstructions}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Add modal to the DOM
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';
    
    // Close modal when clicking the close button
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize orders page when DOM is loaded
document.addEventListener('DOMContentLoaded', initOrdersPage); 