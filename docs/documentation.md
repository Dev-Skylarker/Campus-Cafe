# Campus Cafe System Documentation

![Campus Cafe Logo](../assets/logo.png)
*Campus Cafe System Logo*

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [System Architecture](#system-architecture)
4. [User Guides](#user-guides)
   - [Customer Guide](#customer-guide)
   - [Administrator Guide](#administrator-guide)
5. [Technical Reference](#technical-reference)
   - [Data Models](#data-models)
   - [Core Components](#core-components)
   - [API Reference](#api-reference)
6. [Development Guide](#development-guide)
   - [Setting Up Development Environment](#setting-up-development-environment)
   - [Extending the System](#extending-the-system)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)
9. [Appendix](#appendix)

## Introduction

The Campus Cafe System is a web-based application designed to streamline the management and customer experience of a university campus cafe. The system allows customers to view the menu, place orders, and provides administrators with tools to manage menu items, track orders, and oversee cafe operations.

### Purpose and Scope

This system serves as a comprehensive solution for campus cafes, enabling:
- Easy menu management for administrators
- Intuitive menu browsing and ordering for customers
- Responsive design for use on various devices
- Offline-capable functionality through LocalStorage

### Key Features

- **Customer-Facing Interface**
  - Interactive menu with search and filter options
  - Featured dishes display
  - Availability status for menu items
  - Responsive design for mobile and desktop users

- **Admin Dashboard**
  - Secure login system
  - Menu management with CRUD operations
  - Item availability control
  - Featured items management
  - Filter and search capabilities
  - Image preview and management

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Storage**: LocalStorage for persistent data
- **Design**: Responsive design with light/dark mode

![System Architecture Diagram]()
*Insert system architecture diagram here*

## Installation

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage enabled
- Minimum screen resolution: 360px width (mobile), 768px (desktop)

### Installation Steps

1. Clone the repository or download the source code
   ```bash
   git clone https://github.com/your-username/campus-cafe.git
   ```

2. No build steps required - this is a vanilla JavaScript application

3. Open `index.html` in your web browser to access the customer interface

4. For admin access:
   - Navigate to `admin/login.html`
   - Use default credentials:
     - Username: admin
     - Password: admin123

### Deployment

For production deployment:

1. Upload all files to your web server
2. Ensure all files maintain their relative paths
3. No database setup required as the system uses LocalStorage

## System Architecture

The Campus Cafe system follows a client-side architecture with the following components:

### Frontend Components
- **HTML**: Provides the structure and content
- **CSS**: Handles styling and responsiveness
- **JavaScript**: Implements business logic and UI interactions

### Data Storage
- Uses the browser's **LocalStorage API** for persistent data storage
- Implements a structured data model for menu items, user preferences, etc.

### Directory Structure

```
/
├── index.html              # Homepage
├── menu.html               # Menu page
├── js/
│   ├── main.js             # Main JavaScript file
│   ├── menu.js             # Menu page logic
│   ├── admin/
│   │   └── menu-manager.js # Admin menu management
│   └── utils/
│       ├── storage.js      # Storage management utility
│       ├── auth.js         # Authentication utility
│       ├── currency.js     # Currency formatting utility
│       └── theme.js        # Theme switching utility
├── css/
│   ├── styles.css          # Main CSS file
│   └── admin.css           # Admin-specific styling
├── admin/
│   ├── login.html          # Admin login page
│   ├── dashboard.html      # Admin dashboard
│   └── manage-menu.html    # Menu management page
└── assets/                 # Images and other assets
```

![Component Interaction Diagram]()
*Insert component interaction diagram here*

## User Guides

### Customer Guide

#### Browsing the Menu

1. **Homepage**: When you visit the Campus Cafe website, you'll see the homepage featuring:
   - Featured menu items at the top
   - Navigation menu to access different sections
   - Light/dark mode toggle

   ![Homepage Screenshot]()
   *Insert homepage screenshot here*

2. **Menu Page**: Click on "Menu" in the navigation bar to view all available menu items:
   - Items are organized by category (Breakfast, Main Courses, Desserts, Drinks)
   - Only available items are displayed by default
   - Each item shows its name, price, and a brief description

   ![Menu Page Screenshot]()
   *Insert menu page screenshot here*

#### Using Search and Filters

1. **Search**: Use the search bar at the top of the menu page to find specific items:
   - Enter keywords related to the dish name or ingredients
   - Results update as you type
   - The system searches through item names and descriptions

   ![Search Functionality Screenshot]()
   *Insert search functionality screenshot here*

2. **Category Filter**: Use the category dropdown to filter items by type:
   - All Categories
   - Breakfast
   - Main Courses
   - Desserts
   - Drinks

   ![Category Filter Screenshot]()
   *Insert category filter screenshot here*

#### Viewing Item Details

1. Click on any menu item to view its detailed information:
   - Full description
   - Price
   - Ingredients list
   - Larger image
   - Availability status

   ![Item Details Screenshot]()
   *Insert item details screenshot here*

#### Placing Orders

1. From the item details page or menu listing, click "Add to Order"
2. Review your order in the cart
3. Adjust quantities as needed
4. Proceed to checkout
5. Fill in your details
6. Submit your order

   ![Order Placement Flow Diagram]()
   *Insert order placement flow diagram here*

### Administrator Guide

#### Logging In

1. Navigate to `/admin/login.html`
2. Enter your administrator credentials:
   - Username
   - Password
3. Click "Login"

   ![Admin Login Screenshot]()
   *Insert admin login screenshot here*

#### Dashboard Overview

After logging in, you'll see the admin dashboard with:

1. **Sidebar Navigation**:
   - Dashboard (overview)
   - Manage Menu
   - Logout

2. **Dashboard Statistics**:
   - Total menu items
   - Items by category
   - Featured items count

   ![Admin Dashboard Screenshot]()
   *Insert admin dashboard screenshot here*

#### Managing Menu Items

1. **Viewing Menu Items**:
   - Go to "Manage Menu" in the sidebar
   - See all items in a table format with columns for name, category, price, image, featured status, and availability
   - Use the search and filter options to find specific items

   ![Menu Management Screenshot]()
   *Insert menu management screenshot here*

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

   ![Add Item Form Screenshot]()
   *Insert add item form screenshot here*

3. **Editing an Item**:
   - Click the edit (pencil) icon next to the item
   - Modify any fields as needed
   - Click "Save Item"

   ![Edit Item Form Screenshot]()
   *Insert edit item form screenshot here*

4. **Deleting an Item**:
   - Click the delete (trash) icon next to the item
   - Confirm deletion in the modal window

   ![Delete Confirmation Screenshot]()
   *Insert delete confirmation screenshot here*

#### Setting Item Availability

1. When adding or editing an item, set the "Availability Status" to:
   - "Ready to serve" - Item is available for ordering
   - "Unavailable" - Item will not be shown to customers

2. You can also filter the admin view to see:
   - All items
   - Available items only
   - Unavailable items only

   ![Availability Management Screenshot]()
   *Insert availability management screenshot here*

#### Managing Featured Items

1. **Setting an Item as Featured**:
   - When adding or editing an item, check the "Featured Item" checkbox
   - Featured items will appear in the featured section on the homepage

2. **Viewing Featured Items**:
   - In the admin table, featured items are marked with a "Featured" badge

   ![Featured Items Management Screenshot]()
   *Insert featured items management screenshot here*

#### Using Admin Search and Filters

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

   ![Admin Search and Filters Screenshot]()
   *Insert admin search and filters screenshot here*

## Technical Reference

### Data Models

#### Menu Item

```javascript
{
  id: "item_1234567890",        // Unique identifier
  name: "Cappuccino",           // Item name
  category: "drinks",           // Category (appetizers, main-courses, desserts, drinks)
  price: 350,                   // Price in KSH
  description: "Rich coffee...", // Description text
  ingredients: ["Coffee", "Milk"], // Array of ingredients
  imageUrl: "url/to/image.jpg", // Optional image URL
  featured: true,               // Whether item is featured on homepage
  availability: "available"     // available or unavailable
}
```

![Data Model Diagram]()
*Insert data model diagram here*

### Core Components

#### Storage Manager

The `storage.js` utility provides an abstraction layer for working with LocalStorage:

```javascript
// Key storage functions:
getMenuItems()          // Retrieves all menu items
getMenuItem(id)         // Gets a specific menu item by ID
saveMenuItem(item)      // Saves a menu item
deleteMenuItem(id)      // Deletes a menu item
getDefaultMenuItems()   // Gets default items if none exist
```

#### Authentication Manager

The `auth.js` utility handles admin authentication:

```javascript
// Key auth functions:
login(username, password)  // Authenticates admin
logout()                  // Logs out admin
isLoggedIn()              // Checks if admin is logged in
```

#### Menu Loading Process

1. `menu.js`: The `initMenuPage()` function:
   - Retrieves items from localStorage using `storageManager.getMenuItems()`
   - Filters out unavailable items
   - Organizes items by category
   - Renders the menu DOM elements

#### Item Filtering

The filtering mechanism in `menu-manager.js` uses:
```javascript
function filterMenuItems() {
    const menuItems = storageManager.getMenuItems();
    
    // Apply filters
    let filteredItems = menuItems;
    
    // Filter by category
    if (currentFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === currentFilter);
    }
    
    // Filter by availability
    if (currentAvailabilityFilter !== 'all') {
        filteredItems = filteredItems.filter(item => {
            const availability = item.availability || 'available';
            return availability === currentAvailabilityFilter;
        });
    }
    
    // Filter by search term
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
```

### API Reference

#### LocalStorage Keys

The system uses the following LocalStorage keys:

- `cafe_menu_items`: Array of menu items
- `cafe_user`: Admin user information
- `cafe_theme`: User theme preference (light/dark)

#### Function Reference

| Function | Description | Parameters | Return Value |
| -------- | ----------- | ---------- | ------------ |
| `storageManager.getMenuItems()` | Gets all menu items | None | Array of menu items |
| `storageManager.getMenuItem(id)` | Gets a specific menu item | id (string) | Menu item object or null |
| `storageManager.saveMenuItem(item)` | Saves a menu item | item (object) | Updated item with ID |
| `storageManager.deleteMenuItem(id)` | Deletes a menu item | id (string) | Boolean success |
| `authManager.login(username, password)` | Authenticates admin | username (string), password (string) | Boolean success |
| `authManager.logout()` | Logs out admin | None | void |
| `authManager.isLoggedIn()` | Checks login status | None | Boolean |

## Development Guide

### Setting Up Development Environment

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/campus-cafe.git
   ```

2. Open the project in your favorite code editor (VSCode recommended)

3. No build tools or package managers required - this is a vanilla JavaScript project

4. Use a local server (like Live Server extension for VSCode) for development

### Extending the System

#### Adding New Features

To add new features to the system:

1. **New Menu Item Properties**:
   - Add the property to the item form in `manage-menu.html`
   - Update the `handleSaveItem()` function in `menu-manager.js`
   - Update the display logic in both admin and public interfaces

2. **New Pages**:
   - Create a new HTML file with appropriate structure
   - Link to it from the navigation menu
   - Create corresponding JavaScript files for functionality

#### Customizing Styles

To customize the appearance:

1. **Theme Colors**: Modify the CSS variables in `styles.css`:
   ```css
   :root {
       --primary-color: #f5a623;
       --accent-color: #4caf50;
       /* Other variables */
   }
   ```

2. **Component Styles**: Override specific component styles in the appropriate CSS files

## Troubleshooting

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
| ----- | -------------- | -------- |
| Images not displaying | Incorrect URL | Verify that the image URL is correct and accessible |
| Items not showing on menu | Unavailable status | Check that the item's availability is set to "Ready to serve" |
| Featured items not appearing | Not marked as available | Ensure the items are both featured AND available |
| Changes not saving | LocalStorage permissions | Ensure that your browser allows LocalStorage access |
| Login not working | Incorrect credentials | Use the default credentials (admin/admin123) |

### Debug Tools

- Browser Console (F12): Check for JavaScript errors
- Browser Application tab: Inspect LocalStorage values
- Network tab: Verify image URLs load correctly

## FAQ

**Q: Can I use this system on a mobile device?**  
A: Yes, the system is fully responsive and works on mobile devices.

**Q: Where is the data stored?**  
A: All data is stored in your browser's LocalStorage. This means data persists between sessions on the same device and browser, but is not shared across devices.

**Q: Can multiple administrators use the system simultaneously?**  
A: Yes, but since data is stored in LocalStorage, changes made on one device won't be reflected on others.

**Q: How do I back up the menu data?**  
A: You would need to implement a custom export/import feature to transfer the LocalStorage data.

**Q: Can I deploy this to a production environment?**  
A: While the system is functional, for a production environment you would want to:
   - Implement a proper backend database (instead of LocalStorage)
   - Add server-side authentication
   - Set up proper image hosting

## Appendix

### Glossary

- **Featured Item**: A menu item highlighted on the homepage
- **Availability Status**: Whether an item is currently available for ordering
- **LocalStorage**: A web browser feature that allows websites to store data locally on a user's device
- **CRUD**: Create, Read, Update, Delete - the four basic operations of data storage

### References

- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [HTML5 Specification](https://html.spec.whatwg.org/)
- [CSS3 Reference](https://developer.mozilla.org/en-US/docs/Web/CSS) 