# 🔴 FINAL PRE-LAUNCH CHECKLIST

**DO NOT DEPLOY UNTIL ALL ITEMS ARE CHECKED**

---

## ✅ **1. SECURITY HARDENING**

### Database Security:
- [ ] Run `supabase_hardening.sql` in Supabase SQL Editor
- [ ] Verify NO policies with `using (true)` exist
- [ ] Check `security_audit` view for open policies
- [ ] Test that customers can't access staff data
- [ ] Test that waiters can't delete orders
- [ ] Test that kitchen can't manage menu

**How to verify:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM security_audit WHERE qual LIKE '%true%';
-- Should return ZERO rows with permissive policies
```

### Frontend Security:
- [ ] No API keys in frontend code
- [ ] No sensitive data in localStorage (except session)
- [ ] All environment variables start with `VITE_`
- [ ] `.env` file in `.gitignore`

---

## ✅ **2. ERROR LOGGING & MONITORING**

### Error Logging:
- [ ] `error_logs` table created
- [ ] Global error handler initialized (check console for "✅ Global error handler initialized")
- [ ] Login failures logged to database
- [ ] Test: Trigger an error and check `error_logs` table

**How to test:**
```javascript
// In browser console
throw new Error('Test error');
// Check Supabase → error_logs table
```

### Monitoring Views:
- [ ] `daily_metrics` view exists
- [ ] `failed_operations` view exists
- [ ] `login_failures` view exists
- [ ] Can query these views without errors

**How to verify:**
```sql
SELECT * FROM daily_metrics LIMIT 5;
SELECT * FROM failed_operations;
SELECT * FROM login_failures;
```

---

## ✅ **3. DUPLICATE ORDER PREVENTION**

### Database Trigger:
- [ ] `check_duplicate_order()` function exists
- [ ] Trigger `prevent_duplicate_orders` active
- [ ] Test: Try placing same order twice within 5 minutes
- [ ] Should see error: "Duplicate order detected"

**How to test:**
1. Place an order from menu
2. Immediately place exact same order
3. Should be blocked

---

## ✅ **4. OFFLINE RECOVERY**

### Offline Support:
- [ ] `useNetwork` hook working
- [ ] `OfflineScreen` displays when offline
- [ ] `cacheService` caching menu
- [ ] Orders queued when offline
- [ ] Orders auto-submit when back online

**How to test:**
1. Open app
2. Disconnect internet (DevTools → Network → Offline)
3. See offline screen
4. Reconnect
5. See "Back online!" toast

### Cache Testing:
- [ ] Menu loads from cache when offline
- [ ] Pending orders saved to queue
- [ ] No duplicate orders after reconnect

---

## ✅ **5. PERFORMANCE**

### Lighthouse Score:
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 80

**How to test:**
1. Open Chrome DevTools
2. Lighthouse tab
3. Run audit
4. Check scores

### Load Times:
- [ ] App loads in < 3 seconds
- [ ] Menu loads in < 1 second
- [ ] Order status updates in < 1 second
- [ ] No UI freezing

**How to test:**
1. Hard refresh (Ctrl+Shift+R)
2. Check Network tab load time
3. Test on slow 3G (DevTools → Network → Slow 3G)

---

## ✅ **6. REAL DEVICE TESTING**

### Mobile Testing:
- [ ] Tested on iPhone (Safari)
- [ ] Tested on Android (Chrome)
- [ ] Tested on tablet
- [ ] Responsive at 320px width
- [ ] No horizontal scroll
- [ ] Touch targets > 44px

### Network Testing:
- [ ] Works on WiFi
- [ ] Works on 4G
- [ ] Works on slow 3G
- [ ] Handles network drops gracefully

---

## ✅ **7. DATA BACKUP**

### Supabase Backups:
- [ ] Go to Supabase → Database → Backups
- [ ] Enable "Point-in-time Recovery"
- [ ] Set retention: 7 days minimum
- [ ] Verify backup schedule active

**CRITICAL:** Without backups, data loss = disaster

---

## ✅ **8. ROLE-BASED TESTING**

### Manager:
- [ ] Can login with MGR5710 / 5710
- [ ] Can add/edit/delete menu items
- [ ] Can add/remove staff
- [ ] Can view all orders
- [ ] Can change order status
- [ ] Can view analytics

### Waiter:
- [ ] Can login with waiter credentials
- [ ] Can see assigned orders
- [ ] Can update order status (valid transitions only)
- [ ] Cannot delete orders
- [ ] Cannot manage staff

### Kitchen:
- [ ] Can login with kitchen credentials
- [ ] Can see all orders
- [ ] Can mark as preparing/ready
- [ ] Cannot mark as served
- [ ] Cannot manage menu

### Customer:
- [ ] Can view menu
- [ ] Can place order
- [ ] Must enter name and mobile
- [ ] See success toast after order

---

## ✅ **9. STATE MACHINE VALIDATION**

### Valid Transitions (MUST WORK):
- [ ] pending → preparing ✅
- [ ] preparing → ready ✅
- [ ] ready → served ✅
- [ ] served → completed ✅
- [ ] any → cancelled ✅

### Invalid Transitions (MUST FAIL):
- [ ] pending → served ❌
- [ ] preparing → completed ❌
- [ ] served → pending ❌
- [ ] ready → preparing ❌

**How to test:**
1. Create order (pending)
2. Try to mark as "served" directly
3. Should see error toast
4. Check `error_logs` for `invalid_state_transition`

---

## ✅ **10. ERROR HANDLING**

### Toast Notifications:
- [ ] Login success shows toast
- [ ] Login failure shows toast
- [ ] Order created shows toast
- [ ] Order updated shows toast
- [ ] Invalid transition shows error toast
- [ ] Network error shows toast

### Loading States:
- [ ] Menu shows spinner while loading
- [ ] Orders show spinner while loading
- [ ] Staff list shows spinner while loading
- [ ] Empty states show when no data
- [ ] Error states show on failure

---

## ✅ **11. CONSOLE CHECKS**

### No Errors:
- [ ] Open DevTools → Console
- [ ] No red errors
- [ ] No unhandled promise rejections
- [ ] No 404s in Network tab
- [ ] No CORS errors

### Expected Logs:
- [ ] "✅ Global error handler initialized"
- [ ] "✅ Order created successfully"
- [ ] "✅ Staff validated"
- [ ] "📡 Order change detected" (real-time)

---

## ✅ **12. ENVIRONMENT VARIABLES**

### Local (.env):
- [ ] `VITE_SUPABASE_URL` set
- [ ] `VITE_SUPABASE_ANON_KEY` set
- [ ] No Firebase variables (removed)

### Vercel (Production):
- [ ] Environment variables added
- [ ] Applied to all environments
- [ ] No typos in variable names

---

## ✅ **13. BUILD & DEPLOYMENT**

### Build Test:
- [ ] Run `npm run build`
- [ ] Build completes without errors
- [ ] `dist` folder created
- [ ] Check `dist` size < 5MB

**How to test:**
```bash
npm run build
ls -lh dist
```

### Deployment Ready:
- [ ] Code pushed to GitHub
- [ ] All tests passed
- [ ] No console errors
- [ ] Performance > 80
- [ ] Backups enabled

---

## ✅ **14. PILOT RESTAURANT READY**

### Pilot Plan:
- [ ] 1 restaurant identified
- [ ] 1 manager account created
- [ ] 2 waiter accounts created
- [ ] 1 kitchen account created
- [ ] Menu items added
- [ ] Tables configured

### Training Materials:
- [ ] Manager guide ready
- [ ] Waiter guide ready
- [ ] Kitchen guide ready
- [ ] Customer instructions ready

---

## 🚨 **CRITICAL BLOCKERS**

**DO NOT DEPLOY if ANY of these are true:**

- [ ] Console has errors
- [ ] Login doesn't work
- [ ] Orders don't create
- [ ] State machine broken
- [ ] Real-time not working
- [ ] Performance < 70
- [ ] No backups enabled
- [ ] Open RLS policies exist
- [ ] Duplicate orders not prevented
- [ ] Error logging not working

---

## 📊 **FINAL SCORE**

Count your checkmarks:

- **Security:** ___/10
- **Monitoring:** ___/8
- **Offline:** ___/6
- **Performance:** ___/6
- **Mobile:** ___/6
- **Backups:** ___/4
- **Testing:** ___/24
- **State Machine:** ___/9
- **Error Handling:** ___/11
- **Console:** ___/5
- **Environment:** ___/5
- **Build:** ___/4
- **Pilot:** ___/8

**TOTAL:** ___/106

**Required to deploy:** 100/106 (94%)

---

## ✅ **DEPLOYMENT AUTHORIZATION**

**I certify that:**

- [ ] All critical items checked
- [ ] No blockers exist
- [ ] Score > 94%
- [ ] Pilot restaurant ready
- [ ] Rollback plan ready
- [ ] Monitoring active

**Authorized by:** _______________  
**Date:** _______________  
**Score:** ___/106

---

## 🚀 **READY TO DEPLOY?**

**If score > 94% and no blockers:**

1. Run `supabase_hardening.sql`
2. Enable backups
3. Push to GitHub
4. Deploy to Vercel
5. Monitor for 24 hours
6. Launch pilot

**If score < 94%:**

STOP. Fix failing items. Re-test. Don't rush.

---

**Remember:** 
- 100% technical readiness ≠ 100% real-world readiness
- Pilot testing will reveal issues
- Monitor closely for first week
- Be ready to rollback

**This is not a demo anymore. This is real.** 🎯

