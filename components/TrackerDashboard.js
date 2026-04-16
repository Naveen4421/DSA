"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TOPICS, COMPANY_TRACKS } from '@/lib/data';
import Header from '@/components/Header';
import TopicCard from '@/components/TopicCard';
import AllProblemsTable from '@/components/AllProblemsTable';
import LoginOverlay from '@/components/LoginOverlay';
import AnalyticsHUD from '@/components/AnalyticsHUD';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import AchievementHUD from '@/components/AchievementHUD';
import RisingStarCertificate from '@/components/RisingStarCertificate';
import BadgeShowcase from '@/components/BadgeShowcase';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Search, Sparkles, Filter, LayoutGrid, List, Star as StarIcon, Trophy, Target, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Leaderboard from '@/components/Leaderboard';

export default function TrackerDashboard() {
    const [user, setUser] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [isCertificateOpen, setIsCertificateOpen] = useState(false);
    const [isBadgeShowcaseOpen, setIsBadgeShowcaseOpen] = useState(false);

    const [done, setDone] = useLocalStorage('dsa_done', {});
    const [notes, setNotes] = useLocalStorage('dsa_notes', {});
    const [stars, setStars] = useLocalStorage('dsa_stars', {});
    const [solutions, setSolutions] = useLocalStorage('dsa_solutions', {});
    const [times, setTimes] = useLocalStorage('dsa_times', {});
    const [theme, setTheme] = useLocalStorage('theme', 'dark');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [dailyProblem, setDailyProblem] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState('all');
    const [viewMode, setViewMode] = useState('list');
    const [trackType, setTrackType] = useState('topics'); // 'topics' or 'companies'

    // Unified Load State
    useEffect(() => {
        setIsMounted(true);
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
                        fetchLeaderboard();
                    }
                    setIsLoaded(true);
                    pickDailyProblem();
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
        if (!userId || userId === 'guest') return;
        try {
            const { data } = await supabase.from('user_data').select('*').eq('id', userId).maybeSingle();
            if (data) {
                if (data.done_data && Object.keys(data.done_data).length > Object.keys(done).length) setDone(data.done_data);
                if (data.notes_data && Object.keys(data.notes_data).length > Object.keys(notes).length) setNotes(data.notes_data);
                if (data.stars_data && Object.keys(data.stars_data).length > Object.keys(stars).length) setStars(data.stars_data);
                if (data.solutions_data && Object.keys(data.solutions_data).length > Object.keys(solutions).length) setSolutions(data.solutions_data);
                if (data.times_data && Object.keys(data.times_data).length > Object.keys(times).length) setTimes(data.times_data);
            }
        } catch (e) {
            console.error("Cloud fetch failed:", e);
        }
    };

    const fetchLeaderboard = async () => {
        if (!supabase) return;
        try {
            const { data } = await supabase.from('user_data').select('id, email, done_data, updated_at');
            if (data) {
                const processed = data.map(item => ({
                    id: item.id,
                    email: item.email || item.id.substring(0, 8),
                    solved: Object.keys(item.done_data || {}).length,
                    lastActive: item.updated_at
                })).sort((a, b) => b.solved - a.solved).slice(0, 10);
                setLeaderboardData(processed);
            }
        } catch (e) {
            console.error("Leaderboard fetch failed:", e);
        }
    };

    const pickDailyProblem = () => {
        const allProblems = TOPICS.flatMap(t => t.weeks.flatMap(w => w.problems));
        // Use the current date as seed for daily problem
        const today = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < today.length; i++) {
            hash = (hash << 5) - hash + today.charCodeAt(i);
            hash |= 0;
        }
        const index = Math.abs(hash) % allProblems.length;
        setDailyProblem(allProblems[index]);
    };

    const syncToCloud = async (newData, type) => {
        if (!user || user.id === 'guest' || !supabase) return;
        const updates = { id: user.id, updated_at: new Date().toISOString() };
        if (type === 'done') updates.done_data = newData;
        if (type === 'notes') updates.notes_data = newData;
        if (type === 'stars') updates.stars_data = newData;
        if (type === 'solutions') updates.solutions_data = newData;
        if (type === 'times') updates.times_data = newData;
        await supabase.from('user_data').upsert(updates);
    };

    const updateTime = (pid, val) => {
        const newTimes = { ...(times || {}) };
        newTimes[pid] = val;
        setTimes(newTimes);
        syncToCloud(newTimes, 'times');
    };

    const handleLogin = async (email, password, mode) => {
        setAuthError(null);

        // 1. Guest Mode - Instant Access
        if (mode === 'GUEST') {
            setUser({ id: 'guest', email: 'guest@local' });
            return;
        }

        // 2. Configuration Check
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const isConfigured = url && !url.includes('placeholder');

        if (!isConfigured) {
            setAuthError("Build Error: Your environment variables weren't ready when this build started. Please click 'Redeploy' in Vercel.");
            return;
        }

        try {
            const isSigningUp = mode === true;

            // Add a timeout to the auth call
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Connection Timeout: The database is taking too long to respond. Check your internet or Supabase status.")), 15000)
            );

            const authPromise = isSigningUp
                ? supabase.auth.signUp({ email, password })
                : supabase.auth.signInWithPassword({ email, password });

            // Race the auth call against the timeout
            const { data, error } = await Promise.race([authPromise, timeoutPromise]);

            if (error) throw error;

            if (isSigningUp && !data.session) {
                alert("Account created! Verify your email to login.");
            }
        } catch (e) {
            console.warn("Auth process failed:", e.message);
            setAuthError(e.message || "An unexpected error occurred.");
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
        const newDone = { ...(done || {}) };
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
        const newNotes = { ...(notes || {}) };
        val.trim() ? newNotes[pid] = val : delete newNotes[pid];
        setNotes(newNotes);
        syncToCloud(newNotes, 'notes');
    };

    const toggleStar = (pid, e) => {
        if (e) e.stopPropagation();
        const newStars = { ...(stars || {}) };
        newStars[pid] ? delete newStars[pid] : newStars[pid] = true;
        setStars(newStars);
        syncToCloud(newStars, 'stars');
    };

    const updateSolution = (pid, val) => {
        const newSolutions = { ...(solutions || {}) };
        val.trim() ? newSolutions[pid] = val : delete newSolutions[pid];
        setSolutions(newSolutions);
        syncToCloud(newSolutions, 'solutions');
    };

    const solvedCount = Object.keys(done || {}).length;
    const allAvailableTracks = [...TOPICS, ...COMPANY_TRACKS];
    const totalCount = allAvailableTracks.reduce((acc, t) => acc + (t.weeks?.reduce((a, w) => a + (w.problems?.length || 0), 0) || 0), 0);

    const activeTracks = trackType === 'topics' ? TOPICS : COMPANY_TRACKS;

    const filteredTopics = React.useMemo(() => {
        return activeTracks.map(topic => {
            const filteredWeeks = topic.weeks.map(week => ({
                ...week,
                problems: week.problems.filter(p => (
                    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.pattern.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (filterMode === 'all' || p.diff === filterMode || (filterMode === 'starred' && stars?.[p.id]))
                ))
            })).filter(w => w.problems.length > 0);
            return { ...topic, weeks: filteredWeeks };
        }).filter(t => t.weeks.length > 0 || (searchQuery === '' && filterMode === 'all'));
    }, [searchQuery, filterMode, stars, trackType]);

    if (!isLoaded || !isMounted) {
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

            <Header
                user={user}
                solvedCount={solvedCount}
                totalCount={totalCount}
                streak={7}
                theme={theme}
                onLogout={handleLogout}
                onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                onOpenBadges={() => setIsBadgeShowcaseOpen(true)}
                onShowExplore={() => setViewMode('list')}
            />

            <main className="max-w-6xl mx-auto px-4 mt-12">

                {/* Daily Challenge Section */}
                {dailyProblem && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="relative glass-panel p-8 rounded-[32px] border-accent-blue/20 overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-blue/20 transition-all duration-700" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-2 text-accent-blue font-bold text-xs uppercase tracking-[0.3em]">
                                        <Sparkles className="w-4 h-4" />
                                        Daily Astra Mission
                                    </div>
                                    <h2 className="text-4xl font-syne font-heavy tracking-tighter text-white">
                                        {dailyProblem.name}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${dailyProblem.diff === 'Easy' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : dailyProblem.diff === 'Medium' ? 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20' : 'bg-accent-red/10 text-accent-red border-accent-red/20'}`}>
                                            {dailyProblem.diff}
                                        </span>
                                        <span className="text-muted text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Target className="w-3.5 h-3.5" />
                                            {dailyProblem.pattern}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => window.open(dailyProblem.url, '_blank')}
                                        className="bg-accent-blue hover:bg-accent-blue/80 text-white font-syne font-bold px-8 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-accent-blue/20"
                                    >
                                        Execute Mission
                                        <Target className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsLeaderboardOpen(true)}
                                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-syne font-bold px-6 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95"
                                    >
                                        <Trophy className="w-4 h-4 text-accent-yellow" />
                                        Leaderboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Company Quick-Start Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-syne font-heavy text-2xl text-white flex items-center gap-3">
                                <Briefcase className="w-6 h-6 text-accent-blue" />
                                Elite Company Tracks
                            </h3>
                            <p className="text-muted text-sm mt-1">Direct path to top-tier product companies</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {COMPANY_TRACKS.map((company) => (
                            <button
                                key={company.id}
                                onClick={() => {
                                    setTrackType('companies');
                                    setSearchQuery('');
                                    // Smooth scroll to the topics section
                                    document.getElementById('challenges-grid')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="glass-panel group p-6 rounded-[24px] border-white/5 hover:border-accent-blue/40 transition-all text-left relative overflow-hidden"
                            >
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: `radial-gradient(circle at top right, ${company.color}15, transparent)` }}
                                />
                                <div
                                    className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110 duration-500"
                                    style={{ backgroundColor: company.bg }}
                                >
                                    {company.icon}
                                </div>
                                <h4 className="font-syne font-bold text-lg text-white group-hover:text-accent-blue transition-colors">{company.title}</h4>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">{company.weeks[0].problems.length} Missions</p>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Achievements Section */}
                <AchievementHUD
                    doneData={done}
                    topics={allAvailableTracks}
                    onViewCertificate={() => setIsCertificateOpen(true)}
                />

                {/* Analytics Section */}
                <AnalyticsHUD
                    done={done}
                    totalCount={totalCount}
                    theme={theme}
                    topics={allAvailableTracks}
                    onViewCertificates={() => setIsCertificateOpen(true)}
                />

                {/* Activity Heatmap Section */}
                <ActivityHeatmap doneData={done} />

                {/* Toolbar Section */}
                <section className="sticky top-24 z-40 mb-12 py-4">
                    <div className="glass-panel rounded-3xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 border-white/5 shadow-2xl">

                        <div className="flex items-center gap-2 bg-background/50 p-1 rounded-2xl border border-border/50">
                            <button
                                onClick={() => setTrackType('topics')}
                                className={`px-6 py-2.5 rounded-xl transition-all font-syne font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${trackType === 'topics' ? 'bg-accent-blue text-white shadow-lg' : 'text-muted hover:text-white'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                Topics
                            </button>
                            <button
                                onClick={() => setTrackType('companies')}
                                className={`px-6 py-2.5 rounded-xl transition-all font-syne font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${trackType === 'companies' ? 'bg-accent-blue text-white shadow-lg' : 'text-muted hover:text-white'}`}
                            >
                                <Briefcase className="w-4 h-4" />
                                Companies
                            </button>
                        </div>

                        <div className="relative w-full md:w-64 group">
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
                                {['all', 'Easy', 'Medium', 'Hard', 'starred'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setFilterMode(mode)}
                                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${filterMode === mode
                                            ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20'
                                            : 'bg-background/50 border-border/50 text-muted hover:border-accent-blue hover:text-white'
                                            }`}
                                    >
                                        {mode === 'starred' ? <div className="flex items-center gap-1.5"><StarIcon className="w-3 h-3 fill-current" /> {mode}</div> : mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Topics Content */}
                <div id="challenges-grid" className="w-full">
                    <AnimatePresence mode='popLayout'>
                        {viewMode === 'table' ? (
                            <motion.div
                                key="table-view"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <AllProblemsTable
                                    topics={TOPICS}
                                    done={done || {}}
                                    stars={stars || {}}
                                    onToggleDone={toggleDone}
                                    onToggleStar={toggleStar}
                                />
                            </motion.div>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
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
                                            done={done || {}}
                                            notes={notes || {}}
                                            stars={stars || {}}
                                            solutions={solutions || {}}
                                            onToggleDone={toggleDone}
                                            onToggleStar={toggleStar}
                                            onUpdateNote={updateNote}
                                            onUpdateSolution={updateSolution}
                                            onUpdateTime={updateTime}
                                            times={times || {}}
                                        />

                                    </motion.div>
                                ))}
                            </div>
                        )}
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

            <RisingStarCertificate
                isOpen={isCertificateOpen}
                onClose={() => setIsCertificateOpen(false)}
                userName={user?.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9 ]/g, ' ') : "Elite Champion"}
                date={new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            />

            <BadgeShowcase
                isOpen={isBadgeShowcaseOpen}
                onClose={() => setIsBadgeShowcaseOpen(false)}
            />

            <Leaderboard
                isOpen={isLeaderboardOpen}
                onClose={() => setIsLeaderboardOpen(false)}
                data={leaderboardData}
            />

            {/* Floating Decorative Elements */}
            <div className="fixed top-1/4 -left-32 w-64 h-64 bg-accent-blue/5 blur-[120px] rounded-full -z-10 animate-pulse-glow" />
            <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-accent-purple/5 blur-[150px] rounded-full -z-10 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        </div>
    );
}
