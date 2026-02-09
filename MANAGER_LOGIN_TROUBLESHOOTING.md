# 🔧 Manager Login Troubleshooting Guide

## Issue: "Invalid Manager ID or Secret Code" Error

If you're getting this error even with correct credentials, follow these steps:

---

## 🔍 **Step 1: Check Browser Console**

1. **Open the app** at http://localhost:5173/
2. **Press F12** to open Developer Tools
3. **Click on "Console" tab**
4. **Look for these messages**:
   - `📊 Managers loaded from Firebase:` - Shows what managers are in database
   - `🔐 Validating credentials:` - Shows what you're trying to login with
   - `👔 Checking managers:` - Shows the validation process

---

## 🔄 **Step 2: Hard Refresh the Page**

The managers list might not have loaded yet. Do a hard refresh:

### Windows:
```
Ctrl + Shift + R
```

### Mac:
```
Cmd + Shift + R
```

**Wait 3-5 seconds** after refresh before trying to login.

---

## 📋 **Step 3: Try These Exact Credentials**

Copy and paste these EXACTLY (no extra spaces):

### Option 1:
```
Staff ID: MANAGER
Secret Code: 5710
```

### Option 2:
```
Staff ID: MGR5710
Secret Code: 5710
```

---

## 🐛 **Step 4: Debug in Console**

Open browser console (F12) and paste this code:

```javascript
// Check what managers are loaded
console.log("Managers in app:", window.managers);

// Or check localStorage
console.log("Current user:", localStorage.getItem('currentUser'));
```

---

## 🔧 **Step 5: Manual Manager Check**

1. Open browser console (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click on "IndexedDB" or check Network tab
4. Look for Firebase data

---

## ✅ **Step 6: Clear Everything and Retry**

If still not working, clear all data:

1. **Open Developer Tools** (F12)
2. **Go to Application tab** (Chrome) or Storage tab (Firefox)
3. **Click "Clear site data"** or "Clear storage"
4. **Refresh the page** (Ctrl + Shift + R)
5. **Wait 5 seconds** for Firebase to load
6. **Try logging in again**

---

## 🎯 **Common Issues and Solutions**

### Issue 1: "Managers array is empty"
**Solution**: Wait 3-5 seconds after page load. Firebase needs time to sync.

### Issue 2: "Cannot read property 'toUpperCase' of undefined"
**Solution**: The managers haven't loaded yet. Hard refresh and wait.

### Issue 3: "Invalid credentials" but console shows manager exists
**Solution**: Check for extra spaces in your input. Copy-paste the credentials exactly.

### Issue 4: Default manager not created
**Solution**: 
1. Check browser console for errors
2. Make sure Firebase is configured correctly
3. Check `src/firebase/config.js` exists

---

## 🔍 **What to Look For in Console**

When you try to login, you should see:

```
🔐 Validating credentials: { role: 'MANAGER', id: 'MANAGER', secretID: '5710' }
👔 Checking managers: [{id: 'MANAGER', secretID: '5710', name: 'Main Manager'}]
Looking for ID: MANAGER Secret: 5710
Comparing with manager: {id: 'MANAGER', secretID: '5710', name: 'Main Manager'}
ID match: true Secret match: true
Manager found: {name: 'Main Manager', id: 'MANAGER', profilePhoto: ''}
```

If you see `Checking managers: []` (empty array), the managers haven't loaded yet.

---

## 🚀 **Quick Fix Script**

If nothing works, try this in browser console:

```javascript
// Force reload managers
window.location.reload(true);

// After reload, wait 5 seconds, then try login
```

---

## 📞 **Still Not Working?**

If you've tried everything above and it still doesn't work:

1. **Check the browser console** and copy any error messages
2. **Take a screenshot** of the console
3. **Check if Firebase is configured** properly in `src/firebase/config.js`
4. **Verify internet connection** (Firebase needs internet to sync)

---

## 💡 **Pro Tip**

The most common issue is **timing** - the managers list loads from Firebase asynchronously. 

**Always wait 3-5 seconds after page load before trying to login.**

---

## ✅ **Expected Behavior**

When working correctly:
1. Page loads
2. Console shows: `📊 Managers loaded from Firebase: [...]`
3. Console shows: `✅ Found 1 manager(s) in database` (or more)
4. You can login with `MANAGER` / `5710`

---

**Last Updated:** 2026-02-09
