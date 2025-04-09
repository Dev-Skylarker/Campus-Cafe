/**
 * Menu Editor JavaScript for Campus Cafe Admin
 */

import { auth } from '../utils/firebase.js';
import storageManager from '../utils/storage.js';

// DOM Elements
const menuItemsContainer = document.getElementById('menu-items-container');
const searchInput = document.getElementById('menu-search');
const searchBtn = document.getElementById('search-btn');
const categoryFilter = document.getElementById('category-filter');
const availabilityFilter = document.getElementById('availability-filter');
const addItemBtn = document.getElementById('add-item-btn');
const itemModal = document.getElementById('item-modal');
const closeModalBtn = itemModal ? itemModal.querySelector('.close-modal') : null;
const modalTitle = document.getElementById('modal-title');
const itemForm = document.getElementById('item-form');
const itemIdInput = document.getElementById('item-id');
const itemNameInput = document.getElementById('item-name');
const itemCategoryInput = document.getElementById('item-category');
const itemPriceInput = document.getElementById('item-price');
const itemDescriptionInput = document.getElementById('item-description');
const itemIngredientsInput = document.getElementById('item-ingredients');
const itemImageInput = document.getElementById('item-image');
const previewImage = document.getElementById('preview-image');
const itemAvailabilityInput = document.getElementById('item-availability');
const itemFeaturedInput = document.getElementById('item-featured');
const deleteItemBtn = document.getElementById('delete-item-btn');
const confirmModal = document.getElementById('confirm-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');

// Filters state
let currentCategory = 'all';
let currentAvailability = 'all';
let currentSearchTerm = '';
let allMenuItems = [];
let currentItemId = null;

// Initialize the page
async function initMenuEditor() {
    try {
        // Check authentication
        if (!auth.currentUser) {
            window.location.href = 'login.html?redirect=menu-editor.html';
            return;
        }
        
        // Load menu items
        await loadMenuItems();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing menu editor:', error);
        showAlert('Failed to load menu editor. Please try again.', 'error');
    }
}

