"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import useLocalStorage from '@/hooks/useLocalStorage';
import {
    ChevronLeft, Trophy, Calendar, Zap, Activity, Shield,
    Target, Award, Star, Flame, Map, Hexagon, Code, Rocket,
    X, CheckCircle, Lock
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { TOPICS } from '@/lib/data';
import ActivityHeatmap from '@/components/ActivityHeatmap';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Badge Details & Logic
const BADGES = [
    {
        id: 'apex',
        name: 'Apex Predator',
        color: 'text-accent-red',
        requirement: 'Solve 50+ Hard difficulty challenges.',
        check: (done) => false // Placeholder for complex logic
    },
    {
        id: 'sliding',
        name: 'Sliding King',
        color: 'text-accent-green',
        requirement: 'Master all Sliding Window pattern questions.',
        check: (done) => false
    },
    {
        id: 'dp',
        name: 'DP Specialist',
        color: 'text-accent-purple',
        requirement: 'Solve 20+ Dynamic Programming challenges.',
        check: (done) => false
    },
    {
        id: 'array',
        name: 'Array Master',
        color: 'text-accent-blue',
        requirement: 'Complete all questions in the Arrays & Strings foundation.',
        check: (done) => false
    },
    {
        id: 'early',
        name: 'Early Bird',
        color: 'text-accent-yellow',
        requirement: 'Solve your first problem of the day before 7:00 AM.',
        check: (done) => false
    },
    {
        id: 'bug',
        name: 'Bug Hunter',
        color: 'text-muted',
        requirement: 'Refactor or update your solutions 10+ times.',
        check: (done) => false
    }
];

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [done] = useLocalStorage('dsa_done', {});
    const [isLoaded, setIsLoaded] = useState(false);
    const [timeFrame, setTimeFrame] = useState('14D');
    const [selectedBadge, setSelectedBadge] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setUser(session.user);
            setIsLoaded(true);
        });
    }, []);

    const stats = useMemo(() => {
        const timestamps = Object.values(done || {});
        if (timestamps.length === 0) {
            return {
                labels: [], seriesData: [], activeDays: 0, streak: 0, level: 1,
                xp: 0, nextLevelXp: 100, topicMastery: []
            };
        }

        const dailyCounts = {};
        const uniqueDays = new Set();
        timestamps.forEach(ts => {
            const dateStr = new Date(ts).toLocaleDateString();
            dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
            uniqueDays.add(dateStr);
        });

        const labels = [];
        const seriesData = [];
        const range = timeFrame === '1Y' ? 365 : 14;

        for (let i = range; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString();

            if (timeFrame === '1Y') {
                if (d.getDate() === 1) {
                    labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
                } else {
                    labels.push("");
                }
            } else {
                labels.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
            }
            seriesData.push(dailyCounts[dateStr] || 0);
        }

        let streak = 0;
        let checkDate = new Date();
        if (!dailyCounts[checkDate.toLocaleDateString()]) checkDate.setDate(checkDate.getDate() - 1);
        while (dailyCounts[checkDate.toLocaleDateString()]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        const activeDays = uniqueDays.size;
        const totalSolved = timestamps.length;
        const level = Math.floor(totalSolved / 5) + 1;
        const xp = (totalSolved % 5) * 20;
        const nextLevelXp = 100;

        const topicMastery = TOPICS.map(t => {
            const allT = t.weeks.flatMap(w => w.problems);
            const solved = allT.filter(p => done[p.id]).length;
            return {
                name: t.title,
                value: allT.length > 0 ? Math.round((solved / allT.length) * 100) : 0
            };
        });

        return { labels, seriesData, activeDays, streak, level, xp, nextLevelXp, topicMastery };
    }, [done, timeFrame]);

    const radarOptions = {
        chart: { toolbar: { show: false }, background: 'transparent' },
        colors: ['#3B82F6'],
        plotOptions: {
            radar: {
                polygons: {
                    strokeColors: '#22262E',
                    connectorColors: '#22262E',
                    fill: { colors: ['transparent'] }
                }
            }
        },
        markers: { size: 4, colors: ['#3B82F6'], strokeWidth: 2, strokeColors: '#fff' },
        xaxis: {
            categories: stats.topicMastery.map(t => t.name),
            labels: { style: { colors: Array(TOPICS.length).fill('#94A3B8'), fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-syne)' } }
        },
        yaxis: { show: false, min: 0, max: 100 },
        fill: { opacity: 0.4, type: 'solid' },
        stroke: { show: true, width: 2, dashArray: 0 }
    };

    const areaOptions = {
        chart: { toolbar: { show: false }, zoom: { enabled: false }, background: 'transparent' },
        colors: ['#3B82F6'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        grid: { borderColor: '#22262E', strokeDashArray: 4 },
        xaxis: {
            categories: stats.labels,
            labels: { style: { colors: '#64748B', fontSize: '10px' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: '#64748B' } } },
        tooltip: { theme: 'dark' }
    };

    if (!isLoaded) return null;

    const initials = user?.email?.substring(0, 2).toUpperCase() || "GC";

    return (
        <div className="min-h-screen bg-[#07090D] text-white selection:bg-accent-blue/30 overflow-x-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-blue/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <Link href="/">
                        <motion.button whileHover={{ x: -5 }} className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-5 py-2.5 transition-all">
                            <ChevronLeft className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
                            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
                        </motion.button>
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 border border-accent-blue/20 rounded-2xl">
                        <Shield className="w-4 h-4 text-accent-blue" />
                        <span className="text-xs font-heavy tracking-tighter">ELITE COMMANDER</span>
                    </div>
                </div>

                <header className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 mb-12">
                    <div className="glass-panel p-10 rounded-[48px] relative overflow-hidden flex flex-col md:flex-row items-center gap-12 border-white/5 shadow-2xl">
                        <div className="w-44 h-44 rounded-[42px] bg-gradient-to-br from-accent-blue via-accent-purple to-accent-orange p-1">
                            <div className="w-full h-full bg-[#07090D] rounded-[40px] flex items-center justify-center overflow-hidden">
                                <span className="text-5xl font-syne font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">{initials}</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-5xl font-syne font-black tracking-tighter mb-4">{user?.email?.split('@')[0]}</h1>
                            <div className="w-full max-w-md">
                                <div className="flex justify-between items-end mb-3 font-jetbrains font-bold uppercase text-[10px]">
                                    <span className="text-accent-blue">Experience</span>
                                    <span>{stats.xp} / 100 XP</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full border border-white/5 p-[2px]">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${stats.xp}%` }} className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-[40px] flex flex-col items-center justify-center border-white/5">
                        <Flame className="w-8 h-8 text-accent-orange mb-4" />
                        <span className="text-7xl font-syne font-black mb-2">{stats.streak}</span>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent-orange">Day Streak</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 glass-panel p-10 rounded-[48px] border-white/5">
                        <h3 className="font-syne font-bold text-xl mb-8">Mastery Spectrum</h3>
                        <div className="h-[400px] w-full">
                            <Chart options={radarOptions} series={[{ name: 'Mastery', data: stats.topicMastery.map(t => t.value) }]} type="radar" height="100%" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {[
                            { label: 'Total Solved', val: Object.keys(done).length, icon: Target, color: 'text-accent-blue' },
                            { label: 'Active Days', val: stats.activeDays, icon: Calendar, color: 'text-accent-green' },
                            { label: 'Power Level', val: stats.level, icon: Rocket, color: 'text-accent-orange' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-panel p-6 rounded-3xl border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${stat.color.replace('text', 'bg')}/10 rounded-2xl flex items-center justify-center border ${stat.color.replace('text', 'border')}/20`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="font-syne font-heavy text-2xl">{stat.val}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <section className="glass-panel p-10 rounded-[48px] mb-12 border-white/5">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="font-syne font-bold text-xl">Neural Activity Flow</h3>
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                            {['14D', '1Y'].map(t => (
                                <button key={t} onClick={() => setTimeFrame(t)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${timeFrame === t ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20' : 'text-muted hover:text-white'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-80 w-full mb-12">
                        <Chart key={timeFrame} options={{ ...areaOptions, xaxis: { ...areaOptions.xaxis, categories: stats.labels } }} series={[{ name: 'Solved', data: stats.seriesData }]} type="area" height="100%" />
                    </div>
                    <div className="pt-8 border-t border-white/5">
                        <ActivityHeatmap doneData={done} />
                    </div>
                </section>

                <section className="glass-panel p-10 rounded-[48px] border-white/5">
                    <h3 className="font-syne font-bold text-xl mb-10">Decorations & Badges</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {BADGES.map((badge, i) => (
                            <motion.div
                                key={i}
                                onClick={() => setSelectedBadge(badge)}
                                whileHover={{ scale: 1.05 }}
                                className="flex flex-col items-center text-center group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-[24px] flex items-center justify-center mb-4 group-hover:bg-white/10 transition-all">
                                    <Star className={`w-10 h-10 ${badge.color} fill-current opacity-40`} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted group-hover:text-white">{badge.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Badge Detail Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBadge(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-[#0F1217] border border-white/10 rounded-[42px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10 flex flex-col items-center text-center">
                                <div className={`w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mb-8 border border-white/5 shadow-inner`}>
                                    <Star className={`w-12 h-12 ${selectedBadge.color} fill-current shadow-lg`} />
                                </div>

                                <h2 className="text-3xl font-syne font-black mb-2">{selectedBadge.name}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted mb-8 italic">Decoration of Honor</p>

                                <div className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 mb-8 text-left">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Target className="w-4 h-4 text-accent-blue" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue">Mission Objective</span>
                                    </div>
                                    <p className="text-sm text-white/80 leading-relaxed font-medium">
                                        {selectedBadge.requirement}
                                    </p>
                                </div>

                                <div className="w-full flex gap-3">
                                    <button
                                        onClick={() => setSelectedBadge(null)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/5 transition-all text-xs uppercase tracking-widest"
                                    >
                                        Dismiss
                                    </button>
                                    <button className="flex-1 bg-accent-blue text-white font-bold py-4 rounded-2xl shadow-lg shadow-accent-blue/20 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Lock className="w-3.5 h-3.5" />
                                        Locked
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedBadge(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .glass-panel { background: rgba(18, 21, 26, 0.4); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.03); }
                .font-heavy { font-weight: 900; }
            `}</style>
        </div>
    );
}
