/**
 * Common Admin Functions and Components
 * 
 * This file contains shared functions and initialization code for all admin pages.
 */

import { auth } from '../utils/firebase.js';

// Export admin utilities
export const adminUtils = {
    /**
     * Check if current user is authenticated as admin
     * @returns {Promise<boolean>} True if user is admin
     */
    async checkAdminAuth() {
        // Check if we're in the admin login fix scenario - always allow
        const forcedAdminAuth = localStorage.getItem('forced_admin_auth');
        if (forcedAdminAuth === 'true') {
            console.log('Using forced admin authentication');
            return true;
        }
        
        // First check if Firebase auth is authenticated
        if (!auth.currentUser) {
            console.log('No Firebase user authenticated');
            return this.checkAdminSessionFallback();
        }
        
        // Then check if admin session exists in localStorage
        const adminSession = localStorage.getItem('admin_session');
        if (!adminSession) {
            console.log('No admin session found');
            return false;
        }
        
        try {
            const session = JSON.parse(adminSession);
            
            // Verify session email matches current user and has admin flag
            if (session.email === auth.currentUser.email && session.isAdmin === true) {
                // Check if session is expired (24 hours)
                const sessionTime = session.timestamp || 0;
                const currentTime = Date.now();
                const sessionAge = currentTime - sessionTime;
                
                // If session is older than 24 hours, consider it expired
                if (sessionAge > 24 * 60 * 60 * 1000) {
                    console.log('Admin session expired');
                    localStorage.removeItem('admin_session');
                    return false;
                }
                
                // Update timestamp to extend session
                session.timestamp = Date.now();
                localStorage.setItem('admin_session', JSON.stringify(session));
                
                return true;
            }
        } catch (e) {
            console.error('Error parsing admin session:', e);
        }
        
        return false;
    },
    
    /**
     * Fallback check for admin authentication when Firebase auth fails
     * @returns {boolean} True if admin session exists and is valid
     */
    checkAdminSessionFallback() {
        try {
            const adminSession = localStorage.getItem('admin_session');
            if (!adminSession) return false;
            
            const session = JSON.parse(adminSession);
            
            // Basic validation - must have email, isAdmin flag, and timestamp
            if (!session.email || session.isAdmin !== true || !session.timestamp) {
                return false;
            }
            
            // Check if default admin email
            const isDefaultAdmin = session.email === 'campuscafe@embuni.ac.ke';
            
            // Check if session is expired (24 hours for regular, 7 days for default admin)
            const maxAge = isDefaultAdmin ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
            const sessionAge = Date.now() - session.timestamp;
            
            // If session is older than allowed, consider it expired
            if (sessionAge > maxAge) {
                localStorage.removeItem('admin_session');
                return false;
            }
            
            // For default admin, set a flag to force authentication
            if (isDefaultAdmin) {
                localStorage.setItem('forced_admin_auth', 'true');
            }
            
            return true;
        } catch (e) {
            console.error('Error in admin session fallback check:', e);
            return false;
        }
    },
    
    /**
     * Initialize the current theme
     */
    initTheme() {
        // Check if dark mode is enabled in local storage
        const isDarkMode = localStorage.getItem('dark_mode') === 'true';
        
        // Set body class accordingly
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            
            // Update theme toggle icon if it exists
            const themeToggle = document.querySelector('.theme-toggle i');
            if (themeToggle) {
                themeToggle.classList.remove('fa-moon');
                themeToggle.classList.add('fa-sun');
            }
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
    },

    /**
     * Get the current page name from the URL
     * @returns {string} The current page name
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // Return page name without .html extension
        return filename.replace('.html', '');
    },
    
    /**
     * Initialize login page specific functionality
     */
    initLoginPage() {
        // Set up theme toggle on login page
        const themeToggle = document.querySelector('.theme-toggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                document.body.classList.toggle('dark-mode');
                document.body.classList.toggle('light-mode');
                
                const isDarkMode = document.body.classList.contains('dark-mode');
                localStorage.setItem('dark_mode', isDarkMode);
                
                // Toggle icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-moon');
                    icon.classList.toggle('fa-sun');
                }
            });
        }
        
        // Clear any existing admin session on login page
        localStorage.removeItem('admin_session');
        localStorage.removeItem('forced_admin_auth');
    }
};

// Initialization code
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize theme from local storage
    adminUtils.initTheme();
    
    // Check if we're on an admin page (not login)
    const isAdminPage = document.querySelector('.admin-wrapper');
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (isAdminPage) {
        // Check if user is authenticated as admin
        const isAdmin = await adminUtils.checkAdminAuth();
        if (!isAdmin) {
            // Redirect to login page if not admin
            window.location.href = 'login.html?error=auth';
            return;
        }
        
        // Get the current page name from the URL
        const currentPage = adminUtils.getCurrentPage();
        
        // Initialize components if they exist
        if (window.AdminHeader) {
            window.AdminHeader.init({ currentPage });
        }
        
        if (window.AdminFooter) {
            window.AdminFooter.init();
        }
    } else if (isLoginPage) {
        // Special handling for login page
        adminUtils.initLoginPage();
        
        // Show error message if redirected due to auth failure
        if (window.location.search.includes('error=auth')) {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = 'Admin authentication required';
                errorMessage.style.display = 'block';
            }
        }
    }
}); 