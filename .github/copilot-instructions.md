# Copilot Instructions - Modern Web Application

## 🏗️ Project Architecture

This is a modern web application with a **Lando-based development environment** featuring:

- **Backend**: PHP 8.2 + MySQL 8.0 (LAMP stack via Lando/Docker)
- **Frontend**: Bootstrap 5.3.8 + jQuery 3.7.1 + Swiper 12.x
- **Build System**: Automated CSS-to-SASS conversion with file watching
- **Package Management**: Dual npm/composer with automation scripts
- **Authentication**: Client-side encryption with Web Crypto API + fallbacks

## 🚀 Development Environment

### Lando Configuration (`.lando.yml`)
```yaml
# Key services:
- PHP 8.2 service with custom tooling
- MySQL 8.0 database
- Node.js tooling for frontend builds
- Custom scripts integration
```

### Quick Start Commands
```bash
# Start development environment
lando start

# Install dependencies (automated via check-deps.sh)
./scripts/check-deps.sh

# Start CSS watcher for SASS conversion
./scripts/run-watcher.sh

# Access database
lando mysql
```

## 🔐 Authentication System Architecture

**Location**: `src/assets/js/main.js` (1392 lines)

### Core Security Features
1. **Web Crypto API Implementation** with graceful fallbacks
2. **Client-side encryption** for sensitive data storage
3. **Role-based access control** (admin, editor, subscriber)
4. **Automatic Excel export** with encrypted data handling
5. **LocalStorage-based persistence** with integrity verification

### Key Functions to Understand
```javascript
// Encryption/Decryption (Web Crypto API + XOR fallback)
generateUserKey() // Crypto key generation
encryptData(data, userKey) // AES-GCM encryption
decryptData(encryptedData, userKey) // Decryption with fallbacks

// User Management
registerUser(username, password, email, role) // Full registration flow
loginUser(username, password) // Authentication with encryption
updateUserProfile(newUsername, newEmail, newRole) // Profile updates

// Excel Integration
updateExcelFile() // Auto-sync to Excel format
removeUserFromExcel(username) // Clean user data
downloadCurrentExcel() // Manual export via SheetJS
```

### Authentication Flow
1. User registration → Generate unique encryption key
2. Encrypt user data with Web Crypto API (fallback to XOR)
3. Store encrypted data + key in localStorage
4. Auto-update Excel export with role-based columns
5. Maintain integrity verification for all stored data

## 📁 File Structure & Conventions

```
src/
├── assets/
│   ├── css/
│   │   ├── main.css          # Primary styles (source)
│   │   ├── main.scss         # Auto-generated from main.css
│   │   └── custom.css        # Additional modern styling
│   └── js/
│       └── main.js           # Core application logic (1392 lines)
├── index.html                # Main application page
├── auth-test.html           # Authentication testing interface
└── showcase.html            # Feature demonstration page

scripts/
├── run-watcher.sh           # CSS-to-SASS automation via inotify
├── check-deps.sh            # Dependency installation automation
└── css-to-sass-converter.py # Python converter for CSS→SASS
```

## 🛠️ Build System & Automation

### CSS-to-SASS Workflow
**File**: `scripts/run-watcher.sh`
- Uses `inotify-tools` for file system monitoring
- Automatically converts `main.css` → `main.scss` via Python script
- Preserves SASS structure while maintaining CSS compatibility
- Runs in background during development

### Dependency Management
**File**: `scripts/check-deps.sh`
- Auto-detects missing npm/composer dependencies
- Installs packages based on `package.json`/`composer.json`
- Handles both frontend and backend dependency chains
- Integrates with Lando environment

## 🎨 Frontend Stack & Libraries

### CDN Dependencies (loaded in HTML)
```html
<!-- Core Framework -->
Bootstrap 5.3.8 (CSS + JS)
jQuery 3.7.1

<!-- Specialized Libraries -->
Swiper 12.0.0 (carousel/slider functionality)
SheetJS/XLSX 0.18.5 (Excel export functionality)

<!-- UI Components -->
Bootstrap Icons (icon system)
```

