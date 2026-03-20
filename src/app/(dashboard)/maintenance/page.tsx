"use client"
import React, { useState, useMemo } from "react"

import {
    Plus, Edit, Trash2, CheckCircle2, Clock, 
    AlertCircle, Wrench, Zap, Droplets, 
    AlertTriangle, Filter, MoreVertical,
    ClipboardCheck, Printer, Calendar, History as HistoryIcon, ShieldCheck, Info,
    FileText, Download, Search, TrendingUp, User, MapPin,
    TrafficCone, ShieldAlert, ArrowRight, Camera, Image, CheckCircle, ListTodo, Settings2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter, DialogHeader
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { SearchableSelect } from "@/components/shared/searchable-select"

// ─── Types & Data ─────────────────────────────────────────────────────────────

type MaintenanceTask = {
    id: string
    title: string
    description: string
    type: 'Electrical' | 'Mechanical' | 'Cleaning' | 'Routine' | 'Emergency'
    priority: 'Low' | 'Medium' | 'High' | 'Critical'
    status: 'Pending' | 'In Progress' | 'Completed' | 'Deferred'
    machineId?: string
    machineName?: string
    assignedTo?: string
    reportedBy: string
    createdAt: string
    updatedAt: string
}

type RecurringTask = {
    id: string
    name: string
    assignee: string
    frequency: 'Daily' | 'Fortnightly' | 'Monthly' | 'Quarterly' | 'Half-Yearly'
    requirePhoto: boolean
    category: string
    lastDone?: string
    nextDue: string
}

type TaskExecution = {
    id: string
    taskId: string
    taskName: string
    completedBy: string
    completedAt: string
    proofImage?: string
    status: 'Verified' | 'Pending Review'
}

const initialTasks: MaintenanceTask[] = [
    {
        id: "T-001",
        title: "Main Floor Lighting",
        description: "Replace flickering LED panel in the digital section.",
        type: 'Electrical',
        priority: 'Medium',
        status: 'Pending',
        reportedBy: "Praveen",
        createdAt: "2026-03-09T10:00:00Z",
        updatedAt: "2026-03-09T10:00:00Z"
    },
    {
        id: "T-002",
        title: "Heidelberg Roller Cleaning",
        description: "Weekly routine cleaning of the rollers.",
        type: 'Cleaning',
        priority: 'High',
        status: 'In Progress',
        machineId: "2",
        machineName: "Heidelberg Speedmaster",
        reportedBy: "Amit",
        createdAt: "2026-03-10T08:30:00Z",
        updatedAt: "2026-03-10T09:00:00Z"
    },
    {
        id: "T-003",
        title: "Epson Ink Leakage Check",
        description: "Strange smell near the ink bay, need urgent check.",
        type: 'Emergency',
        priority: 'Critical',
        status: 'Pending',
        machineId: "1",
        machineName: "Epson SureColor S80670",
        reportedBy: "Suresh",
        createdAt: "2026-03-10T09:15:00Z",
        updatedAt: "2026-03-10T09:15:00Z"
    }
]

const initialRecurringTasks: RecurringTask[] = [
    {
        id: "R-001",
        name: "AC Filter Cleaning & Check",
        assignee: "Ramesh Sharma",
        frequency: "Fortnightly",
        requirePhoto: true,
        category: "Facility",
        nextDue: "2026-03-12"
    },
    {
        id: "R-002",
        name: "UPS/Inverter Battery Water Top-up",
        assignee: "Suresh Tech",
        frequency: "Quarterly",
        requirePhoto: true,
        category: "Electrical",
        nextDue: "2026-03-15"
    },
    {
        id: "R-003",
        name: "End of Day: Main MCB & Shop Lock",
        assignee: "Amit Security",
        frequency: "Daily",
        requirePhoto: true,
        category: "Closing",
        nextDue: "2026-03-11"
    },
    {
        id: "R-004",
        name: "Shutter Greasing & Maintenance",
        assignee: "Ramesh Sharma",
        frequency: "Half-Yearly",
        requirePhoto: false,
        category: "Mechanical",
        nextDue: "2026-04-10"
    }
]

const executionHistory: TaskExecution[] = [
    {
        id: "E-001",
        taskId: "R-003",
        taskName: "End of Day: Main MCB & Shop Lock",
        completedBy: "Amit Security",
        completedAt: "2026-03-10T20:15:00Z",
        proofImage: "https://images.unsplash.com/photo-1558002038-1055931eff3b?q=80&w=200&auto=format&fit=crop",
        status: "Verified"
    }
]

type HistoryRecord = {
    id: string
    title: string
    machineName: string
    completedAt: string
    technician: string
    duration: string
    cost: number
    type: string
}

const mockHistory: HistoryRecord[] = [
    {
        id: "H-101",
        title: "Monthly Deep Cleaning",
        machineName: "Heidelberg Speedmaster",
        completedAt: "2026-03-01T15:00:00Z",
        technician: "Ramesh Kumar",
        duration: "4h 30m",
        cost: 1500,
        type: "Routine"
    },
    {
        id: "H-102",
        title: "Primary Roller Replacement",
        machineName: "Konica Minolta C6085",
        completedAt: "2026-02-28T11:20:00Z",
        technician: "Suresh Tech",
        duration: "2h 15m",
        cost: 8500,
        type: "Mechanical"
    },
    {
        id: "H-103",
        title: "Main Breaker Repair",
        machineName: "Electrical Floor 1",
        completedAt: "2026-02-25T09:45:00Z",
        technician: "Electrician Sonu",
        duration: "1h 00m",
        cost: 2200,
        type: "Electrical"
    }
]

const criticalIssues = [
    {
        id: "ISS-001",
        issue: "Color Misalignment in High-Speed Mode",
        machine: "Konica Minolta C6085",
        severity: "High",
        reportedSince: "2 hours ago",
        impact: "Production slowed by 40%",
        status: "In Investigation"
    },
    {
        id: "ISS-002",
        issue: "Feed Tray Sensor Failure",
        machine: "Heidelberg Speedmaster",
        severity: "Critical",
        reportedSince: "15 mins ago",
        impact: "Machine Stopped",
        status: "Awaiting Parts"
    },
    {
        id: "ISS-003",
        issue: "UPS Battery Backup Low",
        machine: "Digital Section UPS",
        severity: "Medium",
        reportedSince: "Yesterday",
        impact: "Power backup risk",
        status: "Scheduled"
    }
]

// ─── Components ─────────────────────────────────────────────────────────────

// Tasks Tab Component
function TasksTab() {
    const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks)
    const [showForm, setShowForm] = useState(false)
    const [editingTask, setEditingTask] = useState<MaintenanceTask | undefined>(undefined)

    const [formData, setFormData] = useState<Partial<MaintenanceTask>>({})

    const handleEdit = (task: MaintenanceTask) => {
        setEditingTask(task)
        setFormData(task)
        setShowForm(true)
    }

    const handleCreate = () => {
        setEditingTask(undefined)
        setFormData({
            type: 'Routine',
            priority: 'Medium',
            status: 'Pending',
            reportedBy: 'Admin'
        })
        setShowForm(true)
    }

    const handleSave = () => {
        if (editingTask) {
            setTasks((prev: MaintenanceTask[]) => prev.map((t: MaintenanceTask) => t.id === editingTask.id ? { ...t, ...formData } as MaintenanceTask : t))
        } else {
            const newTask: MaintenanceTask = {
                ...formData,
                id: `T-00${tasks.length + 1}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } as MaintenanceTask
            setTasks((prev: MaintenanceTask[]) => [newTask, ...prev])
        }
        setShowForm(false)
    }

    const columns: ColumnDef<MaintenanceTask>[] = useMemo(() => [
        {
            key: "id",
            label: "ID",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (val: any) => <span className="text-[10px] font-bold text-slate-400 uppercase">#{val as string}</span>
        },
        {
            key: "title",
            label: "Ticket Description",
            render: (_: any, item: MaintenanceTask) => (
                <div className="space-y-0.5">
                    <p className="font-bold text-sm text-slate-900 leading-tight">{item.title}</p>
                    {item.machineName ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {['Electrical', 'Mechanical', 'Emergency'].includes(item.type) ? <Wrench className="h-3 w-3" /> : <MapPin className="h-3 w-3" />} 
                            {item.machineName}
                        </div>
                    ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">Office / General Floor</span>
                    )}
                </div>
            )
        },
        {
            key: "type",
            label: "Category",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (val: any) => <span className="text-xs font-medium text-slate-600">{val as string}</span>
        },
        {
            key: "priority",
            label: "Priority",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val: any) => {
                const colors = {
                    Low: 'bg-slate-100 text-slate-600 border-slate-200',
                    Medium: 'bg-blue-50 text-blue-700 border-blue-100',
                    High: 'bg-orange-50 text-orange-700 border-orange-100',
                    Critical: 'bg-rose-50 text-rose-700 border-rose-100'
                }
                return (
                    <Badge className={`${colors[val as keyof typeof colors]} font-bold text-[9px] uppercase tracking-wider border px-2 py-0.5 rounded-sm shadow-none`}>
                        {val as string}
                    </Badge>
                )
            }
        },
        {
            key: "status",
            label: "Status",
            render: (val: any) => (
                <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${
                        val === 'Completed' ? 'bg-emerald-500' :
                        val === 'In Progress' ? 'bg-amber-500' :
                        'bg-slate-300'
                    }`} />
                    <span className="text-[11px] font-bold text-slate-700">{val as string}</span>
                </div>
            )
        },
        {
            key: "reportedBy",
            label: "Reported",
            className: "hidden xl:table-cell",
            headerClassName: "hidden xl:table-cell",
            render: (val: any, item: MaintenanceTask) => (
                <div className="space-y-0 text-[11px]">
                    <p className="font-bold text-slate-700">{val as string}</p>
                    <p className="text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (_: any, item: MaintenanceTask) => (
                <div className="flex items-center justify-end gap-1 px-1">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                        onClick={() => handleEdit(item)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ], [tasks])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Maintenance Logs</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Manage and track floor maintenance requests.</p>
                </div>
                
                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreate} className="gap-2 font-bold h-8 px-3 rounded-md shadow-sm text-white text-[10px] uppercase tracking-wider" style={{ background: 'var(--primary)' }}>
                            <Plus className="h-3.5 w-3.5" /> New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[500px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col uppercase font-sans">
                        <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                    <Wrench className="h-4 w-4" />
                                </div>
                                <div>
                                    <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">
                                        {editingTask ? 'Edit Maintenance Task' : 'New Maintenance Ticket'}
                                    </DialogTitle>
                                    <DialogDescription className="text-[10px] text-slate-400 font-medium"> Register engine or facility work details</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-6 space-y-6">
                                {/* Title Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Basic Information</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Task Title <span className="text-rose-500">*</span></Label>
                                        <Input 
                                            className="h-9 rounded-md border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all" 
                                            placeholder="e.g. Printer Roller Jamming"
                                            value={formData.title || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Configuration Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classification</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Category</Label>
                                            <SearchableSelect 
                                                options={[
                                                    { value: "Electrical", label: "Electrical" },
                                                    { value: "Mechanical", label: "Mechanical" },
                                                    { value: "Facility", label: "Facility Maintenance" },
                                                    { value: "IT/Network", label: "IT & Network" },
                                                    { value: "Administrative", label: "Company/Admin Task" },
                                                    { value: "Routine", label: "Routine" },
                                                    { value: "Emergency", label: "Emergency" }
                                                ]}
                                                value={formData.type} 
                                                onValueChange={val => setFormData(prev => ({ ...prev, type: val as any }))}
                                                placeholder="Category"
                                                className="h-9 rounded-md border-slate-200 bg-white text-xs font-medium shadow-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Priority</Label>
                                            <SearchableSelect 
                                                options={[
                                                    { value: "Low", label: "Low" },
                                                    { value: "Medium", label: "Medium" },
                                                    { value: "High", label: "High" },
                                                    { value: "Critical", label: "Critical" }
                                                ]}
                                                value={formData.priority} 
                                                onValueChange={val => setFormData(prev => ({ ...prev, priority: val as any }))}
                                                placeholder="Priority"
                                                className="h-9 rounded-md border-slate-200 bg-white text-xs font-bold text-rose-600 shadow-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Task Details</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Asset / Location</Label>
                                        <Input 
                                            className="h-9 rounded-md border-slate-200 bg-white font-bold text-sm" 
                                            placeholder="Machine name, Room No, or Floor (e.g. Sales Office)"
                                            value={formData.machineName || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, machineName: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Description</Label>
                                        <Textarea 
                                            className="min-h-[100px] rounded-md border-slate-200 bg-white text-sm resize-none" 
                                            placeholder="Describe the issue or required work in detail..."
                                            value={formData.description || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Status Toggle Section */}
                                <div className="p-3 bg-white rounded-md border border-slate-200 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${formData.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-200'}`} style={formData.status === 'Completed' ? { background: 'color-mix(in srgb, var(--primary), white 90%)', color: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Current Progress</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Current lifecycle status</p>
                                        </div>
                                    </div>
                                    <SearchableSelect 
                                        options={[
                                            { value: "Pending", label: "Pending" },
                                            { value: "In Progress", label: "In Progress" },
                                            { value: "Completed", label: "Completed" }
                                        ]}
                                        value={formData.status} 
                                        onValueChange={val => setFormData(prev => ({ ...prev, status: val as any }))}
                                        placeholder="Status"
                                        className="h-8 w-[130px] rounded-md border-slate-200 bg-white text-[10px] font-bold uppercase tracking-wider shadow-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                            <Button variant="ghost" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800">Discard Entry</Button>
                            <Button 
                                onClick={handleSave}
                                className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                                style={{ background: 'var(--primary)' }}
                            >
                                {editingTask ? 'Save Record' : 'Register Task'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-sans italic">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Active Tasks</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{tasks.filter(t => t.status !== 'Completed').length}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                    <p className="text-[9px] font-black uppercase text-rose-500 mb-1">Critical</p>
                    <p className="text-2xl font-black text-rose-600 tracking-tighter">{tasks.filter(t => t.priority === 'Critical').length}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                    <p className="text-[9px] font-black uppercase text-amber-600 mb-1">Today</p>
                    <p className="text-2xl font-black text-amber-700 tracking-tighter">05</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <p className="text-[9px] font-black uppercase text-emerald-600 mb-1">Total Fixed</p>
                    <p className="text-2xl font-black text-emerald-700 tracking-tighter">{tasks.filter(t => t.status === 'Completed').length + 48}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <DataGrid
                    data={tasks}
                    columns={columns}
                    enableDateRange={true}
                    dateFilterKey="createdAt"
                    searchPlaceholder="Search maintenance tickets..."
                />
            </div>
        </div>
    )
}

// ─── Checklist Master Tab (Admin View) ──────────────────────────────────────
function ChecklistMasterTab() {
    const [tasks, setTasks] = useState<RecurringTask[]>(initialRecurringTasks)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState<Partial<RecurringTask>>({})

    const handleSave = () => {
        const newTask: RecurringTask = {
            ...formData,
            id: `R-0${tasks.length + 1}`,
            nextDue: new Date().toISOString().split('T')[0]
        } as RecurringTask
        setTasks(prev => [newTask, ...prev])
        setShowForm(false)
    }

    const columns: ColumnDef<RecurringTask>[] = [
        { key: "name", label: "Task Protocol", render: (v, item) => (
            <div className="space-y-0.5">
                <p className="font-bold text-slate-900 text-xs">{v as string}</p>
                <Badge variant="outline" className="text-[8px] font-black uppercase text-slate-400 border-slate-100">{item.category}</Badge>
            </div>
        )},
        { key: "frequency", label: "Cycle", className: "hidden sm:table-cell", headerClassName: "hidden sm:table-cell", render: (v) => <Badge className="bg-slate-100 text-slate-700 font-bold text-[9px] border-none">{v as string}</Badge> },
        { key: "assignee", label: "Assigned To", className: "hidden md:table-cell", headerClassName: "hidden md:table-cell", render: (v) => <span className="text-[11px] font-bold text-slate-600 uppercase">{v as string}</span> },
        { key: "requirePhoto", label: "Photo Proof", className: "hidden lg:table-cell", headerClassName: "hidden lg:table-cell", render: (v) => v ? <Badge className="bg-indigo-50 text-indigo-600 font-black text-[8px] border-indigo-100">REQUIRED</Badge> : <span className="text-[10px] text-slate-300">N/A</span> },
        { key: "nextDue", label: "Next Run", className: "hidden xl:table-cell", headerClassName: "hidden xl:table-cell", render: (v) => <span className="text-xs font-black text-amber-600">{v as string}</span> },
        { key: "actions", label: "", className: "text-right", render: () => <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3 w-3" /></Button> }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Maintenance Protocols</h2>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">Set recurrences and photo requirements for workers.</p>
                </div>
                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                        <Button className="font-bold h-8 text-[10px] uppercase bg-slate-900 text-white shadow-lg">
                            <Plus className="h-3.5 w-3.5 mr-2" /> Create Protocol
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[450px] p-0 overflow-hidden bg-white border border-slate-200 rounded-xl uppercase font-sans">
                        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-slate-50 bg-slate-50/30 italic">
                            <DialogTitle className="text-sm font-black uppercase tracking-tight">New Maintenance Setup</DialogTitle>
                        </DialogHeader>
                        <div className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-slate-400">Task Name</Label>
                                <Input placeholder="e.g. AC Filter Cleaning" className="h-10 font-bold" onChange={e => setFormData((p: any) => ({...p, name: e.target.value}))} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Assign To</Label>
                                    <SearchableSelect 
                                        options={[
                                            { value: "Ramesh Sharma", label: "Ramesh Sharma" },
                                            { value: "Suresh Tech", label: "Suresh Tech" },
                                            { value: "Amit Security", label: "Amit Security" },
                                            { value: "Praveen Yadav", label: "Praveen Yadav" }
                                        ]}
                                        placeholder="Select Staff"
                                        onValueChange={v => setFormData((p: any) => ({...p, assignee: v}))}
                                        className="h-10 text-xs font-bold bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Frequency</Label>
                                    <SearchableSelect
                                        options={[
                                            { value: "Daily", label: "Daily" },
                                            { value: "Fortnightly", label: "Fortnightly (15 Days)" },
                                            { value: "Monthly", label: "Monthly" },
                                            { value: "Quarterly", label: "Quarterly" },
                                            { value: "Half-Yearly", label: "Half Yearly" }
                                        ]}
                                        onValueChange={v => setFormData((p: any) => ({...p, frequency: v as any}))}
                                        placeholder="Select Cycle"
                                        className="h-10 text-xs font-bold shadow-none bg-white"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <div>
                                    <p className="text-xs font-black text-indigo-900">Require Photo Proof?</p>
                                    <p className="text-[9px] font-bold text-indigo-500">Worker must upload photo to complete task</p>
                                </div>
                                <Button 
                                    variant={formData.requirePhoto ? "default" : "outline"}
                                    onClick={() => setFormData((p: any) => ({...p, requirePhoto: !p.requirePhoto}))}
                                    className={cn("h-7 px-4 rounded-full text-[9px] font-black", formData.requirePhoto ? "bg-indigo-600" : "border-indigo-200 text-indigo-600")}
                                >
                                    {formData.requirePhoto ? "YES (ACTIVE)" : "NOT REQUIRED"}
                                </Button>
                            </div>
                        </div>
                        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
                            <Button className="w-full bg-slate-900 text-white font-black text-xs h-10 shadow-xl" onClick={handleSave}>CONFIRM & DEPLOY PROTOCOL</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <DataGrid data={tasks} columns={columns} searchPlaceholder="Search protocols..." />
            </div>
        </div>
    )
}

// ─── Work Execution Tab (Staff/Mobile View) ─────────────────────────────────
function WorkExecutionTab() {
    const [tasks, setTasks] = useState<RecurringTask[]>(initialRecurringTasks.filter(t => t.frequency === 'Daily' || t.id === 'R-001'))
    const [isUploading, setIsUploading] = useState(false)
    const [completingTask, setCompletingTask] = useState<RecurringTask | null>(null)

    const handleComplete = (task: RecurringTask) => {
        if (task.requirePhoto) {
            setCompletingTask(task)
        } else {
            setTasks((prev: RecurringTask[]) => prev.filter((t: RecurringTask) => t.id !== task.id))
            toast.success("Task completed successfully!")
        }
    }

    const confirmCompletion = () => {
        setIsUploading(true)
        setTimeout(() => {
            setTasks((prev: RecurringTask[]) => prev.filter((t: RecurringTask) => t.id !== completingTask?.id))
            setIsUploading(false)
            setCompletingTask(null)
            toast.success("Photo verified. Task marked as complete!")
        }, 1500)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assigned Checklist</h2>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Your to-do tasks for today</p>
                </div>
                <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[9px] px-2">{tasks.length} PENDING</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map(task => (
                    <Card key={task.id} className="p-4 border-slate-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-black text-slate-800 leading-tight">{task.name}</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[8px] font-bold border-slate-100 uppercase">{task.frequency}</Badge>
                                    {task.requirePhoto && <Badge className="bg-rose-50 text-rose-600 border-none text-[8px] font-black uppercase px-2">PHOTO REQ</Badge>}
                                </div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50">
                                <ListTodo className="size-4 text-slate-300" />
                            </div>
                        </div>

                        <Button 
                            className="w-full h-11 bg-slate-900 hover:bg-black text-white font-black text-xs gap-2 shadow-xl shadow-slate-200"
                            onClick={() => handleComplete(task)}
                        >
                            <CheckCircle className="size-4" /> MARK AS COMPLETE
                        </Button>
                    </Card>
                ))}

                {tasks.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="p-4 rounded-full bg-emerald-50 mb-4">
                            <ShieldCheck className="size-8 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900">ALL SET FOR TODAY!</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">No pending maintenance tasks assigned to you</p>
                    </div>
                )}
            </div>

            <Dialog open={!!completingTask} onOpenChange={() => setCompletingTask(null)}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[400px] p-0 overflow-hidden bg-white rounded-xl uppercase font-sans">
                    <DialogHeader className="p-4 sm:p-6 pb-0 italic">
                        <DialogTitle className="text-sm font-black uppercase text-slate-800">Verify Implementation</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-slate-400">Please upload a photo of the completed work</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-4">
                        <div 
                            className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors group relative overflow-hidden"
                            onClick={confirmCompletion}
                        >
                            {isUploading ? (
                                <div className="text-center space-y-2">
                                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-[10px] font-black text-primary uppercase">Uploading & Verifying...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 rounded-full bg-white shadow-xl group-hover:scale-110 transition-transform">
                                        <Camera className="size-8 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[11px] font-black text-slate-700">CLICK TO SNAP PHOTO</p>
                                        <p className="text-[9px] font-bold text-slate-400">Supported: JPG, PNG, WEBP</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="p-4 bg-slate-50 gap-2 border-t border-slate-100">
                        <Button variant="ghost" className="text-[10px] font-black uppercase text-slate-400" onClick={() => setCompletingTask(null)}>CANCEL</Button>
                        <Button 
                            className="bg-primary text-white font-black text-[10px] uppercase px-8 h-9 rounded-lg shadow-lg active:scale-95 transition-all"
                            disabled={isUploading}
                            onClick={confirmCompletion}
                        >
                            CONFIRM WORK DONE
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// History Tab Component
function HistoryTab() {
    const columns: ColumnDef<HistoryRecord>[] = useMemo(() => [
        {
            key: "id",
            label: "ID",
            render: (val: any) => <span className="text-[10px] font-bold text-slate-400 uppercase">#{val as string}</span>
        },
        {
            key: "title",
            label: "Service Details",
            render: (_: any, item: HistoryRecord) => (
                <div className="space-y-0.5">
                    <p className="font-bold text-sm text-slate-900 leading-tight">{item.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.machineName}</p>
                </div>
            )
        },
        {
            key: "technician",
            label: "Technician",
            render: (val: any) => <span className="text-xs font-bold text-slate-700">{val as string}</span>
        },
        {
            key: "completedAt",
            label: "Date",
            render: (val: any) => <span className="text-xs font-medium text-slate-500">{new Date(val as string).toLocaleDateString()}</span>
        },
        {
            key: "duration",
            label: "Time Taken",
            render: (val: any) => <span className="text-xs font-black text-amber-600">{val as string}</span>
        },
        {
            key: "cost",
            label: "Cost",
            render: (val: any) => <span className="text-sm font-black text-slate-900">₹{(val as number).toLocaleString("en-IN")}</span>
        }
    ], [])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Service History</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Full audit logs of past maintenance activities.</p>
                </div>
                <Button variant="outline" className="rounded-md font-bold h-8 text-[10px] uppercase tracking-wider border-slate-200">
                    <Download className="h-3.5 w-3.5 mr-2" /> Export
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-indigo-600 text-white shadow-sm space-y-0.5">
                    <p className="text-[8px] font-bold uppercase opacity-60">Upkeep Cost</p>
                    <p className="text-xl font-black">₹42.5K</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm space-y-0.5">
                    <p className="text-[8px] font-bold uppercase text-slate-400">Total Hours</p>
                    <p className="text-xl font-black text-slate-900">124 Hrs</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm space-y-0.5">
                    <p className="text-[8px] font-bold uppercase text-slate-400">Efficiency</p>
                    <p className="text-xl font-black text-emerald-500">92%</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <DataGrid
                    data={mockHistory}
                    columns={columns}
                    enableDateRange={true}
                    dateFilterKey="completedAt"
                    searchPlaceholder="Search history logs..."
                />
            </div>
        </div>
    )
}

// Issues Tab Component
function IssuesTab() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Critical Failures</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Machines requiring immediate repairs.</p>
                </div>
                <Button className="rounded-md font-bold h-8 px-4 text-white text-[10px] uppercase tracking-wider shadow-sm" style={{ background: 'var(--primary)' }}>
                    <AlertCircle className="h-3.5 w-3.5 mr-2" /> Report Broken
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalIssues.map((issue) => (
                    <Card key={issue.id} className="relative overflow-hidden group border-slate-100 shadow-sm transition-all rounded-xl p-4">
                        <div className={`absolute top-0 left-0 w-full h-1 ${
                            issue.severity === 'Critical' ? 'bg-rose-500' : 'bg-orange-500'
                        }`} />

                        <div className="flex justify-between items-start mb-3 pt-1">
                            <Badge className={`${
                                issue.severity === 'Critical' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'
                            } border-none font-bold text-[8px] uppercase px-1.5 rounded-sm shadow-none`}>
                                {issue.severity}
                            </Badge>
                            <span className="text-[8px] font-bold text-slate-300 uppercase">#{issue.id}</span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-900 leading-tight h-8 line-clamp-2">
                                {issue.issue}
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                    <TrafficCone className="h-3 w-3 text-slate-300" />
                                    {issue.machine}
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100/50">
                                    <p className="text-[8px] font-bold uppercase text-slate-400 mb-0.5">Impact</p>
                                    <p className="text-[11px] font-bold text-slate-700">{issue.impact}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[9px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                                    <ShieldAlert className="h-3 w-3" /> {issue.status}
                                </span>
                                <span className="text-[8px] font-medium text-slate-400 uppercase">
                                    {issue.reportedSince}
                                </span>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button variant="ghost" className="rounded-md flex-1 h-7 text-[8px] font-bold uppercase text-slate-400">DISMISS</Button>
                                <Button className="rounded-md flex-1 h-7 text-[8px] font-bold uppercase bg-transparent border border-slate-100 text-slate-900 hover:border-primary hover:text-primary transition-all shadow-none">MANAGE</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// ─── Main Unified Page ────────────────────────────────────────────────────────

export default function UnifiedMaintenancePage() {
    return (
        <div className="space-y-4 font-sans bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100 italic uppercase">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-2 px-1 gap-4 font-sans italic uppercase">
                <div className="flex items-center gap-3">
                    <Wrench className="h-6 w-6 text-slate-500" />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Maintenance Board</h1>
                    </div>
                </div>
            </div>

            {/* Main Tabs Control */}
            <Tabs defaultValue="tasks" className="space-y-4 font-sans uppercase">
                <div className="flex items-center justify-between overflow-x-auto no-scrollbar">
                    <TabsList className="bg-white p-1 h-12 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar justify-start sm:justify-start">
                        <TabsTrigger 
                            value="tasks" 
                            className="rounded-md px-4 sm:px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 transition-all h-10 shrink-0" 
                            style={({ '--active-bg': 'var(--primary)' } as any)}
                        >
                            <AlertCircle className="h-3.5 w-3.5 mr-2" /> Task Tickets
                        </TabsTrigger>
                        <TabsTrigger 
                            value="master" 
                            className="rounded-md px-4 sm:px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 transition-all h-10 shrink-0" 
                            style={({ '--active-bg': 'var(--primary)' } as any)}
                        >
                            <Settings2 className="h-3.5 w-3.5 mr-2" /> Protocols
                        </TabsTrigger>
                        <TabsTrigger 
                            value="execution" 
                            className="rounded-md px-4 sm:px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 transition-all h-10 shrink-0" 
                            style={({ '--active-bg': 'var(--primary)' } as any)}
                        >
                            <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Work Floor View
                        </TabsTrigger>
                        <TabsTrigger 
                            value="history" 
                            className="rounded-md px-4 sm:px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 transition-all h-10 shrink-0" 
                            style={({ '--active-bg': 'var(--primary)' } as any)}
                        >
                            <HistoryIcon className="h-3.5 w-3.5 mr-2" /> Service History
                        </TabsTrigger>
                        <TabsTrigger 
                            value="issues" 
                            className="rounded-md px-4 sm:px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 transition-all h-10 shrink-0" 
                            style={({ '--active-bg': 'var(--primary)' } as any)}
                        >
                            <AlertTriangle className="h-3.5 w-3.5 mr-2" /> Critical Issues
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="tasks" className="mt-4 outline-none">
                    <TasksTab />
                </TabsContent>
                <TabsContent value="master" className="mt-4 outline-none">
                    <ChecklistMasterTab />
                </TabsContent>
                <TabsContent value="execution" className="mt-4 outline-none">
                    <WorkExecutionTab />
                </TabsContent>
                <TabsContent value="history" className="mt-4 outline-none">
                    <HistoryTab />
                </TabsContent>
                <TabsContent value="issues" className="mt-4 outline-none">
                    <IssuesTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
