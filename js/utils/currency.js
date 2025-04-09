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
