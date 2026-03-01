'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const ActivityHeatmap = ({ doneData }) => {
    // 1. Generate the last 12 weeks of dates
    const weeks = useMemo(() => {
        const result = [];
        const today = new Date();

        // Start from 12 weeks ago
        for (let i = 11; i >= 0; i--) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                const date = new Date(today);
                date.setDate(today.getDate() - (i * 7 + (6 - j)));

                const dateStr = date.toLocaleDateString();
                const count = Object.values(doneData).filter(timestamp =>
                    new Date(timestamp).toLocaleDateString() === dateStr
                ).length;

                week.push({
                    date: dateStr,
                    count,
                    opacity: count === 0 ? 0.05 : Math.min(0.2 + (count * 0.2), 1)
                });
            }
            result.push(week);
        }
        return result;
    }, [doneData]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-background-secondary/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-syne font-bold text-xl text-white">Activity Pulse</h3>
                    <p className="text-muted text-sm">Your consistency over the last 90 days</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-muted">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {[0.1, 0.4, 0.7, 1].map(op => (
                            <div key={op} className="w-3 h-3 rounded-sm bg-accent-blue" style={{ opacity: op }} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {/* Day Labels */}
                <div className="flex flex-col justify-between py-1 text-[10px] text-muted font-bold h-28 pr-2">
                    {days.map((day, i) => i % 2 === 0 ? <span key={day}>{day}</span> : <div key={day} />)}
                </div>

                {/* Heatmap Grid */}
                <div className="flex gap-1.5">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1.5">
                            {week.map((day, dIndex) => (
                                <motion.div
                                    key={day.date}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: (wIndex * 7 + dIndex) * 0.002 }}
                                    className="w-3.5 h-3.5 rounded-sm bg-accent-blue relative group"
                                    style={{ opacity: day.opacity }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-background-secondary border border-white/10 rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl">
                                        <span className="text-white font-bold">{day.count} solved</span>
                                        <span className="text-muted ml-2">{day.date}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
