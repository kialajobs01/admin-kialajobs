// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/service'];
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  if (isPublicRoute || !isProtectedRoute) {
    return NextResponse.next();
  }

  // Verifica o token no cookie da requisição
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next(); 
  response.cookies.set('auth-token', token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false // Precisa ser false para JS client-side acessar
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ],
};
