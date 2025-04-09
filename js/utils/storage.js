/**
 * Storage Manager for Campus Cafe
 * Handles localStorage operations for menu items and orders
 */

import { database, auth } from './firebase.js';

const storageManager = (function() {
    // Firebase references
    const menuItemsRef = database.ref('menu');
    const ordersRef = database.ref('orders');
    const messagesRef = database.ref('messages');
    const adminRef = database.ref('admin');
    
    /**
     * Initialize storage with default data if empty
     */
    async function initStorage() {
        try {
            console.log('Initializing storage...');
            
            // Check if user is authenticated before accessing database
            if (!auth.currentUser) {
                console.log('User not authenticated yet, using default data for non-authenticated access');
                
                // For non-authenticated users, we'll still try to get public menu data
                try {
                    const menuItemsSnapshot = await menuItemsRef.once('value');
                    if (menuItemsSnapshot.exists()) {
                        console.log('Menu items loaded from Firebase for non-authenticated user');
                        return;
                    }
                } catch (err) {
                    console.warn('Error accessing menu data as non-authenticated user:', err);
                }
                
                // If we couldn't get data, we'll use local defaults
                localStorage.setItem('campus_cafe_menu_items', JSON.stringify(getDefaultMenuItems()));
                console.log('Using local storage with default menu items for non-authenticated access');
                return;
            }

            console.log('User authenticated, initializing storage with Firebase...');
            
            // Check if menu items exist
            const menuItemsSnapshot = await menuItemsRef.once('value');
            if (!menuItemsSnapshot.exists()) {
                console.log('No menu items found, creating defaults...');
                const defaultMenuItems = getDefaultMenuItems();
                // Create each menu item with a unique key
                const batchUpdates = {};
                defaultMenuItems.forEach((item) => {
                    batchUpdates[item.id] = {
                        ...item,
                        imageUrl: item.imageUrl || 'default-image-url.jpg' // Ensure image URL is stored
                    };
                });
                
                // Use update to perform a batch update
                await menuItemsRef.update(batchUpdates);
                console.log('Default menu items created successfully');
            } else {
                console.log('Menu items already exist in Firebase');
            }
            
            // Check if orders exist
            const ordersSnapshot = await ordersRef.once('value');
            if (!ordersSnapshot.exists()) {
                // Initialize with empty object instead of array for Firebase
                await ordersRef.set({});
                console.log('Orders storage initialized');
            }
            
            // Check if messages exist
            const messagesSnapshot = await messagesRef.once('value');
            if (!messagesSnapshot.exists()) {
                // Initialize with empty object instead of array for Firebase
                await messagesRef.set({});
                console.log('Messages storage initialized');
            }

            // Check if admin exists
            const adminSnapshot = await adminRef.once('value');
            if (!adminSnapshot.exists()) {
                // Store admin by email (replacing dots with commas for Firebase path)
                const adminEmail = 'campuscafe@embuni.ac.ke';
                const sanitizedEmail = adminEmail.replace(/\./g, ',');
                const adminData = {
                    email: adminEmail,
                    password: 'CcAdmin123.'
                };
                await adminRef.child(sanitizedEmail).set(adminData);
                console.log('Admin account initialized');
            }
            
            console.log('Storage initialized successfully');
        } catch (error) {
            console.error('Error initializing storage:', error);
            
            // Fallback to local storage if Firebase fails
            if (!localStorage.getItem('campus_cafe_menu_items')) {
                localStorage.setItem('campus_cafe_menu_items', JSON.stringify(getDefaultMenuItems()));
                console.log('Fallback: Using local storage with default menu items');
            }
        }
    }
    
    /**
     * Get all menu items
     * @returns {Array} - Array of menu items
     */
    async function getMenuItems() {
        try {
            // First try to get items from Firebase
            const snapshot = await menuItemsRef.once('value');
            if (snapshot.exists()) {
                // Convert Firebase object to array
                const menuItems = [];
                snapshot.forEach((childSnapshot) => {
                    menuItems.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                
                // Cache result in localStorage for offline use
                localStorage.setItem('campus_cafe_menu_items', JSON.stringify(menuItems));
                console.log('Menu items loaded from Firebase:', menuItems.length);
                return menuItems;
            }
            
            // Try to get from localStorage if Firebase doesn't have data
            const localMenuItems = localStorage.getItem('campus_cafe_menu_items');
            if (localMenuItems) {
                const menuItems = JSON.parse(localMenuItems);
                console.log('Menu items loaded from localStorage:', menuItems.length);
                return menuItems;
            }
            
            // If all else fails, return default menu items
            const defaultItems = getDefaultMenuItems();
            console.log('Using default menu items:', defaultItems.length);
            return defaultItems;
        } catch (error) {
            console.error('Error getting menu items from Firebase:', error);
            
            // Fallback to localStorage
            try {
                const localMenuItems = localStorage.getItem('campus_cafe_menu_items');
                if (localMenuItems) {
                    const menuItems = JSON.parse(localMenuItems);
                    console.log('Fallback: Menu items loaded from localStorage:', menuItems.length);
                    return menuItems;
                }
            } catch (err) {
                console.error('Error parsing localStorage menu items:', err);
            }
            
            // Last resort: return default menu items
            const defaultItems = getDefaultMenuItems();
            console.log('Fallback: Using default menu items:', defaultItems.length);
            return defaultItems;
        }
    }
    
    /**
     * Get menu item by ID
     * @param {string} id - Item ID
     * @returns {Object|null} - Menu item or null if not found
     */
    async function getMenuItemById(id) {
        try {
            const snapshot = await menuItemsRef.child(id).once('value');
            if (!snapshot.exists()) {
                return null;
            }
            return {
                id: snapshot.key,
                ...snapshot.val()
            };
        } catch (error) {
            console.error('Error getting menu item by ID:', error);
            return null;
        }
    }
    
    /**
     * Save menu item (create or update)
     * @param {Object} item - Menu item to save
     */
    async function saveMenuItem(item) {
        if (!item || !item.id || !item.name || !item.category || item.price === undefined) {
            throw new Error('Invalid menu item data');
        }
        
        try {
            await menuItemsRef.child(item.id).set({
                ...item,
                imageUrl: item.imageUrl || 'default-image-url.jpg' // Ensure image URL is stored
            });
            console.log('Menu item saved:', item.id);
            return item;
        } catch (error) {
            console.error('Error saving menu item:', error);
            throw error;
        }
    }
    
    /**
     * Delete menu item by ID
     * @param {string} id - Item ID to delete
     */
    async function deleteMenuItem(id) {
        const itemRef = database.ref(`menu/${id}`);
        await itemRef.remove();
    }
    
    /**
     * Get all orders
     * @returns {Array} - Array of orders
     */
    async function getOrders() {
        try {
            const snapshot = await ordersRef.once('value');
            if (!snapshot.exists()) {
                return [];
            }
            
            // Convert Firebase object to array
            const orders = [];
            snapshot.forEach((childSnapshot) => {
                orders.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            return orders;
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    }
    
    /**
     * Save a new order
     * @param {Object} order - Order to save
     * @returns {Object} - Saved order with ID
     */
    async function saveOrder(order) {
        if (!order || !order.items || !order.userId) {
            throw new Error('Invalid order data');
        }
        
        try {
            // Generate a new key if no ID provided
            const orderRef = order.id ? ordersRef.child(order.id) : ordersRef.push();
            const orderId = order.id || orderRef.key;
            
            // Update the order with its ID and save
            const orderWithId = {
                ...order,
                id: orderId,
                timestamp: Date.now()
            };
            
            await orderRef.set(orderWithId);
            return orderWithId;
        } catch (error) {
            console.error('Error saving order:', error);
            throw error;
        }
    }
    
    /**
     * Update order status
     * @param {string} id - Order ID
     * @param {string} status - New status
     * @returns {Object|null} - Updated order or null if not found
     */
    async function updateOrderStatus(id, status) {
        try {
            const orderRef = ordersRef.child(id);
            const snapshot = await orderRef.once('value');
            
            if (!snapshot.exists()) {
                return null;
            }
            
            await orderRef.update({ status });
            
            // Get the updated order
            const updatedSnapshot = await orderRef.once('value');
            return {
                id: updatedSnapshot.key,
                ...updatedSnapshot.val()
            };
        } catch (error) {
            console.error('Error updating order status:', error);
            return null;
        }
    }
    
    /**
     * Get all contact messages
     * @returns {Array} - Array of messages
     */
    async function getMessages() {
        try {
            const snapshot = await messagesRef.once('value');
            if (!snapshot.exists()) {
                return [];
            }
            
            // Convert Firebase object to array
            const messages = [];
            snapshot.forEach((childSnapshot) => {
                messages.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            return messages;
        } catch (error) {
            console.error('Error getting messages:', error);
            return [];
        }
    }
    
    /**
     * Save a new contact message
     * @param {Object} message - Message to save
     * @returns {Object} - Saved message
     */
    async function saveMessage(message) {
        if (!message || !message.name || !message.email || !message.message) {
            throw new Error('Invalid message data');
        }
        
        try {
            // Generate a new key
            const newMessageRef = messagesRef.push();
            const messageId = newMessageRef.key;
            
            // Add timestamp and ID
            const messageWithDetails = {
                ...message,
                id: messageId,
                timestamp: Date.now()
            };
            
            await newMessageRef.set(messageWithDetails);
            return messageWithDetails;
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    }
    
    /**
     * Default menu items
     * @returns {Array} - Array of default menu items
     */
    function getDefaultMenuItems() {
        return [
            {
                id: 'item_1',
                name: 'Breakfast Burrito',
                category: 'appetizers',
                price: 180,
                featured: true,
                availability: 'available',
                description: 'Start your day right with our hearty breakfast burrito packed with scrambled eggs, cheese, potatoes, and your choice of bacon or sausage.',
                ingredients: ['Flour tortilla', 'Scrambled eggs', 'Cheddar cheese', 'Potatoes', 'Choice of bacon or sausage', 'Salsa'],
                imageUrl: 'https://images.unsplash.com/photo-1584178639036-613ba57e5e37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 'item_2',
                name: 'Classic Burger',
                category: 'main-courses',
                price: 220,
                featured: true,
                availability: 'available',
                description: 'Juicy beef patty topped with lettuce, tomato, onion, and our special sauce on a toasted brioche bun. Served with fries.',
                ingredients: ['Beef patty', 'Brioche bun', 'Lettuce', 'Tomato', 'Onion', 'Special sauce', 'French fries'],
                imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 'item_3',
                name: 'Grilled Chicken Salad',
                category: 'main-courses',
                price: 260,
                featured: true,
                availability: 'available',
                description: 'Fresh mixed greens topped with grilled chicken breast, cherry tomatoes, cucumber, red onion, and balsamic vinaigrette.',
                ingredients: ['Mixed greens', 'Grilled chicken breast', 'Cherry tomatoes', 'Cucumber', 'Red onion', 'Balsamic vinaigrette'],
                imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 'item_4',
                name: 'Double Chocolate Brownie',
                category: 'desserts',
                price: 100,
                featured: false,
                availability: 'available',
                description: 'Rich, fudgy brownie loaded with chocolate chips. The perfect sweet treat between classes.',
                ingredients: ['Chocolate', 'Flour', 'Sugar', 'Eggs', 'Butter', 'Chocolate chips', 'Vanilla extract'],
                imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 'item_5',
                name: 'Iced Coffee',
                category: 'drinks',
                price: 90,
                featured: false,
                availability: 'available',
                description: 'Smooth cold-brewed coffee served over ice. Add your choice of flavored syrup for an extra kick.',
                ingredients: ['Cold-brewed coffee', 'Ice', 'Optional: flavored syrup', 'Optional: cream'],
                imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 'item_6',
                name: 'Veggie Wrap',
                category: 'main-courses',
                price: 195,
                featured: false,
                availability: 'available',
                description: 'Grilled vegetables, hummus, and feta cheese wrapped in a spinach tortilla. A healthy option for busy students.',
                ingredients: ['Spinach tortilla', 'Grilled vegetables', 'Hummus', 'Feta cheese', 'Mixed greens'],
                imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 'item_7',
                name: 'Avocado Toast',
                category: 'appetizers',
                price: 150,
                featured: false,
                availability: 'available',
                description: 'Smashed avocado on toasted sourdough bread with cherry tomatoes, red pepper flakes, and a drizzle of olive oil.',
                ingredients: ['Sourdough bread', 'Avocado', 'Cherry tomatoes', 'Red pepper flakes', 'Olive oil', 'Salt and pepper'],
                imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1168fc056?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 'item_8',
                name: 'Fruit Parfait',
                category: 'desserts',
                price: 120,
                featured: false,
                availability: 'available',
                description: 'Layers of yogurt, granola, and seasonal fresh fruits. A light and refreshing dessert option.',
                ingredients: ['Greek yogurt', 'Granola', 'Seasonal fruits', 'Honey', 'Mint garnish'],
                imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
        ];
    }
    
    /**
     * Get admin account info
     * @returns {Object|null} - Admin account info or null if not found
     */
    async function getAdmin() {
        try {
            const snapshot = await adminRef.once('value');
            if (!snapshot.exists()) {
                return null;
            }
            
            // Firebase might store multiple admin accounts, get the first one
            let adminAccount = null;
            snapshot.forEach((childSnapshot) => {
                if (!adminAccount) {
                    adminAccount = {
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    };
                }
            });
            
            return adminAccount;
        } catch (error) {
            console.error('Error getting admin account:', error);
            return null;
        }
    }
    
    /**
     * Save admin account
     * @param {Object} admin - Admin account info
     */
    async function saveAdmin(admin) {
        if (!admin || !admin.email || !admin.password) {
            throw new Error('Invalid admin data');
        }
        
        try {
            // Replace dots in email with commas for Firebase path
            const sanitizedEmail = admin.email.replace(/\./g, ',');
            await adminRef.child(sanitizedEmail).set(admin);
            return admin;
        } catch (error) {
            console.error('Error saving admin account:', error);
            throw error;
        }
    }
    
    /**
     * Save authenticated user to local storage
     * @param {Object} user - Firebase user object
     */
    function saveAuthenticatedUser(user) {
        if (user) {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                lastLogin: new Date().toISOString()
            }));
            
            // Set a secure cookie for server-side authentication check
            document.cookie = `auth=${user.uid}; path=/; max-age=86400; secure; samesite=strict`;
        }
    }
    
    /**
     * Get authenticated user from local storage
     * @returns {Object|null} User object or null if not authenticated
     */
    function getAuthenticatedUser() {
        const userData = localStorage.getItem('auth_user');
        return userData ? JSON.parse(userData) : null;
    }
    
    /**
     * Clear authentication data on logout
     */
    function clearAuthData() {
        localStorage.removeItem('auth_user');
        document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    
    // Public API
    const api = {
        initStorage,
        getMenuItems,
        getMenuItemById,
        saveMenuItem,
        deleteMenuItem,
        getOrders,
        saveOrder,
        updateOrderStatus,
        getMessages,
        saveMessage,
        getAdmin,
        saveAdmin,
        saveAuthenticatedUser,
        getAuthenticatedUser,
        clearAuthData
    };
    
    // Set up authentication listener to initialize storage once authenticated
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User authenticated, initializing storage...');
            initStorage().catch(error => {
                console.error('Failed to initialize storage after auth:', error);
            });
        } else {
            console.log('User not authenticated, storage initialization deferred.');
        }
    });
    
    return api;
})();

export default storageManager;

