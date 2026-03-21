import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

// Helper: extract auth token from request
export function getAuthToken(request) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

// Helper: get authenticated user + admin supabase client
// Uses service role key to bypass RLS — auth is verified via JWT
export async function getAuthenticatedClient(request) {
  const token = getAuthToken(request);
  if (!token) {
    return { error: NextResponse.json({ error: 'Missing authorization token' }, { status: 401 }) };
  }

  // Verify the JWT by getting the user
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }

  // Return admin client (bypasses RLS) + verified user
  return { supabase: supabaseAdmin, user };
}

// Helper: standard error response
export function errorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

// Helper: success response
export function successResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}
