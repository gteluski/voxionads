import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  console.log('========================================');
  console.log('🔵 [REDIRECT] GET Iniciado');
  console.log('========================================');

  try {
    const clientId = process.env.NEXT_PUBLIC_META_CLIENT_ID || process.env.META_CLIENT_ID || process.env.META_APP_ID || '';
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI || process.env.META_REDIRECT_URI || '';
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID || process.env.META_CONFIG_ID || ''; // Omitir config_id por padrão se não configurado nas variáveis de ambiente

    console.log('🔵 [REDIRECT] Credenciais:', {
      clientId: clientId ? `✓ (${clientId})` : '✗ FALTA',
      redirectUri: redirectUri || '✗ FALTA',
      configId: configId ? `✓ (${configId})` : '✗ Opcional (não definido)',
    });

    if (!clientId || !redirectUri) {
      console.log('🔴 [REDIRECT] ERRO: Variáveis META ausentes');
      return NextResponse.json(
        { error: 'Configurações do aplicativo Meta (META_CLIENT_ID, META_REDIRECT_URI) ausentes.' },
        { status: 500 }
      );
    }

    // Generate random state to mitigate CSRF attacks
    const state = crypto.randomBytes(16).toString('hex');
    console.log('🔵 [REDIRECT] State gerado:', state.substring(0, 15) + '...');

    const scopes = ['ads_management', 'ads_read', 'business_management'].join(',');
    const configParam = configId ? `&config_id=${configId}` : '';
    const fbOAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes}&state=${state}&response_type=code${configParam}`;

    console.log('🔵 [REDIRECT] OAuth URL:', fbOAuthUrl);

    const response = NextResponse.redirect(fbOAuthUrl);

    // Save state token in secure httpOnly cookie
    const isSecure = req.url.startsWith('https://') || process.env.NODE_ENV === 'production';
    console.log('🔵 [REDIRECT] Cookie secure?', isSecure, '| NODE_ENV:', process.env.NODE_ENV);

    response.cookies.set('meta_oauth_state', state, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60, // 10 minutes
    });

    console.log('🟢 [REDIRECT] ✓ Cookie meta_oauth_state definido');
    console.log('🟢 [REDIRECT] ✓ Redirecionando para Facebook OAuth');
    console.log('========================================');

    return response;
  } catch (error) {
    console.log('🔴 [REDIRECT] ERRO GET:', error);
    return NextResponse.json(
      { error: 'Erro interno ao construir URL de redirecionamento.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  console.log('========================================');
  console.log('🔵 [REDIRECT] POST Iniciado');
  console.log('========================================');

  try {
    const clientId = process.env.NEXT_PUBLIC_META_CLIENT_ID || process.env.META_CLIENT_ID || process.env.META_APP_ID || '';
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI || process.env.META_REDIRECT_URI || '';
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID || process.env.META_CONFIG_ID || '';

    console.log('🔵 [REDIRECT] Credenciais:', {
      clientId: clientId ? `✓ (${clientId})` : '✗ FALTA',
      redirectUri: redirectUri || '✗ FALTA',
      configId: configId ? `✓ (${configId})` : '✗ Opcional (não definido)',
    });

    if (!clientId || !redirectUri) {
      console.log('🔴 [REDIRECT] ERRO: Variáveis ausentes');
      return NextResponse.json(
        { error: 'Configurações do aplicativo Meta ausentes.' },
        { status: 500 }
      );
    }

    const state = crypto.randomBytes(16).toString('hex');
    console.log('🔵 [REDIRECT] State gerado:', state.substring(0, 15) + '...');

    const scopes = ['ads_management', 'ads_read', 'business_management'].join(',');
    const configParam = configId ? `&config_id=${configId}` : '';
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes}&state=${state}&response_type=code${configParam}`;

    console.log('🔵 [REDIRECT] OAuth URL:', url);

    const response = NextResponse.json({ url });

    const isSecure = req.url.startsWith('https://') || process.env.NODE_ENV === 'production';
    response.cookies.set('meta_oauth_state', state, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60, // 10 minutes
    });

    console.log('🟢 [REDIRECT] ✓ Cookie e URL gerados (POST)');
    console.log('========================================');

    return response;
  } catch (error) {
    console.log('🔴 [REDIRECT] ERRO POST:', error);
    return NextResponse.json(
      { error: 'Erro interno ao iniciar autenticação Meta.' },
      { status: 500 }
    );
  }
}
