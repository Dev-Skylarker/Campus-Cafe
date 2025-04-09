/**
 * Cart Management Utility for Campus Cafe
 */

// Convert to a named export
export const cartManager = {
    // Cart data structure
    cart: {
        items: [],
        totalAmount: 0,
        totalItems: 0
    },

    // Initialize cart from localStorage
    init() {
        const savedCart = localStorage.getItem('campus_cafe_cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartBadge();
        }
    },

    // Add item to cart
    addItem(item, quantity = 1, specialInstructions = '') {
        const existingItem = this.cart.items.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
        } else {
            this.cart.items.push({
                id: item.id,
                name: item.name,
                quantity: quantity,
                unitPrice: item.price, // Price is already in KSH
                subtotal: item.price * quantity,
                specialInstructions: specialInstructions
            });
        }

        this.updateCart();
    },

    // Remove item from cart
    removeItem(itemId) {
        this.cart.items = this.cart.items.filter(item => item.id !== itemId);
        this.updateCart();
    },

    // Update item quantity
    updateQuantity(itemId, quantity) {
        const item = this.cart.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity;
            item.subtotal = item.quantity * item.unitPrice;
            this.updateCart();
        }
    },

    // Update special instructions
    updateSpecialInstructions(itemId, instructions) {
        const item = this.cart.items.find(item => item.id === itemId);
        if (item) {
            item.specialInstructions = instructions;
            this.updateCart();
        }
    },

    // Clear cart
    clearCart() {
        this.cart = {
            items: [],
            totalAmount: 0,
            totalItems: 0
        };
        this.updateCart();
    },

    // Update cart totals and save to localStorage
    updateCart() {
        this.cart.totalItems = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cart.totalAmount = this.cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        
        localStorage.setItem('campus_cafe_cart', JSON.stringify(this.cart));
        this.updateCartBadge();
    },

    // Update cart badge across all pages
    updateCartBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.textContent = this.cart.totalItems;
        });
    },

    // Get cart contents
    getCart() {
        return this.cart;
    },

    // Check if cart is empty
    isEmpty() {
        return this.cart.items.length === 0;
    }
};

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    cartManager.init();
}); 