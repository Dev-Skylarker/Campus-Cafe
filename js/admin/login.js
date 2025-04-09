import { database, auth } from '../utils/firebase.js';
import storageManager from '../utils/storage.js';

/**
 * Admin Login Functionality
 */

document.addEventListener('DOMContentLoaded', async function() {
    // If user is already logged in, redirect to dashboard
    if (auth.currentUser) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Get form elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const errorMessage = document.getElementById('error-message');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    
    // Handle password visibility toggle
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Check if default admin exists and create it if not
    try {
        const adminRef = database.ref('admin');
        const snapshot = await adminRef.once('value');
        
        if (!snapshot.exists()) {
            // Create default admin in the database
            const defaultAdmin = {
                email: 'campuscafe@embuni.ac.ke',
                password: 'CcAdmin123.',
                role: 'admin'
            };
            
            // Store by sanitized email (Firebase doesn't allow dots in keys)
            const sanitizedEmail = defaultAdmin.email.replace(/\./g, ',');
            await adminRef.child(sanitizedEmail).set(defaultAdmin);
            console.log('Default admin account created in database');
            
            // Create the admin in Firebase Auth if it doesn't exist
            try {
                await auth.createUserWithEmailAndPassword(defaultAdmin.email, defaultAdmin.password);
                console.log('Default admin created in Firebase Auth');
            } catch (authError) {
                // If the account already exists in Auth, that's fine
                if (authError.code !== 'auth/email-already-in-use') {
                    console.error('Error creating admin in Firebase Auth:', authError);
                }
            }
        }
    } catch (error) {
        console.error('Error checking/creating admin account:', error);
        showError('Error initializing admin system');
    }
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Reset error message
            errorMessage.style.display = 'none';
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Simple validation
            if (!email || !password) {
                showError('Please enter both email and password');
                return;
            }
            
            try {
                // First check if this is the admin account in the database
                const adminRef = database.ref('admin');
                const sanitizedEmail = email.replace(/\./g, ',');
                const adminSnapshot = await adminRef.child(sanitizedEmail).once('value');
                
                if (!adminSnapshot.exists()) {
                    showError('Admin account not found');
                    return;
                }
                
                const adminData = adminSnapshot.val();
                
                // Check if the password matches the one in the database
                if (password !== adminData.password) {
                    showError('Invalid password');
                    passwordInput.value = '';
                    return;
                }
                
                // Try Firebase authentication
                try {
                    await auth.signInWithEmailAndPassword(email, password);
                    
                    // Store admin session
                    localStorage.setItem('admin_session', JSON.stringify({
                        email: email,
                        isAdmin: true,
                        timestamp: Date.now()
                    }));
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } catch (authError) {
                    console.error('Firebase Auth error:', authError);
                    
                    // If user doesn't exist in Auth or wrong password, create/update it
                    if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
                        try {
                            // First try to create the user
                            await auth.createUserWithEmailAndPassword(email, password)
                                .catch(async (createError) => {
                                    // If user already exists but password is wrong, reset the password
                                    if (createError.code === 'auth/email-already-in-use') {
                                        // For demo purposes, we'll sign in again with correct password
                                        // In a real app with Firebase Admin SDK, you would reset the user's password
                                        showError('Authentication failed. Please contact support to reset your password.');
                                        return Promise.reject('Cannot reset password in client-side code');
                                    }
                                    return Promise.reject(createError);
                                });
                            
                            // If we get here, user was created successfully
                            localStorage.setItem('admin_session', JSON.stringify({
                                email: email,
                                isAdmin: true,
                                timestamp: Date.now()
                            }));
                            
                            // Redirect to dashboard
                            window.location.href = 'dashboard.html';
                        } catch (createError) {
                            console.error('Error creating user in Auth:', createError);
                            showError('Authentication failed. Please try again or contact support.');
                        }
                    } else {
                        showError('Authentication failed: ' + (authError.message || 'Unknown error'));
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Login failed. Please try again.');
                passwordInput.value = '';
            }
        });
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}); 