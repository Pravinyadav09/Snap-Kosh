"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion"
import { 
    Command, 
    Mail, 
    Lock, 
    ArrowRight, 
    ShieldCheck, 
    Loader2, 
    Zap, 
    Activity, 
    Layers, 
    Globe,
    ChevronDown,
    LayoutDashboard,
    Briefcase,
    BarChart3,
    Cpu,
    Warehouse,
    ChevronRight,
    Github,
    Twitter,
    Linkedin,
    CheckCircle2,
    MousePointer2,
    Sparkles,
    Users,
    Package,
    Wallet,
    Truck,
    Wrench,
    Database,
    Settings,
    Eye,
    EyeOff,
    Calculator,
    Calendar,
    FileText,
    Gauge,
    ClipboardList,
    Share2,
    Cog,
    TrendingUp,
    Receipt
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/shared/mode-toggle"
import { API_BASE } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// --- COMPONENTS ---

const FeatureCard = ({ icon: Icon, title, description, index }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: index * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
        whileHover={{ y: -10 }}
        className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.15)] transition-all group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
            <Icon size={80} />
        </div>
        <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
            <Icon className="h-7 w-7 text-slate-400 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-4 font-sans">{title}</h3>
        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-normal font-sans">
            {description}
        </p>
    </motion.div>
)

