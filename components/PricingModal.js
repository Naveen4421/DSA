"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Rocket, Shield, Crown, X, Star } from 'lucide-react';

export default function PricingModal({ isOpen, onClose, onUpgrade, currentPlan = 'Free' }) {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            desc: 'Essential DSA training for everyone',
            features: [
                'Access to all 12+ Core Topics',
                'Standard Progress Tracking',
                'Basic Activity Heatmap',
                'Community Leaderboard',
                'One Hour Daily IDE usage'
            ],
            button: 'Current Plan',
            isPremium: false,
            color: 'zinc'
        },
        {
            name: 'Astra Pro',
            price: '$9.99',
            period: '/mo',
            desc: 'Unlock the full power of elitist training',
            features: [
                'All 13+ Elite Company Tracks',
                'Unlimited Astra Special Ops (LLD)',
                'Priority Code Execution (No limits)',
                'Advanced Detailed Analytics',
                'Verified Elite Certificate',
                'Personalized AI Study Bot'
            ],
            button: 'Upgrade to Pro',
            isPremium: true,
            color: 'accent-blue',
            highlight: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            desc: 'For teams and interview bootcamps',
            features: [
                'Everything in Pro Plan',
                'Team Progress Dashboard',
                'Custom Curriculum Design',
                'Priority Dedicated Support',
                'Bulk API Access',
                'White-label Certification'
            ],
            button: 'Contact Sales',
            isPremium: true,
            color: 'accent-purple'
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-5xl bg-[#0F1217] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden"
                >
                    {/* Header Decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-muted hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 md:p-12">
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold uppercase tracking-widest mb-4"
                            >
                                <Crown className="w-3.5 h-3.5" />
                                Premium Astra Access
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-syne font-black text-white tracking-tighter mb-4">
                                Choose Your <span className="text-accent-blue">Astra Level</span>
                            </h2>
                            <p className="text-muted text-lg max-w-2xl mx-auto">
                                Accelerate your journey to the world's most prestigious product companies with advanced tools and elite curriculum.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.map((plan, i) => (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative flex flex-col p-8 rounded-[32px] border transition-all duration-500 ${plan.highlight
                                            ? 'bg-accent-blue/[0.03] border-accent-blue/30 shadow-2xl shadow-accent-blue/10 scale-105 z-10'
                                            : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-blue text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-accent-blue/20">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-syne font-heavy text-white mb-2">{plan.name}</h3>
                                        <p className="text-muted text-xs leading-relaxed">{plan.desc}</p>
                                    </div>

                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-syne font-black text-white">{plan.price}</span>
                                        {plan.period && <span className="text-muted text-sm font-bold">{plan.period}</span>}
                                    </div>

                                    <div className="space-y-4 mb-10 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${plan.isPremium ? 'bg-accent-blue/20 text-accent-blue' : 'bg-white/10 text-muted'}`}>
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                                <span className="text-xs text-white/80 font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => plan.name !== currentPlan && onUpgrade(plan.name)}
                                        disabled={plan.name === currentPlan}
                                        className={`w-full py-4 rounded-2xl font-syne font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${plan.name === currentPlan
                                                ? 'bg-white/5 text-muted cursor-default border border-white/5'
                                                : plan.highlight
                                                    ? 'bg-accent-blue text-white shadow-xl shadow-accent-blue/20 hover:bg-accent-blue/80'
                                                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {plan.button}
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left pt-12 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Shield className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">30-Day Money Back</h4>
                                    <p className="text-[10px] text-muted">Risk-free elite training</p>
                                </div>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                                    <Globe className="w-6 h-6 text-accent-green" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Worldwide Access</h4>
                                    <p className="text-[10px] text-muted">Join from any space node</p>
                                </div>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0F1217] bg-zinc-800 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-[#0F1217] bg-accent-blue flex items-center justify-center text-[8px] font-black text-white">
                                    +5K
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                                Trusted by <span className="text-white">5,000+ elite engineers</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
