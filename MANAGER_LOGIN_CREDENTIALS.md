# 🔐 Manager Login Credentials

## Default Manager Account

Your application has **TWO** manager accounts set up:

---

## 📋 **Option 1: Default Manager** (Auto-created)

This manager is automatically created if no managers exist in the database.

### **Login Credentials:**

| Field | Value |
|-------|-------|
| **Staff ID** | `MANAGER` |
| **Secret Code** | `5710` |
| **Name** | Main Manager |

### **How to Login:**
1. Select **"Manager"** role on login page
2. Enter Staff ID: `MANAGER`
3. Enter Secret Code: `5710`
4. Click "Access Dashboard"

---

## 📋 **Option 2: Custom Manager** (Previously Added)

This manager was manually added to Firebase.

### **Login Credentials:**

| Field | Value |
|-------|-------|
| **Staff ID** | `MGR5710` |
| **Secret Code** | `5710` |
| **Name** | SHREYAS |

### **How to Login:**
1. Select **"Manager"** role on login page
2. Enter Staff ID: `MGR5710`
3. Enter Secret Code: `5710`
4. Click "Access Dashboard"

---

## 🎯 **Quick Reference Card**

```
╔════════════════════════════════════════╗
║     MANAGER LOGIN CREDENTIALS          ║
╠════════════════════════════════════════╣
║                                        ║
║  DEFAULT MANAGER:                      ║
║  ├─ Staff ID: MANAGER                  ║
║  └─ Secret Code: 5710                  ║
║                                        ║
║  CUSTOM MANAGER:                       ║
║  ├─ Staff ID: MGR5710                  ║
║  └─ Secret Code: 5710                  ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## 📝 **Important Notes:**

1. **Both accounts work** - You can use either one
2. **Same secret code** - Both use `5710` for easy remembering
3. **Case insensitive** - Login works with any case (MANAGER, manager, Manager)
4. **Auto-creation** - If database is empty, default manager is created automatically
5. **Persistent** - Credentials are stored in Firebase permanently

---

## 🔄 **Troubleshooting:**

### If login doesn't work:

1. **Hard Refresh** the browser:
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Wait 2-3 seconds** after page loads for Firebase to sync

3. **Check browser console** (F12) for any errors

4. **Try both accounts**:
   - First try: `MANAGER` / `5710`
   - Then try: `MGR5710` / `5710`

5. **Clear browser cache** if still not working

---

## 🚀 **After Login:**

Once logged in as Manager, you can:

- ✅ **Add/Remove Staff**: Waiters, Kitchen Staff, Sub-Managers
- ✅ **Manage Menu**: Add, edit, or remove menu items
- ✅ **View Orders**: Monitor all active orders
- ✅ **Manage Tables**: Add or remove tables
- ✅ **View Analytics**: Check feedback and statistics
- ✅ **Add More Managers**: Create additional manager accounts

---

## 📱 **Login URL:**

```
http://localhost:5173/
```

Or your deployed URL if in production.

---

## 🔒 **Security Notes:**

- **Change the default secret code** in production
- **Don't share credentials** publicly
- **Use strong secret codes** for new managers
- **Regularly audit** manager accounts

---

**Last Updated:** 2026-02-09

**Status:** ✅ Both accounts are active and ready to use
