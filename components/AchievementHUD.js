                                                                                                                                                                                            'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star as StarIcon, Zap, Flame, Award } from 'lucide-react';

const AchievementHUD = ({ doneData, topics, onViewCertificate }) => {
    // 1. Calculate Achievements
    const achievements = useMemo(() => {
        const safeDone = doneData || {};
        const solvedCount = Object.keys(safeDone).length;
        const totalCount = topics.reduce((acc, t) => acc + (t.weeks?.reduce((a, w) => a + (w.problems?.length || 0), 0) || 0), 0);
        const todayStr = new Date().toLocaleDateString();
        const solvedToday = Object.values(safeDone).filter(t => new Date(t).toLocaleDateString() === todayStr).length;

        return [
            {
                id: 'starter',
                name: 'The First Spark',
                desc: 'Solve your very first problem.',
                icon: Zap,
                color: 'text-amber-400',
                isUnlocked: solvedCount >= 1
            },
            {
                id: 'dedicated',
                name: 'Elite Striker',
                desc: 'Solve 10+ problems in the tracker.',
                icon: Trophy,
                color: 'text-zinc-300',
                isUnlocked: solvedCount >= 10
            },
            {
                id: 'marathon',
                name: 'Code Runner',
                desc: 'Solve 5+ problems in a single day.',
                icon: Flame,
                color: 'text-orange-500',
                isUnlocked: solvedToday >= 5
            },
            {
                id: 'specialist',
                name: 'Topic Master',
                desc: 'Complete an entire problem set.',
                icon: Award,
                color: 'text-fuchsia-400',
                isUnlocked: topics.some(t => {
                    const allT = t.weeks?.flatMap(w => w.problems) || [];
                    return allT.length > 0 && allT.every(p => safeDone[p.id]);
                })
            },
            {
                id: 'rising-star',
                name: 'Rising Star',
                desc: 'Complete all questions in the tracker.',
                icon: StarIcon,
                color: 'text-amber-500',
                isUnlocked: solvedCount >= totalCount && totalCount > 0,
                isCertificate: true
            }
        ];
    }, [doneData, topics]);

    const unlockedCount = achievements.filter(a => a.isUnlocked).length;

    return (
        <div className="bg-background-secondary/20 backdrop-blur-xl border border-white/5 rounded-3xl p-6 mb-8 mt-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="font-syne font-bold text-2xl text-white">Your Legacy</h2>
                    <p className="text-muted text-sm italic">Unlock fragments of mastery</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-4xl font-black text-white/10 select-none">#{unlockedCount}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent-blue leading-none">Rank</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {achievements.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => item.isCertificate && item.isUnlocked && onViewCertificate()}
                        className={`group relative p-4 rounded-2xl border transition-all duration-500 overflow-hidden ${item.isUnlocked
                            ? 'bg-background-secondary border-white/10 shadow-xl'
                            : 'bg-transparent border-white/5 grayscale pointer-events-none'
                            } ${item.isCertificate && item.isUnlocked ? 'cursor-pointer hover:border-amber-500/50' : ''}`}
                    >
                        {/* Shimmer Effect */}
                        {item.isUnlocked && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-accent-blue/0 via-accent-blue/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}

                        {/* Special Glow for Certificate */}
                        {item.isCertificate && item.isUnlocked && (
                            <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />
                        )}

                        <div className="relative z-10">
                            <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${item.isUnlocked ? 'bg-background/80 shadow-inner' : 'bg-white/5'
                                }`}>
                                <item.icon className={`w-5 h-5 ${item.isUnlocked ? item.color : 'text-muted/40'}`} />
                            </div>
                            <h4 className={`font-bold text-sm ${item.isUnlocked ? 'text-white' : 'text-muted'}`}>{item.name}</h4>
                            <p className="text-[10px] text-muted leading-relaxed mt-1">
                                {item.isCertificate && item.isUnlocked ? 'Click to claim certificate!' : item.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AchievementHUD;
