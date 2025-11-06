import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-blue-900">CMMCPro</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Get Started</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="max-w-4xl">
          <div className="mb-8">
            <ShieldCheck className="w-20 h-20 text-blue-600 mx-auto mb-6 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4">
              CMMCPro
            </h1>
            <p className="text-2xl md:text-3xl text-blue-700 font-semibold mb-6">
              The TurboTax of CMMC Compliance
            </p>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
              Get your business CMMC compliant with our automated, AI-powered platform. 
              Simple, guided, and designed to help you pass your CB audit on the first try.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="gap-2 text-lg px-8">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 text-lg px-8">
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Stats Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-sm text-gray-700">First-time pass guidance</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">AI</div>
              <p className="text-sm text-gray-700">Automated evidence validation</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">Simple</div>
              <p className="text-sm text-gray-700">Step-by-step guidance</p>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20 bg-white/60 backdrop-blur-sm rounded-lg p-8 shadow-sm max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Why CMMCPro?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Automated Compliance Tracking</h3>
                  <p className="text-sm text-gray-600">Track your progress across all CMMC controls in real-time</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Evidence Review</h3>
                  <p className="text-sm text-gray-600">Get instant feedback on your evidence uploads</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Guided Compliance Wizard</h3>
                  <p className="text-sm text-gray-600">Step-by-step guidance through every control</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Audit Preparation</h3>
                  <p className="text-sm text-gray-600">Generate comprehensive evidence packages for your CB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2025 CMMCPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
