import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex flex-col items-center justify-center text-center px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <ShieldCheck className="w-20 h-20 text-blue-600 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            CMMCPro
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            The TurboTax of CMMC Compliance
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mb-8">
            Get your business CMMC compliant with our automated, AI-powered platform. 
            Simple, guided, and guaranteed to pass your CB audit on the first try.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <p className="text-sm text-gray-600">First-time pass guarantee</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">AI-Powered</div>
            <p className="text-sm text-gray-600">Automated evidence validation</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">Simple</div>
            <p className="text-sm text-gray-600">Step-by-step guidance</p>
          </div>
        </div>
      </main>
    </div>
  );
}
