# Campus Cafe Technical Documentation

This technical guide provides details about the system architecture, code organization, and implementation details of the Campus Cafe system.

## System Architecture

The Campus Cafe system follows a client-side architecture with the following components:

### Frontend Components
- **HTML**: Provides the structure and content
- **CSS**: Handles styling and responsiveness
- **JavaScript**: Implements business logic and UI interactions

### Data Storage
- Uses the browser's **LocalStorage API** for persistent data storage
- Implements a structured data model for menu items, user preferences, etc.

## Directory Structure

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

## Data Models

### Menu Item

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

## Core Utilities

### Storage Manager

The `storage.js` utility provides an abstraction layer for working with LocalStorage:

```javascript
// Key storage functions:
getMenuItems()          // Retrieves all menu items
getMenuItem(id)         // Gets a specific menu item by ID
saveMenuItem(item)      // Saves a menu item
deleteMenuItem(id)      // Deletes a menu item
getDefaultMenuItems()   // Gets default items if none exist
```

### Authentication Manager

The `auth.js` utility handles admin authentication:

```javascript
// Key auth functions:
login(username, password)  // Authenticates admin
logout()                  // Logs out admin
isLoggedIn()              // Checks if admin is logged in
```

## UI Components

### Menu Management Interface

The menu management interface in `admin/manage-menu.html` provides:

1. **Item Listing**: Table with sortable columns
2. **Search & Filter**: Real-time filtering of menu items
3. **CRUD Operations**:
   - Create new menu items
   - Read existing items
   - Update item details
   - Delete items

### Menu Display

The public menu interface in `menu.html` provides:

1. **Category Organization**: Items grouped by category
2. **Search Functionality**: Filter by name/description
3. **Availability Filtering**: Only shows available items by default

## Implementation Details

### Menu Loading Process

1. `menu.js`: The `initMenuPage()` function:
   - Retrieves items from localStorage using `storageManager.getMenuItems()`
   - Filters out unavailable items
   - Organizes items by category
   - Renders the menu DOM elements

### Item Filtering

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

## Extending the System

### Adding New Features

To add new features to the system:

1. **New Menu Item Properties**:
   - Add the property to the item form in `manage-menu.html`
   - Update the `handleSaveItem()` function in `menu-manager.js`
   - Update the display logic in both admin and public interfaces

2. **New Pages**:
   - Create a new HTML file with appropriate structure
   - Link to it from the navigation menu
   - Create corresponding JavaScript files for functionality

### Customizing Styles

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

## Security Considerations

1. **Authentication**: The system uses a simple authentication mechanism for demo purposes. In a production environment, implement:
   - Server-side authentication
   - Secure password storage
   - Session management

2. **Data Storage**: LocalStorage is used for convenience in this demonstration. For production:
   - Move to a server-side database
   - Implement proper API endpoints
   - Add data validation and sanitization

# Firebase Integration

## Firebase Authentication

The Campus Cafe system now uses Firebase Authentication for user management:

- **Google Sign-In**: Users can sign in using their Google account
- **Email/Password**: Admin authentication
- **Authentication State Management**: Persists user sessions

### Key Authentication Files

- `js/utils/firebase.js`: Firebase initialization and configuration
- `js/login.js`: Handles Google Sign-In process
- `js/admin/login.js`: Admin authentication

### Authentication Flow

1. User clicks "Sign in with Google" button
2. Firebase Authentication popup appears
3. After successful authentication, user data is stored in:
   - Firebase Realtime Database
   - Local storage for persistence
4. Auth state listener redirects unauthenticated users to login page

## Firebase Realtime Database

The system uses Firebase Realtime Database for data storage:

- **Menu Items**: Stores all menu items with categories, prices, etc.
- **Orders**: Tracks customer orders with status updates
- **Users**: Stores user profile information
- **Admin**: Admin account information

### Database Structure

```
/
├── menu/                     # Menu items by ID
│   ├── item_1/               
│   │   ├── name              
│   │   ├── price             
│   │   ├── description       
│   │   ├── category          
│   │   ├── featured          
│   │   └── availability      
│   └── ...                   
├── orders/                   # Order information by ID
│   ├── order_1/              
│   │   ├── userId            
│   │   ├── items             
│   │   ├── status            
│   │   └── timestamp         
│   └── ...                   
├── users/                    # User profiles by UID
│   ├── user_1/               
│   │   ├── email             
│   │   ├── name              
│   │   ├── photoURL          
│   │   └── lastLogin         
│   └── ...                   
└── admin/                    # Admin accounts by ID
    └── admin@example.com/    
        ├── email             
        └── password          
```

### Security Rules

The database is secured with Firebase Security Rules:

- Public read-only access to menu items
- Authenticated read/write for orders
- User-specific read/write for user profiles
- Admin-only access for menu management

For more details, see `database.rules.json`. 