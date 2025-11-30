# 🚀 Quick Setup Guide - OAuth Configuration

## ⚡ TL;DR - Fastest Way to Start

**Option 1: Just use Wallet (No setup needed!)**
```
1. Click "Connect Wallet" in navbar
2. Connect your Sui wallet
3. Go to Dashboard → Create Profile
4. Done! ✅
```

**Option 2: Setup OAuth (5-10 minutes)**
Follow steps below to enable Google/42 École login.

---

## 🌐 Google OAuth Setup

### Step 1: Create Google OAuth Client

1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Click "APIs & Services" → "Credentials"
4. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
5. Configure:
   - Application type: **Web application**
   - Name: `SuiSoul Local Dev`
   - Authorized redirect URIs: `http://localhost:5173/auth/callback`
6. Click "CREATE"
7. Copy the **Client ID** (looks like: `xxx-xxx.apps.googleusercontent.com`)

### Step 2: Update .env File

Open `sui_dapp/.env` and update:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
```

### Step 3: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd sui_dapp
npm run dev
```

### Step 4: Test

1. Go to: http://localhost:5173/login
2. Click "Continue with Google"
3. Login with your Google account
4. You'll be redirected back with your email! ✅

---

## 🎓 42 École OAuth Setup

### Step 1: Create 42 Application

1. Go to: https://profile.intra.42.fr/oauth/applications/new
2. Fill in:
   - Name: `SuiSoul Local Dev`
   - Redirect URI: `http://localhost:5173/auth/callback`
   - Scopes: `public` (default)
3. Click "Submit"
4. Copy the **UID** (Client ID)
5. Copy the **SECRET**

### Step 2: Update .env File

Open `sui_dapp/.env` and update:
```env
VITE_42_CLIENT_ID=your_42_uid_here
VITE_42_CLIENT_SECRET=your_42_secret_here
```

### Step 3: Restart Dev Server

```bash
cd sui_dapp
npm run dev
```

### Step 4: Test

1. Go to: http://localhost:5173/login
2. Click "Continue with 42 École"
3. Login with your 42 account
4. You'll be redirected back! ✅

---

## 🔍 Troubleshooting

### "Redirect URI Mismatch" Error

**Problem**: OAuth redirect URL doesn't match.

**Solution**: 
- Make sure redirect URI in Google/42 console is EXACTLY: `http://localhost:5173/auth/callback`
- No trailing slash!
- Use `http` not `https` for local dev

### "Client ID not configured" Alert

**Problem**: `.env` file not loaded or contains placeholder values.

**Solution**:
1. Check if `.env` file exists in `sui_dapp/` folder
2. Make sure values don't contain `YOUR_XXX_HERE`
3. Restart dev server completely

### OAuth Window Opens But Nothing Happens

**Problem**: Callback page not handling the response.

**Solution**:
1. Check browser console for errors (F12)
2. Make sure you're on `http://localhost:5173` not a different port
3. Try clearing browser cache and cookies

### "Email not showing in navbar"

**Problem**: zkLogin state not persisting.

**Solution**:
1. Check if you completed the OAuth flow
2. Look in sessionStorage (F12 → Application → Session Storage)
3. Try logging in again

---

## 📋 Current Status Check

Run this command to see what's configured:
```bash
cd sui_dapp
cat .env
```

You should see:
```env
VITE_GOOGLE_CLIENT_ID=xxx-xxx.apps.googleusercontent.com  # ✅ Real value
VITE_42_CLIENT_ID=your_actual_42_uid                      # ✅ Real value
```

NOT:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE  # ❌ Placeholder
```

---

## 🎯 Testing Flow

### 1. Test Google Login
```
1. Open: http://localhost:5173/login
2. Click "Continue with Google"
3. Should see Google login page
4. After login → redirects to /auth/callback
5. Email badge appears in navbar
6. Go to dashboard → Create Profile
7. Email shown in blue box ✅
```

### 2. Test 42 École Login
```
1. Open: http://localhost:5173/login
2. Click "Continue with 42 École"
3. Should see 42 login page
4. After login → redirects to /auth/callback
5. Email badge appears in navbar
6. Go to dashboard → Create Profile
7. Email shown in blue box ✅
```

### 3. Test Wallet Login (No setup needed!)
```
1. Click "Connect Wallet" in navbar
2. Connect your Sui wallet
3. Go to dashboard → Create Profile
4. No email shown (wallet only) ✅
```

---

## ⚠️ Important Notes

1. **Development Only**: These credentials are for local development only
2. **Never Commit .env**: The `.env` file is gitignored, don't share it
3. **Production**: For production, you need to:
   - Get production OAuth credentials
   - Set up environment variables in your hosting platform
   - Use HTTPS redirect URIs

---

## 🆘 Still Having Issues?

1. **Check Console**: Open browser console (F12) for errors
2. **Check Network**: Look at Network tab for failed requests
3. **Check .env**: Make sure file is in correct location
4. **Restart Everything**: Stop dev server, close browser, start fresh

---

## 💡 Recommended Approach

**For quick testing**: Just use Wallet Connect (no OAuth setup needed)

**For full features**: Take 10 minutes to set up Google OAuth

**For 42 students**: Set up 42 OAuth to login with your school account

---

Need more help? Check the main `ZKLOGIN_GUIDE.md` for detailed explanations!
