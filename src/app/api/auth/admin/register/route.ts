import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido.' },
        { status: 400 }
      );
    }

    // Check if any admin exists
    const { count, error: countError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Database check error:', countError);
      return NextResponse.json(
        { error: 'Erro ao verificar usuários existentes no banco.' },
        { status: 500 }
      );
    }

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Registro desabilitado. O administrador principal já foi criado.' },
        { status: 403 }
      );
    }

    // Hash password with 10 rounds
    const passwordHash = await bcrypt.hash(password, 10);

    // Save to admin_users
    const { data: newUser, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        is_active: true,
      })
      .select('id, email, name')
      .single();

    if (insertError) {
      console.error('User creation error:', insertError);
      return NextResponse.json(
        { error: 'Erro ao cadastrar administrador no banco.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Administrador cadastrado com sucesso!', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
