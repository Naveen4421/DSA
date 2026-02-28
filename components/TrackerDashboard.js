"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TOPICS } from '@/lib/data';
import Header from '@/components/Header';
import TopicCard from '@/components/TopicCard';
import LoginOverlay from '@/components/LoginOverlay';
import AnalyticsHUD from '@/components/AnalyticsHUD';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Search, Sparkles, Filter, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function TrackerDashboard() {
    const [user, setUser] = useState(null);
    const [authError, setAuthError] = useState(null);

    const [done, setDone] = useLocalStorage('dsa_done', {});
    const [notes, setNotes] = useLocalStorage('dsa_notes', {});
    const [stars, setStars] = useLocalStorage('dsa_stars', {});
    const [theme, setTheme] = useLocalStorage('theme', 'dark');
    const [isLoaded, setIsLoaded] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState('all');
    const [viewMode, setViewMode] = useState('list');

    // Unified Load State
    useEffect(() => {
        // 1. Theme initialization
        document.documentElement.setAttribute('data-theme', theme);

        // 2. Initial Session Check
        const isReady = supabase &&
            process.env.NEXT_PUBLIC_SUPABASE_URL &&
            !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

        let isMounted = true;
        if (isReady) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (isMounted) {
                    if (session) {
                        setUser(session.user);
                        loadCloudData(session.user.id);
                    }
                    setIsLoaded(true);
                }
            });
        } else {
            // Handle missing keys for local-only mode
            setIsLoaded(true);
        }

        // 3. Auth Listener (Only once on mount)
        let subscription;
        if (supabase) {
            const { data } = supabase.auth.onAuthStateChange((event, session) => {
                if (isMounted) {
                    if (session) {
                        setUser(session.user);
                        if (event === 'SIGNED_IN') {
                            loadCloudData(session.user.id);
                        }
                    } else {
                        setUser(null);
                    }
                }
            });
            subscription = data.subscription;
        }

        return () => {
            isMounted = false;
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    // Theme effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const loadCloudData = async (userId) => {
        try {
            const { data } = await supabase.from('user_data').select('*').eq('id', userId).single();
            if (data) {
                if (Object.keys(data.done_data).length > Object.keys(done).length) setDone(data.done_data);
                if (Object.keys(data.notes_data).length > Object.keys(notes).length) setNotes(data.notes_data);
            }
        } catch (e) {
            console.error("Cloud fetch failed:", e);
        }
    };

    const syncToCloud = async (newData, type) => {
        if (!user) return;
        const updates = { id: user.id, updated_at: new Date().toISOString() };
        if (type === 'done') updates.done_data = newData;
        if (type === 'notes') updates.notes_data = newData;
        await supabase.from('user_data').upsert(updates);
    };

    const handleLogin = async (email, password, isSignUp) => {
        setAuthError(null);
        try {
            let result = isSignUp
                ? await supabase.auth.signUp({ email, password })
                : await supabase.auth.signInWithPassword({ email, password });
            if (result.error) throw result.error;
            if (isSignUp && !result.data.session) alert("Check your email!");
        } catch (e) {
            setAuthError(e.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
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
            const topic = TOPICS.find(t => t.id === topicId);
            const allTopicProblems = topic.weeks.flatMap(w => w.problems);
            const solvedInTopic = allTopicProblems.filter(p => p.id === pid || newDone[p.id]).length;
            if (solvedInTopic === allTopicProblems.length) {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#3FB950', '#58A6FF', '#BC8CFF'] });
            }
        }
        setDone(newDone);
        syncToCloud(newDone, 'done');
    };

    const updateNote = (pid, val) => {
        const newNotes = { ...notes };
        val.trim() ? newNotes[pid] = val : delete newNotes[pid];
        setNotes(newNotes);
        syncToCloud(newNotes, 'notes');
    };

    const solvedCount = Object.keys(done).length;
    const totalCount = TOPICS.reduce((acc, t) => acc + t.weeks.reduce((a, w) => a + w.problems.length, 0), 0);

    const filteredTopics = React.useMemo(() => {
        return TOPICS.map(topic => {
            const filteredWeeks = topic.weeks.map(week => ({
                ...week,
                problems: week.problems.filter(p => (
                    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.pattern.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (filterMode === 'all' || p.diff === filterMode)
                ))
            })).filter(w => w.problems.length > 0);
            return { ...topic, weeks: filteredWeeks };
        }).filter(t => t.weeks.length > 0 || (searchQuery === '' && filterMode === 'all'));
    }, [searchQuery, filterMode]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-12 h-12 border-4 border-accent-blue/20 border-t-accent-blue rounded-full mb-4"
                />
                <h2 className="font-syne font-bold text-xl animate-pulse">Initializing Dashboard...</h2>
                <p className="text-muted text-sm mt-2">Checking your progress in the secure cloud...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 selection:bg-accent-blue selection:text-white">
            <AnimatePresence>{!user && <LoginOverlay onLogin={handleLogin} isCloudEnabled={true} error={authError} />}</AnimatePresence>

            <Header user={user} solvedCount={solvedCount} totalCount={totalCount} streak={7} theme={theme} onLogout={handleLogout} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

            <main className="max-w-6xl mx-auto px-4 mt-12">

                {/* Analytics Section */}
                <AnalyticsHUD done={done} totalCount={totalCount} theme={theme} />

                {/* Toolbar Section */}
                <section className="sticky top-24 z-40 mb-12 py-4">
                    <div className="glass-panel rounded-3xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 border-white/5 shadow-2xl">

                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent-blue transition-colors" />
                            <input
                                type="text"
                                placeholder="Find a challenge..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-background/50 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-accent-blue transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                            <div className="flex bg-background/50 p-1 rounded-2xl border border-border/50 mr-2">
                                {[
                                    { id: 'list', icon: List },
                                    { id: 'grid', icon: LayoutGrid }
                                ].map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setViewMode(mode.id)}
                                        className={`p-2 rounded-xl transition-all ${viewMode === mode.id ? 'bg-accent-blue text-white shadow-lg' : 'text-muted hover:text-white'}`}
                                    >
                                        <mode.icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                                {['all', 'Easy', 'Medium', 'Hard'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setFilterMode(mode)}
                                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${filterMode === mode
                                            ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20'
                                            : 'bg-background/50 border-border/50 text-muted hover:border-accent-blue hover:text-white'
                                            }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Topics Content */}
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    <AnimatePresence mode='popLayout'>
                        {filteredTopics.map((topic, i) => (
                            <motion.div
                                layout
                                key={topic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <TopicCard
                                    topic={topic}
                                    done={done}
                                    notes={notes}
                                    stars={stars}
                                    onToggleDone={toggleDone}
                                    onToggleStar={() => { }}
                                    onUpdateNote={updateNote}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredTopics.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-32 text-center"
                        >
                            <div className="inline-flex p-6 rounded-full bg-surface-hover mb-6">
                                <Filter className="w-12 h-12 text-muted animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-syne font-extrabold mb-2">No missions found</h3>
                            <p className="text-muted text-sm">Adjust your filters to discover new challenges.</p>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Floating Decorative Elements */}
            <div className="fixed top-1/4 -left-32 w-64 h-64 bg-accent-blue/5 blur-[120px] rounded-full -z-10 animate-pulse-glow" />
            <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-accent-purple/5 blur-[150px] rounded-full -z-10 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        </div>
    );
}
