/**
 * Currency formatting utilities
 * Provides consistent currency formatting across the Campus Cafe application
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (default: 'KES')
 * @param {string} locale - The locale to use for formatting (default: 'en-KE')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = 'KES', locale = 'en-KE') {
    // Handle null, undefined, or NaN values
    if (amount === null || amount === undefined || isNaN(amount)) {
        amount = 0;
    }
    
    // For KES, use a simple string format rather than Intl formatter
    // to avoid currency symbol issues
    if (currencyCode === 'KES') {
        return `KSH ${amount.toFixed(2)}`;
    }
    
    // For other currencies, use Intl formatter
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Parse a currency string to a number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} The parsed number
 */
export function parseCurrency(currencyString) {
    if (!currencyString) return 0;
    
    // Remove currency symbols and thousands separators
    const numericString = currencyString.replace(/[^\d.-]/g, '');
    
    // Parse the string to a number
    const amount = parseFloat(numericString);
    
    // Return 0 if the result is NaN
    return isNaN(amount) ? 0 : amount;
}

/**
 * Calculate subtotal from item quantities and prices
 * @param {Object} items - Object of items with quantities and prices
 * @returns {number} The calculated subtotal
 */
export function calculateSubtotal(items) {
    if (!items || typeof items !== 'object') return 0;
    
    return Object.values(items).reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + (price * quantity);
    }, 0);
}

/**
 * Calculate tax amount
 * @param {number} subtotal - The subtotal to calculate tax from
 * @param {number} taxRate - The tax rate as a percentage (default: 8.875)
 * @returns {number} The calculated tax amount
 */
export function calculateTax(subtotal, taxRate = 8.875) {
    if (subtotal === null || subtotal === undefined || isNaN(subtotal)) {
        subtotal = 0;
    }
    
    return subtotal * (taxRate / 100);
}

/**
 * Calculate total with tax
 * @param {number} subtotal - The subtotal amount
 * @param {number} taxRate - The tax rate as a percentage (default: 8.875)
 * @returns {number} The total including tax
 */
export function calculateTotal(subtotal, taxRate = 8.875) {
    const tax = calculateTax(subtotal, taxRate);
    return subtotal + tax;
}

/**
 * Format price for display in menu items
 * (Simplified version of formatCurrency for menu items)
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
    return formatCurrency(price);
}

const currencies = {
    KES: { symbol: 'KSH', rate: 1 }
};

const currencyUtil = {
    currentCurrency: 'KES',

    formatPrice(amount, currency = this.currentCurrency) {
        const { symbol, rate } = currencies[currency];
        const convertedAmount = amount * rate;
        return `${symbol} ${convertedAmount.toFixed(2)}`;
    },

    switchCurrency(newCurrency) {
        if (currencies[newCurrency]) {
            this.currentCurrency = newCurrency;
            localStorage.setItem('preferredCurrency', newCurrency);
            return true;
        }
        return false;
    },

    initialize() {
        const saved = localStorage.getItem('preferredCurrency');
        if (saved && currencies[saved]) {
            this.currentCurrency = saved;
        }
    }
};

currencyUtil.initialize();
