// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/service'];
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  console.log('🔍 Middleware - Path:', path);
  console.log('🔍 Middleware - Protected:', isProtectedRoute);

  // Permite acesso a rotas públicas e não protegidas
  if (isPublicRoute || !isProtectedRoute) {
    console.log('✅ Middleware: Allowing access (public/non-protected)');
    return NextResponse.next();
  }

  // Verifica o token no cookie da requisição
  const token = request.cookies.get('auth-token')?.value;
  
  console.log('🍪 Middleware - Token exists:', !!token);
  console.log('🍪 Middleware - All cookies:', request.cookies.getAll().map(c => c.name));

  // Se não tem token, redireciona para login
  if (!token) {
    console.log('❌ Middleware: No token, redirecting to /login');
    const loginUrl = new URL('/login', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // Tem token - permite acesso e garante que o cookie continua setado
  console.log('✅ Middleware: Token valid, allowing access');
  const response = NextResponse.next();
  
  // Reaplica o cookie na response para garantir persistência
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