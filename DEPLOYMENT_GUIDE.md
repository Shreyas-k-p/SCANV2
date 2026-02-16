# 🚀 DEPLOYMENT GUIDE

**Deploy ScanNServe to Production**

---

## **PREREQUISITES**

Before deploying, ensure:

- [x] All tests passed (see TESTING_CHECKLIST.md)
- [x] No console errors
- [x] Toast notifications working
- [x] Loading states everywhere
- [x] Offline support implemented
- [x] Production SQL script run in Supabase

---

## **STEP 1: PREPARE CODE**

### 1.1 Clean Up

```bash
# Remove development files
rm -rf node_modules
rm -rf dist

# Reinstall dependencies
npm install

# Build for production
npm run build
```

### 1.2 Verify Build

```bash
# Check dist folder exists
ls dist

# Should see:
# - index.html
# - assets/
# - vite.svg
```

---

## **STEP 2: PUSH TO GITHUB**

### 2.1 Initialize Git (if not done)

```bash
git init
git add .
git commit -m "Production ready - Supabase migration complete"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `scan4serve`
3. Description: "Smart Restaurant Management System"
4. Public or Private: **Private** (recommended)
5. Click "Create repository"

### 2.3 Push Code

```bash
git remote add origin https://github.com/YOUR_USERNAME/scan4serve.git
git branch -M main
git push -u origin main
```

---

## **STEP 3: DEPLOY TO VERCEL**

### 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### 3.2 Import Project

1. Click "Add New..." → "Project"
2. Select your GitHub repository: `scan4serve`
3. Click "Import"

### 3.3 Configure Build Settings

**Framework Preset:** Vite

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

### 3.4 Add Environment Variables

Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://ohkrzxcmueodijbhxxgx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK` |

**IMPORTANT:** Add to all environments (Production, Preview, Development)

### 3.5 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. You'll see: "🎉 Congratulations!"

---

## **STEP 4: CONFIGURE CUSTOM DOMAIN (Optional)**

### 4.1 Add Domain

1. Go to Project Settings → Domains
2. Add your domain: `yourdomain.com`
3. Follow DNS configuration instructions

### 4.2 DNS Settings

Add these records to your domain provider:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 Verify

Wait 5-10 minutes, then visit your domain.

---

## **STEP 5: SUPABASE PRODUCTION CONFIG**

### 5.1 Run Production SQL

1. Open Supabase SQL Editor
2. Run `supabase_production_setup.sql`
3. Verify no errors

### 5.2 Enable Backups

1. Go to Supabase Dashboard → Database → Backups
2. Enable "Point-in-time Recovery"
3. Set retention: 7 days minimum

### 5.3 Configure Rate Limiting

1. Go to Settings → API
2. Enable rate limiting
3. Set limits:
   - Anonymous: 100 requests/minute
   - Authenticated: 1000 requests/minute

### 5.4 Review RLS Policies

1. Go to Authentication → Policies
2. Verify all tables have RLS enabled
3. Remove any "Allow all" development policies

---

## **STEP 6: POST-DEPLOYMENT CHECKS**

### 6.1 Test Production URL

Visit your Vercel URL: `https://scan4serve.vercel.app`

**Test:**
- [ ] App loads
- [ ] No console errors
- [ ] Login works
- [ ] Can create order
- [ ] Real-time updates work
- [ ] Toast notifications appear

### 6.2 Performance Check

Use Google PageSpeed Insights:
https://pagespeed.web.dev/

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### 6.3 Mobile Test

Test on actual devices:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet

---

## **STEP 7: MONITORING SETUP**

### 7.1 Vercel Analytics

1. Go to Project → Analytics
2. Enable "Web Analytics"
3. Monitor:
   - Page views
   - Unique visitors
   - Performance metrics

### 7.2 Supabase Monitoring

1. Go to Supabase → Reports
2. Monitor:
   - API requests
   - Database size
   - Active connections

### 7.3 Error Tracking (Optional)

**Option A: Sentry**
```bash
npm install @sentry/react
```

**Option B: LogRocket**
```bash
npm install logrocket
```

---

## **STEP 8: FINAL PRODUCTION CHECKLIST**

**Before announcing to users:**

- [ ] App deployed and accessible
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Environment variables set
- [ ] Database backups enabled
- [ ] RLS policies strict
- [ ] All tests passed
- [ ] Performance > 90
- [ ] Mobile responsive
- [ ] Offline support works
- [ ] Toast notifications work
- [ ] Loading states everywhere
- [ ] Error handling complete
- [ ] Monitoring active

---

## **TROUBLESHOOTING**

### Build Fails

**Error:** "Module not found"
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working

1. Check variable names start with `VITE_`
2. Redeploy after adding variables
3. Clear browser cache

### App Loads But Blank Screen

1. Check browser console for errors
2. Verify Supabase URL and key
3. Check RLS policies allow access

### Real-time Not Working

1. Enable realtime in Supabase
2. Check table replication settings
3. Verify network not blocking WebSockets

---

## **ROLLBACK PLAN**

If something breaks:

1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback!

---

## **CONTINUOUS DEPLOYMENT**

**Automatic deployments:**

Every `git push` to `main` branch will:
1. Trigger new Vercel build
2. Run tests (if configured)
3. Deploy to production
4. Update live site

**To disable:**
- Go to Project Settings → Git
- Disable "Production Branch"

---

## **COST ESTIMATE**

**Vercel:**
- Free tier: 100GB bandwidth/month
- Hobby: $20/month (unlimited bandwidth)

**Supabase:**
- Free tier: 500MB database, 2GB bandwidth
- Pro: $25/month (8GB database, 50GB bandwidth)

**Total:** $0-45/month depending on usage

---

## **SUPPORT & MAINTENANCE**

**Weekly:**
- Check error logs
- Monitor performance
- Review user feedback

**Monthly:**
- Update dependencies
- Review analytics
- Optimize queries

**Quarterly:**
- Security audit
- Performance optimization
- Feature updates

---

## ✅ **DEPLOYMENT COMPLETE!**

**Your app is now live at:**
- Vercel URL: `https://scan4serve.vercel.app`
- Custom Domain: `https://yourdomain.com` (if configured)

**Next steps:**
1. Share with test users
2. Gather feedback
3. Iterate and improve

**Congratulations! 🎉**

