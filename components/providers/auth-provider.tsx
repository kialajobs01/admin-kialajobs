// components/auth-provider.tsx
'use client';

import { getAuthCookie } from '@/lib/cookies';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, user, initializeAuth, isLoading, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (hasHydrated && !isInitialized) {
      const initialize = async () => {
        try {
          console.log('🔄 AuthProvider - Initializing auth...');
          await initializeAuth();
        } catch (error) {
          console.error('AuthProvider - Initialization failed:', error);
        } finally {
          console.log('✅ AuthProvider - Initialization completed');
          setIsInitialized(true);
        }
      };

      initialize();
    }
  }, [hasHydrated, initializeAuth, isInitialized]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    console.log('🔄 AuthProvider - Route check:', {
      hasToken: !!token,
      userRole: user?.role,
      pathname,
      isInitialized,
      isLoading
    });

    const cookieToken = getAuthCookie();
    console.log('🍪 AuthProvider - Cookie check:', !!cookieToken);

    if (token && user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && pathname === '/login') {
      console.log('➡️ Redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    if (!token && pathname !== '/login') {
      console.log('➡️ Redirecting to login - no token');
      router.push('/login');
      return;
    }

    if (token && user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('➡️ Redirecting to main site - not admin');
      window.location.href = 'https://www.kialajobs.com';
      return;
    }

    console.log('✅ AuthProvider - No redirect needed');
  }, [token, user, pathname, isInitialized, isLoading, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}