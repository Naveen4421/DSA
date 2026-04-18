
"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';

// Use dynamic import with ssr: false to prevent hydration mismatches
const TrackerDashboard = dynamic(() => import('@/components/TrackerDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090B]">
      <div className="w-12 h-12 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin mb-4" />
      <p className="text-muted text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Astra Systems...</p>
    </div>
  )
});

export default function Page() {
  return (
    <main>
      <ErrorBoundary>
        <TrackerDashboard />
      </ErrorBoundary>
    </main>
  );
}
