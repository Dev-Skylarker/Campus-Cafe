# Campus Cafe User Guide

This guide provides detailed instructions for using the Campus Cafe system for both customers and administrators.

## Table of Contents

1. [Customer Guide](#customer-guide)
   - [Browsing the Menu](#browsing-the-menu)
   - [Using Search and Filters](#using-search-and-filters) 
   - [Viewing Item Details](#viewing-item-details)
   - [Placing Orders](#placing-orders)

2. [Administrator Guide](#administrator-guide)
   - [Logging In](#logging-in)
   - [Dashboard Overview](#dashboard-overview)
   - [Managing Menu Items](#managing-menu-items)
   - [Setting Item Availability](#setting-item-availability)
   - [Managing Featured Items](#managing-featured-items)
   - [Using Admin Search and Filters](#using-admin-search-and-filters)

---

## Customer Guide

### Browsing the Menu

1. **Homepage**: When you visit the Campus Cafe website, you'll see the homepage featuring:
   - Featured menu items at the top
   - Navigation menu to access different sections
   - Light/dark mode toggle

2. **Menu Page**: Click on "Menu" in the navigation bar to view all available menu items:
   - Items are organized by category (Breakfast, Main Courses, Desserts, Drinks)
   - Only available items are displayed by default
   - Each item shows its name, price, and a brief description

### Using Search and Filters

1. **Search**: Use the search bar at the top of the menu page to find specific items:
   - Enter keywords related to the dish name or ingredients
   - Results update as you type
   - The system searches through item names and descriptions

2. **Category Filter**: Use the category dropdown to filter items by type:
   - All Categories
   - Breakfast
   - Main Courses
   - Desserts
   - Drinks

### Viewing Item Details

1. Click on any menu item to view its detailed information:
   - Full description
   - Price
   - Ingredients list
   - Larger image
   - Availability status

### Placing Orders

1. From the item details page or menu listing, click "Add to Order"
2. Review your order in the cart
3. Adjust quantities as needed
4. Proceed to checkout
5. Fill in your details
6. Submit your order

---

## Administrator Guide

### Logging In

1. Navigate to `/admin/login.html`
2. Enter your administrator credentials:
   - Username
   - Password
3. Click "Login"

### Dashboard Overview

After logging in, you'll see the admin dashboard with:

1. **Sidebar Navigation**:
   - Dashboard (overview)
   - Manage Menu
   - Logout

2. **Dashboard Statistics**:
   - Total menu items
   - Items by category
   - Featured items count

### Managing Menu Items

1. **Viewing Menu Items**:
   - Go to "Manage Menu" in the sidebar
   - See all items in a table format with columns for name, category, price, image, featured status, and availability
   - Use the search and filter options to find specific items

2. **Adding a New Item**:
   - Click "Add New Item" button
   - Fill in the item details:
     - Name (required)
     - Category (required)
     - Price (required)
     - Featured status (checkbox)
     - Availability status (dropdown)
     - Image URL (optional)
     - Description (required)
     - Ingredients (one per line, optional)
   - Preview the image (if URL provided)
   - Click "Save Item"

3. **Editing an Item**:
   - Click the edit (pencil) icon next to the item
   - Modify any fields as needed
   - Click "Save Item"

4. **Deleting an Item**:
   - Click the delete (trash) icon next to the item
   - Confirm deletion in the modal window

### Setting Item Availability

1. When adding or editing an item, set the "Availability Status" to:
   - "Ready to serve" - Item is available for ordering
   - "Unavailable" - Item will not be shown to customers

2. You can also filter the admin view to see:
   - All items
   - Available items only
   - Unavailable items only

### Managing Featured Items

1. **Setting an Item as Featured**:
   - When adding or editing an item, check the "Featured Item" checkbox
   - Featured items will appear in the featured section on the homepage

2. **Viewing Featured Items**:
   - In the admin table, featured items are marked with a "Featured" badge

### Using Admin Search and Filters

The admin interface provides powerful search and filtering tools:

1. **Search**: 
   - Use the search bar to find items by name or description
   - Click the search icon or press Enter to execute the search

2. **Category Filter**:
   - Filter items by category (All, Breakfast, Main Courses, Desserts, Drinks)

3. **Availability Filter**:
   - Filter items by availability status (All, Available Only, Unavailable Only)

4. **Clearing Filters**:
   - Click "Clear filters" to reset all search and filter options

---

## Troubleshooting

- **Images not displaying**: Verify that the image URL is correct and accessible
- **Items not showing on public menu**: Check that the item's availability is set to "Ready to serve"
- **Featured items not appearing**: Ensure the items are both featured AND available 