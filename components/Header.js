"use client";
import { Brain, Trophy, LogOut, Moon, Sun, LayoutDashboard, Database, Download, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function Header({ user, solvedCount, totalCount, streak, onLogout, onToggleTheme, theme }) {
    const progress = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-xl px-4 py-3 md:px-8">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-purple rounded-xl flex items-center justify-center text-xl shadow-lg shadow-accent-orange/20">
                        <Brain className="text-white w-6 h-6" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="font-syne text-lg font-extrabold tracking-tight leading-none uppercase">
                            DSA Tracker
                        </h1>
                        <p className="text-[10px] text-muted font-medium tracking-widest uppercase mt-1">
                            Master the Code
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="font-syne text-xl font-extrabold text-accent-green leading-none">{solvedCount}</span>
                            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Solved</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-syne text-xl font-extrabold text-accent-blue leading-none">{totalCount}</span>
                            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Total</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-syne text-xl font-extrabold text-accent-purple leading-none">{streak}🔥</span>
                            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Streak</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onToggleTheme}
                            className="p-2.5 rounded-xl border border-border bg-surface-hover hover:border-accent-blue transition-all active:scale-95"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {user && (
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red hover:bg-accent-red hover:text-white transition-all font-semibold text-sm active:scale-95"
                            >
                                <LogOut className="w-4 h-4 text-accent-red" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-border overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-accent-green via-accent-blue to-accent-purple"
                />
            </div>
        </header>
    );
}
