export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Sessão encerrada com sucesso.' });

    // Invalidate NextAuth session cookies
    response.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/' });
    response.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
