"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginOverlay({ onLogin, isCloudEnabled, error }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onLogin(email, password, isSignUp);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-2xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-surface border border-border rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="text-center mb-10 relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-accent-blue/20">
                        <Rocket className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="font-syne text-3xl font-extrabold tracking-tight mb-2">DSA Mastery</h1>
                    <p className="text-muted text-sm font-medium uppercase tracking-widest">
                        {isSignUp ? 'Create your account' : 'Welcome back, Explorer'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within:text-accent-blue transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within:text-accent-blue transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-4 rounded-2xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs leading-relaxed"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-2xl py-4 font-bold text-sm shadow-xl shadow-accent-blue/30 hover:scale-[1.02] hover:shadow-accent-blue/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Create Free Account' : 'Enter Dashboard')}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-muted font-medium">
                    {isSignUp ? 'Already on a journey?' : "New to the path?"}{' '}
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-accent-blue font-bold hover:underline"
                    >
                        {isSignUp ? 'Log in here' : 'Sign up now'}
                    </button>
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <button
                            type="button"
                            onClick={() => onLogin(null, null, 'GUEST')}
                            className="text-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                        >
                            Or proceed in Guest Mode (Offline)
                        </button>
                    </div>
                </p>

                {!isCloudEnabled && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-accent-yellow uppercase tracking-widest bg-accent-yellow/5 border border-accent-yellow/10 py-2 rounded-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
                        Local Mode Active
                    </div>
                )}
            </motion.div>
        </div>
    );
}
