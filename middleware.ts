import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === '/login';
  const isHomePage = req.nextUrl.pathname === '/';

  // Allow access to login page
  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if not logged in
  if (!isLoggedIn && !isHomePage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect root to dashboard if logged in
  if (isLoggedIn && isHomePage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

