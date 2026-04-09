'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, Download, X, ShieldCheck, Trophy } from 'lucide-react';

const RisingStarCertificate = ({ isOpen, onClose, userName, date }) => {
    const certificateRef = useRef(null);

    const handleDownload = () => {
        // In a real app, we might use html2canvas or generate a PDF
        // For now, we'll provide a print option which is more reliable than custom libs without installation
        window.print();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="relative bg-zinc-900 border-[12px] border-zinc-800 p-1 md:p-4 rounded-lg shadow-2xl overflow-hidden print:p-0 print:border-none print:shadow-none"
                        id="certificate-content"
                        ref={certificateRef}
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                            <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full" />
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
                        </div>

                        {/* Certificate Border Pattern */}
                        <div className="relative border-2 border-amber-500/30 p-8 md:p-16 flex flex-col items-center text-center bg-zinc-900/50 backdrop-blur-sm">

                            {/* Seal/Badge at top */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                                className="mb-8"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                                        <Trophy className="w-12 h-12 text-zinc-900" />
                                    </div>
                                    <div className="absolute -inset-2 border-2 border-dashed border-amber-500/50 rounded-full animate-spin-slow" />
                                </div>
                            </motion.div>

                            <h1 className="font-syne font-black text-4xl md:text-6xl text-white tracking-tighter mb-2">
                                CERTIFICATE <span className="text-amber-500">OF MASTERY</span>
                            </h1>
                            <p className="text-amber-500 font-bold tracking-[0.3em] uppercase mb-12">Rising Star Achievement</p>

                            <p className="text-zinc-400 text-lg mb-4">This highly prestigious award is presented to</p>

                            <h2 className="font-syne font-bold text-3xl md:text-5xl text-white underline decoration-amber-500 decoration-2 underline-offset-8 mb-8">
                                {userName || "Elite Champion"}
                            </h2>

                            <p className="max-w-xl text-zinc-400 leading-relaxed mb-12">
                                For demonstrating exceptional dedication and technical prowess by successfully completing
                                the entire <span className="text-white font-bold">DSA Astra Mastery Tracker</span> curriculum.
                                Their commitment to mastering complex algorithms and data structures marks them as a true
                                <span className="text-amber-500 font-bold italic"> Rising Star</span> in the engineering community.
                            </p>

                            <div className="grid grid-cols-2 gap-12 w-full max-w-2xl mb-12 border-t border-zinc-800 pt-12">
                                <div className="flex flex-col items-center">
                                    <div className="h-0.5 w-32 bg-zinc-700 mb-2" />
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Date Achieved</p>
                                    <p className="text-sm text-white font-bold mt-1">{date || new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col items-center uppercase tracking-widest">
                                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                                        <ShieldCheck className="w-5 h-5" />
                                        <span className="font-bold">Verified</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">DSA Astra Academy</p>
                                </div>
                            </div>

                            {/* Decorative Stars */}
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="w-6 h-6 text-amber-500 fill-amber-500 shadow-amber-500/50" />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={handleDownload}
                            className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <Download className="w-5 h-5" />
                            Generate & Print Certificate
                        </button>
                    </div>
                </div>
            </motion.div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #certificate-content, #certificate-content * {
                        visibility: visible;
                    }
                    #certificate-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        height: auto !important;
                    }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default RisingStarCertificate;
