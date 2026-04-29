const COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export function setAuthCookie(token: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    
    const secure = process.env.NODE_ENV === 'production';
    const cookieString = [
      `${COOKIE_NAME}=${token}`,
      'path=/',
      `max-age=${COOKIE_MAX_AGE}`,
      'SameSite=Lax',
      secure ? 'Secure' : ''
    ].filter(Boolean).join('; ');
    
    document.cookie = cookieString;
    console.log('🍪 Cookie set successfully');
    
    setTimeout(() => {
      resolve();
    }, 10);
  });
}

export function getAuthCookie(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      console.log('🍪 Cookie found');
      return value;
    }
  }
  console.log('🍪 No cookie found');
  return null;
}

export function removeAuthCookie() {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  console.log('🍪 Cookie removed');
}