# CMMCPro - CMMC Compliance Made Simple

The TurboTax of CMMC compliance. An AI-powered platform to help businesses achieve CMMC Level 1 & 2 certification with automated evidence collection, real-time monitoring, and guaranteed first-time CB audit pass.

## Features

### Core Features ✅
- **Intelligent Onboarding** - Level recommendation based on your business needs
- **Gamified Compliance Wizard** - Step-by-step guidance through all CMMC controls
- **AI-Powered Evidence Validation** - Automatic validation using Google Gemini AI
- **Evidence Upload & Management** - Secure storage with Vercel Blob
- **Multi-Company Support** - Manage multiple companies from one account
- **Progress Tracking** - Real-time compliance percentage and achievements

### Planned Features 🚧
- Integration Framework (Azure AD, AWS, Intune, etc.)
- Continuous Monitoring System
- Risk Assessment Engine
- Policy Management System
- Vendor Risk Management
- Live Instructor Training (1 free session/year)
- CB Audit Preparation Tools
- Advanced Search & Visualization
- Mobile PWA

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Auth**: Clerk (with trial/subscription support)
- **AI**: Google Gemini API
- **Storage**: Vercel Blob
- **UI**: shadcn/ui + Tailwind CSS
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database
- Clerk account (for authentication)
- Google Gemini API key (optional, for AI features)
- Vercel Blob token (optional, for file storage)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd cmmc
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:
```env
# Authentication (Clerk) - Get from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (Neon PostgreSQL)
DATABASE_URL=your_neon_database_url

# AI Features (optional but recommended)
GEMINI_API_KEY=your_gemini_api_key

# File Storage (optional but recommended)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

4. Push database schema to Neon:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) and sign up with Clerk
   - Click "Get Started" or "Sign Up"
   - Create your account using email, Google, or other providers
   - You'll be redirected to the dashboard after sign-up

## Deployment to Vercel

1. Push your code to GitHub

2. Set up Clerk for production:
   - Go to https://dashboard.clerk.com
   - Create a production instance
   - Get your production API keys

3. Import project in Vercel dashboard

4. Add environment variables in Vercel:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
   - `CLERK_SECRET_KEY` - Your Clerk secret key
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - `/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - `/dashboard`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - `/dashboard`
   - `DATABASE_URL` - Your Neon database URL
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `BLOB_READ_WRITE_TOKEN` - Vercel Blob token

5. Deploy

6. Your app is now live! Users can sign up and start using CMMCPro

## Project Structure

```
cmmc/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── company/[id]/         # Company-specific pages
│   │   └── wizard/           # Compliance wizard
│   ├── dashboard/            # Dashboard pages
│   ├── login/                # Authentication
│   └── onboarding/           # New company onboarding
├── components/               # React components
│   └── ui/                   # shadcn/ui components
├── lib/                      # Utilities and services
│   ├── ai/                   # Gemini AI integration
│   ├── cmmc/                 # CMMC control utilities
│   ├── db/                   # Database configuration
│   └── types/                # TypeScript types
├── shared/                   # Shared data
│   └── cmmc-controls.json    # CMMC control definitions
└── drizzle/                  # Database migrations
```

## CMMC Levels Supported

### Level 1 - Foundational (17 controls)
Basic cybersecurity hygiene practices from FAR Clause 52.204-21

### Level 2 - Advanced (110 controls)
NIST SP 800-171 Rev 2 controls for protecting Controlled Unclassified Information (CUI)

## Development

### Database Commands

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Code Quality

```bash
# Run linter
npm run lint

# Build for production
npm run build
```

## License

Proprietary - Custodia Compliance © 2026

## Support

For support, contact: support@custodiacompliance.com

## Roadmap

- [x] Core compliance wizard
- [x] AI-powered evidence validation
- [x] Multi-company support
- [ ] Integration framework
- [ ] Continuous monitoring
- [ ] Policy management
- [ ] Vendor risk management
- [ ] Live training platform
- [ ] CB audit preparation tools
- [ ] Mobile app (PWA)

---

Built with ❤️ by Custodia Compliance
