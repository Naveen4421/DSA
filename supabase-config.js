const SUPABASE_URL = 'https://wwpurmviubmukjelccmb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3cHVybXZpdWJtdWtqZWxjY21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzQ5NTcsImV4cCI6MjA4NzE1MDk1N30.metnARFBzAPkd9PmtU2nbbr2ToNUXBtAmntG-_SkOlM';

let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase Client Initialized");
    return supabaseClient;
  }
  console.error("❌ Supabase script not loaded yet!");
  return null;
}

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
