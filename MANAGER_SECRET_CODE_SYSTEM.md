# Manager Secret Code Authentication System

## Overview
This implementation adds a secure authentication system for managers where each manager gets a unique secret code generated when they are added through the Manager Dashboard. This secret code must be used to login to their dashboard.

## Key Features

### 1. **Multiple Managers Support**
- The system now supports multiple managers, each with their own credentials
- Each manager gets a unique ID (format: `MGR-XXXXX`) and a 5-character secret code
- Managers are stored in Firebase Firestore for persistence

### 2. **Secret Code Generation**
- When a manager is added, a random 5-character secret code is automatically generated
- The code uses alphanumeric characters (excluding confusing ones like I, 1, O, 0)
- The secret code is displayed immediately after creation and must be shared with the manager

### 3. **Manager Dashboard Integration**
- New "Managers" tab in the Manager Dashboard
- Shows count of managers: `👔 Managers (X)`
- Displays all managers with their:
  - Profile photo
  - Name
  - Manager ID
  - Secret code (with copy-to-clipboard functionality)
- "Add Manager" button to create new manager accounts
- Delete functionality for removing managers

### 4. **Add Manager Modal**
The modal includes:
- **Name field**: Required input for manager's name
- **Profile Photo**: Optional file upload (max 800KB)
- **Success screen**: Shows the generated secret code that must be shared

### 5. **Login Validation**
- Managers must provide both their Manager ID and Secret Code to login
- The system validates credentials against the Firebase database
- Invalid credentials show error: "Invalid Manager ID or Secret Code"
- Successful login redirects to the Manager Dashboard

## Files Modified

### 1. **src/services/managerService.js**
- Changed from single manager to multiple managers support
- Added `addManagerToDB()` - Creates new manager with secret code
- Added `listenToManagers()` - Real-time listener for all managers
- Added `removeManagerFromDB()` - Deletes a manager

### 2. **src/context/AppContext.jsx**
- Added `managers` state array
- Added `addManager()` function - Creates manager with auto-generated secret code
- Added `removeManager()` function - Removes manager by document ID
- Updated `validateSecretID()` to support MANAGER role validation
- Added Firebase listener for managers collection

### 3. **src/pages/Login.jsx**
- Removed hardcoded `SECRET_IDS` object
- Updated manager login to validate against database using `validateSecretID()`
- All roles (MANAGER, KITCHEN, SUB_MANAGER) now validate against database
- Improved error messages for invalid credentials

### 4. **src/pages/ManagerDashboard.jsx**
- Added managers tab to navigation
- Added state for manager modal and photo upload
- Added `handleManagerImageChange()` for profile photo processing
- Created complete Managers tab UI showing all managers
- Added "Add Manager" modal with form and success screen
- Integrated manager CRUD operations

## How It Works

### Adding a New Manager

1. **Main Manager logs in** to the Manager Dashboard
2. **Clicks "Managers" tab** to view all managers
3. **Clicks "Add Manager" button**
4. **Fills in the form**:
   - Enter manager's name (required)
   - Upload profile photo (optional)
5. **Clicks "Create Manager Account"**
6. **System generates**:
   - Unique Manager ID (e.g., `MGR-12345`)
   - Random 5-character secret code (e.g., `A3K9P`)
7. **Success screen displays** the secret code
8. **Main manager copies** and shares the credentials with the new manager

### Manager Login Process

1. **New manager goes to login page**
2. **Selects "Manager" role**
3. **Enters credentials**:
   - Staff ID: `MGR-12345` (provided by main manager)
   - Secret Key: `A3K9P` (provided by main manager)
4. **System validates** credentials against Firebase database
5. **If valid**: Redirects to Manager Dashboard
6. **If invalid**: Shows error message

## Security Features

1. **Database Validation**: All credentials validated against Firebase
2. **Unique Secret Codes**: Each manager has a unique, randomly generated code
3. **No Hardcoded Passwords**: Removed all hardcoded secret IDs
4. **Case-Insensitive Matching**: IDs and secret codes work regardless of case
5. **Secure Storage**: All manager data stored in Firebase Firestore

## Database Structure

### Firestore Collection: `managers`
```javascript
{
  id: "MGR-12345",           // Unique manager ID
  name: "John Doe",          // Manager's name
  email: "",                 // Optional email
  profilePhoto: "base64...", // Optional profile photo (Base64)
  secretID: "A3K9P",         // 5-character secret code
  createdAt: Timestamp       // Creation timestamp
}
```

## User Interface

### Managers Tab
- **Header**: "👔 Manager Management"
- **Add Button**: Purple gradient button with UserPlus icon
- **Manager Cards**: Grid layout showing:
  - Profile photo (40x40px circle)
  - Manager name
  - Manager ID
  - Secret code in highlighted box
  - Copy button for secret code
  - Delete button (red gradient)

### Add Manager Modal
- **Form View**:
  - Title: "Add Manager"
  - Name input field
  - File upload for profile photo
  - Photo preview (80x80px circle)
  - "Create Manager Account" button

- **Success View**:
  - Green checkmark icon
  - "Manager Added!" heading
  - Instructions to share credentials
  - Large secret code display (purple color)
  - "Done" button to close

## Testing the Feature

1. **Start the development server**: `npm run dev`
2. **Login as main manager** (if you have existing manager credentials)
3. **Navigate to "Managers" tab**
4. **Click "Add Manager"**
5. **Create a test manager** with name "Test Manager"
6. **Copy the generated secret code**
7. **Logout**
8. **Try logging in** with the new manager credentials
9. **Verify successful login** to Manager Dashboard

## Important Notes

- **First Manager**: You'll need to manually add the first manager to the database or create a setup script
- **Secret Code Security**: The secret code is only shown once when created - make sure to copy it!
- **Profile Photos**: Optional but recommended for better UX
- **Deletion**: Deleting a manager is permanent and cannot be undone
- **Active Sessions**: Only one manager can be logged in at a time (per the existing logic)

## Future Enhancements

Potential improvements for this system:
1. Email notifications with credentials
2. Password reset functionality
3. Two-factor authentication
4. Manager permissions/roles system
5. Activity logging for managers
6. Bulk manager import/export
7. Manager profile editing
8. Secret code regeneration option
