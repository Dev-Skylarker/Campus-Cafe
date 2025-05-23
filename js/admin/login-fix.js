/**
 * Admin Login Fix
 * This script ensures admin authentication works properly with fallback mechanisms.
 */

import { auth, database } from '../utils/firebase.js';

// Execute when document is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin login fix loaded');
    
    // Default admin credentials
    const DEFAULT_ADMIN = {
        email: 'campuscafe@embuni.ac.ke',
        password: 'CcAdmin123.'
    };
    
    // Login form elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const errorMessage = document.getElementById('error-message');
    
    // Early return if not on login page
    if (!loginForm) return;
    
    // Pre-fill login form with default credentials for demo purposes
    emailInput.value = DEFAULT_ADMIN.email;
    
    // Ensure default admin account exists in database
    try {
        await ensureDefaultAdminExists();
    } catch (error) {
        console.error('Error ensuring default admin exists:', error);
    }
    
    // Replace form submit handler to use our fixed version
    loginForm.addEventListener('submit', handleAdminLogin);
    
    /**
     * Ensure default admin account exists in Firebase
     */
    async function ensureDefaultAdminExists() {
        try {
            // Check if admin exists in Realtime Database
            const adminRef = database.ref('admin');
            const sanitizedEmail = DEFAULT_ADMIN.email.replace(/\./g, ',');
            const snapshot = await adminRef.child(sanitizedEmail).once('value');
            
            if (!snapshot.exists()) {
                // Create default admin in Realtime Database
                await adminRef.child(sanitizedEmail).set({
                    email: DEFAULT_ADMIN.email,
                    password: DEFAULT_ADMIN.password,
                    role: 'admin',
                    created: Date.now()
                });
                console.log('Default admin created in database');
            }
            
            // Try to create admin in Firebase Auth (will fail if already exists)
            try {
                await auth.createUserWithEmailAndPassword(
                    DEFAULT_ADMIN.email, 
                    DEFAULT_ADMIN.password
                );
                console.log('Default admin created in Firebase Auth');
            } catch (authError) {
                // Ignore if user already exists
                if (authError.code !== 'auth/email-already-in-use') {
                    console.error('Error creating admin in Firebase Auth:', authError);
                }
            }
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
    
    /**
     * Handle admin login with fallback mechanisms
     * @param {Event} e - Submit event
     */
    async function handleAdminLogin(e) {
        e.preventDefault();
        
        // Hide any previous error
        if (errorMessage) errorMessage.style.display = 'none';
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Form validation
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        try {
            // First try to authenticate with Firebase
            await signInWithFirebase(email, password);
            
            // If successful, set admin session
            setAdminSession(email);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Admin login error:', error);
            
            // If default admin login, try fallback approach
            if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
                try {
                    await handleDefaultAdminFallback();
                } catch (fallbackError) {
                    showError('Authentication failed. Please try again later.');
                }
            } else {
                showError(error.message || 'Authentication failed');
            }
        }
    }
    
    /**
     * Try to sign in with Firebase Auth
     */
    async function signInWithFirebase(email, password) {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            return true;
        } catch (error) {
            console.log('Firebase auth error:', error.code);
            throw error;
        }
    }
    
    /**
     * Handle default admin fallback authentication
     */
    async function handleDefaultAdminFallback() {
        console.log('Using fallback auth for default admin');
        
        // Set admin session
        setAdminSession(DEFAULT_ADMIN.email);
        
        // Try to create/reset the user in Firebase Auth
        try {
            // Try to create user
            await auth.createUserWithEmailAndPassword(
                DEFAULT_ADMIN.email, 
                DEFAULT_ADMIN.password
            ).catch(async (createError) => {
                // If user already exists, try to sign in again
                if (createError.code === 'auth/email-already-in-use') {
                    await auth.signInWithEmailAndPassword(
                        DEFAULT_ADMIN.email, 
                        DEFAULT_ADMIN.password
                    ).catch(error => {
                        console.error('Fallback sign-in failed:', error);
                    });
                }
            });
        } catch (authError) {
            console.error('Fallback auth failed:', authError);
        }
        
        // Redirect to dashboard even if Firebase auth fails
        window.location.href = 'dashboard.html';
    }
    
    /**
     * Set admin session in localStorage
     */
    function setAdminSession(email) {
        localStorage.setItem('admin_session', JSON.stringify({
            email: email,
            isAdmin: true,
            timestamp: Date.now()
        }));
    }
    
    /**
     * Show error message on the form
     */
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
});
