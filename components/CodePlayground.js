'use client';

import React, { useState } from 'react';
import { Terminal, Maximize2, Minimize2, Cpu, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CodePlayground = ({ defaultLanguage = 'python' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [language, setLanguage] = useState(defaultLanguage);

    // OneCompiler mapping
    const langMap = {
        'python': 'python',
        'cpp': 'cpp',
        'java': 'java',
        'javascript': 'javascript',
        'c': 'c'
    };

    const compilerUrl = `https://onecompiler.com/embed/${langMap[language] || 'python'}?hideLanguageSelection=true&hideRun=false`;

    return (
        <div className={`mt-4 rounded-2xl border border-white/10 bg-black/40 overflow-hidden transition-all duration-500 ${isExpanded ? 'fixed inset-4 z-[200]' : 'relative h-[500px]'}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-accent-blue" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/70 font-syne">Astra IDE v1.0</span>
                    </div>

                    <div className="h-4 w-[1px] bg-white/10" />

                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-accent-blue focus:outline-none cursor-pointer"
                    >
                        <option value="python">Python 3</option>
                        <option value="cpp">C++ 17</option>
                        <option value="java">Java 11</option>
                        <option value="javascript">JavaScript</option>
                        <option value="c">C</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                        <Cpu className="w-3 h-3 text-accent-green" />
                        <span className="text-[10px] font-mono text-accent-green">Online</span>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white"
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* IDE Body */}
            <div className="w-full h-[calc(100%-48px)] bg-black relative">
                {/* Backdrop loader */}
                <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 bg-zinc-950">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-10 h-10 border-2 border-accent-blue/20 border-t-accent-blue rounded-full mb-4"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Spinning up Astra Kernel...</p>
                </div>

                <iframe
                    src={compilerUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="relative z-10 opacity-0 animate-fade-in"
                    onLoad={(e) => e.target.style.opacity = '1'}
                    title="Code Playground"
                />
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CodePlayground;
