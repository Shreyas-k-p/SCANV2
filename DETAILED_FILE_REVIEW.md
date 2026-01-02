# 📄 Detailed File-by-File Code Review

## 🔴 AppContext.jsx - CRITICAL ISSUES

### Issue 1: localStorage Synchronous Operations
```javascript
// Line 37-47: Blocking operations
useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
}, [menuItems]);
```
**Problem:**
- Blocks main thread
- No error handling if localStorage fails
- No size checking (5-10MB limit)
- Synchronous - will freeze UI with large data

**Fix:**
```javascript
useEffect(() => {
    try {
        if (menuItems.length > 0) {
            const serialized = JSON.stringify(menuItems);
            if (serialized.length > 4 * 1024 * 1024) { // 4MB check
                console.error('Data too large for localStorage');
                return;
            }
            localStorage.setItem('menuItems', serialized);
        }
    } catch (error) {
        console.error('localStorage error:', error);
        // Fallback to IndexedDB or show error to user
    }
}, [menuItems]);
```

### Issue 2: Race Condition in placeOrder
```javascript
// Line 97-108: Race condition
const placeOrder = (tableNo, items, customerInfo) => {
    const newOrder = { /* ... */ };
    setOrders([...orders, newOrder]); // Uses stale closure
};
```
**Problem:**
- Uses stale `orders` from closure
- Multiple rapid calls = lost orders
- No validation

**Fix:**
```javascript
const placeOrder = useCallback((tableNo, items, customerInfo) => {
    // Validation
    if (!tableNo || !items || items.length === 0) {
        throw new Error('Invalid order data');
    }
    
    setOrders(prev => {
        const newOrder = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Better ID
            tableNo: String(tableNo).trim(),
            items: items.map(item => ({
                ...item,
                price: Number(item.price),
                quantity: Number(item.quantity)
            })),
            customerInfo,
            status: 'pending',
            timestamp: new Date().toISOString(),
            totalAmount: items.reduce((sum, item) => {
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 0;
                return sum + (price * qty);
            }, 0)
        };
        return [...prev, newOrder];
    });
}, []);
```

### Issue 3: No Error Handling in JSON.parse
```javascript
// Line 20-22: Can throw
const saved = localStorage.getItem('menuItems');
return saved ? JSON.parse(saved) : initialMenu;
```
**Problem:**
- JSON.parse can throw on corrupted data
- No fallback
- App crashes

**Fix:**
```javascript
const [menuItems, setMenuItems] = useState(() => {
    try {
        const saved = localStorage.getItem('menuItems');
        if (!saved) return initialMenu;
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : initialMenu;
    } catch (error) {
        console.error('Failed to parse menuItems:', error);
        localStorage.removeItem('menuItems'); // Clear corrupted data
        return initialMenu;
    }
});
```

### Issue 4: Date.now() for IDs - Collision Risk
```javascript
// Line 89: Can collide with concurrent users
const newItem = { ...item, id: Date.now(), available: true };
```
**Problem:**
- Multiple users can generate same ID
- No uniqueness guarantee

**Fix:**
```javascript
const newItem = { 
    ...item, 
    id: `${Date.now()}-${crypto.randomUUID()}`,
    available: true 
};
```

---

## 🔴 Login.jsx - SECURITY ISSUES

### Issue 1: Hardcoded Secret
```javascript
// Line 47: Security vulnerability
if (formData.secret !== '5710-5710') {
```
**Problem:**
- Secret in source code
- Visible in browser DevTools
- No server-side validation

**Fix:**
- Move to environment variable
- Hash comparison on server
- Never expose in client code

### Issue 2: No Input Sanitization
```javascript
// Line 94: XSS vulnerability
value={formData.name}
onChange={e => setFormData({ ...formData, name: e.target.value })}
```
**Problem:**
- Can inject scripts
- No length limits
- No sanitization

**Fix:**
```javascript
const sanitizeInput = (input, maxLength = 100) => {
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, ''); // Basic XSS prevention
};

onChange={e => {
    const sanitized = sanitizeInput(e.target.value, 50);
    setFormData({ ...formData, name: sanitized });
}}
```

