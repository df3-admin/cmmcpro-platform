import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/';
  const isOnboardingPage = pathname.startsWith('/onboarding');

  // Allow access to login and onboarding pages
  if (isLoginPage || isOnboardingPage) {
    if (isLoggedIn && !isOnboardingPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    if (isHomePage) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect root to dashboard if logged in
  if (isHomePage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (static files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

