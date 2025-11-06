# CMMCPro Deployment Guide

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **Neon Database** - Sign up at https://neon.tech
3. **Google Gemini API Key** - Get from https://makersuite.google.com/app/apikey
4. **GitHub Repository** - Push your code to GitHub

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: CMMCPro application"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Create Neon Database

1. Go to https://neon.tech
2. Create a new project
3. Name it "cmmcpro-db"
4. Copy the connection string (it will look like: `postgresql://user:password@host.neon.tech/database`)

### 3. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 4. Connect Neon to Vercel

#### Option A: Via Vercel Dashboard (Recommended)
1. In your Vercel project, go to "Storage"
2. Click "Connect Store" → "Neon"
3. Follow the prompts to connect your Neon database
4. Vercel will automatically set the `DATABASE_URL` environment variable

#### Option B: Manual Connection
1. In Vercel project settings, go to "Environment Variables"
2. Add `DATABASE_URL` with your Neon connection string

### 5. Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
DATABASE_URL=<automatically-set-by-neon-integration>

NEXTAUTH_SECRET=<generate-with-command-below>
NEXTAUTH_URL=https://your-app.vercel.app

GEMINI_API_KEY=<your-gemini-api-key>

BLOB_READ_WRITE_TOKEN=<automatically-set-by-vercel-blob>

SEED_SECRET=<generate-with-command-below>
```

**Generate secrets:**
```bash
# For NEXTAUTH_SECRET and SEED_SECRET
openssl rand -base64 32
```

### 6. Enable Vercel Blob Storage

1. In Vercel Dashboard → Storage
2. Click "Create Database" → "Blob"
3. Name it "cmmcpro-blob"
4. This automatically sets `BLOB_READ_WRITE_TOKEN`

### 7. Deploy

Click "Deploy" in Vercel. Your app will build and deploy.

### 8. Initialize Database

After deployment, seed the database:

1. Open your browser
2. Navigate to: `https://your-app.vercel.app/api/seed?secret=YOUR_SEED_SECRET`
3. You should see: `{"success":true,"message":"Database seeded successfully..."}`

Alternatively, use curl:
```bash
curl "https://your-app.vercel.app/api/seed?secret=YOUR_SEED_SECRET"
```

### 9. Push Database Schema

The schema will be automatically applied on first database connection. Alternatively, you can manually push:

```bash
# Install dependencies locally
npm install

# Set DATABASE_URL in .env.local
echo "DATABASE_URL=your_neon_connection_string" > .env.local

# Push schema to Neon
npm run db:push
```

### 10. Access Your Application

1. Navigate to `https://your-app.vercel.app`
2. Click "Get Started"
3. Login with:
   - Username: `df3`
   - Password: `1223`

## Verifying Deployment

✅ **Check these things:**

1. **Homepage loads** - Should show "CMMCPro - The TurboTax of CMMC Compliance"
2. **Login works** - Can log in with df3/1223
3. **Onboarding flow** - Can create a company
4. **Wizard loads** - Can navigate through controls
5. **Evidence upload** - Can upload files (tests Blob storage)
6. **AI features** - Get AI explanation button works (tests Gemini)

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Review build logs in Vercel dashboard

### Database Connection Errors
- Verify DATABASE_URL is set correctly
- Check Neon database is not paused
- Ensure IP allowlist includes Vercel (or is set to allow all)

### AI Features Not Working
- Verify GEMINI_API_KEY is set
- Check Gemini API quota/billing
- Review API logs in Vercel dashboard

### File Upload Fails
- Verify BLOB_READ_WRITE_TOKEN is set
- Check Vercel Blob storage is enabled
- Review network tab for errors

## Post-Deployment

### Custom Domain (Optional)
1. In Vercel → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update NEXTAUTH_URL to your custom domain

### Monitoring
- Enable Vercel Analytics for performance monitoring
- Check logs regularly: Vercel Dashboard → Logs
- Set up error tracking (e.g., Sentry)

### Regular Maintenance
- Update dependencies monthly
- Review security advisories
- Monitor API usage (Gemini, Vercel Blob)
- Backup database regularly (Neon provides automatic backups)

## Production Checklist

- [ ] All environment variables set
- [ ] Database seeded successfully
- [ ] Custom domain configured (if applicable)
- [ ] NEXTAUTH_URL updated for production
- [ ] Test login with df3/1223
- [ ] Test full onboarding flow
- [ ] Test evidence upload
- [ ] Test AI features
- [ ] Review security settings
- [ ] Enable Vercel Analytics
- [ ] Set up monitoring/alerts

## Support

For issues:
1. Check Vercel deployment logs
2. Review application logs via Vercel Dashboard
3. Check database connection via Neon Dashboard
4. Verify all environment variables

---

**Congratulations! CMMCPro is now live! 🎉**

Users can start their CMMC compliance journey at your deployment URL.


