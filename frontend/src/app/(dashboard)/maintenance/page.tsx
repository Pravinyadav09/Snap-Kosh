"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
    Plus,
    Wrench,
    CheckCircle2,
    Clock,
    User,
    DollarSign,
    FileText,
    Cpu,
    RefreshCcw,
    Calendar,
    CheckSquare,
    ClipboardList,
    AlertCircle,
    Image as ImageIcon,
    MessageSquare,
    Send,
    Activity
} from "lucide-react"
import { toast } from "sonner"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────
type BasicMachine = {
    id: number
    name: string
}

type MaintenanceRecord = {
    id: number
    machineId: number | null
    taskName: string | null
    assignedTo: string | null
    endDate: string | null
    isDaily: boolean
    category: string
    priority: string
    status: string
    description: string
    maintenanceDate: string
    cost: number | null
    performedBy: string
    createdAt: string
    machineName?: string
    completionPhoto?: string
    completionRemark?: string
}

const CATEGORIES = [
    { value: "Routine Check", label: "Routine Check" },
    { value: "Electrical", label: "Electrical" },
    { value: "Mechanical", label: "Mechanical" },
    { value: "Cleaning", label: "Cleaning" },
    { value: "Software/Digital", label: "Software/Digital" },
    { value: "Facility", label: "Facility Management" },
    { value: "Calibration", label: "Calibration" }
]

const PRIORITIES = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Urgent", label: "Urgent" }
]

