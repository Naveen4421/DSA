"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Brain, LogOut, Moon, Sun, Flame, User, Bell,
    Share2, Settings, ExternalLink, ChevronDown,
    Search, LayoutGrid, Terminal, BarChart3, Trophy,
    Swords, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ user, solvedCount, totalCount, streak, onLogout, onToggleTheme, theme, onOpenBadges, onShowExplore, plan = 'Free', onOpenPricing }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const menuRef = useRef(null);
    const progress = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
    const isPro = plan !== 'Free';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const avatarUrl = user?.user_metadata?.avatar_url;
    const userEmail = user?.email || "";
    const initials = userEmail.substring(0, 2).toUpperCase() || "??";

    const navLinks = [
        { name: "Explore", icon: LayoutGrid, href: "/" },
        { name: "Contests", icon: Swords, href: "/", badge: "Patterns" },
        { name: "Astra Log", icon: BarChart3, href: "/profile" },
        { name: "Badges", icon: Trophy, href: "/profile" }
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-3xl px-4 py-3 md:px-8">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-8">
                {/* Logo & Brand */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-10 h-10 bg-gradient-to-br from-accent-blue via-accent-purple to-accent-orange rounded-xl flex items-center justify-center text-xl shadow-lg shadow-accent-blue/10 cursor-pointer"
                    >
                        <Brain className="text-white w-5 h-5" />
                    </motion.div>
                    <div className="hidden xl:block">
                        <Link href="/" onClick={onShowExplore}>
                            <h1 className="font-syne text-base font-extrabold tracking-tight leading-none uppercase cursor-pointer">
                                DSA <span className="text-accent-blue">Astra</span>
                            </h1>
                        </Link>
                    </div>
                </div>

                {/* Unified System Navigation */}
                <nav className="hidden lg:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <div key={link.name} className="flex">
                            {link.name === "Explore" ? (
                                <Link href="/" onClick={onShowExplore}>
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-2 relative group"
                                    >
                                        <link.icon className="w-3.5 h-3.5" />
                                        {link.name}
                                    </motion.div>
                                </Link>
                            ) : link.name === "Badges" ? (
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    onClick={onOpenBadges}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-2 relative group"
                                >
                                    <link.icon className="w-3.5 h-3.5" />
                                    {link.name}
                                </motion.div>
                            ) : (
                                <Link href={link.href}>
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-2 relative group"
                                    >
                                        <link.icon className="w-3.5 h-3.5" />
                                        {link.name}
                                        {link.badge && (
                                            <span className="absolute -top-1 -right-2 px-1 py-0.5 bg-accent-blue/20 text-accent-blue text-[8px] rounded border border-accent-blue/30 scale-75 group-hover:scale-100 transition-transform">
                                                {link.badge}
                                            </span>
                                        )}
                                    </motion.div>
                                </Link>
                            )}
                        </div>
                    ))}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenPricing}
                        className={`ml-4 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isPro
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                            : 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue hover:bg-accent-blue hover:text-white'
                            }`}
                    >
                        {isPro ? '★ Elite Member' : '⚡ Upgrade to Pro'}
                    </motion.button>
                </nav>

                <div className="hidden md:flex flex-1 max-w-md relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent-blue transition-colors" />
                    <input
                        type="text"
                        placeholder="Search problems or patterns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-border group-focus-within:border-accent-blue/50 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-all placeholder:text-muted/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-border text-[9px] font-bold text-muted bg-background">
                        ⌘K
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6 mr-2">
                        <div className="hidden sm:flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-syne font-heavy text-white leading-none">{solvedCount}</span>
                                <span className="text-muted text-[10px] uppercase font-bold">Solved</span>
                            </div>
                            <div className="h-1 w-24 bg-border rounded-full mt-1.5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-accent-green shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-surface/50 border border-border rounded-xl px-3 py-1.5">
                            <Flame className="w-4 h-4 text-accent-orange" />
                            <span className="font-syne text-xs font-bold leading-none">{streak}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 border-l border-border pl-4">
                        <button onClick={onToggleTheme} className="p-2.5 rounded-xl hover:bg-surface transition-all text-muted hover:text-white">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button className="p-2.5 rounded-xl hover:bg-surface transition-all relative">
                            <Bell className="w-4 h-4 text-muted hover:text-white" />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-accent-red rounded-full border border-background" />
                        </button>

                        <div className="relative ml-2" ref={menuRef}>
                            <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 p-1.5 bg-surface border border-border rounded-2xl cursor-pointer hover:border-accent-blue/50 transition-all group">
                                <div className="w-8 h-8 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20 overflow-hidden">
                                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-accent-blue">{initials}</span>}
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full right-0 mt-3 w-64 bg-[#0F1217]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl">
                                        <div className="p-4 border-b border-white/5 bg-accent-blue/5">
                                            <p className="text-[9px] font-bold text-accent-blue uppercase tracking-widest mb-1">Authenticated As</p>
                                            <p className="text-xs font-medium text-white/70 truncate">{userEmail}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                                                <button className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group">
                                                    <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20"><User className="w-4 h-4 text-accent-blue" /></div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-white group-hover:text-accent-blue transition-colors">View Profile</p>
                                                        <span className="text-[9px] text-muted">{plan === 'Free' ? 'Astra Aspirant' : plan}</span>
                                                    </div>
                                                </button>
                                            </Link>
                                            <button onClick={() => setIsMenuOpen(false)} className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group">
                                                <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20"><Settings className="w-4 h-4 text-accent-purple" /></div>
                                                <div className="text-left"><p className="text-xs font-bold text-white group-hover:text-accent-purple transition-colors">Settings</p><span className="text-[9px] text-muted">Preferences</span></div>
                                            </button>
                                        </div>
                                        <div className="p-2 border-t border-white/5">
                                            <button onClick={() => { setIsMenuOpen(false); onLogout(); }} className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-accent-red/10 transition-all text-accent-red">
                                                <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center border border-accent-red/20 text-accent-red"><LogOut className="w-4 h-4" /></div>
                                                <div className="text-left"><p className="text-xs font-bold">Logout</p><span className="text-[9px] opacity-70">End session</span></div>
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
