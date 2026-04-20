"use client"

import React, { useState, useEffect } from "react"
import Loading from "@/app/loading"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname, useSearchParams } from "next/navigation"

export default function SplashScreen({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 300) // Ultra-fast 0.3s delay for snappy transitions

        return () => clearTimeout(timer)
    }, [pathname, searchParams])

    return (
        <>
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="splash"
                        initial={{ opacity: 1 }}
                        exit={{ 
                            opacity: 0,
                            scale: 1.1,
                            filter: "blur(20px)",
                        }}
                        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                        className="fixed inset-0 z-[9999]"
                    >
                        <Loading />
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.div
                initial={false}
                animate={{ 
                    opacity: 1, 
                    scale: 1,
                    filter: isLoading ? "blur(4px)" : "blur(0px)",
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={isLoading ? "pointer-events-none" : ""}
            >
                {children}
            </motion.div>
        </>
    )
}
