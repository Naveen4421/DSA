# System Architecture - DSA Mastery Tracker

## Overview
The DSA Mastery Tracker is a modern, full-stack web application designed to help users track their progress through a curated list of Data Structures and Algorithms problems.

## Tech Stack
- **Frontend Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Deployment**: [Vercel](https://vercel.com/)

## Server/Client Division (Architecture)

### 1. Server Components (`app/`)
- **`app/page.js`**: The main entry point is a **Server Component**. This ensures fast initial delivery and provides SEO metadata directly from the server.
- **`app/layout.js`**: Managed globally on the server to handle fonts, meta tags, and high-level structure.

### 2. Client Components (`components/`)
- **`components/TrackerDashboard.js`**: This is the application's "Interactive Engine." It is marked with `"use client"` and handles all React state, Supabase auth listeners, and browser storage.
- **`components/TopicCard.js`**, **`components/LoginOverlay.js`**: Interactive UI fragments that respond to user events.

### 3. Problem Discovery (`/lib/data.js`)
- A centralized JSON-like structure containing 129+ hand-picked problems.
- Problems are categorized by Topic (e.g., Arrays, DP) and Difficulty (Easy, Medium, Hard).

### 4. UI/UX Features
- **Progress Tracking**: Circular rings and linear bars built with SVG and Framer Motion.
- **Filtering & Search**: Real-time filtering logic in JavaScript to allow instant searching across the entire problem set.
- **Theme Engine**: Custom CSS variables for Dark/Light mode, toggled via a global theme hook.

## Data Schema (Supabase)
```sql
create table public.user_data (
  id uuid references auth.users not null primary key,
  username text,
  done_data jsonb default '{}'::jsonb,
  notes_data jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Deployment Flow
1. **Source Control**: Code hosted on GitHub.
2. **CI/CD**: Automatic deployments triggered via Vercel on every push to `main`.
3. **Environment**: `.env.local` variables injected during the build process for secure API communication.
