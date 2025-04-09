/**
 * Navigation and Auth State Management Utils for Campus Cafe
 */

import { auth } from './firebase.js';
import storageManager from './storage.js';

// Export the navigation manager
export const navigationManager = {
    /**
     * Initialize navigation and auth listeners
     */
    init() {
        this.setupMobileNav();
        this.setupUserState();
        this.setupLogout();
        this.setupCartBadge();
        this.listenForAuthChanges();
    },
    
    /**
     * Setup mobile navigation
     */
    setupMobileNav() {
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (mobileNavToggle && mainNav) {
            // Toggle menu on button click
            mobileNavToggle.addEventListener('click', () => {
                mainNav.classList.toggle('active');
                document.body.classList.toggle('menu-open');
                
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
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (mainNav.classList.contains('active') && 
                    !e.target.closest('.mobile-nav-toggle') && 
                    !e.target.closest('.main-nav')) {
                    
                    mainNav.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    
                    const icon = mobileNavToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
            
            // Close menu when pressing Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    
                    const icon = mobileNavToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        }
    },
    
    /**
     * Set up user state based on local storage
     */
    setupUserState() {
        const user = storageManager.getAuthenticatedUser();
        if (user) {
            this.updateUserStatus(user);
        }
    },
    
    /**
     * Setup logout functionality
     */
    setupLogout() {
        const logoutLink = document.querySelector('.logout-link');
        
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Sign out from Firebase
                auth.signOut().then(() => {
                    // Clear local user data
                    storageManager.clearAuthData();
                    
                    // Update UI for logged out state
                    this.updateUserStatus(null);
                    
                    // Redirect to home page after logout
                    window.location.href = 'index.html';
                }).catch(error => {
                    console.error('Logout error:', error);
                    alert('Failed to log out. Please try again.');
                });
            });
        }
    },
    
    /**
     * Setup cart badge from local storage
     */
    setupCartBadge() {
        const cartData = JSON.parse(localStorage.getItem('campus_cafe_cart'));
        const badges = document.querySelectorAll('.cart-badge');
        
        if (cartData && badges) {
            badges.forEach(badge => {
                badge.textContent = cartData.totalItems || 0;
            });
        }
    },
    
    /**
     * Listen for auth state changes
     */
    listenForAuthChanges() {
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in
                storageManager.saveAuthenticatedUser(user);
                this.updateUserStatus(user);
                
                // Create or update user profile if needed
                this.createUserProfile(user);
            } else {
                // User is signed out
                storageManager.clearAuthData();
                this.updateUserStatus(null);
            }
        });
    },
    
    /**
     * Create user profile in header
     * @param {Object} user - Firebase auth user
     */
    createUserProfile(user) {
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
                    alert('Error signing out. Please try again.');
                });
            });
        }
    },
    
    /**
     * Update navigation items based on user login status
     * @param {Object} user - Firebase auth user
     */
    updateUserStatus(user) {
        const loginLink = document.querySelector('.login-link');
        const logoutLink = document.querySelector('.logout-link');
        const userDisplay = document.querySelector('.user-display');
        const ordersLink = document.querySelector('a[href="orders.html"]');
        
        if (user) {
            // User is logged in
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'inline-flex';
            if (ordersLink) ordersLink.style.display = 'flex';
            
            // Display user name if available
            if (userDisplay) {
                const displayName = user.displayName || user.email.split('@')[0] || 'User';
                userDisplay.textContent = displayName;
                userDisplay.style.display = 'inline-block';
            }
        } else {
            // User is logged out
            if (loginLink) loginLink.style.display = 'inline-flex';
            if (logoutLink) logoutLink.style.display = 'none';
            if (userDisplay) userDisplay.style.display = 'none';
        }
    }
};

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    navigationManager.init();
}); 