import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Authenticate with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check admin role — query by email (more reliable than auth user ID)
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role, full_name, email, plan')
      .eq('email', email)
      .single();

    // If no profile exists, create one with admin role for this user
    if (profileErr || !profile) {
      // Auto-create admin profile
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email: email,
        full_name: data.user.user_metadata?.full_name || 'Admin',
        role: 'admin',
        plan: 'enterprise',
      }, { onConflict: 'id' });

      return NextResponse.json({
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: email,
          name: data.user.user_metadata?.full_name || 'Admin',
          role: 'admin',
          plan: 'enterprise',
        },
      });
    }

    // Allow admin or the specific admin email
    const isAdmin = profile.role === 'admin' || email === 'nitheeraj1@gmail.com';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 });
    }

    // If role isn't set to admin yet, update it
    if (profile.role !== 'admin') {
      await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', profile.id);
    }

    return NextResponse.json({
      token: data.session.access_token,
      user: {
        id: profile.id || data.user.id,
        email: profile.email || email,
        name: profile.full_name || 'Admin',
        role: 'admin',
        plan: profile.plan || 'enterprise',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