### Styling Architecture
- **Modern CSS3**: Flexbox, Grid, Custom Properties
- **Responsive Design**: Mobile-first Bootstrap approach
- **Animations**: CSS keyframes with performance optimization
- **Glass morphism**: Backdrop filters and transparency effects

## 📊 Excel Integration System

**Dependencies**: SheetJS (XLSX) library
**Storage**: localStorage with automatic sync

### Excel Features
- **Auto-generation** on user registration/updates
- **Role-based columns**: Username, Email, Role, Registration Date, etc.
- **Encryption status tracking** in export data
- **Manual download** via `downloadCurrentExcel()`
- **Data integrity** verification before export

### Excel Column Structure
```
Username | Email | Role | Registration Date | Last Login | Login Count | Last Modified | Security Status
```

## 🔧 Development Patterns & Best Practices

### Code Organization
- **Single-file architecture** for simplicity (`main.js`)
- **Modular functions** with clear responsibilities
- **Async/await patterns** for crypto operations
- **Error handling** with graceful degradation
- **Console logging** with emoji indicators for debugging

### Security Patterns
```javascript
// Always check crypto availability
if (window.crypto && window.crypto.subtle) {
    // Use Web Crypto API
} else {
    // Fallback to XOR encryption
}

// Validate data integrity
const isValid = await verifyDataIntegrity();
```

### Excel Integration Patterns
```javascript
// Update Excel after user changes
await updateExcelFile();

// Remove user from Excel during deletion
await removeUserFromExcel(username);

// Manual export for admin users
downloadCurrentExcel();
```

## 🧪 Testing & Debug Features

### Authentication Testing (`auth-test.html`)
- Isolated testing environment for auth flows
- Console-based debugging tools
- User management interface for testing roles

### Debug Functions
```javascript
verifyDataIntegrity() // Check encrypted data validity
checkExcelStatus() // Verify Excel file state
resetExcelFile() // Clear Excel data for testing
```

## 🌟 Modern Features & UI Patterns

### Contemporary Design Elements
- **Glass morphism effects** with backdrop-filter
- **Gradient backgrounds** (135deg, `#667eea` to `#764ba2`)
- **Smooth animations** with CSS transitions
- **Custom scrollbars** with gradient styling
- **Responsive modals** with Bootstrap integration

### Interactive Components
- **Swiper carousels** for content presentation
- **Bootstrap modals** for user interactions
- **Dynamic form validation** with real-time feedback
- **Loading states** with animated indicators

## 📝 Writing Code for This Project

### When Adding Features
1. **Check authentication state** before sensitive operations
2. **Update Excel export** after data modifications  
3. **Use encryption** for sensitive data storage
4. **Follow single-file pattern** unless complexity requires separation
5. **Add console logging** with emoji indicators
6. **Test with both Web Crypto and fallback** scenarios

### When Modifying Styles
1. **Edit `main.css`** (source file)
2. **Let watcher auto-generate** `main.scss`
3. **Use `custom.css`** for additional modern features
4. **Maintain responsive design** principles
5. **Test glass morphism effects** across browsers

### When Working with User Data
1. **Always encrypt sensitive information**
2. **Update Excel export automatically**
3. **Verify data integrity** after operations
4. **Handle role-based permissions** appropriately
5. **Maintain backward compatibility** with legacy users

## 🚨 Important Implementation Notes

- **No server-side authentication** - fully client-side system
- **Excel files stored in localStorage** - not persistent across browsers
- **Encryption keys generated per-user** - cannot be recovered if lost
- **Role system** supports admin/editor/subscriber levels
- **CSS watcher requires inotify-tools** on Linux systems
- **Lando required** for full development environment

This architecture enables rapid development while maintaining security and modern UX patterns. Focus on encryption-first data handling and automated Excel integration when extending functionality.