"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Star, ExternalLink, Code2, Lightbulb, Terminal } from 'lucide-react';

export default function AllProblemsTable({ topics, done, stars, onToggleDone, onToggleStar }) {
    const allProblems = topics.flatMap(t =>
        t.weeks.flatMap(w =>
            w.problems.map(p => ({ ...p, topicName: t.title }))
        )
    );

    const getDiffColor = (diff) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'text-accent-green bg-accent-green/10';
            case 'medium': return 'text-accent-yellow bg-accent-yellow/10';
            case 'hard': return 'text-accent-red bg-accent-red/10';
            default: return 'text-muted bg-white/5';
        }
    };

    return (
        <section className="bg-surface border border-border rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-white/5">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted">Title</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted">Pattern</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted">Difficulty</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {allProblems.map((p, i) => (
                            <motion.tr
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.01 }}
                                className="group hover:bg-white/5 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onToggleDone(p.id, p.topicId)}
                                        className={`transition-all ${done[p.id] ? 'text-accent-green scale-110' : 'text-muted/30 hover:text-muted'}`}
                                    >
                                        {done[p.id] ? <CheckCircle2 className="w-5 h-5 fill-accent-green/10" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white group-hover:text-accent-blue transition-colors cursor-pointer">{p.name}</span>
                                            {stars[p.id] && <Star className="w-3.5 h-3.5 text-accent-yellow fill-accent-yellow" />}
                                        </div>
                                        <span className="text-[9px] text-muted font-bold uppercase tracking-tight">{p.topicName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-muted/80">{p.pattern}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-current opacity-70 ${getDiffColor(p.diff)}`}>
                                        {p.diff}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-accent-blue transition-all">
                                            <Code2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-accent-purple transition-all">
                                            <Lightbulb className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-accent-orange transition-all">
                                            <Terminal className="w-4 h-4" />
                                        </button>
                                        <a href={p.url} target="_blank" rel="noopener noreferrer">
                                            <button className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </a>
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