### Issue 3: No Rate Limiting
**Problem:**
- Can spam login attempts
- No brute force protection

**Fix:**
- Implement debouncing
- Add server-side rate limiting
- Add CAPTCHA after failed attempts

---

## 🔴 ManagerDashboard.jsx - PERFORMANCE ISSUES

### Issue 1: Expensive Calculations on Every Render
```javascript
// Line 14-31: Recalculates every render
const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.timestamp).toDateString();
    return orderDate === today && o.status === 'completed';
});
```
**Problem:**
- O(n) operation on every render
- Date parsing is expensive
- No memoization

**Fix:**
```javascript
const today = useMemo(() => new Date().toDateString(), []);

const todayOrders = useMemo(() => {
    return orders.filter(o => {
        if (o.status !== 'completed') return false;
        try {
            const orderDate = new Date(o.timestamp).toDateString();
            return orderDate === today;
        } catch (error) {
            console.error('Invalid timestamp:', o.timestamp);
            return false;
        }
    });
}, [orders, today]);

const dailyRevenue = useMemo(() => 
    todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    [todayOrders]
);

const dailyCustomers = useMemo(() => 
    new Set(todayOrders.map(o => String(o.tableNo))).size,
    [todayOrders]
);
```

### Issue 2: Renders All Orders
```javascript
// Line 101: No pagination
{orders.slice().reverse().map(order => (
```
**Problem:**
- Renders potentially thousands of rows
- No virtualization
- Memory intensive

**Fix:**
```javascript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 50;

const paginatedOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
}, [orders, currentPage]);

// Or use react-window for virtualization
```

### Issue 3: No Error Handling for Invalid Data
```javascript
// Line 104: Can throw
<td>{new Date(order.timestamp).toLocaleString()}</td>
```
**Problem:**
- Invalid timestamp crashes component
- No fallback

**Fix:**
```javascript
const formatDate = (timestamp) => {
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString();
    } catch (error) {
        return 'Invalid Date';
    }
};

<td>{formatDate(order.timestamp)}</td>
```

---

## 🔴 Menu.jsx - MULTIPLE ISSUES

### Issue 1: No Cart Validation
```javascript
// Line 21-28: No validation
const addToCart = (item, quantity, notes) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity, notes } : i));
    }
```
**Problem:**
- No quantity limits
- No price validation
- Can add unavailable items

**Fix:**
```javascript
const addToCart = useCallback((item, quantity, notes) => {
    if (!item.available) {
        alert('Item is not available');
        return;
    }
    
    const qty = Math.max(1, Math.min(100, Number(quantity) || 1)); // Limit 1-100
    const sanitizedNotes = String(notes || '').slice(0, 200); // Max 200 chars
    
    setCart(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
            return prev.map(i => 
                i.id === item.id 
                    ? { ...i, quantity: Math.min(100, i.quantity + qty), notes: sanitizedNotes }
                    : i
            );
        }
        return [...prev, { ...item, quantity: qty, notes: sanitizedNotes }];
    });
}, []);
```

### Issue 2: alert() Blocks UI
```javascript
// Line 32, 38, 47: Poor UX
alert('Please enter your table number');
```
**Problem:**
- Blocks entire browser
- Not accessible
- Poor UX

**Fix:**
- Use toast notifications (react-toastify)
- Or inline error messages
- Or modal dialogs

### Issue 3: No Image Error Handling
```javascript
// Line 95: Broken images show nothing
<img src={item.image} alt={item.name} />
```
**Problem:**
- No fallback for broken images
- No loading state

**Fix:**
```javascript
const [imageError, setImageError] = useState(false);

<img 
    src={item.image} 
    alt={item.name}
    onError={() => setImageError(true)}
    style={{ display: imageError ? 'none' : 'block' }}
/>
{imageError && <div>Image not available</div>}
```

---

## 🔴 WaiterDashboard.jsx - ISSUES

