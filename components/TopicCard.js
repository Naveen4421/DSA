"use client";
import React, { useState } from 'react';
import { ChevronDown, ExternalLink, Check, Star, Timer, MessageSquare, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function TopicCard({ topic, done, notes, onToggleDone, onToggleNotes, onUpdateNote, onToggleStar, stars }) {
    const [isOpen, setIsOpen] = useState(false);

    const allProblems = topic.weeks.flatMap(w => w.problems);
    const total = allProblems.length;
    const solved = allProblems.filter(p => done[p.id]).length;
    const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

    const circum = 2 * Math.PI * 18;
    const offset = circum - (percent / 100) * circum;

    return (
        <div className="mb-6 rounded-2xl border border-border bg-surface shadow-sm overflow-hidden transition-all hover:border-accent-blue/30 group">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-5 cursor-pointer select-none"
            >
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner"
                        style={{ backgroundColor: topic.bg }}
                    >
                        {topic.icon}
                    </div>
                    <div>
                        <h3 className="font-syne text-lg font-extrabold tracking-tight">{topic.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted font-medium uppercase tracking-wider">{topic.desc}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-xs font-bold" style={{ color: topic.color }}>{solved}/{total} Solved</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="relative w-14 h-14 hidden sm:block">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
                            <circle className="stroke-border fill-none" strokeWidth="4" cx="26" cy="26" r="18" />
                            <motion.circle
                                initial={{ strokeDashoffset: circum }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="fill-none transition-all duration-500"
                                strokeWidth="4"
                                strokeLinecap="round"
                                cx="26"
                                cy="26"
                                r="18"
                                style={{ stroke: topic.color, strokeDasharray: circum }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-jetbrains text-[10px] font-bold">
                            {percent}%
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        className="p-2 rounded-lg bg-surface-hover text-muted"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                    >
                        {topic.weeks.map((week, idx) => (
                            <div key={idx} className="border-b border-border last:border-0">
                                <div className="bg-background/40 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
                                    {week.label}
                                </div>
                                {week.problems.map(p => (
                                    <ProblemRow
                                        key={p.id}
                                        problem={p}
                                        isDone={!!done[p.id]}
                                        isStarred={!!stars[`star_${p.id}`]}
                                        note={notes[p.id]}
                                        onToggleDone={(e) => onToggleDone(p.id, topic.id, e)}
                                        onToggleStar={(e) => onToggleStar(p.id, e)}
                                        onToggleNotes={() => onToggleNotes(p.id)}
                                        onUpdateNote={(val) => onUpdateNote(p.id, val)}
                                    />
                                ))}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ProblemRow({ problem, isDone, isStarred, note, onToggleDone, onToggleStar, onToggleNotes, onUpdateNote }) {
    const [isNotesOpen, setIsNotesOpen] = useState(false);

    const getDiffClass = (diff) => {
        if (diff === 'Easy') return 'bg-accent-green/10 text-accent-green border-accent-green/20';
        if (diff === 'Medium') return 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20';
        return 'bg-accent-red/10 text-accent-red border-accent-red/20';
    };

    return (
        <div className="border-b border-border/50 group/row last:border-0">
            <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[48px_1fr_auto] items-center gap-4 px-6 py-4 hover:bg-surface-hover transition-colors">
                <button
                    onClick={onToggleDone}
                    className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        isDone ? "bg-accent-green border-accent-green shadow-sm shadow-accent-green/20" : "border-border hover:border-accent-green"
                    )}
                >
                    {isDone && <Check className="w-4 h-4 text-white" />}
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 overflow-hidden">
                    <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "font-medium text-sm transition-all truncate hover:text-accent-blue",
                            isDone && "text-muted line-through"
                        )}
                    >
                        {problem.name}
                    </a>

                    <div className="flex items-center gap-2">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", getDiffClass(problem.diff))}>
                            {problem.diff}
                        </span>
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                            {problem.pattern}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-3">
                    <button
                        onClick={onToggleStar}
                        className={cn("p-1.5 rounded-lg transition-colors", isStarred ? "text-accent-yellow" : "text-muted hover:bg-background")}
                    >
                        <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
                    </button>

                    <button
                        onClick={() => setIsNotesOpen(!isNotesOpen)}
                        className={cn("p-1.5 rounded-lg transition-colors", note ? "text-accent-blue" : "text-muted hover:bg-background")}
                    >
                        <MessageSquare className="w-4 h-4" />
                    </button>

                    <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-muted hover:bg-background transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <AnimatePresence>
                {isNotesOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-background/20 px-6 pb-6"
                    >
                        <div className="pl-10 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                                <Code className="w-3 h-3" />
                                Problem Notes
                            </div>
                            <textarea
                                value={note || ""}
                                onChange={(e) => onUpdateNote(e.target.value)}
                                placeholder="Write your solution approach or notes here..."
                                className="w-full bg-surface border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-accent-blue transition-all min-height-[120px]"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
