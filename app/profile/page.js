"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import useLocalStorage from '@/hooks/useLocalStorage';
import {
    ChevronLeft, Trophy, Calendar, Zap, Activity, Shield,
    Target, Award, Star, Flame, Map, Hexagon, Code, Rocket
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { TOPICS } from '@/lib/data';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [done] = useLocalStorage('dsa_done', {});
    const [isLoaded, setIsLoaded] = useState(false);

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
        for (let i = 14; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString();
            labels.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
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
    }, [done]);

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

    const userEmail = user?.email || "Guest Commander";
    const userName = userEmail.split('@')[0];
    const initials = userEmail.substring(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-[#07090D] text-white selection:bg-accent-blue/30 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-blue/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">
                {/* Top Navigation */}
                <div className="flex items-center justify-between mb-16">
                    <Link href="/">
                        <motion.button
                            whileHover={{ x: -5 }}
                            className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-5 py-2.5 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
                            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
                        </motion.button>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Status</p>
                            <p className="text-sm font-syne font-heavy text-accent-green">MISSION ACTIVE</p>
                        </div>
                        <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 border border-accent-blue/20 rounded-2xl">
                            <Shield className="w-4 h-4 text-accent-blue" />
                            <span className="text-xs font-heavy tracking-tighter">ELITE COMMANDER</span>
                        </div>
                    </div>
                </div>

                {/* Hero Header */}
                <header className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 mb-12">
                    <div className="glass-panel p-10 rounded-[48px] relative overflow-hidden flex flex-col md:flex-row items-center gap-12 border-white/5 shadow-2xl">
                        <div className="relative">
                            <div className="w-44 h-44 rounded-[42px] bg-gradient-to-br from-accent-blue via-accent-purple to-accent-orange p-1 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                                <div className="w-full h-full bg-[#07090D] rounded-[40px] flex items-center justify-center overflow-hidden">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl font-syne font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">{initials}</span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-[#07090D] border-4 border-[#12151A] rounded-2xl flex items-center justify-center shadow-xl">
                                <Trophy className="w-7 h-7 text-accent-yellow fill-accent-yellow/20" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                                <h1 className="text-5xl font-syne font-black tracking-tighter">{userName}</h1>
                                <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Level {stats.level}</span>
                                </div>
                            </div>
                            <p className="text-muted text-lg mb-8 leading-relaxed max-w-lg">Mastering algorithms and building advanced mental models for problem solving.</p>

                            {/* XP Bar */}
                            <div className="w-full max-w-md">
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue">Experience Points</span>
                                    <span className="text-xs font-jetbrains font-bold">{stats.xp} / {stats.nextLevelXp} XP</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full border border-white/5 p-[2px] overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-[40px] flex flex-col justify-between border-white/5">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-accent-orange/10 rounded-2xl flex items-center justify-center border border-accent-orange/20">
                                <Flame className="w-6 h-6 text-accent-orange fill-accent-orange/20" />
                            </div>
                            <div>
                                <h4 className="font-syne font-bold text-lg leading-none mb-1">Performance Streak</h4>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Uninterrupted Mastery</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-7xl font-syne font-black text-white leading-none tracking-tighter mb-2">{stats.streak}</span>
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent-orange">Days Active</span>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 text-center">
                            <p className="text-[10px] text-muted italic leading-relaxed">"Consistency is the silent catalyst of greatness."</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Mastery Radar */}
                    <div className="lg:col-span-2 glass-panel p-10 rounded-[48px] border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center border border-accent-blue/20">
                                    <Hexagon className="w-6 h-6 text-accent-blue fill-accent-blue/20" />
                                </div>
                                <div>
                                    <h3 className="font-syne font-bold text-xl leading-none mb-1">Mastery Spectrum</h3>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Skill Distribution Analysis</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                <div className="w-2 h-2 rounded-full bg-accent-blue" />
                                <span className="text-[10px] font-bold uppercase">Topic-wise %</span>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <Chart options={radarOptions} series={[{ name: 'Mastery', data: stats.topicMastery.map(t => t.value) }]} type="radar" height="100%" />
                        </div>
                    </div>

                    {/* Stats List */}
                    <div className="flex flex-col gap-6">
                        {[
                            { label: 'Total Challenges', val: Object.keys(done).length, icon: Target, color: 'text-accent-blue' },
                            { label: 'Active Sessions', val: stats.activeDays, icon: Calendar, color: 'text-accent-green' },
                            { label: 'Pattern Mastery', val: `${Math.round(stats.topicMastery.reduce((a, b) => a + b.value, 0) / (TOPICS.length || 1))}%`, icon: Code, color: 'text-accent-purple' },
                            { label: 'Current Level', val: stats.level, icon: Rocket, color: 'text-accent-orange' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel p-6 rounded-3xl border-white/5 hover:border-white/10 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${stat.color.replace('text', 'bg')}/10 rounded-2xl flex items-center justify-center border ${stat.color.replace('text', 'border')}/20 group-hover:scale-110 transition-transform`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                            <p className="font-syne font-heavy text-2xl leading-none">{stat.val}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Activity Graph */}
                <section className="glass-panel p-10 rounded-[48px] mb-12 border-white/5">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent-purple/10 rounded-2xl flex items-center justify-center border border-accent-purple/20">
                                <Activity className="w-6 h-6 text-accent-purple" />
                            </div>
                            <div>
                                <h3 className="font-syne font-bold text-xl leading-none mb-1">Neural Activity Flow</h3>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Recent Problem Solving Momentum</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['14D'].map(t => (
                                <span key={t} className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-lg text-xs font-bold">{t}</span>
                            ))}
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <Chart options={areaOptions} series={[{ name: 'Questions Solved', data: stats.seriesData }]} type="area" height="100%" />
                    </div>
                </section>

                {/* Achievements Preview */}
                <section className="glass-panel p-10 rounded-[48px] border-white/5">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-accent-yellow/10 rounded-2xl flex items-center justify-center border border-accent-yellow/20">
                            <Award className="w-6 h-6 text-accent-yellow fill-accent-yellow/20" />
                        </div>
                        <div>
                            <h3 className="font-syne font-bold text-xl leading-none mb-1">Decorations & Badges</h3>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Medals of Honor</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[
                            { name: 'Apex Predator', color: 'text-accent-red' },
                            { name: 'Sliding King', color: 'text-accent-green' },
                            { name: 'DP Specialist', color: 'text-accent-purple' },
                            { name: 'Array Master', color: 'text-accent-blue' },
                            { name: 'Early Bird', color: 'text-accent-yellow' },
                            { name: 'Bug Hunter', color: 'text-muted' }
                        ].map((badge, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className={`w-20 h-20 bg-white/5 border border-white/5 rounded-[24px] flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:-translate-y-2 transition-all cursor-help`}>
                                    <Star className={`w-10 h-10 ${badge.color} fill-current opacity-40`} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted group-hover:text-white transition-colors">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <style jsx global>{`
                .glass-panel {
                    background: rgba(18, 21, 26, 0.4);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                }
                .glow-blue { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
                .font-heavy { font-weight: 900; }
            `}</style>
        </div>
    );
}
