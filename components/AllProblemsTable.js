"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Star, ExternalLink, Code2, Lock, Youtube, PlayCircle } from 'lucide-react';

export default function AllProblemsTable({ topics, done, stars, onToggleDone, onToggleStar }) {
    const allProblems = topics.flatMap(t =>
        t.weeks.flatMap(w =>
            w.problems.map(p => ({
                ...p,
                topicName: t.title,
                acceptance: (Math.random() * (75 - 45) + 45).toFixed(1) + "%", // Mock acceptance
            }))
        )
    );

    const getDiffColor = (diff) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'text-[#00af9b]'; // LeetCode Green
            case 'medium': return 'text-[#ffb800]'; // LeetCode Yellow
            case 'hard': return 'text-[#ff2d55]'; // LeetCode Red
            default: return 'text-muted';
        }
    };

    return (
        <section className="w-full bg-surface/30 rounded-2xl overflow-hidden border border-border/50">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="bg-surface/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-[12px] font-medium text-muted/80 border-b border-border w-12 text-center font-inter">Status</th>
                            <th className="px-4 py-3 text-[12px] font-medium text-muted/80 border-b border-border font-inter">Title</th>
                            <th className="px-4 py-3 text-[12px] font-medium text-muted/80 border-b border-border font-inter">Solution</th>
                            <th className="px-4 py-3 text-[12px] font-medium text-muted/80 border-b border-border font-inter">Acceptance</th>
                            <th className="px-4 py-3 text-[12px] font-medium text-muted/80 border-b border-border font-inter">Difficulty</th>
                            <th className="px-4 py-3 text-[12px] font-medium text-muted/80 border-b border-border font-inter">Frequency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allProblems.map((p, i) => (
                            <motion.tr
                                key={p.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.005 }}
                                className={`group hover:bg-[#282828]/50 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-surface/10'}`}
                            >
                                <td className="px-4 py-3.5 border-b border-border/30 text-center">
                                    <button
                                        onClick={() => onToggleDone(p.id, p.topicId)}
                                        className={`transition-all ${done[p.id] ? 'text-[#00af9b]' : 'text-muted/20 hover:text-muted/40'}`}
                                    >
                                        <CheckCircle2 className={`w-4 h-4 ${done[p.id] ? 'fill-[#00af9b]/10' : ''}`} />
                                    </button>
                                </td>
                                <td className="px-4 py-3.5 border-b border-border/30">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={p.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[14px] font-medium text-white group-hover:text-accent-blue transition-all line-clamp-1"
                                        >
                                            {i + 1}. {p.name}
                                        </a>
                                        {stars[p.id] && <Star className="w-3 h-3 text-[#ffb800] fill-[#ffb800]" />}
                                    </div>
                                </td>
                                <td className="px-4 py-3.5 border-b border-border/30">
                                    <div className="flex items-center gap-2">
                                        <Code2 className="w-4 h-4 text-accent-blue/60 group-hover:text-accent-blue cursor-pointer transition-colors" />
                                        <PlayCircle className="w-4 h-4 text-accent-red/60 group-hover:text-accent-red cursor-pointer transition-colors" />
                                    </div>
                                </td>
                                <td className="px-4 py-3.5 border-b border-border/30">
                                    <span className="text-[13px] text-white/90 font-inter">{p.acceptance}</span>
                                </td>
                                <td className="px-4 py-3.5 border-b border-border/30">
                                    <span className={`text-[13px] font-medium font-inter ${getDiffColor(p.diff)}`}>
                                        {p.diff.charAt(0).toUpperCase() + p.diff.slice(1)}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 border-b border-border/30">
                                    <div className="relative group/freq">
                                        <div className="h-1.5 w-16 bg-border/40 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent-blue/40"
                                                style={{ width: `${Math.random() * 80 + 20}%` }}
                                            />
                                        </div>
                                        <Lock className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted opacity-0 group-hover/freq:opacity-100 transition-opacity" />
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
