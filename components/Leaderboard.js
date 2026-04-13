"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Crown, Medal, User } from 'lucide-react';

export default function Leaderboard({ isOpen, onClose, data }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-surface border border-border rounded-[32px] shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-border flex items-center justify-between bg-accent-blue/5">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-accent-yellow" />
                        <h2 className="text-xl font-syne font-extrabold uppercase tracking-tight">Global Leaderboard</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                        <X className="w-5 h-5 text-muted" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-3">
                        {data.map((player, index) => (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${index === 0 ? 'bg-accent-yellow/10 border-accent-yellow/30' :
                                        index === 1 ? 'bg-zinc-400/10 border-zinc-400/30' :
                                            index === 2 ? 'bg-accent-orange/10 border-accent-orange/30' :
                                                'bg-background border-border hover:border-accent-blue/30'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 flex items-center justify-center font-syne font-heavy text-sm">
                                        {index === 0 ? <Crown className="w-6 h-6 text-accent-yellow" /> :
                                            index === 1 ? <Medal className="w-6 h-6 text-zinc-400" /> :
                                                index === 2 ? <Medal className="w-6 h-6 text-accent-orange" /> :
                                                    `#${index + 1}`}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-white truncate max-w-[150px]">
                                                {player.email.split('@')[0]}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted uppercase font-bold tracking-widest">
                                            Last Active: {new Date(player.lastActive).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right px-4 py-1.5 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-lg font-syne font-heavy text-accent-blue">{player.solved}</div>
                                    <div className="text-[8px] text-muted uppercase font-bold tracking-widest">Solved</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-accent-blue/5 border-t border-border flex justify-center">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
                        Syncing with secure cloud data...
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
