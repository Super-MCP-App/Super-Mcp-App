import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST /api/auth/register
export async function POST(request) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: full_name || '' },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      message: 'Registration successful',
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