// Load menu items from storage
async function loadMenuItems() {
    try {
        // Show loader
        if (menuItemsContainer) {
            menuItemsContainer.innerHTML = '<div class="loader"></div>';
        }
        
        // Get menu items
        allMenuItems = await storageManager.getMenuItems();
        
        // Apply current filters
        filterMenuItems();
    } catch (error) {
        console.error('Error loading menu items:', error);
        if (menuItemsContainer) {
            menuItemsContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load menu items. Please try again.</p>
                    <button id="retry-btn" class="btn btn-primary">Retry</button>
                </div>
            `;
            
            const retryBtn = document.getElementById('retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', loadMenuItems);
            }
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            currentSearchTerm = searchTerm;
            filterMenuItems();
        });
    }
    
    // Category filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentCategory = categoryFilter.value;
            filterMenuItems();
        });
    }
    
    // Availability filter
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', () => {
            currentAvailability = availabilityFilter.value;
            filterMenuItems();
        });
    }
    
    // Add item button
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            openItemModal();
        });
    }
    
    // Close modal button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeItemModal);
    }
    
    // Item form submission
    if (itemForm) {
        itemForm.addEventListener('submit', handleItemFormSubmit);
    }
    
    // Delete item button
    if (deleteItemBtn) {
        deleteItemBtn.addEventListener('click', () => {
            if (currentItemId) {
                confirmModal.style.display = 'block';
            }
        });
    }
    
    // Cancel delete button
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
    }
    
    // Confirm delete button
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            await deleteMenuItem(currentItemId);
            confirmModal.style.display = 'none';
            closeItemModal();
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === itemModal) {
            closeItemModal();
        }
        if (e.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeItemModal();
            confirmModal.style.display = 'none';
        }
    });
    
    // Image preview
    if (itemImageInput && previewImage) {
        itemImageInput.addEventListener('input', updateImagePreview);
    }
}

// Handle search input
function handleSearch(e) {
    currentSearchTerm = e.target.value.trim().toLowerCase();
    filterMenuItems();
}

// Filter menu items based on current filters
function filterMenuItems() {
    let filteredItems = [...allMenuItems];
    
    // Apply category filter
    if (currentCategory !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === currentCategory);
    }
    
    // Apply availability filter
    if (currentAvailability !== 'all') {
        filteredItems = filteredItems.filter(item => item.availability === currentAvailability);
    }
    
    // Apply search filter
    if (currentSearchTerm) {
        filteredItems = filteredItems.filter(item => {
            return (
                item.name.toLowerCase().includes(currentSearchTerm) ||
                item.description.toLowerCase().includes(currentSearchTerm)
            );
        });
    }
    
    // Display filtered items
    displayMenuItems(filteredItems);
}

// Display menu items in the container
function displayMenuItems(items) {
    if (!menuItemsContainer) return;
    
    if (items.length === 0) {
        menuItemsContainer.innerHTML = `
            <div class="no-items-message">
                <i class="fas fa-utensils"></i>
                <h3>No menu items found</h3>
                <p>Try adjusting your filters or add a new menu item.</p>
            </div>
        `;
        return;
    }
    
    menuItemsContainer.innerHTML = '';
    
    items.forEach(item => {
        const menuItemCard = createMenuItemCard(item);
        menuItemsContainer.appendChild(menuItemCard);
    });
}

// Create a menu item card element
function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = `menu-item-card ${item.availability}`;
    card.dataset.id = item.id;
    
    // Get the correct image URL
    const imageUrl = item.imageUrl || item.image || '../assets/placeholder-food.png';
    
    card.innerHTML = `
        <div class="item-image">
            <img src="${imageUrl}" alt="${item.name}" onerror="this.src='../assets/placeholder-food.png';">
            ${item.featured ? '<span class="featured-badge">Featured</span>' : ''}
        </div>
        <div class="item-info">
            <h3>${item.name}</h3>
            <div class="item-meta">
                <span class="item-category">${formatCategoryLabel(item.category)}</span>
                <span class="item-price">KSH ${item.price.toFixed(2)}</span>
            </div>
            <p class="item-description">${limitText(item.description, 100)}</p>
            <div class="item-status">
                <span class="status-badge ${item.availability}">
                    ${item.availability === 'available' ? 'Available' : 'Unavailable'}
                </span>
            </div>
            <div class="item-actions">
                <button class="btn btn-secondary edit-btn" data-id="${item.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        </div>
    `;
    
    // Add event listener to edit button
    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
        openItemModal(item);
    });
    
    return card;
}

// Open the item modal for adding or editing
function openItemModal(item = null) {
    if (!itemModal) return;
    
    // Reset form
    itemForm.reset();
    
    if (item) {
        // Editing existing item
        modalTitle.textContent = 'Edit Menu Item';
        itemIdInput.value = item.id;
        itemNameInput.value = item.name;
        itemCategoryInput.value = item.category;
        itemPriceInput.value = item.price;
        itemDescriptionInput.value = item.description;
        itemIngredientsInput.value = item.ingredients ? item.ingredients.join('\n') : '';
        itemImageInput.value = item.imageUrl || item.image || '';
        itemAvailabilityInput.value = item.availability || 'available';
        itemFeaturedInput.checked = item.featured || false;
        
        currentItemId = item.id;
        deleteItemBtn.style.display = 'block';
        
        // Update image preview
        updateImagePreview();
    } else {
        // Adding new item
        modalTitle.textContent = 'Add New Menu Item';
        itemIdInput.value = 'item_' + Date.now();
        itemImageInput.value = '';
        previewImage.src = '../assets/placeholder-food.png';
        
        currentItemId = null;
        deleteItemBtn.style.display = 'none';
    }
    
    // Show modal
    itemModal.style.display = 'block';
}

// Close the item modal
function closeItemModal() {
    if (!itemModal) return;
    itemModal.style.display = 'none';
    currentItemId = null;
}

// Handle item form submission
async function handleItemFormSubmit(e) {
    e.preventDefault();
    
    try {
        // Get form values
        const item = {
            id: itemIdInput.value,
            name: itemNameInput.value.trim(),
            category: itemCategoryInput.value,
            price: parseFloat(itemPriceInput.value),
            description: itemDescriptionInput.value.trim(),
            ingredients: itemIngredientsInput.value.trim().split('\n').filter(line => line.trim() !== ''),
            imageUrl: itemImageInput.value.trim(),
            availability: itemAvailabilityInput.value,
            featured: itemFeaturedInput.checked
        };
        
        // Save item
        await storageManager.saveMenuItem(item);
        
        // Reload menu items
        await loadMenuItems();
        
        // Close modal
        closeItemModal();
        
        // Show success message
        showAlert('Menu item saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving menu item:', error);
        showAlert('Failed to save menu item. Please try again.', 'error');
    }
}

// Delete a menu item
async function deleteMenuItem(id) {
    try {
        await storageManager.deleteMenuItem(id);
        
        // Reload menu items
        await loadMenuItems();
        
        // Show success message
        showAlert('Menu item deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting menu item:', error);
        showAlert('Failed to delete menu item. Please try again.', 'error');
    }
}

// Update the image preview
function updateImagePreview() {
    if (!previewImage || !itemImageInput) return;
    
    const imageUrl = itemImageInput.value.trim();
    if (imageUrl) {
        previewImage.src = imageUrl;
        previewImage.onerror = () => {
            previewImage.src = '../assets/placeholder-food.png';
        };
    } else {
        previewImage.src = '../assets/placeholder-food.png';
    }
}

// Format a category label
function formatCategoryLabel(category) {
    switch (category) {
        case 'appetizers':
            return 'Breakfast';
        case 'main-courses':
            return 'Main Courses';
        case 'desserts':
            return 'Desserts';
        case 'drinks':
            return 'Drinks';
        default:
            return category.charAt(0).toUpperCase() + category.slice(1);
    }
}

// Limit text to a certain length
function limitText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Show an alert message
function showAlert(message, type = 'success') {
    // Create alert element if it doesn't exist
    let alertEl = document.querySelector('.alert-message');
    if (!alertEl) {
        alertEl = document.createElement('div');
        alertEl.className = 'alert-message';
        document.body.appendChild(alertEl);
    }
    
    // Set alert content and type
    alertEl.textContent = message;
    alertEl.className = `alert-message ${type}`;
    
    // Show alert
    alertEl.classList.add('show');
    
    // Hide alert after 3 seconds
    setTimeout(() => {
        alertEl.classList.remove('show');
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initMenuEditor); 