/**
 * Admin Header Component
 * Creates and manages the admin header across all admin pages
 */

const AdminHeader = (function() {
    // Cache DOM elements
    let headerContainer;
    let sidebarContainer;
    let mobileMenuToggle;
    let adminNameElement;
    let logoutBtn;
    let footerLogoutBtn;
    let themeToggle;
    
    /**
     * Initialize the admin header
     * @param {Object} options - Configuration options
     * @param {string} options.currentPage - The current page name (dashboard, menu, etc.)
     */
    function init(options = {}) {
        const currentUser = authManager.getCurrentUser();
        
        // Redirect to login if not authenticated (except on login page)
        if (!currentUser && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }
        
        // Only initialize if we're on an admin page
        if (document.querySelector('.admin-wrapper')) {
            renderAdminUI(options, currentUser);
        }
    }
    
    /**
     * Render admin UI components
     * @param {Object} options - Configuration options
     * @param {Object} currentUser - The current user object
     */
    function renderAdminUI(options, currentUser) {
        setupSidebar(options.currentPage);
        setupHeader(currentUser);
        setupFooter();
        setupEventListeners();
    }
    
    /**
     * Set up the sidebar navigation
     * @param {string} currentPage - The current page name
     */
    function setupSidebar(currentPage) {
        sidebarContainer = document.querySelector('.admin-sidebar');
        
        // Set active menu item based on current page
        if (currentPage && sidebarContainer) {
            const menuItems = sidebarContainer.querySelectorAll('.sidebar-menu li');
            
            menuItems.forEach(item => {
                item.classList.remove('active');
                const link = item.querySelector('a');
                
                if (link && link.getAttribute('href') && link.getAttribute('href').includes(currentPage)) {
                    item.classList.add('active');
                }
            });
        }
    }
    
    /**
     * Set up the admin header
     * @param {Object} currentUser - The current user object
     */
    function setupHeader(currentUser) {
        headerContainer = document.querySelector('.admin-header');
        
        if (headerContainer) {
            adminNameElement = headerContainer.querySelector('#admin-name');
            mobileMenuToggle = headerContainer.querySelector('#mobile-menu-toggle');
            
            // Set admin name
            if (adminNameElement && currentUser) {
                adminNameElement.textContent = currentUser.username || 'Admin';
            }
        }
    }
    
    /**
     * Set up the admin footer
     */
    function setupFooter() {
        const footerContainer = document.querySelector('.admin-footer');
        
        if (footerContainer) {
            footerLogoutBtn = footerContainer.querySelector('#footer-logout-btn');
        }
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Mobile menu toggle
        if (mobileMenuToggle && sidebarContainer) {
            mobileMenuToggle.addEventListener('click', function() {
                sidebarContainer.classList.toggle('active');
            });
        }
        
        // Logout button in sidebar
        logoutBtn = document.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                authManager.logout();
                window.location.href = 'login.html';
            });
        }
        
        // Logout button in footer
        if (footerLogoutBtn) {
            footerLogoutBtn.addEventListener('click', function() {
                authManager.logout();
                window.location.href = 'login.html';
            });
        }
        
        // Theme toggle
        themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                document.body.classList.toggle('dark-mode');
                document.body.classList.toggle('light-mode');
                
                const isDarkMode = document.body.classList.contains('dark-mode');
                localStorage.setItem('dark_mode', isDarkMode);
                
                // Toggle icon
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-moon');
                icon.classList.toggle('fa-sun');
            });
            
            // Set initial theme icon
            const isDarkMode = document.body.classList.contains('dark-mode');
            const icon = themeToggle.querySelector('i');
            
            if (isDarkMode && icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    }
    
    // Public API
    return {
        init
    };
})(); 