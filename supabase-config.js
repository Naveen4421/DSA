const SUPABASE_URL = 'https://wwpurmviubmukjelccmb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5cbe3YP3AN_YB5Zo1bpjVQ_CkCEuhdI';

// Initialize the Supabase client
// Note: We use 'supabaseClient' to avoid shadowing the global 'supabase' object from the CDN
const supabaseClient = (window.supabase && typeof window.supabase.createClient === 'function')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// SQL to run in Supabase SQL Editor:
/*
-- Create a table for user progress
create table public.user_data (
  id uuid references auth.users not null primary key,
  username text,
  done_data jsonb default '{}'::jsonb,
  notes_data jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.user_data enable row level security;

create policy "Users can view their own data" 
  on public.user_data for select 
  using (auth.uid() = id);

create policy "Users can insert their own data" 
  on public.user_data for insert 
  with check (auth.uid() = id);

create policy "Users can update their own data" 
  on public.user_data for update 
  using (auth.uid() = id);
*/
