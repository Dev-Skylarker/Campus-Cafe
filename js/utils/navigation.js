/**
 * Navigation Utility for Campus Cafe
 * Ensures consistent navigation across all pages
 */

import { auth } from './firebase.js';

export const navigationManager = {
    /**
     * Initialize the navigation 
     */
    init() {
        this.updateNavigation();
        this.setupMobileNav();
        this.setupLogout();
        this.setupMobileMenuClosing();
        
        // Listen for auth state changes to update user-specific menu items
        auth.onAuthStateChanged(user => {
            this.updateUserStatus(user);
        });
    },
    
    /**
     * Setup mobile navigation toggle
     */
    setupMobileNav() {
        const mobileMenuToggle = document.querySelector('.mobile-nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        const body = document.body;
        
        // Function to toggle mobile menu
        function toggleMobileMenu() {
            mainNav.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Toggle between hamburger and close icon
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                if (mainNav.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
        
        // Handle touch events for mobile devices
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('touchstart', (e) => {
                e.preventDefault();
                toggleMobileMenu();
            }, { passive: false });
            
            // Click event for desktop
            mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMobileMenu();
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mainNav && mainNav.classList.contains('active') && 
                !mainNav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                toggleMobileMenu();
            }
        });
        
        // Close menu with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav && mainNav.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
        
        // Close menu when clicking on navigation links
        const navLinks = mainNav ? mainNav.querySelectorAll('a') : [];
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768 && mainNav.classList.contains('active')) {
                    toggleMobileMenu();
                }
            });
        });
    },
    
    /**
     * Setup functionality to close mobile menu when clicking outside
     */
    setupMobileMenuClosing() {
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const mainNav = document.querySelector('.main-nav');
            const mobileToggle = document.querySelector('.mobile-nav-toggle');
            
            if (mainNav && mainNav.classList.contains('active')) {
                // If click is outside the nav and the toggle button
                if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
                    mainNav.classList.remove('active');
                    
                    // Reset icon
                    const icon = mobileToggle.querySelector('i');
                    if (icon && icon.classList.contains('fa-times')) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
        
        // Close menu on resize to desktop
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768) {
                    const mainNav = document.querySelector('.main-nav');
                    if (mainNav && mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                        
                        // Reset icon
                        const mobileToggle = document.querySelector('.mobile-nav-toggle');
                        if (mobileToggle) {
                            const icon = mobileToggle.querySelector('i');
                            if (icon && icon.classList.contains('fa-times')) {
                                icon.classList.remove('fa-times');
                                icon.classList.add('fa-bars');
                            }
                        }
                    }
                }
            }, 250); // Debounce resize events
        });
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
     * Update navigation based on current page
     */
    updateNavigation() {
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index.html';
        
        // Find all nav links
        const navLinks = document.querySelectorAll('.main-nav a');
        
        // Remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current page link
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === pageName || 
                (pageName === 'index.html' && (href === '/' || href === 'index.html' || href === ''))) {
                link.classList.add('active');
            }
        });
    },
    
    /**
     * Update navigation items based on user login status
     * @param {Object} user - Firebase auth user
     */
    updateUserStatus(user) {
        const loginLink = document.querySelector('.login-link');
        const logoutLink = document.querySelector('.logout-link');
        const ordersLink = document.querySelector('a[href="orders.html"]');
        const userDisplay = document.querySelector('.user-display');
        
        if (user) {
            // User is logged in
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'block';
            if (ordersLink) ordersLink.style.display = 'block';
            
            // Display user name if available
            if (userDisplay) {
                const displayName = user.displayName || user.email || 'User';
                userDisplay.textContent = displayName;
                userDisplay.style.display = 'block';
            }
        } else {
            // User is logged out
            if (loginLink) loginLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'none';
            if (userDisplay) userDisplay.style.display = 'none';
        }
    }
};

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    navigationManager.init();
}); 