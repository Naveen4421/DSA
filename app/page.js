import TrackerDashboard from '@/components/TrackerDashboard';

export const metadata = {
  title: "Dashboard | DSA Mastery Tracker",
  description: "Track your progress on top DSA problems.",
};

export default function Page() {
  // This is a Server Component
  // In a more complex app, we could fetch static data or check auth cookies here
  return (
    <main>
      <TrackerDashboard />
    </main>
  );
}