### Issue 1: Inefficient Filtering
```javascript
// Line 7: Called for every table on every render
const getTableOrders = (tableNo) => orders.filter(o => 
    String(o.tableNo) === String(tableNo) && o.status !== 'completed'
);
```
**Problem:**
- O(n) for each table
- Called 8 times per render
- No memoization

**Fix:**
```javascript
const tableOrdersMap = useMemo(() => {
    const map = new Map();
    orders.forEach(order => {
        if (order.status === 'completed') return;
        const tableNo = String(order.tableNo);
        if (!map.has(tableNo)) {
            map.set(tableNo, []);
        }
        map.get(tableNo).push(order);
    });
    return map;
}, [orders]);

// Then use:
const tableOrders = tableOrdersMap.get(String(table)) || [];
```

### Issue 2: Using Array Index as Key
```javascript
// Line 34: Anti-pattern
{order.items.map((it, idx) => (
    <li key={idx}>{it.name} x{it.quantity}</li>
))}
```
**Problem:**
- React can't track items properly
- Can cause rendering issues

**Fix:**
```javascript
{order.items.map((it, idx) => (
    <li key={`${order.id}-${it.id || idx}-${it.name}`}>
        {it.name} x{it.quantity}
    </li>
))}
```

---

## 🔴 KitchenDashboard.jsx - ISSUES

### Issue 1: No Optimistic Updates
```javascript
// Line 43: No loading state
onClick={() => updateOrderStatus(order.id, 'ready')}
```
**Problem:**
- No feedback during update
- Can double-click
- No error handling

**Fix:**
```javascript
const [updating, setUpdating] = useState(new Set());

const handleMarkReady = useCallback(async (orderId) => {
    setUpdating(prev => new Set(prev).add(orderId));
    try {
        await updateOrderStatus(order.id, 'ready');
    } catch (error) {
        alert('Failed to update order');
    } finally {
        setUpdating(prev => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
        });
    }
}, [updateOrderStatus]);

<button 
    disabled={updating.has(order.id)}
    onClick={() => handleMarkReady(order.id)}
>
    {updating.has(order.id) ? 'Updating...' : 'Mark Ready'}
</button>
```

---

## 🔴 Layout.jsx - ISSUES

### Issue 1: No Loading State
```javascript
// Line 30: Can be undefined
{user?.name?.[0]?.toUpperCase() || 'U'}
```
**Problem:**
- No loading indicator
- Shows 'U' during load

**Fix:**
```javascript
{user ? (
    <div>
        <div>{user.name?.[0]?.toUpperCase() || 'U'}</div>
        <div>{user.name || 'Guest'}</div>
    </div>
) : (
    <div>Loading...</div>
)}
```

---

## 🔴 App.jsx - ISSUES

### Issue 1: No Error Boundary
```javascript
// No error handling wrapper
function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>...</Routes>
                </Layout>
            </BrowserRouter>
        </AppProvider>
    );
}
```
**Problem:**
- One error crashes entire app

**Fix:**
```javascript
function App() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <BrowserRouter>
                    <Layout>
                        <Routes>...</Routes>
                    </Layout>
                </BrowserRouter>
            </AppProvider>
        </ErrorBoundary>
    );
}
```

---

## 📊 Summary of Required Fixes

### Critical (Must Fix)
1. ✅ Add error boundaries
2. ✅ Add input validation
3. ✅ Add memoization (useMemo, useCallback)
4. ✅ Fix race conditions (functional updates)
5. ✅ Add error handling (try-catch)
6. ✅ Add pagination/virtualization
7. ✅ Remove hardcoded secrets
8. ✅ Add loading states

### High Priority
1. Replace alert() with toast notifications
2. Add image error handling
3. Add optimistic updates
4. Fix key props
5. Add debouncing for inputs

### Medium Priority
1. Add TypeScript
2. Add unit tests
3. Add accessibility
4. Add monitoring

---

*This review identifies specific code issues. See CRITICAL_CODE_REVIEW.md for architectural concerns.*