export default function MaintenancePage() {
    const [records, setRecords] = useState<MaintenanceRecord[]>([])
    const [machines, setMachines] = useState<BasicMachine[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null)

    // View Settings
    const [viewMode, setViewMode] = useState<"all" | "daily">("daily")
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0])
    const [isMachineTask, setIsMachineTask] = useState(false)

    const [formData, setFormData] = useState({
        machineId: 0,
        taskName: "",
        assignedTo: "",
        endDate: "",
        isDaily: false,
        category: "Routine Check",
        priority: "Medium",
        status: "Scheduled",
        description: "",
        maintenanceDate: new Date().toISOString().split("T")[0],
        cost: 0,
        performedBy: "" // Backwards compatibility if needed
    })

    const fetchAllData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [maintRes, machineRes, userRes] = await Promise.all([
                fetch(`${API_BASE}/api/maintenance`),
                fetch(`${API_BASE}/api/machines/lookup`),
                fetch(`${API_BASE}/api/users`)
            ])

            let maintData: MaintenanceRecord[] = []
            let machineData: BasicMachine[] = []
            let userData: any[] = []

            if (maintRes.ok) maintData = await maintRes.json()
            if (machineRes.ok) {
                const rawMachines = await machineRes.json()
                machineData = rawMachines.map((m: any) => ({
                    id: m.id || parseInt(m.value),
                    name: m.name || m.label
                }))
            }
            if (userRes.ok) userData = await userRes.json()

            setMachines(machineData)
            setUsers(userData)

            const mapped = maintData.map(record => ({
                ...record,
                machineName: record.machineId ? (machineData.find(m => m.id === record.machineId)?.name || `Machine #${record.machineId}`) : undefined
            }))

            setRecords(mapped)
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load task records. Check backend connection.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    const filteredRecords = useMemo(() => {
        if (viewMode === "all") return records
        return records.filter(r => r.maintenanceDate.split("T")[0] === filterDate)
    }, [records, viewMode, filterDate])

    const summary = useMemo(() => {
        const total = filteredRecords.length
        const completed = filteredRecords.filter(r => r.status === "Completed").length
        const pending = total - completed
        const overdue = filteredRecords.filter(r => r.status !== "Completed" && r.endDate && new Date(r.endDate) < new Date()).length

        // Logical "Missed" checks for daily tasks
        const dailyTaskNames = Array.from(new Set(records.filter(r => r.isDaily).map(r => r.taskName || r.machineName)))
        const missedToday = dailyTaskNames.filter(name =>
            !records.some(r => (r.taskName === name || r.machineName === name) && r.maintenanceDate.split("T")[0] === filterDate && r.status === "Completed")
        )

        return { total, completed, pending, overdue, missedCount: missedToday.length, missedTasks: missedToday }
    }, [filteredRecords, records, filterDate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isMachineTask && !formData.machineId) {
            toast.error("Please select a machine")
            return
        }
        if (!isMachineTask && !formData.taskName.trim()) {
            toast.error("Please provide a task name")
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`${API_BASE}/api/maintenance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    machineId: isMachineTask ? formData.machineId : null,
                    taskName: !isMachineTask ? formData.taskName : null,
                    assignedTo: formData.assignedTo,
                    endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                    isDaily: formData.isDaily,
                    category: formData.category,
                    priority: formData.priority,
                    status: formData.status,
                    description: formData.description,
                    maintenanceDate: new Date(formData.maintenanceDate).toISOString(),
                    cost: formData.cost > 0 ? formData.cost : null,
                    performedBy: formData.performedBy // legacy field
                })
            })

            if (response.ok) {
                toast.success("Task created successfully")
                setIsAddModalOpen(false)
                // Reset form
                setFormData({
                    machineId: 0,
                    taskName: "",
                    assignedTo: "",
                    endDate: "",
                    isDaily: false,
                    category: "Routine Check",
                    priority: "Medium",
                    status: "Scheduled",
                    description: "",
                    maintenanceDate: new Date().toISOString().split("T")[0],
                    cost: 0,
                    performedBy: ""
                })
                setIsMachineTask(false)
                fetchAllData()
            } else {
                toast.error("Failed to save task. Check backend response.")
            }
        } catch (error) {
            console.error("Error submitting:", error)
            toast.error("An error occurred while linking to the backend.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const markAsCompleted = async (taskId: number) => {
        try {
            const response = await fetch(`${API_BASE}/api/maintenance/${taskId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify("Completed")
            })

            if (response.ok) {
                toast.success("Task marked as completed!")
                fetchAllData()
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            toast.error("Failed to connect to server")
        }
    }

    const columns: ColumnDef<MaintenanceRecord>[] = useMemo(() => [
        {
            key: "taskDetails",
            label: "Task / Machine Details",
            render: (_, row) => (
                <div className="flex items-center gap-3 font-sans">
                    <div className={cn(
                        "p-1.5 rounded-md border",
                        row.machineId ? "bg-indigo-50 border-indigo-100 text-indigo-500" : "bg-fuchsia-50 border-fuchsia-100 text-fuchsia-500"
                    )}>
                        {row.machineId ? <Cpu className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-slate-900">
                            {row.taskName || row.machineName || "General Task"}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.category}</span>
                            {row.isDaily && <Badge variant="secondary" className="h-3.5 px-1 py-0 text-[8px] uppercase tracking-wider bg-orange-100 text-orange-700 hover:bg-orange-100">Daily</Badge>}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "assignedTo",
            label: "Assignee / Tech",
            render: (val, row) => (
                <div className="flex items-center gap-2 font-sans">
                    <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                        <User className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{val || row.performedBy || "Unassigned"}</span>
                </div>
            )
        },
        {
            key: "priority",
            label: "Priority",
            render: (val) => {
                const colors: Record<string, string> = {
                    Urgent: "bg-rose-50 text-rose-600 border-rose-100",
                    High: "bg-orange-50 text-orange-600 border-orange-100",
                    Medium: "bg-blue-50 text-blue-600 border-blue-100",
                    Low: "bg-slate-50 text-slate-600 border-slate-100"
                }
                return (
                    <Badge variant="outline" className={`${colors[val as string] || "bg-slate-50 border-slate-100 text-slate-600"} font-bold text-[10px] uppercase tracking-wider px-2 h-5 rounded-sm font-sans`}>
                        {val as string}
                    </Badge>
                )
            }
        },
        {
            key: "maintenanceDate",
            label: "Timeline",
            render: (val, row) => (
                <div className="flex flex-col font-sans">
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-800">
                            {new Date(val as string).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                        </span>
                        {row.endDate && (
                            <>
                                <span className="text-[10px] text-slate-400">→</span>
                                <span className="text-xs font-bold text-slate-800">
                                    {new Date(row.endDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: row.endDate.includes(new Date().getFullYear().toString()) ? undefined : 'numeric' })}
                                </span>
                            </>
                        )}
                    </div>
                    {row.status !== 'Completed' && row.endDate && new Date(row.endDate) < new Date() && (
                        <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5 mt-0.5"><AlertCircle className="w-2.5 h-2.5" /> OVERDUE</span>
                    )}
                </div>
            )
        },
        {
            key: "status",
            label: "Task Status",
            render: (val) => {
                const isDone = val === "Completed"
                return (
                    <div className="flex items-center gap-2 font-sans">
                        <div className={`h-1.5 w-1.5 rounded-full ${isDone ? 'bg-emerald-500' : val === 'In-Progress' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isDone ? 'text-emerald-700' : 'text-slate-500'}`}>{val as string}</span>
                    </div>
                )
            }
        },
        {
            key: "actions",
            label: "Action",
            className: "text-right w-[100px]",
            filterable: false,
            render: (_, row) => (
                <div className="flex justify-end pr-2 font-sans gap-1 items-center">
                    {row.status !== "Completed" ? (
                        <Button variant="outline" size="sm" onClick={() => markAsCompleted(row.id)} className="h-7 text-[10px] font-bold text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 uppercase tracking-wider px-2">
                            <CheckSquare className="h-3 w-3 mr-1" /> Mark Done
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1">
                                {row.completionPhoto && (
                                    <a href={row.completionPhoto.startsWith('http') ? row.completionPhoto : (row.completionPhoto.startsWith('/') ? `${API_BASE}${row.completionPhoto}` : `${API_BASE}/${row.completionPhoto}`)} target="_blank" rel="noopener noreferrer" title={row.completionRemark || "View Task Proof"}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 bg-indigo-50/70 border border-indigo-100/50">
                                        <ImageIcon className="h-3.5 w-3.5" />
                                    </Button>
                                </a>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                title="View Details"
                                onClick={() => {
                                    setSelectedRecord(row);
                                    setIsViewModalOpen(true);
                                }}
                            >
                                <FileText className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )
        }
    ], [machines])

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 px-4 sm:px-1">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading flex items-center gap-2 uppercase">
                        <Wrench className="size-5 sm:size-6 text-primary shrink-0" />
                        Maintenance Center
                    </h1>
                </div>

                <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 shadow-inner flex-1 sm:flex-none">
                        <Button
                            variant={viewMode === "daily" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("daily")}
                            className="h-8 text-[10px] sm:text-[11px] font-bold font-sans uppercase tracking-wider px-2 sm:px-3 rounded-lg flex-1 sm:flex-none whitespace-nowrap"
                        >
                            Daily
                        </Button>
                        <Button
                            variant={viewMode === "all" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("all")}
                            className="h-8 text-[10px] sm:text-[11px] font-bold font-sans uppercase tracking-wider px-2 sm:px-3 rounded-lg flex-1 sm:flex-none whitespace-nowrap"
                        >
                            History
                        </Button>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-10 sm:h-9 px-4 sm:px-6 font-bold font-sans text-[10px] sm:text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 gap-1 sm:gap-2 flex-1 sm:flex-none"
                        style={{ background: 'var(--primary)' }}
                    >
                        <Plus className="h-4 w-4" /> <span>Assign Task</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
                {/* 1. Total Checks */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <ClipboardList className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Total Checks</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">{summary.total}</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Routine Protocol</p>
                    </CardContent>
                </Card>

                {/* 2. Completed */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <CheckCircle2 className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Completed</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">{summary.completed}</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Success Level</p>
                    </CardContent>
                </Card>

                {/* 3. Pending */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Clock className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Pending Tasks</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">{summary.pending}</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Awaiting Work</p>
                    </CardContent>
                </Card>

                {/* 4. Missing Checks (Overdue) */}
                <Card className={cn(
                    "border-none shadow-sm rounded-xl text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300",
                    summary.missedCount > 0 ? "bg-gradient-to-br from-rose-500 to-rose-600" : "bg-gradient-to-br from-slate-400 to-slate-500"
                )}>
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <AlertCircle className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Missing Checks</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">{summary.missedCount}</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">
                            {summary.missedCount > 0 ? "Critical Info" : "Zero Missed"}
                        </p>
                    </CardContent>
                </Card>

                {/* 5. Asset Coverage */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Cpu className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Asset Coverage</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">{machines.length} Units</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Production Assets</p>
                    </CardContent>
                </Card>

                {/* 6. Performance Pulse */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Activity className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Performance</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">100%</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Operational Index</p>
                    </CardContent>
                </Card>
            </div>

            {summary.missedCount > 0 && viewMode === "daily" && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Unfinished Daily Tasks</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {summary.missedTasks.map((t, index) => (
                                <Badge key={`${t}-${index}`} variant="outline" className="bg-white/80 border-rose-200 text-rose-600 text-[9px] font-black uppercase py-0.5">
                                    {t}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-100/50 text-[10px] font-black uppercase">Notify All</Button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden min-h-[400px]">
                <DataGrid
                    columns={columns}
                    data={filteredRecords}
                    isLoading={isLoading}
                    searchPlaceholder="Search task name, assignee or category.."
                />
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white flex flex-col h-[90vh] max-h-[90vh]">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                        <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white relative shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 p-2 rounded-lg border bg-slate-50 flex items-center justify-center shadow-sm" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                    <Wrench className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-sm font-bold text-slate-800 leading-none">Assign New Task</DialogTitle>
                                    <DialogDescription className="text-xs text-slate-500 mt-1.5 font-sans">Delegate factory-level responsibilities or machine setups.</DialogDescription>
                                </div>
                            </div>
                            <div className="absolute top-6 right-12">
                                <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-slate-50 uppercase tracking-widest px-2.5 h-6 rounded-sm">TASK-GEN-2026</Badge>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
                            <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <Checkbox
                                    id="machineType"
                                    checked={isMachineTask}
                                    onCheckedChange={(c) => setIsMachineTask(c === true)}
                                />
                                <label htmlFor="machineType" className="text-xs font-bold text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                    This task is bound to a specific machine/equipment
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {isMachineTask ? (
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label className="text-xs font-medium text-slate-600 font-sans leading-none capitalize">Select Machine <span className="text-rose-500">*</span></Label>
                                        <SearchableSelect
                                            options={machines.map(m => ({ value: m.id.toString(), label: m.name }))}
                                            value={formData.machineId ? formData.machineId.toString() : ""}
                                            onValueChange={(val) => setFormData(prev => ({ ...prev, machineId: parseInt(val) }))}
                                            placeholder={machines.length > 0 ? "Search Equipment Library..." : "No machines found. Check backend."}
                                            className="h-9 rounded-md border-slate-200 shadow-none text-sm bg-white"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label className="text-xs font-medium text-slate-600 font-sans leading-none capitalize">Task Title <span className="text-rose-500">*</span></Label>
                                        <Input
                                            placeholder="E.g. Turn off main lights after shift, Clean floor, etc."
                                            value={formData.taskName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
                                            className="h-9 rounded-md border-slate-200 shadow-none text-sm bg-white px-3"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600 font-sans leading-none capitalize">Category</Label>
                                    <SearchableSelect
                                        options={CATEGORIES}
                                        value={formData.category}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                        className="h-9 rounded-md border-slate-200 shadow-none text-sm bg-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600 font-sans leading-none capitalize">Priority</Label>
                                    <SearchableSelect
                                        options={PRIORITIES}
                                        value={formData.priority}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}
                                        className="h-9 rounded-md border-slate-200 shadow-none text-sm bg-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600 font-sans leading-none capitalize">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.maintenanceDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, maintenanceDate: e.target.value }))}
                                        className="h-9 rounded-md border-slate-200 shadow-none text-sm bg-white px-3"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600 font-sans leading-none capitalize">End Date / Deadline (Optional)</Label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="h-9 rounded-md border-slate-200 shadow-none text-sm bg-white px-3"
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs font-medium text-slate-600 font-sans leading-none capitalize">Assign To (User / Worker)</Label>
                                    <SearchableSelect
                                        options={users.map(u => ({ value: u.fullName, label: u.fullName }))}
                                        value={formData.assignedTo}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, assignedTo: val, performedBy: val }))}
                                        placeholder={users.length > 0 ? "Select employee..." : "No users found."}
                                        className="h-9 rounded-md border-slate-200 shadow-none text-sm bg-white"
                                    />
                                </div>

                                <div className="col-span-2 flex items-center space-x-2 pt-2 pb-1">
                                    <Checkbox
                                        id="isDaily"
                                        checked={formData.isDaily}
                                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, isDaily: c === true }))}
                                    />
                                    <label htmlFor="isDaily" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                                        Is this a recurring daily task?
                                    </label>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs font-medium text-slate-600 font-sans leading-none capitalize">Details & Instructions</Label>
                                    <Textarea
                                        placeholder="Provide detailed instructions..."
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="min-h-[100px] border-slate-200 bg-white text-sm font-sans rounded-md resize-none p-3 shadow-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-6 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4 shrink-0 shadow-inner rounded-b-xl">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddModalOpen(false)}
                                className="h-10 px-6 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 font-sans uppercase tracking-[0.05em] transition-all"
                            >
                                Discard Task
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-10 px-10 text-white font-bold text-xs rounded-xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 font-sans whitespace-nowrap flex items-center gap-2 uppercase tracking-wide"
                                style={{ background: 'var(--primary)' }}
                            >
                                {isSubmitting ? (
                                    <RefreshCcw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                )}
                                {isSubmitting ? "Dispatching..." : "Confirm & Dispatch"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white">
                    <DialogHeader className="px-6 py-3 text-left border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 p-2 rounded-lg border bg-white flex items-center justify-center shadow-sm text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-bold text-slate-800 leading-none">Task Information</DialogTitle>
                                <DialogDescription className="text-[10px] text-slate-500 uppercase tracking-widest mt-1.5 font-sans font-bold">Maintenance Records & Audit</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-4 space-y-3">
                        <div className="space-y-1.5">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Task / Equipment</h4>
                            <p className="text-sm font-bold text-slate-800">{selectedRecord?.taskName || selectedRecord?.machineName}</p>
                        </div>

                        <div className="space-y-1.5">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Description & Instructions</h4>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed min-h-[36px]">
                                {selectedRecord?.description || "No specific instructions provided."}
                            </div>
                        </div>

                        {selectedRecord?.status === "Completed" && (
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                {selectedRecord.completionPhoto && (
                                    <div className="space-y-1.5">
                                        <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.1em] flex items-center gap-2">
                                            <ImageIcon className="h-3 w-3" /> Proof of Work
                                        </h4>
                                        <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm bg-slate-50">
                                            <img 
                                                src={selectedRecord.completionPhoto.startsWith('http') ? selectedRecord.completionPhoto : (selectedRecord.completionPhoto.startsWith('/') ? `${API_BASE}${selectedRecord.completionPhoto}` : `${API_BASE}/${selectedRecord.completionPhoto}`)}
                                                alt="Maintenance Completion"
                                                className="w-full h-auto max-h-[180px] object-contain mx-auto"
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-1.5">
                                    <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.1em] flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3" /> Completion Remarks
                                    </h4>
                                    <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100 text-xs text-slate-700 italic leading-relaxed">
                                        {selectedRecord?.completionRemark || "Task marked as finished without remarks."}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Performed By</h4>
                                <p className="text-xs font-bold text-slate-700">{selectedRecord?.assignedTo || selectedRecord?.performedBy || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Date</h4>
                                <p className="text-xs font-bold text-slate-700">
                                    {selectedRecord?.maintenanceDate && new Date(selectedRecord.maintenanceDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-3 bg-slate-50/50 border-t border-slate-100">
                        <Button onClick={() => setIsViewModalOpen(false)} className="h-9 px-6 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95">
                            Close Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; border-color: rgb(254 202 202); }
                    50% { opacity: 0.8; border-color: rgb(248 113 113); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    )
}
