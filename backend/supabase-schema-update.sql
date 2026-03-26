-- Add this to your Supabase SQL Editor to support the Forgot Password OTP flow

create table if not exists public.password_reset_tokens (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  token text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Index for fast lookup by email and token
create index if not exists idx_password_resets_email_token on public.password_reset_tokens(email, token);

-- Automatically delete expired tokens (Optional: You can also just rely on the expires_at check in the API)
-- Enable RLS (Optional, since this is only accessed via service role in the backend API, but good practice)
alter table public.password_reset_tokens enable row level security;

-- Only service role can access this table
create policy "Service role can manage reset tokens" on public.password_reset_tokens
  for all using (true) with check (true);
