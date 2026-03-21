import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request) {
  try {
    // Create admin user: nitheeraj1@gmail.com / Thilak_dr1
    const adminEmail = 'nitheeraj1@gmail.com';
    const adminPassword = 'Thilak_dr1';
    const adminName = 'Nitheeraj Admin';

    // Check if user already exists by trying to sign in
    const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
    const exists = existingAuth?.users?.find(u => u.email === adminEmail);

    let userId;
    if (!exists) {
      // Create the admin user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: adminName },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    } else {
      userId = exists.id;
      // Update password
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: adminPassword });
    }

    // Upsert admin profile
    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: adminName,
      email: adminEmail,
      role: 'admin',
      plan: 'enterprise',
    }, { onConflict: 'id' });

    // Seed sample MCP connected apps
    await supabaseAdmin.from('connected_apps').upsert([
      {
        user_id: userId,
        provider: 'figma',
        provider_display_name: 'Figma',
        provider_icon: '🎨',
        status: 'available',
        description: 'Import designs, extract assets, and collaborate on UI projects',
        scopes: 'files:read,files:write',
      },
      {
        user_id: userId,
        provider: 'canva',
        provider_display_name: 'Canva',
        provider_icon: '🖼️',
        status: 'available',
        description: 'Create designs, edit templates, and export to multiple formats',
        scopes: 'design:read,design:write,asset:read',
      },
      {
        user_id: userId,
        provider: 'google_drive',
        provider_display_name: 'Google Drive',
        provider_icon: '📁',
        status: 'coming_soon',
        description: 'Store and sync files, collaborate on documents',
        scopes: '',
      },
      {
        user_id: userId,
        provider: 'notion',
        provider_display_name: 'Notion',
        provider_icon: '📝',
        status: 'coming_soon',
        description: 'Sync pages, databases, and project documentation',
        scopes: '',
      },
    ], { onConflict: 'user_id,provider' });

    // Seed sample conversation
    const { data: conv } = await supabaseAdmin.from('conversations').upsert({
      user_id: userId,
      title: 'Welcome Chat',
      model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
      last_message: 'Hello! How can I help you today?',
    }, { ignoreDuplicates: true }).select().single();

    // Seed sample task
    await supabaseAdmin.from('tasks').upsert({
      user_id: userId,
      title: 'Brand Strategy Analysis',
      description: 'Analyzing market positioning and brand identity elements',
      status: 'completed',
      progress: 1.0,
      model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
      tokens_used: 12450,
    }, { ignoreDuplicates: true });

    await supabaseAdmin.from('tasks').upsert({
      user_id: userId,
      title: 'Content Calendar Generation',
      description: 'Creating a 30-day social media content plan',
      status: 'running',
      progress: 0.65,
      model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
      tokens_used: 8200,
    }, { ignoreDuplicates: true });

    // Seed notifications
    await supabaseAdmin.from('notifications').upsert([
      { user_id: userId, title: 'Welcome to Super Mcp', body: 'Your account is set up and ready to go!', type: 'system', read: false },
      { user_id: userId, title: 'Figma Connected', body: 'Figma MCP integration is available', type: 'integration', read: false },
      { user_id: userId, title: 'Canva Connected', body: 'Canva MCP integration is available', type: 'integration', read: false },
    ], { ignoreDuplicates: true });

    // Seed usage logs (last 7 days)
    const today = new Date();
    const usageDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      usageDays.push({
        user_id: userId,
        date: d.toISOString().split('T')[0],
        tokens: Math.floor(Math.random() * 5000) + 500,
        api_calls: Math.floor(Math.random() * 50) + 5,
      });
    }
    await supabaseAdmin.from('usage_logs').upsert(usageDays, { onConflict: 'user_id,date' });

    return NextResponse.json({
      success: true,
      message: 'Admin user created + sample data seeded!',
      admin: { email: adminEmail, userId },
      seeded: {
        conversations: 1,
        tasks: 2,
        notifications: 3,
        connected_apps: 4,
        usage_days: 7,
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
