import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard and api routes
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/configuracoes') ||
                           request.nextUrl.pathname.startsWith('/relatorios') ||
                           request.nextUrl.pathname.startsWith('/detalhes')

  const isApiRoute = request.nextUrl.pathname.startsWith('/api') && 
                     !request.nextUrl.pathname.startsWith('/api/auth') && 
                     !request.nextUrl.pathname.startsWith('/api/cron') &&
                     !request.nextUrl.pathname.startsWith('/api/meta/auth/callback')

  if (!user && (isDashboardRoute || isApiRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged in users away from login
  if (user && request.nextUrl.pathname === '/auth/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
};
