import { NextResponse, type NextRequest } from 'next/server'

// Helper function to decode JWT in the Edge Runtime (without Node.js dependencies)
function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hasAccountId = request.nextUrl.searchParams.has('account_id')
  const isProtectedAdminRoute = 
    (pathname === '/dashboard' && !hasAccountId) || 
    pathname.startsWith('/dashboard/clientes') || 
    pathname.startsWith('/dashboard/historico') || 
    pathname.startsWith('/dashboard/configuracoes')

  // Check the Firebase session cookie
  const session = request.cookies.get('session')?.value
  let user = null

  if (session) {
    const payload = decodeJwt(session)
    if (payload && payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
      user = {
        uid: payload.sub,
        email: payload.email,
      }
    }
  }

  if (!user && isProtectedAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

