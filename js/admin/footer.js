/**
 * Admin Footer Component
 * Creates and manages the admin footer across all admin pages
 */

const AdminFooter = (function() {
    // Cache DOM elements
    let footerContainer;
    
    /**
     * Initialize the admin footer
     */
    function init() {
        // Only initialize if not already rendered and we're on an admin page
        if (!document.querySelector('.admin-footer') && document.querySelector('.admin-wrapper')) {
            renderFooter();
            setupEventListeners();
        }
    }
    
    /**
     * Render the admin footer
     */
    function renderFooter() {
        const mainContent = document.querySelector('.admin-content');
        
        if (!mainContent) return;
        
        // Create footer element
        const footer = document.createElement('footer');
        footer.className = 'admin-footer';
        
        // Set footer HTML
        footer.innerHTML = `
            <div class="container">
                <div class="footer-content">
                    <div class="copyright">
                        <p>&copy; ${new Date().getFullYear()} Campus Cafe. All rights reserved.</p>
                    </div>
                    <div class="footer-actions">
                        <a href="../index.html" class="btn btn-small">View Website</a>
                        <button id="footer-logout-btn" class="btn btn-small btn-danger">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Append footer to main content
        mainContent.appendChild(footer);
        
        // Cache footer container
        footerContainer = footer;
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        if (!footerContainer) return;
        
        const logoutBtn = footerContainer.querySelector('#footer-logout-btn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                // Check if authManager is available
                if (typeof authManager !== 'undefined') {
                    authManager.logout();
                } else {
                    // Fallback: clear localStorage
                    localStorage.removeItem('kenyan_delights_user');
                    localStorage.removeItem('kenyan_delights_token');
                }
                
                // Redirect to login page
                window.location.href = 'login.html';
            });
        }
    }
    
    // Public API
    return {
        init
    };
})(); 