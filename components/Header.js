"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Brain, LogOut, Moon, Sun, Flame, User, Bell, Share2, Settings, ExternalLink, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ user, solvedCount, totalCount, streak, onLogout, onToggleTheme, theme }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const progress = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get user initials or avatar
    const avatarUrl = user?.user_metadata?.avatar_url;
    const userEmail = user?.email || "";
    const initials = userEmail.substring(0, 2).toUpperCase() || "??";

    const shareProgress = () => {
        const text = `🚀 DSA Astra Mission Report\n\nConquered: ${solvedCount}/${totalCount} challenges (${progress}%)\nStreak: ${streak} Days 🔥\n\nTrack your DSA journey with precision.`;
        navigator.clipboard.writeText(text);
        alert("Mission Report copied to clipboard! 🚀");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-2xl px-4 py-3 md:px-8">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-11 h-11 bg-gradient-to-br from-accent-blue via-accent-purple to-accent-orange rounded-[14px] flex items-center justify-center text-xl shadow-lg shadow-accent-blue/20 cursor-pointer"
                    >
                        <Brain className="text-white w-6 h-6" />
                    </motion.div>
                    <div className="hidden sm:block">
                        <h1 className="font-syne text-lg font-extrabold tracking-tight leading-none uppercase">
                            DSA <span className="text-accent-blue">Astra</span>
                        </h1>
                        <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase mt-1">
                            Mission Status: <span className="text-accent-green">Active</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden lg:flex items-center gap-10">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="font-syne text-xl font-extrabold text-white leading-none tracking-tight">{solvedCount}</span>
                                <span className="text-muted text-[10px] font-bold uppercase tracking-wider">/ {totalCount}</span>
                            </div>
                            <div className="h-1 w-full bg-border rounded-full mt-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-accent-green glow-green"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-2">
                            <Flame className="w-5 h-5 text-accent-orange fill-accent-orange/20" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none mb-1">Weekly Streak</span>
                                <span className="font-syne text-sm font-extrabold leading-none">{streak} Days 🔥</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border-l border-border pl-4 md:pl-8">
                        <div className="flex items-center gap-2 mr-2">
                            <button
                                onClick={shareProgress}
                                className="p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-surface-hover transition-all text-muted hover:text-white"
                                title="Share Mission Report"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-surface-hover transition-all relative">
                                <Bell className="w-5 h-5 text-muted hover:text-white" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full border-2 border-background" />
                            </button>
                            <button
                                onClick={onToggleTheme}
                                className="p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-surface-hover transition-all text-muted hover:text-white"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="relative" ref={menuRef}>
                            <div
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 p-1.5 bg-surface border border-border rounded-2xl cursor-pointer hover:border-accent-blue/50 transition-all select-none group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20 overflow-hidden group/avatar">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110"
                                        />
                                    ) : (
                                        <span className="text-[10px] font-bold text-accent-blue tracking-tighter">{initials}</span>
                                    )}
                                </div>

                                <div className="hidden sm:flex flex-col mr-1">
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-white leading-tight truncate max-w-[80px]">
                                        {userEmail.split('@')[0]}
                                    </span>
                                    <span className="text-[9px] font-medium text-accent-blue/80 leading-tight">Commander</span>
                                </div>

                                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </div>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-3 w-64 bg-[#0F1217] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                                    >
                                        <div className="p-4 border-b border-white/5 bg-accent-blue/5">
                                            <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-1">Authenticated As</p>
                                            <p className="text-xs font-medium text-white/70 truncate">{userEmail}</p>
                                        </div>

                                        <div className="p-2">
                                            <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group">
                                                    <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
                                                        <User className="w-4 h-4 text-accent-blue" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-white group-hover:text-accent-blue transition-colors">View Profile</p>
                                                        <p className="text-[9px] text-muted">Statistics & Achievements</p>
                                                    </div>
                                                    <ExternalLink className="w-3 h-3 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                                                </button>
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    alert("Edit Profile mode coming soon to Astra Mission Control! 🚀");
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20">
                                                    <Settings className="w-4 h-4 text-accent-purple" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-white group-hover:text-accent-purple transition-colors">Edit Profile</p>
                                                    <p className="text-[9px] text-muted">Personalize your identity</p>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="p-2 border-t border-white/5">
                                            <button
                                                onClick={() => { setIsMenuOpen(false); onLogout(); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent-red/10 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center border border-accent-red/20">
                                                    <LogOut className="w-4 h-4 text-accent-red" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-accent-red">System Logout</p>
                                                    <p className="text-[9px] text-accent-red/50">End current session</p>
                                                </div>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
