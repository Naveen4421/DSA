"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Award, Zap, Target } from 'lucide-react';
import { TOPICS } from '@/lib/data';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AnalyticsHUD({ done, totalCount, theme }) {
    const { solvedCount, progress, difficultyStats, solvedToday, solvedThisWeek, solvedDp } = React.useMemo(() => {
        const solvedCount = Object.keys(done).length;
        const progress = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

        const allProblems = TOPICS.flatMap(t => t.weeks.flatMap(w => w.problems));
        const difficultyStats = { Easy: 0, Medium: 0, Hard: 0 };

        Object.keys(done).forEach(pid => {
            const problem = allProblems.find(p => p.id === parseInt(pid));
            if (problem) {
                difficultyStats[problem.diff]++;
            }
        });

        const today = new Date().toLocaleDateString();
        const solvedToday = Object.values(done).filter(timestamp =>
            new Date(timestamp).toLocaleDateString() === today
        ).length;

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const solvedThisWeek = Object.values(done).filter(timestamp =>
            new Date(timestamp) >= startOfWeek
        ).length;

        const dpTopic = TOPICS.find(t => t.id === 'dp');
        const dpProblems = dpTopic ? dpTopic.weeks.flatMap(w => w.problems) : [];
        const solvedDp = dpProblems.filter(p => done[p.id]).length;

        return { solvedCount, progress, difficultyStats, solvedToday, solvedThisWeek, solvedDp };
    }, [done, totalCount]);

    const chartSeries = [difficultyStats.Easy, difficultyStats.Medium, difficultyStats.Hard];
    const weeklyTarget = 15;

    const chartOptions = {
        chart: { type: 'donut', background: 'transparent' },
        labels: ['Easy', 'Medium', 'Hard'],
        colors: ['#10B981', '#F59E0B', '#EF4444'],
        legend: { show: false },
        dataLabels: { enabled: false },
        stroke: { show: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: { show: false },
                        value: {
                            show: true,
                            fontSize: '22px',
                            fontFamily: 'var(--font-syne)',
                            fontWeight: 800,
                            color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
                            offsetY: 8,
                            formatter: () => `${progress}%`
                        }
                    }
                }
            }
        },
        tooltip: {
            theme: theme === 'dark' ? 'dark' : 'light',
            y: { formatter: (val) => `${val} Solved` }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Main Stats Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-2 glass-panel p-8 rounded-[32px] overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-accent-blue font-bold text-xs uppercase tracking-widest">
                                <Target className="w-4 h-4" />
                                Current Mission
                            </div>
                            <h3 className="text-3xl font-syne font-extrabold leading-tight">Mastering DSA Fundamentals</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <div className="text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Solved Today</div>
                                <div className="text-2xl font-syne font-heavy text-accent-green">{solvedToday}</div>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <div className="text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Week Progress</div>
                                <div className="text-2xl font-syne font-heavy text-accent-purple">
                                    {solvedThisWeek} <span className="text-sm text-muted">/ {weeklyTarget}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-48 h-48 relative flex items-center justify-center">
                        <Chart options={chartOptions} series={chartSeries} type="donut" width="100%" />
                        <div className="absolute -z-10 w-32 h-32 bg-accent-blue/20 blur-2xl rounded-full animate-pulse-glow" />
                    </div>
                </div>
            </motion.div>

            {/* Achievement Side Card */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-accent-purple p-8 rounded-[32px] text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-accent-purple/20"
            >
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                    <Award className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-1 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter mb-4">
                        <Zap className="w-3 h-3 fill-current" />
                        Milestone
                    </div>
                    <h4 className="text-2xl font-syne font-extrabold mb-2 leading-tight">
                        {solvedDp > 5 ? "DP Specialist" : "Rising Star"}
                    </h4>
                    <p className="text-white/70 text-xs font-medium leading-relaxed">
                        {solvedDp > 0
                            ? `You've conquered ${solvedDp} Dynamic Programming challenges so far. Keep building that intuition!`
                            : "Start your journey today. Solving your first Dynamic Programming problem will unlock new insights!"}
                    </p>
                </div>

                <button className="mt-8 bg-white text-accent-purple font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all hover:shadow-lg active:scale-95">
                    View Certifications
                </button>
            </motion.div>
        </div>
    );
}
