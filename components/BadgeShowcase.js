"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Award, Zap, Shield, Target, Flame, Trophy, Lock, CheckCircle2 } from 'lucide-react';

const BADGE_TYPES = [
    {
        id: 'collector',
        name: 'Grand Collector',
        icon: trophy => <Trophy className={trophy} />,
        quality: 'Legendary',
        desc: 'Awarded to commanders who have gathered a critical mass of solved challenges.',
        color: 'text-accent-yellow',
        requirement: 'Solve 100+ Problems'
    },
    {
        id: 'striker',
        name: 'Persistence Engine',
        icon: flame => <Flame className={flame} />,
        quality: 'Epic',
        desc: 'Maintained an unbreakable focus for consecutive days of training.',
        color: 'text-accent-orange',
        requirement: '7-Day Streak'
    },
    {
        id: 'perfectionist',
        name: 'Zenith Master',
        icon: shield => <Shield className={shield} />,
        quality: 'Mythic',
        desc: 'The ultimate honor for completing every single objective in the Astra roadmap.',
        color: 'text-accent-blue',
        requirement: '100% Completion'
    },
    {
        id: 'specialist',
        name: 'Pattern Guru',
        icon: target => <Target className={target} />,
        quality: 'Rare',
        desc: 'Demonstrated deep mastery over specific algorithmic patterns and structures.',
        color: 'text-accent-purple',
        requirement: 'Complete all sliding window & two pointer challenges'
    },
    {
        id: 'hardcore',
        name: 'Apex Predator',
        icon: zap => <Zap className={zap} />,
        quality: 'Legendary',
        desc: 'Thrives in the chaos of Hard-level orbital complexity.',
        color: 'text-accent-red',
        requirement: 'Solve 20+ Hard Problems'
    },
    {
        id: 'pioneer',
        name: 'Early Adopter',
        icon: star => <Star className={star} />,
        quality: 'Common',
        desc: 'One of the first few commanders to join the Astra mission.',
        color: 'text-accent-green',
        requirement: 'Early Access Member'
    }
];

export default function BadgeShowcase({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-surface border border-border rounded-[42px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                    >
                        {/* Left Side: Illustration / Hero */}
                        <div className="md:w-1/3 bg-gradient-to-br from-accent-blue/10 via-accent-purple/10 to-transparent p-12 flex flex-col items-center justify-center text-center border-r border-border/50">
                            <div className="w-24 h-24 bg-accent-blue/20 rounded-3xl flex items-center justify-center mb-6 shadow-glow-blue">
                                <Trophy className="w-12 h-12 text-accent-blue" />
                            </div>
                            <h2 className="text-3xl font-syne font-black mb-4">Astra<br />Hall of Valor</h2>
                            <p className="text-xs text-muted leading-relaxed font-medium">
                                Collect rare medals and advance your ranking in the cosmic leaderboard.
                            </p>

                            <div className="mt-12 space-y-3 w-full">
                                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted">
                                    <span>Rarity Spectrum</span>
                                    <span>Status</span>
                                </div>
                                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden flex">
                                    <div className="h-full w-[40%] bg-accent-green" />
                                    <div className="h-full w-[30%] bg-accent-blue" />
                                    <div className="h-full w-[20%] bg-accent-purple" />
                                    <div className="h-full w-[10%] bg-accent-red" />
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Badge Grid */}
                        <div className="flex-1 p-8 md:p-12 max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-syne font-bold uppercase tracking-tighter">Decoration Catalog</h3>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">6 Classified Objectives</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {BADGE_TYPES.map((badge) => (
                                    <div key={badge.id} className="group p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-accent-blue/30 transition-all cursor-default">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors`}>
                                                {badge.icon(`w-6 h-6 ${badge.color}`)}
                                            </div>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border border-${badge.color.split('-')[1]}/30 bg-${badge.color.split('-')[1]}/10 ${badge.color}`}>
                                                {badge.quality}
                                            </span>
                                        </div>

                                        <h4 className="font-syne font-bold text-sm mb-1 group-hover:text-accent-blue transition-colors">{badge.name}</h4>
                                        <p className="text-[10px] text-muted leading-relaxed mb-4 line-clamp-2">{badge.desc}</p>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Target className="w-3 h-3 text-muted" />
                                                <span className="text-[9px] font-bold text-muted uppercase tracking-tight">{badge.requirement}</span>
                                            </div>
                                            <Lock className="w-3 h-3 text-muted/30" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
