"use client";
import React from "react";
import { Brain, LogOut, Moon, Sun, Flame, User, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function Header({ user, solvedCount, totalCount, streak, onLogout, onToggleTheme, theme }) {
    const progress = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

    // Get user initials or avatar
    const avatarUrl = user?.user_metadata?.avatar_url;
    const userEmail = user?.email || "";
    const initials = userEmail.substring(0, 2).toUpperCase() || "??";

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

                        <div className="flex items-center gap-2 p-1.5 bg-surface border border-border rounded-2xl">
                            <div className="w-8 h-8 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20 overflow-hidden group/avatar">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = ""; // Fallback will trigger if src is empty
                                        }}
                                    />
                                ) : (
                                    <span className="text-[10px] font-bold text-accent-blue tracking-tighter">{initials}</span>
                                )}
                            </div>

                            <div className="hidden sm:flex flex-col mr-2">
                                <span className="text-[10px] font-bold uppercase tracking-tight text-white leading-tight truncate max-w-[80px]">
                                    {userEmail.split('@')[0]}
                                </span>
                                <span className="text-[9px] font-medium text-accent-blue/80 leading-tight">Commander</span>
                            </div>

                            <button
                                onClick={onLogout}
                                className="p-2 text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all group/logout"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4 group-hover/logout:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
