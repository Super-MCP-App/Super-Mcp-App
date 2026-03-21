-- Super Mcp Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ==========================================
-- PROFILES
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  bio text,
  phone text,
  plan text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  role text default 'user' check (role in ('user', 'admin')),
  nvidia_api_key text,
  is_onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Function to check if current user is admin without recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- ==========================================
-- CONVERSATIONS
-- ==========================================
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'New Conversation',
  last_message text,
  model text default 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.conversations enable row level security;
create policy "Users can manage own conversations" on public.conversations for all using (auth.uid() = user_id);

create index idx_conversations_user on public.conversations(user_id);

-- ==========================================
-- MESSAGES
-- ==========================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens_used integer default 0,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Users can manage own messages" on public.messages for all using (
  exists (select 1 from public.conversations where id = conversation_id and user_id = auth.uid())
);

create index idx_messages_conversation on public.messages(conversation_id);

-- ==========================================
-- TASKS
-- ==========================================
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  status text default 'running' check (status in ('running', 'completed', 'failed', 'cancelled')),
  progress real default 0,
  model text,
  tokens_used integer default 0,
  result jsonb,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;
create policy "Users can manage own tasks" on public.tasks for all using (auth.uid() = user_id);

create index idx_tasks_user on public.tasks(user_id);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text default 'info' check (type in ('info', 'success', 'warning', 'error')),
  title text not null,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users can manage own notifications" on public.notifications for all using (auth.uid() = user_id);

create index idx_notifications_user on public.notifications(user_id);

-- ==========================================
-- CONNECTED APPS
-- ==========================================
create table if not exists public.connected_apps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  provider text not null check (provider in ('figma', 'canva', 'kite', 'custom', 'google_drive', 'slack', 'notion', 'discord', 'github')),
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  account_name text,
  status text default 'connected' check (status in ('connected', 'disconnected', 'expired')),
  metadata jsonb default '{}',
  connected_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, provider)
);

alter table public.connected_apps enable row level security;
create policy "Users can manage own connected apps" on public.connected_apps for all using (auth.uid() = user_id);

-- ==========================================
-- USAGE LOGS
-- ==========================================
create table if not exists public.usage_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  tokens integer default 0,
  api_calls integer default 0,
  date date default current_date,
  created_at timestamptz default now()
);

alter table public.usage_logs enable row level security;
alter table public.usage_logs add constraint usage_logs_user_id_date_key unique (user_id, date);
create policy "Users can view own usage" on public.usage_logs for select using (auth.uid() = user_id);

create index idx_usage_user_date on public.usage_logs(user_id, date);

-- ==========================================
-- FUNCTION: Auto-create profile on signup
-- ==========================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- FUNCTION: Update usage on message insert
-- ==========================================
create or replace function public.log_usage()
returns trigger as $$
begin
  insert into public.usage_logs (user_id, tokens, api_calls, date)
  select c.user_id, new.tokens_used, 1, current_date
  from public.conversations c 
  where c.id = new.conversation_id
  on conflict (user_id, date) 
  do update set 
    tokens = public.usage_logs.tokens + excluded.tokens,
    api_calls = public.usage_logs.api_calls + 1;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_ai_message_created
  after insert on public.messages
  for each row execute procedure public.log_usage();
