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
            try {
                this.cart = JSON.parse(savedCart);
            } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
                this.resetCart();
            }
        } else {
            this.resetCart();
        }
        
        // Ensure cart structure is valid
        if (!this.cart || typeof this.cart !== 'object') {
            this.resetCart();
        }
        
        // Ensure items array exists
        if (!Array.isArray(this.cart.items)) {
            this.cart.items = [];
        }
        
        this.updateCartBadge();
    },

    // Helper method to reset cart to initial state
    resetCart() {
        this.cart = {
            items: [],
            totalAmount: 0,
            totalItems: 0
        };
    },

    // Add item to cart
    addItem(item, quantity = 1, specialInstructions = '') {
        // Ensure item is valid
        if (!item || !item.id) {
            console.error('Invalid item passed to addItem:', item);
            return;
        }
        
        // Ensure cart and items array exist
        if (!this.cart) {
            this.resetCart();
        }
        
        if (!Array.isArray(this.cart.items)) {
            this.cart.items = [];
        }
        
        const existingItem = this.cart.items.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
        } else {
            // Ensure item has valid price
            const price = typeof item.price === 'number' ? item.price : 0;
            
            this.cart.items.push({
                id: item.id,
                name: item.name || 'Unknown Item',
                quantity: quantity,
                unitPrice: price,
                subtotal: price * quantity,
                specialInstructions: specialInstructions
            });
        }

        this.updateCart();
    },

    // Remove item from cart
    removeItem(itemId) {
        if (!this.cart || !Array.isArray(this.cart.items)) {
            this.resetCart();
            return;
        }
        
        this.cart.items = this.cart.items.filter(item => item.id !== itemId);
        this.updateCart();
    },

    // Update item quantity
    updateQuantity(itemId, quantity) {
        if (!this.cart || !Array.isArray(this.cart.items)) {
            this.resetCart();
            return;
        }
        
        const item = this.cart.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity;
            item.subtotal = item.quantity * item.unitPrice;
            this.updateCart();
        }
    },

    // Update special instructions
    updateSpecialInstructions(itemId, instructions) {
        if (!this.cart || !Array.isArray(this.cart.items)) {
            this.resetCart();
            return;
        }
        
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
        if (!this.cart) {
            this.resetCart();
        }
        
        if (!Array.isArray(this.cart.items)) {
            this.cart.items = [];
        }
        
        try {
            this.cart.totalItems = this.cart.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
            this.cart.totalAmount = this.cart.items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
            
            localStorage.setItem('campus_cafe_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error updating cart:', error);
            this.resetCart();
        }
        
        this.updateCartBadge();
    },

    // Update cart badge across all pages
    updateCartBadge() {
        try {
            const badges = document.querySelectorAll('.cart-badge');
            const itemCount = this.cart && typeof this.cart.totalItems === 'number' ? this.cart.totalItems : 0;
            
            badges.forEach(badge => {
                badge.textContent = itemCount;
            });
        } catch (error) {
            console.error('Error updating cart badge:', error);
        }
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
    
    // Listen for storage events to update cart badge across tabs
    window.addEventListener('storage', (event) => {
        if (event.key === 'campus_cafe_cart') {
            cartManager.init(); // Reinitialize cart from localStorage
        }
    });
}); 