# CareerDNA — Complete Setup Guide
## For Beginners — Step by Step

---

## ✅ STEP 1: Open the Project

1. Open **File Explorer**
2. Navigate to: `C:\Users\utkar\Desktop\careerdna`
3. This is your project folder

---

## ✅ STEP 2: Create Supabase Account & Database

### 2a. Create Account
1. Go to **https://supabase.com**
2. Click "Start your project"
3. Sign up with GitHub or Google (free)

### 2b. Create a New Project
1. Click **"New Project"**
2. Choose your organization
3. Fill in:
   - **Name**: `careerdna`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### 2c. Run the Database Schema
1. In your Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open the file: `C:\Users\utkar\Desktop\careerdna\supabase-schema.sql`
4. Copy ALL the content
5. Paste it into the SQL Editor
6. Click **"Run"** (green button)
7. You should see: "Success. No rows returned"

### 2d. Get Your API Keys
1. In Supabase, click **"Project Settings"** (gear icon, bottom left)
2. Click **"API"** tab
3. Copy these TWO values:
   - **Project URL** (looks like: https://abcdefgh.supabase.co)
   - **anon public** key (long string starting with "eyJ...")

---

## ✅ STEP 3: Create OpenAI Account

1. Go to **https://platform.openai.com**
2. Sign up / Log in
3. Click your profile → **"API Keys"**
4. Click **"+ Create new secret key"**
5. Name it "CareerDNA"
6. **COPY IT NOW** — you can't see it again!
7. Add some credits ($5 is plenty to start — each AI call costs < $0.01)

---

## ✅ STEP 4: Create Cloudinary Account

1. Go to **https://cloudinary.com**
2. Sign up free (no credit card needed)
3. After signup, go to your **Dashboard**
4. Copy your **Cloud Name** (top of dashboard, e.g., "dxyz123abc")

### 4b. Create Upload Preset
1. In Cloudinary, go to **Settings** → **Upload**
2. Scroll to "Upload presets"
3. Click **"Add upload preset"**
4. Set:
   - **Preset name**: `careerdna_uploads`
   - **Signing Mode**: `Unsigned`
5. Click **Save**

---

## ✅ STEP 5: Fill In Environment Variables

1. Open: `C:\Users\utkar\Desktop\careerdna\.env`
2. Replace the placeholder values with your real values:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...YOUR_ANON_KEY...
VITE_OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=careerdna_uploads
VITE_APP_URL=http://localhost:5173
```

**IMPORTANT**: Never share this file with anyone. Never post it publicly.

---

## ✅ STEP 6: Run the App Locally

1. Open **PowerShell** or **Command Prompt**
2. Type:
   ```
   cd C:\Users\utkar\Desktop\careerdna
   npm run dev
   ```
3. Open your browser at: **http://localhost:5173**
4. You should see the CareerDNA landing page!

---

## ✅ STEP 7: Enable Email Auth in Supabase

1. In Supabase dashboard → **Authentication** → **Providers**
2. Make sure **Email** is enabled (it is by default)
3. Under **Email** settings:
   - Enable "Confirm email" if you want email verification
   - OR disable it for easier testing during development

---

## ✅ STEP 8: Deploy to Netlify (Free Hosting)

### 8a. Build the App
```
cd C:\Users\utkar\Desktop\careerdna
npm run build
```
This creates a `dist/` folder with your production app.

### 8b. Deploy on Netlify
1. Go to **https://netlify.com**
2. Sign up free
3. Click **"Add new site"** → **"Deploy manually"**
4. Drag and drop the `dist/` folder into Netlify
5. Your site is live instantly! (e.g., https://random-name-123.netlify.app)

### 8c. Add Environment Variables to Netlify
1. In Netlify → **Site Settings** → **Environment Variables**
2. Add ALL these variables (same values as your .env file):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
   - `VITE_APP_URL` = your Netlify URL

### 8d. Connect GitHub for Auto-Deploy (Optional but Recommended)
1. Push your code to GitHub
2. In Netlify → **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub → select your repo
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy**

---

## ✅ STEP 9: Update Supabase Auth URL

After deploying to Netlify:
1. In Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Netlify URL: `https://your-site.netlify.app`
3. Add to **Redirect URLs**: `https://your-site.netlify.app/**`

---

## 🔧 COMMON ERRORS & FIXES

### "Invalid API Key" error
→ Check your `.env` file. Make sure VITE_ prefix is on every variable.

### "Failed to fetch" on AI features
→ Your OpenAI API key is wrong or has no credits. Check platform.openai.com

### Profile not loading on public URL
→ Make sure you ran the full `supabase-schema.sql` in SQL Editor

### Videos not uploading
→ Check Cloudinary upload preset is set to "Unsigned" mode

### White screen after deploy
→ In Netlify, add environment variables, then redeploy

---

## 📁 Project Structure Reference

```
careerdna/
├── src/
│   ├── components/
│   │   ├── ui/          ← Reusable components (Button, Card, etc.)
│   │   ├── landing/     ← Landing page sections
│   │   ├── dashboard/   ← Dashboard components
│   │   └── profile/     ← Public profile components
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── auth/        ← Login, Signup, Forgot Password
│   │   ├── dashboard/   ← All dashboard pages
│   │   └── public/      ← Public profile page
│   ├── layouts/         ← DashboardLayout with sidebar
│   ├── hooks/           ← useAuth hook
│   ├── lib/             ← Supabase, OpenAI, Cloudinary clients
│   └── index.css        ← Global styles + Tailwind
├── .env                 ← Your secret keys (NEVER commit!)
├── supabase-schema.sql  ← Run this in Supabase SQL Editor
└── SETUP-GUIDE.md       ← This file
```

---

## 🚀 You're Done!

Your CareerDNA platform is now:
- ✅ Running locally at http://localhost:5173
- ✅ Database configured with full security
- ✅ AI features ready (just add OpenAI key)
- ✅ Video uploads ready (just add Cloudinary key)
- ✅ Ready to deploy to Netlify

**Next steps:**
1. Sign up on your app
2. Fill in Settings page with your info
3. Add projects, upload videos, add achievements
4. Share your profile link!
