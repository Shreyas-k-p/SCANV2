# 🧪 MANUAL TESTING CHECKLIST

**Before Deployment - MUST TEST ALL**

---

## ✅ **ROLE-BASED TESTING**

### **1. MANAGER ROLE**

**Login:**
- [ ] Login with MGR5710 / 5710
- [ ] See welcome toast
- [ ] Redirected to Manager Dashboard
- [ ] Can see all menu items
- [ ] Can see all orders
- [ ] Can see all staff

**Menu Management:**
- [ ] Can add new menu item
- [ ] Can edit menu item
- [ ] Can delete menu item
- [ ] Can toggle availability
- [ ] See success toast on each action

**Staff Management:**
- [ ] Can add new waiter
- [ ] Can add new kitchen staff
- [ ] Can add new sub-manager
- [ ] Can remove staff
- [ ] See staff list update in real-time

**Orders:**
- [ ] Can view all orders
- [ ] Can change order status
- [ ] Can assign waiter to order
- [ ] Can delete order
- [ ] See real-time order updates

**Analytics:**
- [ ] Can view daily revenue
- [ ] Can see top selling items
- [ ] Can view waiter performance
- [ ] Can see order statistics

**Logout:**
- [ ] Logout works
- [ ] See logout toast
- [ ] Redirected to login
- [ ] Session cleared

---

### **2. WAITER ROLE**

**Login:**
- [ ] Login with waiter credentials
- [ ] See welcome toast
- [ ] Redirected to Waiter Dashboard

**Orders:**
- [ ] Can see assigned orders
- [ ] Can update order status (preparing → ready → served)
- [ ] Cannot skip status (e.g., pending → served should fail)
- [ ] See error toast for invalid transitions
- [ ] See success toast for valid transitions

**Permissions:**
- [ ] Cannot access manager functions
- [ ] Cannot add/remove staff
- [ ] Cannot delete orders

---

### **3. KITCHEN ROLE**

**Login:**
- [ ] Login with kitchen credentials
- [ ] Redirected to Kitchen Dashboard

**Orders:**
- [ ] Can see all pending orders
- [ ] Can mark as preparing
- [ ] Can mark as ready
- [ ] Cannot mark as served (waiter only)
- [ ] See real-time new orders

---

### **4. CUSTOMER (MENU PAGE)**

**Ordering:**
- [ ] Can view menu
- [ ] Can add items to cart
- [ ] Can increase/decrease quantity
- [ ] Can remove items
- [ ] Can see total price
- [ ] Must enter name and mobile
- [ ] See validation error if missing info
- [ ] Order placed successfully
- [ ] See success toast

---

## ✅ **ORDER LIFECYCLE TEST (CRITICAL)**

**Full Flow:**

1. **Customer:**
   - [ ] Place order from menu
   - [ ] Order appears as "pending"

2. **Kitchen:**
   - [ ] See new order notification
   - [ ] Mark as "preparing"
   - [ ] Mark as "ready"

3. **Waiter:**
   - [ ] See ready order
   - [ ] Mark as "served"

4. **Manager:**
   - [ ] Mark as "completed"
   - [ ] See in revenue stats

**Invalid Transitions (MUST FAIL):**
- [ ] pending → served (should show error)
- [ ] preparing → completed (should show error)
- [ ] served → pending (should show error)

---

## ✅ **STATE MACHINE VALIDATION**

**Test these transitions:**

| From | To | Expected |
|------|----|----|
| pending | preparing | ✅ Success |
| pending | served | ❌ Error |
| preparing | ready | ✅ Success |
| preparing | completed | ❌ Error |
| ready | served | ✅ Success |
| served | completed | ✅ Success |
| any | cancelled | ✅ Success |

---

## ✅ **ERROR HANDLING TEST**

**Network Errors:**
- [ ] Disconnect internet
- [ ] See offline screen
- [ ] Reconnect
- [ ] See "Back online" toast
- [ ] App resumes normally

**Invalid Data:**
- [ ] Try to create order with 0 items → Error
- [ ] Try to create order with negative price → Error
- [ ] Try invalid login → Error toast

**Loading States:**
- [ ] All data fetches show spinner
- [ ] No frozen UI
- [ ] Smooth transitions

---

## ✅ **REAL-TIME UPDATES**

**Test Subscriptions:**
- [ ] Open manager dashboard in one tab
- [ ] Open waiter dashboard in another tab
- [ ] Create order in manager → appears in waiter
- [ ] Update status in waiter → updates in manager
- [ ] Add menu item → appears immediately
- [ ] Delete order → disappears immediately

---

## ✅ **UI/UX POLISH**

**Loading States:**
- [ ] Menu loads with spinner
- [ ] Orders load with spinner
- [ ] Staff list loads with spinner
- [ ] No blank screens

**Empty States:**
- [ ] Empty menu shows message
- [ ] No orders shows message
- [ ] No staff shows message

**Toasts:**
- [ ] Success toasts are green
- [ ] Error toasts are red
- [ ] Toasts auto-dismiss
- [ ] Toasts don't stack excessively

---

## ✅ **PERFORMANCE**

**Load Times:**
- [ ] App loads in < 3 seconds
- [ ] Menu loads in < 1 second
- [ ] Orders load in < 1 second
- [ ] No lag when typing

**Responsiveness:**
- [ ] Works on mobile (320px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1920px width)

---

## ✅ **SECURITY**

**RLS Policies:**
- [ ] Cannot access other user's data
- [ ] Cannot bypass authentication
- [ ] Session expires correctly

**Data Validation:**
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CSRF tokens (if applicable)

---

## ✅ **BROWSER COMPATIBILITY**

**Test in:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## ✅ **FINAL CHECKS**

**Before Going Live:**
- [ ] No console errors
- [ ] No console warnings (critical ones)
- [ ] All images load
- [ ] All fonts load
- [ ] Favicon present
- [ ] Meta tags correct
- [ ] SSL certificate valid
- [ ] Environment variables set
- [ ] Database backups enabled
- [ ] Monitoring active

---

## 🚨 **CRITICAL BUGS (MUST FIX)**

**If ANY of these fail, DO NOT DEPLOY:**

- [ ] Login fails
- [ ] Orders don't create
- [ ] Status transitions broken
- [ ] Real-time updates not working
- [ ] App crashes on any role
- [ ] Data loss occurs
- [ ] Security vulnerability found

---

## ✅ **TESTING COMPLETE**

**Sign off:**

- Tested by: _______________
- Date: _______________
- All tests passed: [ ] YES [ ] NO
- Ready for deployment: [ ] YES [ ] NO

**Notes:**
_________________________________
_________________________________
_________________________________

