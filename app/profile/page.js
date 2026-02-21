"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ChevronLeft, Trophy, Calendar, Zap, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

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

    // 1. Process data for the graph and metrics
    const processUserStats = () => {
        const timestamps = Object.values(done);
        if (timestamps.length === 0) {
            return { labels: [], seriesData: [], activeDays: 0, streak: 0, level: 1 };
        }

        const dailyCounts = {};
        const uniqueDays = new Set();

        timestamps.forEach(ts => {
            const dateObj = new Date(ts);
            const dateStr = dateObj.toLocaleDateString();
            dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
            uniqueDays.add(dateStr);
        });

        // Get last 7 days for chart
        const labels = [];
        const seriesData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString();
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            seriesData.push(dailyCounts[dateStr] || 0);
        }

        // Calculate Streak
        let streak = 0;
        let checkDate = new Date();
        // Check if solved today first
        if (!dailyCounts[checkDate.toLocaleDateString()]) {
            checkDate.setDate(checkDate.getDate() - 1); // If not today, check from yesterday
        }

        while (dailyCounts[checkDate.toLocaleDateString()]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        const activeDays = uniqueDays.size;
        const level = Math.floor(timestamps.length / 5) + 1; // 1 level every 5 problems

        return { labels, seriesData, activeDays, streak, level };
    };

    const { labels, seriesData, activeDays, streak, level } = processUserStats();

    const chartOptions = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            zoom: { enabled: false },
            background: 'transparent'
        },
        colors: ['#3B82F6'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 100]
            }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        grid: {
            borderColor: '#22262E',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: labels,
            labels: { style: { colors: '#94A3B8', fontFamily: 'var(--font-dm-sans)' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { style: { colors: '#94A3B8', fontFamily: 'var(--font-dm-sans)' } }
        },
        theme: { mode: 'dark' },
        tooltip: { theme: 'dark' }
    };

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="max-w-4xl mx-auto px-4 pt-12">
                <Link href="/">
                    <motion.button
                        whileHover={{ x: -5 }}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-12"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
                    </motion.button>
                </Link>

                <section className="mb-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-4xl font-syne font-heavy text-white shadow-2xl shadow-accent-blue/20">
                        {user?.email?.substring(0, 2).toUpperCase() || "NA"}
                    </div>
                    <div>
                        <h1 className="text-4xl font-syne font-extrabold mb-2">{user?.email?.split('@')[0] || "Commander"}</h1>
                        <p className="text-muted text-sm mb-4">{user?.email}</p>
                        <div className="flex gap-4">
                            <div className="bg-surface border border-border rounded-xl px-4 py-2 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-accent-yellow" />
                                <span className="text-xs font-bold uppercase tracking-wider">Level {level} Explorer</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="glass-panel p-6 rounded-[32px]">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="w-5 h-5 text-accent-blue" />
                            <h3 className="font-syne font-bold">Session Overview</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Total Solved', val: Object.keys(done).length, color: 'text-accent-green' },
                                { label: 'Active Days', val: activeDays, color: 'text-accent-blue' },
                                { label: 'Current Streak', val: `${streak} Days`, color: 'text-accent-orange' },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-border/50 pb-3">
                                    <span className="text-muted text-xs font-bold uppercase tracking-wider">{s.label}</span>
                                    <span className={`font-syne font-extrabold ${s.color}`}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-[32px] bg-accent-blue/5 border-accent-blue/10">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-5 h-5 text-accent-yellow" />
                            <h3 className="font-syne font-bold">Astra Insight</h3>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed italic">
                            {Object.keys(done).length > 0
                                ? `"You've already solved ${Object.keys(done).length} problems. Your consistency is showing! Keep pushing to reach Level ${level + 1}."`
                                : `"Welcome aboard! Start your first challenge today to begin tracking your progress and unlock your Activity Matrix."`}
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[38px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Activity className="w-6 h-6 text-accent-blue" />
                            <h2 className="text-2xl font-syne font-extrabold">Activity Matrix</h2>
                        </div>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Last 7 Days</span>
                    </div>

                    <div className="h-64 w-full">
                        <Chart
                            options={chartOptions}
                            series={[{ name: 'Solved', data: seriesData }]}
                            type="area"
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
