"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TOPICS } from '@/lib/data';
import Header from '@/components/Header';
import TopicCard from '@/components/TopicCard';
import LoginOverlay from '@/components/LoginOverlay';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Search, Trophy, Timer, Flame, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function Home() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  const [done, setDone] = useLocalStorage('dsa_done', {});
  const [notes, setNotes] = useLocalStorage('dsa_notes', {});
  const [stars, setStars] = useLocalStorage('dsa_stars', {});
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  useEffect(() => {
    // Sync theme
    document.documentElement.setAttribute('data-theme', theme);

    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadCloudData(session.user.id);
      }
      setIsLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        loadCloudData(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [theme]);

  const loadCloudData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        if (Object.keys(data.done_data).length > Object.keys(done).length) {
          setDone(data.done_data);
        }
        if (Object.keys(data.notes_data).length > Object.keys(notes).length) {
          setNotes(data.notes_data);
        }
      }
    } catch (e) {
      console.error("Cloud fetch failed:", e);
    }
  };

  const syncToCloud = async (newData, type) => {
    if (!user) return;

    const updates = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (type === 'done') updates.done_data = newData;
    if (type === 'notes') updates.notes_data = newData;

    await supabase.from('user_data').upsert(updates);
  };

  const handleLogin = async (email, password, isSignUp) => {
    setAuthError(null);
    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) throw result.error;

      if (isSignUp && !result.data.session) {
        alert("Please check your email to confirm your account!");
      }
    } catch (e) {
      setAuthError(e.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Clear local storage for privacy
    localStorage.removeItem('dsa_done');
    localStorage.removeItem('dsa_notes');
    window.location.reload();
  };

  const toggleDone = (pid, topicId, e) => {
    e.stopPropagation();
    const newDone = { ...done };
    if (newDone[pid]) {
      delete newDone[pid];
    } else {
      newDone[pid] = Date.now();

      // Topic completion check
      const topic = TOPICS.find(t => t.id === topicId);
      const allTopicProblems = topic.weeks.flatMap(w => w.problems);
      const solvedInTopic = allTopicProblems.filter(p => p.id === pid || newDone[p.id]).length;

      if (solvedInTopic === allTopicProblems.length) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3FB950', '#58A6FF', '#BC8CFF']
        });
      }
    }
    setDone(newDone);
    syncToCloud(newDone, 'done');
  };

  const toggleStar = (pid, e) => {
    e.stopPropagation();
    const key = `star_${pid}`;
    const newStars = { ...stars };
    if (newStars[key]) {
      delete newStars[key];
    } else {
      newStars[key] = true;
    }
    setStars(newStars);
  };

  const updateNote = (pid, val) => {
    const newNotes = { ...notes };
    if (!val.trim()) {
      delete newNotes[pid];
    } else {
      newNotes[pid] = val;
    }
    setNotes(newNotes);
    syncToCloud(newNotes, 'notes');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const solvedCount = Object.keys(done).length;
  const totalCount = TOPICS.reduce((acc, t) => acc + t.weeks.reduce((a, w) => a + w.problems.length, 0), 0);

  const filteredTopics = TOPICS.map(topic => {
    const filteredWeeks = topic.weeks.map(week => ({
      ...week,
      problems: week.problems.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.pattern.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterMode === 'all' || p.diff === filterMode;
        return matchesSearch && matchesFilter;
      })
    })).filter(w => w.problems.length > 0);

    return { ...topic, weeks: filteredWeeks };
  }).filter(t => t.weeks.length > 0 || (searchQuery === '' && filterMode === 'all'));

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pb-20">
      <AnimatePresence>
        {!user && (
          <LoginOverlay
            onLogin={handleLogin}
            isCloudEnabled={true}
            error={authError}
          />
        )}
      </AnimatePresence>

      <Header
        user={user}
        solvedCount={solvedCount}
        totalCount={totalCount}
        streak={3} // Hardcoded for demo, we can implement the logic later
        theme={theme}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Welcome Section */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <Sparkles className="w-5 h-5 text-accent-yellow fill-accent-yellow/20" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted">Astra Learning Path</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-syne text-4xl font-extrabold tracking-tight mb-4"
          >
            Road to Mastery
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted text-sm max-w-xl leading-relaxed"
          >
            Keep pushing forward. Every problem solved is a step closer to your dream engineering role.
            All your progress is automatically synced with our cloud database.
          </motion.p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Completion', val: `${Math.round((solvedCount / totalCount) * 100)}%`, icon: Trophy, color: 'text-accent-green' },
            { label: 'Time Spent', val: '12.4h', icon: Timer, color: 'text-accent-blue' },
            { label: 'Hot Streak', val: '5 Days', icon: Flame, color: 'text-accent-orange' },
            { label: 'Remaining', val: totalCount - solvedCount, icon: Layers, color: 'text-accent-purple' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-surface border border-border rounded-2xl p-5"
            >
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <div className="font-syne text-2xl font-extrabold">{s.val}</div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">{s.label}</div>
            </motion.div>
          ))}
        </section>

        {/* Toolbar */}
        <section className="sticky top-24 z-40 bg-background/80 backdrop-blur-md mb-8 py-4 border-b border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent-blue transition-colors" />
            <input
              type="text"
              placeholder="Search problems or patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-accent-blue transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {['all', 'Easy', 'Medium', 'Hard'].map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${filterMode === mode
                    ? 'bg-accent-blue text-white border-accent-blue'
                    : 'bg-surface border-border text-muted hover:border-accent-blue'
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </section>

        {/* Topics List */}
        <section>
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <TopicCard
                  topic={topic}
                  done={done}
                  notes={notes}
                  stars={stars}
                  onToggleDone={toggleDone}
                  onToggleStar={toggleStar}
                  onToggleNotes={() => { }}
                  onUpdateNote={updateNote}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-[32px]">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-syne text-xl font-bold mb-2">No problems found</h3>
              <p className="text-muted text-sm">Try adjusting your filters or search query.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
