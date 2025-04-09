/**
 * Firebase configuration and initialization
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdczG9tuPKk3BZFp-3NOhMMdRJJ8rgGP4",
  authDomain: "campus-cafe-60191.firebaseapp.com",
  databaseURL: "https://campus-cafe-60191-default-rtdb.firebaseio.com",
  projectId: "campus-cafe-60191",
  storageBucket: "campus-cafe-60191.appspot.com",
  messagingSenderId: "507598566861",
  appId: "1:507598566861:web:989c2925dd2766cb6d8084",
  measurementId: "G-N5FCGY0HNR"
};

// Initialize Firebase
let database, auth, googleAuthProvider;

try {
  // Check if Firebase is loaded
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase SDK not loaded. Ensure the script is included in your HTML file.');
  }

  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // Initialize analytics if available
  if (firebase.analytics) {
    firebase.analytics();
  }
  
  // Initialize services
  database = firebase.database();
  auth = firebase.auth();
  
  // Set persistence to LOCAL - this helps with authentication stability
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(error => {
      console.warn('Auth persistence could not be set:', error);
    });
  
  // Configure Google auth provider with additional scopes
  googleAuthProvider = new firebase.auth.GoogleAuthProvider();
  googleAuthProvider.addScope('profile');
  googleAuthProvider.addScope('email');
  
  // Set custom parameters for the Google auth provider
  googleAuthProvider.setCustomParameters({
    'prompt': 'select_account' // Force account selection even if one account is available
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // Create fallback objects for testing/development
  if (!database) database = createFallbackDatabase();
  if (!auth) auth = createFallbackAuth();
  if (!googleAuthProvider) googleAuthProvider = {};
}

/**
 * Creates a fallback database object when Firebase fails to initialize
 */
function createFallbackDatabase() {
  console.warn('Using fallback database object');
  
  // Check if we have data in localStorage
  const getLocalData = (path) => {
    try {
      return JSON.parse(localStorage.getItem(`fb_fallback_${path}`) || 'null');
    } catch (e) {
      return null;
    }
  };
  
  const setLocalData = (path, data) => {
    try {
      localStorage.setItem(`fb_fallback_${path}`, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Admin default data
  const adminEmail = 'campuscafe@embuni.ac.ke';
  const sanitizedEmail = adminEmail.replace(/\./g, ',');
  
  // Ensure admin exists in fallback storage
  if (!getLocalData(`admin/${sanitizedEmail}`)) {
    setLocalData(`admin/${sanitizedEmail}`, {
      email: adminEmail,
      password: 'CcAdmin123.',
      role: 'admin',
      created: Date.now()
    });
  }
  
  return {
    ref: (path) => ({
      once: (eventType) => {
        return Promise.resolve({
          exists: () => getLocalData(path) !== null,
          val: () => getLocalData(path)
        });
      },
      set: (data) => {
        setLocalData(path, data);
        return Promise.resolve();
      },
      child: (childPath) => database.ref(`${path}/${childPath}`),
      update: (updates) => {
        const data = getLocalData(path) || {};
        setLocalData(path, {...data, ...updates});
        return Promise.resolve();
      },
      push: () => {
        const key = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        return {
          key,
          set: (data) => {
            const items = getLocalData(path) || {};
            items[key] = data;
            setLocalData(path, items);
            return Promise.resolve();
          }
        };
      },
      remove: () => {
        localStorage.removeItem(`fb_fallback_${path}`);
        return Promise.resolve();
      }
    })
  };
}

/**
 * Creates a fallback auth object when Firebase fails to initialize
 */
function createFallbackAuth() {
  console.warn('Using fallback auth object');
  
  // Default admin
  const adminEmail = 'campuscafe@embuni.ac.ke';
  const adminPassword = 'CcAdmin123.';
  
  // Track current user
  let currentUser = null;
  
  // Auth state change listeners
  const authListeners = [];
  
  return {
    onAuthStateChanged: (callback) => {
      authListeners.push(callback);
      // Call immediately with current state
      setTimeout(() => callback(currentUser), 0);
      // Return unsubscribe function
      return () => {
        const index = authListeners.indexOf(callback);
        if (index > -1) authListeners.splice(index, 1);
      };
    },
    signInWithEmailAndPassword: (email, password) => {
      // Check if it's the default admin
      if (email === adminEmail && password === adminPassword) {
        currentUser = { email: adminEmail, displayName: 'Admin' };
        
        // Notify listeners
        authListeners.forEach(listener => listener(currentUser));
        
        // Set admin session
        localStorage.setItem('admin_session', JSON.stringify({
          email: email,
          isAdmin: true,
          timestamp: Date.now()
        }));
        
        return Promise.resolve({ user: currentUser });
      }
      
      return Promise.reject(new Error('Invalid email or password'));
    },
    createUserWithEmailAndPassword: (email, password) => {
      // Only allow creating the default admin 
      if (email === adminEmail) {
        currentUser = { email: adminEmail, displayName: 'Admin' };
        
        // Notify listeners
        authListeners.forEach(listener => listener(currentUser));
        
        return Promise.resolve({ user: currentUser });
      }
      
      return Promise.reject(new Error('Only default admin can be created with fallback auth'));
    },
    signOut: () => {
      currentUser = null;
      
      // Notify listeners
      authListeners.forEach(listener => listener(null));
      
      // Clear admin session
      localStorage.removeItem('admin_session');
      localStorage.removeItem('forced_admin_auth');
      
      return Promise.resolve();
    },
    get currentUser() {
      return currentUser;
    }
  };
}

export { database, auth, googleAuthProvider }; 