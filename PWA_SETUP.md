# PWA Setup Guide

## ✅ What's Included

1. **Service Worker** (`/public/sw.js`) - Handles offline functionality and caching
2. **Web App Manifest** (`/public/manifest.json`) - Defines app metadata
3. **PWA Install Component** - Shows install prompt to users
4. **Offline Support** - App works offline with cached resources

## 📱 Features

- ✅ Installable on mobile and desktop
- ✅ Works offline
- ✅ Fast loading with caching
- ✅ App-like experience
- ✅ Background sync (ready for implementation)

## 🎨 Icons Required

You need to create two icon files:
- `/public/icon-192.png` (192x192 pixels)
- `/public/icon-512.png` (512x512 pixels)

### Quick Icon Creation

1. Use any image editor (Photoshop, GIMP, Canva)
2. Create a square image with your logo
3. Export as PNG at 192x192 and 512x512 sizes
4. Place in `/public/` folder

Or use an online tool:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

## 🚀 Testing PWA

1. Build the app: `npm run build`
2. Serve with HTTPS (required for PWA):
   ```bash
   npx serve -s dist
   ```
3. Open in browser
4. Check "Application" tab in DevTools
5. Look for "Install" button in address bar

## 📝 Notes

- Service Worker only works on HTTPS (or localhost)
- Icons are optional but recommended
- App will work without icons, but won't be installable on some devices

