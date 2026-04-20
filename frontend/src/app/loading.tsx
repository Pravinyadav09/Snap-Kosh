"use client"

import React from "react"
import { motion } from "framer-motion"
import { Command } from "lucide-react"

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/10 dark:bg-slate-950/20 backdrop-blur-[2px]">
            {/* Minimalist Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-blue-500/5 dark:bg-blue-600/5 blur-[80px] rounded-full" />
            
            <div className="relative flex flex-col items-center">
                {/* Compact Premium Loader */}
                <div className="relative h-16 w-16 mb-6">
                    {/* Inner Core Pulse */}
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-blue-600/20 dark:bg-blue-400/20 rounded-full blur-xl"
                    />

                    {/* Outer Rotating Ring 1 */}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-[3px] border-t-blue-600 border-r-transparent border-b-indigo-400 border-l-transparent rounded-full shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                    />

                    {/* Outer Rotating Ring 2 (Counter) */}
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-2 border-[1px] border-l-blue-400 border-t-transparent border-r-indigo-500 border-b-transparent rounded-full opacity-50"
                    />

                {/* Central Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ 
                            opacity: [0.4, 1, 0.4],
                            scale: [0.85, 1, 0.85]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Command className="h-6 w-6 text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]" />
                    </motion.div>
                </div>
            </div>

            {/* Compact Label */}
            <div className="space-y-2 text-center">
                <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200 font-sans"
                >
                    Loading <span className="text-blue-600">ERP</span>
                </motion.h2>
                <motion.div 
                    className="h-[1px] w-32 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden mx-auto"
                >
                    <motion.div 
                        animate={{ x: [-128, 128] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full w-1/2 bg-blue-600"
                    />
                </motion.div>
            </div>
        </div>
        </div>
    )
}
