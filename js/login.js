/**
 * Login JavaScript for the Campus Cafe website
 */

import { database, auth, googleAuthProvider } from './utils/firebase.js';
import storageManager from './utils/storage.js';

// DOM Elements
const googleSignInBtn = document.getElementById('google-signin-btn');

/**
 * Show alert message to user
 * @param {string} message - Message to display
 * @param {string} type - Alert type ('success' or 'error')
 */
function showAlert(message, type = 'success') {
    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    
    // Add to body
    document.body.appendChild(alertEl);
    alertEl.style.position = 'fixed';
    alertEl.style.top = '20px';
    alertEl.style.left = '50%';
    alertEl.style.transform = 'translateX(-50%)';
    alertEl.style.zIndex = '1000';
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (alertEl.parentNode) {
            alertEl.parentNode.removeChild(alertEl);
        }
    }, 5000);
}

/**
 * Save user data to database
 * @param {Object} user - User object from Firebase Auth
 */
async function saveUserToDatabase(user) {
    try {
        const userRef = database.ref(`users/${user.uid}`);
        
        // Check if user already exists
        const snapshot = await userRef.once('value');
        if (!snapshot.exists()) {
            // If user doesn't exist, save to database
            await userRef.set({
                email: user.email,
                name: user.displayName || 'Campus Cafe User',
                phone: user.phoneNumber || '',
                photoURL: user.photoURL || '',
                lastLogin: new Date().toISOString()
            });
        } else {
            // Update last login time
            await userRef.update({
                lastLogin: new Date().toISOString()
            });
        }
        
        // Save user to local storage
        storageManager.saveAuthenticatedUser(user);
        
    } catch (error) {
        console.error('Error saving user data:', error);
        showAlert('Error saving user data. Please try again.', 'error');
    }
}

/**
 * Handle Google Sign-In
 */
function handleGoogleSignIn() {
    // Show loading state
    if (googleSignInBtn) {
        googleSignInBtn.disabled = true;
        googleSignInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    }
    
    // Try first with popup (most common method)
    auth.signInWithPopup(googleAuthProvider)
        .then((result) => {
            handleSuccessfulSignIn(result.user);
        })
        .catch((error) => {
            console.log('Popup sign-in error, trying redirect method:', error);
            
            // If popup is blocked or fails, try redirect method
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                // Store the current URL to return to after auth
                localStorage.setItem('authRedirectUrl', window.location.href);
                
                // Use redirect instead of popup
                auth.signInWithRedirect(googleAuthProvider)
                    .catch((redirectError) => {
                        console.error('Redirect sign-in error:', redirectError);
                        resetButton();
                        showAlert('Failed to sign in with Google. Please check your internet connection and try again.', 'error');
                    });
            } else {
                // Handle other errors
                console.error('Sign-in error:', error);
                resetButton();
                
                // Show specific error message based on error code
                if (error.code === 'auth/network-request-failed') {
                    showAlert('Network error. Please check your internet connection.', 'error');
                } else if (error.code === 'auth/user-disabled') {
                    showAlert('This account has been disabled. Please contact support.', 'error');
                } else if (error.code === 'auth/account-exists-with-different-credential') {
                    showAlert('An account already exists with the same email but different sign-in credentials.', 'error');
                } else {
                    showAlert('Failed to sign in with Google. Please try again.', 'error');
                }
            }
        });
}

/**
 * Handle successful sign-in
 * @param {Object} user - Firebase user object
 */
function handleSuccessfulSignIn(user) {
    // Save user to database and local storage
    saveUserToDatabase(user)
        .then(() => {
            // Show success message
            showAlert('Successfully signed in!', 'success');
            
            // Redirect to home page
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error in post-sign-in process:', error);
            resetButton();
            // Continue to home page even if saving data fails
            window.location.href = 'index.html';
        });
}

/**
 * Reset sign-in button to original state
 */
function resetButton() {
    if (googleSignInBtn) {
        googleSignInBtn.disabled = false;
        googleSignInBtn.innerHTML = '<i class="fab fa-google"></i> Sign in with Google';
    }
}

// Check for redirect result
auth.getRedirectResult()
    .then((result) => {
        if (result.user) {
            // User successfully signed in with redirect
            handleSuccessfulSignIn(result.user);
        }
    })
    .catch((error) => {
        console.error('Redirect result error:', error);
        if (error.code !== 'auth/credential-already-in-use') {
            showAlert('Failed to complete sign-in. Please try again.', 'error');
        }
    });

// Add event listener to Google Sign-In button
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
}

// Check if user is already signed in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, save to local storage and redirect to home page if on login page
        storageManager.saveAuthenticatedUser(user);
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    } else {
        // User is not signed in and not on login page, redirect to login
        storageManager.clearAuthData();
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('admin/') &&
            !window.location.pathname.endsWith('/')) {
            window.location.href = 'login.html';
        }
    }
}); 