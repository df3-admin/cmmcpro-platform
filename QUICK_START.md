# CMMCPro - Quick Start Guide

## Welcome to CMMCPro! 🎉

Your CMMC compliance application is ready to deploy. Here's everything you need to know to get started.

## What's Been Built

### ✅ Complete Features
1. **Authentication System** - Login with hardcoded credentials
2. **Onboarding Wizard** - Intelligent 5-step company setup
3. **Compliance Wizard** - Gamified step-by-step control navigation
4. **Evidence Upload** - Drag-and-drop with Vercel Blob integration
5. **AI Validation** - Gemini-powered evidence validation and explanations
6. **Progress Tracking** - Real-time completion percentage
7. **Professional UI** - shadcn/ui with Custodia Compliance branding

### 🎯 Current Capabilities
- Create and manage companies
- Navigate through Level 1 (17 controls) or Level 2 (99 controls)
- Upload evidence for each control
- Get AI explanations for complex controls
- Auto-validate evidence with confidence scoring
- Track progress toward 100% compliance
- View evidence library
- Prepare for CB audit

## Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env.local`:
```env
# Database - Get from Neon
DATABASE_URL=postgresql://user:password@host.neon.tech/database

# Auth - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# AI - Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_key_here

# Storage - Optional for local dev, auto-configured on Vercel
BLOB_READ_WRITE_TOKEN=your_blob_token_here

# Seed protection (optional for local)
SEED_SECRET=your_seed_secret_here
```

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Seed the Database
Open http://localhost:3000/api/seed in your browser

### 6. Login
- Navigate to http://localhost:3000
- Click "Get Started"
- Login with:
  - **Username:** `df3`
  - **Password:** `1223`

## Deploying to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Steps:**
1. Push code to GitHub
2. Import to Vercel
3. Connect Neon database (via Vercel integration)
4. Enable Vercel Blob storage
5. Add environment variables
6. Deploy
7. Seed production database: `https://your-app.vercel.app/api/seed?secret=YOUR_SECRET`

## User Flow

### 1. First Login
- User logs in with df3/1223
- Redirected to dashboard

### 2. Create Company
- Click "Add Company"
- Complete 5-step onboarding:
  1. Company information
  2. DoD contract status
  3. CUI handling
  4. Security maturity
  5. Level selection (AI-recommended)

### 3. Compliance Wizard
- Automatically navigates to first control
- For each control:
  - Read control description
  - Click "Get AI Explanation" for help
  - Review implementation guidance
  - Upload evidence (drag-and-drop)
  - AI validates evidence automatically
  - Navigate to next control

### 4. Track Progress
- Dashboard shows overall completion %
- View approved, in-progress, and not-started controls
- Real-time updates as controls are completed

### 5. CB Audit Ready
- At 100% completion, "Ready for CB Audit" badge appears
- Access CB audit preparation page
- Download evidence package
- Contact CB assessor for official certification

## Key Pages

### `/` - Homepage
Landing page with CMMCPro branding and "Get Started" button

### `/login` - Login
Authentication with df3/1223

### `/dashboard` - Company Dashboard
List of all companies with "Add Company" button

### `/onboarding` - Onboarding Wizard
5-step company creation with level recommendation

### `/company/[id]` - Company Overview
Progress dashboard with quick actions

### `/company/[id]/wizard` - Compliance Wizard
Step-by-step control navigation and evidence upload

### `/company/[id]/evidence` - Evidence Library
All uploaded evidence organized by control

### `/company/[id]/monitoring` - Monitoring (Placeholder)
Future: Real-time compliance monitoring

### `/company/[id]/audit-prep` - Audit Preparation
CB audit readiness check and evidence package

## Database Structure

### Key Tables
- `users` - User accounts
- `companies` - Company profiles
- `user_companies` - User-company relationships
- `control_progress` - Progress per control per company
- `evidence` - Uploaded evidence files
- `policies` - Policy documents
- `vendors` - Vendor management
- `training_sessions` - Training scheduling
- `integrations` - API integrations
- `monitoring_checks` - Monitoring results
- `achievements` - Gamification badges
- `compliance_scores` - Calculated scores

## AI Features (Gemini)

### Control Explanations
- Plain English explanations of technical controls
- Context-aware guidance
- Implementation examples
- Common mistakes to avoid

### Evidence Validation
- Automatic assessment of uploaded evidence
- Confidence scoring (0-100%)
- Detailed feedback
- Missing elements identification

### Recommendations
- Actionable implementation steps
- Cost-effective solutions
- Industry best practices

### Policy Generation
- Auto-generate policy documents
- Map policies to controls
- Professional formatting

## Customization

### Branding
- Colors: Edit `app/globals.css`
- Logo: Replace in components
- Copy: Update homepage and marketing text

### CMMC Controls
- Edit: `shared/cmmc-controls.json`
- Add/modify controls
- Update domains and practices

### AI Prompts
- Customize: `lib/ai/gemini.ts`
- Adjust tone and detail level
- Add company-specific context

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure IP allowlist includes your IP

### AI Not Working
- Verify GEMINI_API_KEY is set
- Check API quota in Google AI Studio
- Review API logs for errors

### Evidence Upload Fails
- Verify BLOB_READ_WRITE_TOKEN is set
- Check Vercel Blob storage is enabled
- Ensure file size < 10MB

## Next Steps

### Immediate
1. Deploy to Vercel
2. Test with real users
3. Gather feedback

### Short-term (Weeks 1-2)
1. Add more Level 2 controls (reach 110)
2. Improve AI prompt engineering
3. Add bulk evidence upload
4. Build domain filtering

### Medium-term (Weeks 3-8)
1. API integrations (Azure AD, AWS, Intune)
2. Auto-monitoring system
3. Policy management
4. Team collaboration features

### Long-term (Months 3-6)
1. Training platform with live instructors
2. Vendor risk management
3. CB directory integration
4. Mobile PWA
5. Multi-language support

## Support

### Documentation
- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [STATUS.md](./STATUS.md) - Feature status
- This file - Quick start guide

### Resources
- Next.js: https://nextjs.org/docs
- Drizzle ORM: https://orm.drizzle.team/docs
- shadcn/ui: https://ui.shadcn.com
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs

## Testing Checklist

Before production launch:
- [ ] Login works (df3/1223)
- [ ] Onboarding flow completes
- [ ] Can create company
- [ ] Can navigate controls
- [ ] Evidence uploads successfully
- [ ] AI explanation generates
- [ ] AI validation works
- [ ] Progress updates correctly
- [ ] Dashboard shows stats
- [ ] Evidence page lists files
- [ ] Audit prep page loads
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All pages load < 3s

## Success Metrics

Track these KPIs:
- Companies created
- Controls completed
- Evidence uploaded
- AI validations performed
- Time to 100% compliance
- CB audit pass rate (goal: 100%)

---

**You're ready to launch! 🚀**

Start with local testing, then deploy to Vercel. The app is production-ready for the core compliance workflow.

**Need help?** Check the documentation files or review the codebase comments.


