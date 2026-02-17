# Scan4Serve - Comprehensive Technical Documentation

## 1. Project Overview
Scan4Serve is a "Smart Restaurant OS" web application designed to modernize restaurant operations. It features a role-based system for Managers, Waiters, and Kitchen Staff, along with a customer-facing digital menu and ordering system.

**Key Goals:**
- Streamline order management (Order -> Kitchen -> Serve -> Bill).
- Real-time updates for all staff.
- Digital menu management.
- Comprehensive analytics for managers.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Language:** JavaScript (ES Modules)
- **Styling:** Vanilla CSS (Modular & Global Variables), Lucide React (Icons)
- **State Management:** React Context API (`AppContext`)
- **Routing:** React Router DOM v7
- **PWA Support:** `vite-plugin-pwa` (Installable App)

### Backend & Database
- **Platform:** Supabase (PostgreSQL)
- **Authentication:** Custom Role-based Auth + Supabase RLS
- **Real-time:** Supabase Realtime (WebSockets)
- **Storage:** Supabase Storage (Profile Photos, Menu Images)

### Utilities
- `react-hot-toast`: Notifications
- `uuid`: Unique identifiers

---

## 3. Architecture Overview

The project follows a **Service-Oriented Architecture** on the frontend to decouple UI from backend logic.

### Service Layer (`src/services/`)
All backend interactions are encapsulated in dedicated service files:
1.  **`authService.js`**: Handles staff login, session management, and validation.
2.  **`userService.js`**: Manages user profiles and staff directory.
3.  **`menuService.js`**: CRUD operations for menu items and category management.
4.  **`orderService.js`**: Handles the entire order lifecycle (Create -> Update Status -> Delete).
5.  **`tableService.js`**: Manages table status (Available, Occupied, Billed) and QR codes.

**Design Principles:**
-   **Separation of Concerns:** Components never call Supabase directly.
-   **Consistent API:** All services return `{ success, data, error }`.
-   **Real-time Subscriptions:** Services expose functions to subscribe to DB changes.

---

## 4. Database Schema (Supabase PostgreSQL)

### 1. `profiles` (Staff Accounts)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key (Links to Auth) |
| `staff_id` | TEXT | Unique ID (e.g., MGR5710) |
| `role` | TEXT | Enum: MANAGER, SUB_MANAGER, WAITER, KITCHEN |
| `name` | TEXT | Staff Name |
| `secret_id` | TEXT | Password/Pin |
| `profile_photo` | TEXT | URL to image |

### 2. `menu_items` (Digital Menu)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | TEXT | Check item name |
| `category` | TEXT | e.g., Starters, Main Course |
| `price` | NUMERIC | Item price |
| `available` | BOOLEAN | Stock status |
| `image` | TEXT | Image URL |

### 3. `orders` (Order Tracking)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `table_number` | TEXT | Table identifier |
| `items` | JSONB | Array of ordered items |
| `status` | TEXT | pending -> preparing -> ready -> served -> completed |
| `total_amount` | NUMERIC | Total bill value |
| `assigned_waiter` | TEXT | Staff ID of waiter |

### 4. `tables` (Restaurant Tables)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `table_number` | TEXT | Unique Table No |
| `status` | TEXT | available, occupied, billed |
| `qr_code` | TEXT | QR URL |

### 5. `feedbacks`
Stores customer ratings and comments.

---

## 5. Folder Structure

```
src/
├── components/       # Reusable UI components
│   ├── BrandLogo.jsx # Animated App Logo
│   ├── LoginMascot.jsx
│   ├── MenuBot.jsx   # AI Recommendation Bot
│   └── ...
├── context/
│   └── AppContext.jsx # Global State (User, Orders, Menu)
├── pages/            # Main Application Views
│   ├── Login.jsx     # Role-based Entry
│   ├── ManagerDashboard.jsx
│   ├── WaiterDashboard.jsx
│   ├── KitchenDashboard.jsx
│   └── Menu.jsx      # Customer View
├── services/         # API Layer (Supabase interactions)
│   ├── authService.js
│   ├── orderService.js
│   └── ...
├── utils/            # Helpers
│   ├── translations.js # Multi-language support
│   └── ...
├── App.jsx           # Main Router
└── main.jsx          # Entry Point
```

---

## 6. Key Features & Workflows

### 1. Role-Based Login
-   **Manager/Sub-Manager:** Requires Staff ID + Secret ID.
-   **Waiter/Kitchen:** Requires Staff ID + Name.
-   **Customer:** No login required (access via `/menu`).

### 2. Order Lifecycle
1.  **Customer** places order via Digital Menu.
2.  **Order** appears in `pending` state on Kitchen Dashboard (with sound/vibration).
3.  **Kitchen** marks as `preparing` -> `ready`.
4.  **Waiter** gets notification -> marks as `served`.
5.  **Manager/Waiter** generates bill -> marks table as `billed` -> `available`.

### 3. Real-Time Updates
Uses Supabase Realtime to push updates instantly across all connected devices (Dashboards update without refresh).

### 4. PWA Functionality
The app is installable as a native-like app on Android/iOS via `vite-plugin-pwa`.

---

## 7. Security

-   **RLS (Row Level Security):** Strict policies enforce data access.
    -   *Example:* Only Managers can delete orders. Only Staff can view profiles.
-   **Environment Variables:**
    -   `VITE_SUPABASE_URL`
    -   `VITE_SUPABASE_ANON_KEY`
-   **Audit Logs:** Critical actions (Delete/Update) are logged in `audit_logs` table.

---

## 8. Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```
