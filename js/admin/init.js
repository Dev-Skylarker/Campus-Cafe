/**
 * Admin System Initialization - Updated Version
 * This file now handles authentication with our improved system
 */

import { auth } from '../utils/firebase.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Determine which page we're on
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    // Initialize theme based on localStorage
    const isDarkMode = localStorage.getItem('dark_mode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        
        // Update theme toggle icon if it exists
        const themeToggle = document.querySelector('.theme-toggle i');
        if (themeToggle) {
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        }
    }
    
    // Skip auth check for login page
    if (page === 'login.html') return;
    
    // Check if user is authenticated (using our enhanced system)
    const forcedAdminAuth = localStorage.getItem('forced_admin_auth') === 'true';
    const adminSession = JSON.parse(localStorage.getItem('admin_session') || '{}');
    const hasValidSession = adminSession.email && 
                           adminSession.isAdmin === true && 
                           (Date.now() - adminSession.timestamp) < (24 * 60 * 60 * 1000);
    
    // Verify authentication
    if (!forcedAdminAuth && !hasValidSession) {
        // If Firebase auth is available, check that too
        auth.onAuthStateChanged((user) => {
            if (!user || user.email !== adminSession.email) {
                // Redirect to login page
                window.location.href = 'login.html?error=auth';
            }
        });
    }
    
    console.log('Admin init script complete!');
}); 