const NavLink = ({ href, children }: any) => (
    <Link href={href} className="relative group px-2 py-1">
        <span className="text-[11px] font-bold uppercase text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 tracking-wider transition-colors font-sans">
            {children}
        </span>
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left" />
    </Link>
)

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white animate-pulse">
                        <Command className="h-8 w-8" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">Protocol Initializing...</span>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const containerRef = useRef(null)
    const initialTab = (searchParams.get("tab") as "staff" | "client") || "staff"

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
    const bgY = useTransform(smoothProgress, [0, 1], ["0%", "20%"])
    const rotate = useTransform(smoothProgress, [0, 1], [0, 45])
    
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mobile, setMobile] = useState("")
    const [clientPassword, setClientPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [loginType, setLoginType] = useState<"staff" | "client">(initialTab)
    const [isClientLoading, setIsClientLoading] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [showStaffPassword, setShowStaffPassword] = useState(false)
    const [showClientPassword, setShowClientPassword] = useState(false)

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleStaffLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error("Required fields missing", { description: "Please enter your professional ID and password." })
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, userType: "Admin" })
            })

            if (res.ok) {
                const data = await res.json()
                localStorage.setItem("erp_token", data.token)
                localStorage.setItem("user_name", data.fullName)
                localStorage.setItem("user_role", data.role)
                localStorage.setItem("user_email", data.email)
                localStorage.setItem("user_permissions", data.permissions || "")
                
                toast.success("Security Authorization Granted", {
                    description: `Welcome back, ${data.fullName}. System is ready.`
                })
                router.push("/dashboard")
            } else {
                const errData = await res.json().catch(() => ({}))
                toast.error("Access Denied", {
                    description: errData.message || "Invalid credentials. Terminal access refused."
                })
            }
        } catch (error) {
            toast.error("Security Gateway Failure", { description: "Remote authentication server is unreachable." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleClientLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mobile || !clientPassword) {
            toast.error("Credentials Required", { description: "Please provide your registered mobile number and password." })
            return
        }

        setIsClientLoading(true)
        try {
            const response = await fetch(`${API_BASE}/api/portal/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: mobile, password: clientPassword })
            });

            if (response.ok) {
                const customer = await response.json();
                localStorage.setItem("portal_customer", JSON.stringify(customer));
                toast.success("Identity Verified", { 
                    description: `Welcome ${customer.companyName}! Accessing your portfolio...` 
                });
                router.push("/portal/dashboard");
            } else {
                const err = await response.json();
                toast.error(err.message || "Authentication Rejected", {
                    description: "Please verify your mobile number and password."
                });
            }
        } catch (error) {
            toast.error("Gateway Offline", { description: "Client portal service is currently unreachable." });
        } finally {
            setIsClientLoading(false);
        }
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40 relative overflow-x-hidden scroll-smooth">
            {/* --- STICKY NAVIGATION --- */}
            <motion.nav 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 lg:px-12 flex items-center justify-between",
                    scrolled ? "h-20 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 shadow-sm" : "h-28 bg-transparent"
                )}
            >
                <div className="flex items-center gap-4 group cursor-pointer">
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: [-5, 5, 0] }}
                        className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20"
                    >
                        <Command className="h-6 w-6" />
                    </motion.div>
                    <span className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase font-sans">
                        Digital<span className="text-blue-500">ERP</span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-6">
                        <NavLink href="#features">Intelligence</NavLink>
                        <NavLink href="#gateway">Access Portal</NavLink>
                    </div>
                    
                    <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-4">
                        <ModeToggle />
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                                className="rounded-xl px-6 h-10 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-wider shadow-[0_10px_20px_-5px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all font-sans"
                                onClick={() => document.getElementById('gateway')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Log In
                            </Button>
                        </motion.div>
                    </div>
                </div>

                <div className="md:hidden">
                    <ModeToggle />
                </div>
            </motion.nav>

            <section className="relative min-h-screen flex items-center justify-center py-20 px-6 lg:px-12 overflow-hidden bg-white dark:bg-slate-950">
                {/* Background Grid & Decorative Elements */}
                <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
                     style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                />
                <div className="absolute inset-0 z-10">
                    {[
                        { icon: Users, title: "CRM", color: "blue", top: "15%", left: "10%", speed: 25, 
                          pathY: [0, -80, 40, -120, 60, 0], pathX: [0, 100, -60, 140, -80, 0] },
                        { icon: Activity, title: "PRODUCTION", color: "indigo", top: "20%", left: "75%", speed: 30, 
                          pathY: [0, 100, -50, 80, -100, 0], pathX: [0, -120, 80, -60, 100, 0] },
                        { icon: Package, title: "INVENTORY", color: "emerald", top: "65%", left: "12%", speed: 22, 
                          pathY: [0, -100, 70, -40, 90, 0], pathX: [0, 130, -40, 90, -110, 0] },
                        { icon: Wallet, title: "FINANCE", color: "violet", top: "60%", left: "82%", speed: 28, 
                          pathY: [0, 60, -110, 50, -80, 0], pathX: [0, -90, 60, -130, 40, 0] },
                        { icon: Truck, title: "DISPATCH", color: "orange", top: "8%", left: "42%", speed: 24, 
                          pathY: [0, 120, -30, 80, -60, 0], pathX: [0, -70, 110, -50, 80, 0] },
                        { icon: Calculator, title: "ESTIMATOR", color: "rose", top: "45%", left: "25%", speed: 31, 
                          pathY: [0, 50, -90, 40, -60, 0], pathX: [0, -100, 70, -40, 120, 0] },
                        { icon: Calendar, title: "SCHEDULER", color: "cyan", top: "5%", left: "65%", speed: 27, 
                          pathY: [0, 100, -60, 90, -50, 0], pathX: [0, -80, 50, -120, 60, 0] },
                        { icon: TrendingUp, title: "SALES", color: "emerald", top: "78%", left: "68%", speed: 29, 
                          pathY: [0, -70, 40, -90, 60, 0], pathX: [0, 110, -60, 130, -40, 0] },
                        { icon: Share2, title: "OUTSOURCE", color: "indigo", top: "12%", left: "22%", speed: 33, 
                          pathY: [0, 80, -110, 50, -70, 0], pathX: [0, 90, -40, 100, -80, 0] },
                        { icon: ClipboardList, title: "TASKS", color: "amber", top: "85%", left: "45%", speed: 26, 
                          pathY: [0, -100, 60, -120, 50, 0], pathX: [0, -60, 110, -50, 90, 0] },
                        { icon: Gauge, title: "READINGS", color: "blue", top: "55%", left: "40%", speed: 32, 
                          pathY: [0, 60, -80, 40, -50, 0], pathX: [0, 80, -110, 60, -40, 0] },
                        { icon: FileText, title: "QUOTATIONS", color: "slate", top: "35%", left: "92%", speed: 35, 
                          pathY: [0, -120, 50, -90, 80, 0], pathX: [0, -140, 60, -100, 30, 0] },
                        { icon: Receipt, title: "INVOICES", color: "violet", top: "90%", left: "15%", speed: 30, 
                          pathY: [0, -60, 110, -50, 80, 0], pathX: [0, 120, -70, 60, -30, 0] },
                        { icon: Cog, title: "MACHINES", color: "slate", top: "30%", left: "3%", speed: 28, 
                          pathY: [0, 90, -50, 110, -60, 0], pathX: [0, 110, -30, 80, -90, 0] },
                        { icon: Database, title: "MASTERS", color: "slate", top: "42%", left: "5%", speed: 23, 
                          pathY: [0, 90, -60, 110, -30, 0], pathX: [0, 100, -30, 70, -90, 0] },
                        { icon: BarChart3, title: "REPORTS", color: "cyan", top: "40%", left: "88%", speed: 27, 
                          pathY: [0, -50, 80, -90, 30, 0], pathX: [0, -80, 40, -110, 60, 0] },
                        { icon: ShieldCheck, title: "SECURITY", color: "blue", top: "82%", left: "25%", speed: 29, 
                          pathY: [0, -90, 40, -60, 80, 0], pathX: [0, 70, -90, 120, -50, 0] },
                        { icon: Settings, title: "SYSTEM", color: "slate", top: "10%", left: "88%", speed: 26, 
                          pathY: [0, 80, -40, 100, -70, 0], pathX: [0, -100, 50, -70, 90, 0] },
                    ].map((module: any, i) => (
                        <motion.div
                            key={i}
                            className="absolute z-10"
                            style={{ top: module.top, left: module.left }}
                            animate={{ 
                                y: module.pathY,
                                x: module.pathX,
                                rotate: [0, 8, -6, 10, -8, 0]
                            }}
                            transition={{ 
                                duration: module.speed, 
                                repeat: Infinity, 
                                ease: "easeInOut",
                                times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                            }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.3, zIndex: 50 }}
                                className={cn(
                                    "h-20 w-20 rounded-3xl flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md relative group cursor-pointer",
                                    module.color === "blue" && "text-blue-600",
                                    module.color === "indigo" && "text-indigo-600",
                                    module.color === "emerald" && "text-emerald-600",
                                    module.color === "violet" && "text-violet-600",
                                    module.color === "orange" && "text-orange-600",
                                    module.color === "rose" && "text-rose-600",
                                    module.color === "slate" && "text-slate-600",
                                    module.color === "cyan" && "text-cyan-600",
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                                <module.icon className="h-8 w-8 relative z-10" />
                                <span className="absolute -bottom-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white px-2 py-0.5 rounded shadow-lg">{module.title}</span>
                                <div className="absolute h-40 w-px bg-gradient-to-t from-transparent via-blue-500/10 to-transparent -top-40 left-1/2 -z-10" />
                                <div className="absolute w-40 h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -left-40 top-1/2 -z-10" />
                            </motion.div>
                        </motion.div>
                    ))}

                    {/* Background Data Fragments */}
                    {mounted && [...Array(20)].map((_, i) => (
                        <motion.div
                            key={`bit-${i}`}
                            className="absolute text-[8px] font-mono text-blue-500/10 dark:text-blue-400/20 pointer-events-none"
                            style={{ 
                                top: `${Math.random() * 100}%`, 
                                left: `${Math.random() * 100}%` 
                            }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                        >
                            {Math.random() > 0.5 ? "011010110" : "SYNC_NODE_ACTIVE"}
                        </motion.div>
                    ))}
                </div>

                <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center justify-center">
                    <div className="relative flex flex-col items-center text-center">

                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-7xl md:text-9xl font-bold text-slate-900 dark:text-white leading-[0.8] tracking-tightest select-none font-sans"
                        >
                            DYNAMIC <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400 bg-[length:200%_auto] animate-gradient-flow text-blue-500">FLOW.</span>
                        </motion.h1>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-16 flex flex-col sm:flex-row gap-6"
                        >
                            <Button 
                                size="lg" 
                                className="h-16 px-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs tracking-widest shadow-2xl shadow-blue-600/30 transition-all font-sans"
                                onClick={() => document.getElementById('gateway')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Secure Login <ArrowRight className="ml-3 h-5 w-5" />
                            </Button>
                        </motion.div>
                    </div>
                </div>

                    {/* Expansive Data Pulse Indicators */}
                    <div className="absolute bottom-20 left-10 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-12 bg-blue-500/30 rounded-full overflow-hidden">
                                <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="h-full w-full bg-blue-500" />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 tracking-tighter uppercase font-sans">System Pulsating</span>
                        </div>
                         <div className="flex items-center gap-3">
                            <div className="h-1 w-12 bg-indigo-500/30 rounded-full overflow-hidden">
                                <motion.div animate={{ x: [48, -48] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="h-full w-full bg-indigo-500" />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 tracking-tighter uppercase font-sans">Sync Active</span>
                        </div>
                    </div>

                <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 p-2 rounded-full border border-slate-200 dark:border-slate-800"
                >
                    <ChevronDown size={14} className="text-slate-300" />
                </motion.div>
            </section>

            {/* --- CORE FEATURES --- */}
            <section id="features" className="py-32 lg:py-48 bg-[#FDFDFD] dark:bg-slate-900/30 px-6 lg:px-12 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
                        <motion.div 
                            className="max-w-xl"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] mb-4 font-sans">Neural Pipeline</h2>
                            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight uppercase tracking-tight font-sans">
                                LIQUID <br /> <span className="text-blue-500">SYCHRONIZATION.</span>
                            </h3>
                        </motion.div>
                        <motion.p 
                            className="max-w-sm text-lg text-slate-500 font-medium leading-relaxed pt-4 font-sans"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            We have eliminated data silos. Every interaction in the warehouse is instantly reflected in your financial balance sheets.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureCard 
                            icon={Warehouse}
                            index={0}
                            title="Inventory Neural"
                            description="Deep stock telemetry with predictive replenishment and multi-state GRN reconciliation."
                        />
                         <FeatureCard 
                            icon={BarChart3}
                            index={1}
                            title="Finance Pulse"
                            description="Real-time cash flow monitoring with automated tax-slab resolution and ledger parity."
                        />
                         <FeatureCard 
                            icon={Cpu}
                            index={2}
                            title="Core Production"
                            description="End-to-end task orchestration with live status propagation and resource optimization."
                        />
                    </div>
                </div>
            </section>


            {/* --- ACCESS GATEWAY (LOGIN) --- */}
            <section id="gateway" className="py-20 lg:py-28 px-6 lg:px-12 bg-[#FAFAFA] dark:bg-slate-950 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <motion.div 
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] mb-4 font-sans">Secure Authorization</h2>
                            <h3 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight uppercase tracking-tight font-sans">ACCESS <br /> <span className="text-blue-600">HUB.</span></h3>
                        </motion.div>
                        <motion.p 
                            className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 pr-8 font-sans"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                        >
                            Initialize your secure hardware-accelerated session. Every byte is encrypted through our private neural network.
                        </motion.p>
                        <div className="flex items-center justify-center lg:justify-start gap-12 pt-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums font-sans">1.3</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">TLS SECURITY</span>
                            </div>
                            <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
                            <div className="flex flex-col gap-2">
                                <span className="text-3xl font-bold text-emerald-600 tabular-nums font-sans">ACTIVE</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">SENTINEL STAT</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-[480px]">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card className="border border-slate-200 shadow-2xl bg-white dark:bg-slate-900 rounded-lg overflow-hidden font-sans ring-1 ring-slate-100 dark:ring-white/5">
                                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Security Gateway</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Authorized Personnel Only</p>
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="p-0">
                                    <Tabs defaultValue={initialTab} className="w-full" onValueChange={(v: string) => setLoginType(v as any)}>
                                        <div className="px-6 pt-6">
                                            <TabsList className="grid grid-cols-2 h-10 bg-slate-100 dark:bg-slate-800/50 rounded-md p-1 mb-8">
                                                <TabsTrigger value="staff" className="rounded-sm font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all gap-2">
                                                    <LayoutDashboard className="h-3.5 w-3.5" /> STAFF
                                                </TabsTrigger>
                                                <TabsTrigger value="client" className="rounded-sm font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-emerald-500 transition-all gap-2">
                                                    <Briefcase className="h-3.5 w-3.5" /> CLIENT
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <div className="px-8 pb-10">
                                            <TabsContent value="staff" className="mt-0 space-y-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users className="h-3 w-3 text-slate-400" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Credentials</span>
                                                </div>

                                                <form onSubmit={handleStaffLogin} className="space-y-5">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Professional ID</Label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                            <Input
                                                                type="email"
                                                                placeholder="access@digitalerp.com"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                className="h-10 pl-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md font-medium text-sm focus-visible:ring-1 focus-visible:ring-blue-600 transition-all shadow-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5 group">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Access Passkey</Label>
                                                            <Link href="#" className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Recover</Link>
                                                        </div>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                            <Input
                                                                type={showStaffPassword ? "text" : "password"}
                                                                placeholder="••••••••••••"
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                className="h-10 pl-10 pr-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md font-medium text-sm focus-visible:ring-1 focus-visible:ring-blue-600 transition-all shadow-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowStaffPassword(!showStaffPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                                            >
                                                                {showStaffPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <Button 
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="w-full h-11 rounded-md bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold uppercase tracking-wider text-[11px] shadow-sm hover:bg-blue-600 dark:hover:bg-blue-50 transition-all mt-4"
                                                    >
                                                        {isLoading ? "Validating..." : "Initialize Session"}
                                                    </Button>
                                                </form>
                                            </TabsContent>

                                            <TabsContent value="client" className="mt-0 space-y-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Briefcase className="h-3 w-3 text-slate-400" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Portfolio Access</span>
                                                </div>

                                                <form onSubmit={handleClientLogin} className="space-y-5">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Verified Mobile</Label>
                                                        <div className="relative">
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">+91</div>
                                                            <Input
                                                                type="tel"
                                                                placeholder="9998887766"
                                                                maxLength={10}
                                                                value={mobile}
                                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                                                className="h-10 pl-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md font-medium text-sm focus-visible:ring-1 focus-visible:ring-emerald-600 transition-all shadow-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Portfolio PIN</Label>
                                                            <Link href="#" className="text-[10px] font-bold text-emerald-600 hover:underline uppercase">Recovery</Link>
                                                        </div>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                            <Input
                                                                type={showClientPassword ? "text" : "password"}
                                                                placeholder="••••••••"
                                                                value={clientPassword}
                                                                onChange={(e) => setClientPassword(e.target.value)}
                                                                className="h-10 pl-10 pr-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md font-medium text-sm focus-visible:ring-1 focus-visible:ring-emerald-600 transition-all shadow-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowClientPassword(!showClientPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                            >
                                                                {showClientPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <Button 
                                                        type="submit"
                                                        disabled={isClientLoading}
                                                        className="w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-[11px] shadow-sm transition-all mt-4"
                                                    >
                                                        {isClientLoading ? "Syncing..." : "Open Portfolio"}
                                                    </Button>
                                                </form>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </CardContent>
                                <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Hardware Encrypted Environment</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Removed Footer as requested */}
        </div>
    )
}


