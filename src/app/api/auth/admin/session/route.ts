export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado. Nenhuma sessão administrativa encontrada.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        admin_id: session.user.admin_id,
        email: session.user.email,
        name: session.user.name,
      },
    });
  } catch (error) {
    console.error('Session API Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
