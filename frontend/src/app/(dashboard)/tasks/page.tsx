"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
    CheckCircle2,
    Clock,
    User,
    FileText,
    Cpu,
    RefreshCcw,
    ClipboardList,
    AlertCircle,
    Camera,
    CheckSquare,
    Image as ImageIcon,
    Loader2,
    LayoutGrid,
    TableProperties
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type MaintenanceRecord = {
    id: number
    machineId: number | null
    taskName: string | null
    assignedTo: string | null
    isDaily: boolean
    category: string
    priority: string
    status: string
    description: string
    maintenanceDate: string
    endDate: string | null
    completionPhoto?: string
    machineName?: string
}

export default function MyTasksPage() {
    const [tasks, setTasks] = useState<MaintenanceRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCompleting, setIsCompleting] = useState(false)
    const [selectedTask, setSelectedTask] = useState<MaintenanceRecord | null>(null)
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [remark, setRemark] = useState("")
    const [filter, setFilter] = useState<'pending' | 'completed'>('pending')
    const [viewMode, setViewMode] = useState<"cards" | "grid">("cards")

    const fetchMyTasks = useCallback(async () => {
        const username = localStorage.getItem("user_name")
        if (!username) return

        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/maintenance/assigned/${encodeURIComponent(username)}`)
            if (res.ok) {
                const data = await res.json()
                setTasks(data)
            }
        } catch (error) {
            console.error("Error fetching tasks:", error)
            toast.error("Failed to load your tasks.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMyTasks()
    }, [fetchMyTasks])

    const handleComplete = (task: MaintenanceRecord) => {
        setSelectedTask(task)
        setIsUploadOpen(true)
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const submitCompletion = async () => {
        if (!selectedFile || !selectedTask) {
            toast.error("Please provide photographic proof")
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append("file", selectedFile)

        try {
            const uploadRes = await fetch(`${API_BASE}/api/uploads?folder=maintenance`, {
                method: "POST",
                body: formData
            })

            if (!uploadRes.ok) throw new Error("Upload failed")
            const uploadData = await uploadRes.json()
            const photoPath = uploadData.fileUrl

            const completeRes = await fetch(`${API_BASE}/api/maintenance/${selectedTask.id}/complete`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ photoPath, remark })
            })

            if (completeRes.ok) {
                toast.success("Task completed successfully!")
                setIsUploadOpen(false)
                setSelectedTask(null)
                setSelectedFile(null)
                setPreviewUrl(null)
                setRemark("")
                fetchMyTasks()
            } else {
                toast.error("Failed to mark task as complete")
            }
        } catch (error) {
            console.error("Error:", error)
            toast.error("An error occurred during completion.")
        } finally {
            setUploading(false)
        }
    }

    const summary = useMemo(() => {
        const total = tasks.length
        const completed = tasks.filter(t => t.status === 'Completed').length
        const pending = tasks.filter(t => t.status !== 'Completed').length
        return { total, completed, pending }
    }, [tasks])

    const filteredTasks = useMemo(() => {
        if (filter === 'pending') return tasks.filter(t => t.status !== 'Completed')
        return tasks.filter(t => t.status === 'Completed')
    }, [tasks, filter])

    const columns: ColumnDef<MaintenanceRecord>[] = useMemo(() => [
        {
            key: "taskName",
            label: "Task Details",
            render: (_: any, row: MaintenanceRecord) => (
                <div className="flex items-center gap-2">
                    <div className={cn("p-1 rounded bg-slate-50", row.machineId ? "text-indigo-500" : "text-fuchsia-500")}>
                        {row.machineId ? <Cpu className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">{row.taskName || row.machineName || "General Task"}</span>
                </div>
            )
        },
        {
            key: "maintenanceDate",
            label: "Date",
            type: 'date',
            render: (val: any) => <span className="text-xs font-bold text-slate-600">{new Date(val as string).toLocaleDateString()}</span>
        },
        {
            key: "priority",
            label: "Priority",
            render: (val: any) => (
                <Badge variant="outline" className={cn(
                    "font-bold text-[10px] uppercase tracking-wider h-5",
                    val === 'Urgent' ? "text-rose-600 border-rose-100 bg-rose-50" : "text-slate-500 border-slate-100"
                )}>{val as string}</Badge>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (_: any, row: MaintenanceRecord) => (
                <div className="flex items-center gap-2">
                    {row.status !== "Completed" ? (
                        <Button size="sm" onClick={() => handleComplete(row)} className="h-7 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700">Finish</Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Done</span>
                            {row.completionPhoto && (
                                <a 
                                    href={row.completionPhoto.startsWith('http') ? row.completionPhoto : (row.completionPhoto.startsWith('/') ? `${API_BASE}${row.completionPhoto}` : `${API_BASE}/${row.completionPhoto}`)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="ghost" size="sm" className="h-7 px-2 rounded-md text-indigo-600 font-bold text-[9px] uppercase tracking-wider gap-1 hover:bg-indigo-50 border border-indigo-100/50">
                                        <ImageIcon className="h-3 w-3" /> Proof
                                    </Button>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    ], [])

    return (
        <div className="space-y-6 font-sans pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">My Assignments</h1>

                </div>
                <Button variant="outline" onClick={fetchMyTasks} className="h-10 w-10 p-0 rounded-xl border-slate-200 shadow-sm bg-white">
                    <RefreshCcw className={cn("h-4 w-4 text-slate-500", isLoading && "animate-spin")} />
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1 items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned</span>
                    <span className="text-xl font-black text-slate-900">{summary.total}</span>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 shadow-sm flex flex-col gap-1 items-center justify-center text-center transition-all hover:bg-emerald-50">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Done</span>
                    <span className="text-xl font-black text-emerald-700">{summary.completed}</span>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 shadow-sm flex flex-col gap-1 items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Pending</span>
                    <span className="text-xl font-black text-amber-700">{summary.pending}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <DataGrid
                    columns={columns}
                    data={filteredTasks}
                    isLoading={isLoading}
                    hideTitle
                    searchPlaceholder="Search by date or task..."
                    enableDateRange
                    dateFilterKey="maintenanceDate"
                    initialPageSize={10}
                />
            </div>

            <Dialog open={isUploadOpen} onOpenChange={(open) => {
                setIsUploadOpen(open)
                if (!open) {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    setRemark("")
                }
            }}>
                <DialogContent className="sm:max-w-md font-sans p-0 overflow-hidden border-0 shadow-xl rounded-2xl">
                    <DialogHeader className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                        <DialogTitle className="text-base font-bold text-slate-800">Complete Task</DialogTitle>
                        <DialogDescription className="text-xs">
                            Please provide a photo and any relevant remarks to close this task.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 flex flex-col gap-5">
                        {uploading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitting Details...</span>
                            </div>
                        ) : (
                            <>
                                <div className={cn(
                                    "relative group overflow-hidden flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl transition-all duration-300",
                                    previewUrl ? "border-emerald-200 bg-emerald-50/30 p-2" : "border-slate-200 bg-slate-50 py-10"
                                )}>
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label htmlFor="task-photo-upload" className="cursor-pointer bg-white text-slate-800 text-xs font-bold px-4 py-2 rounded-lg shadow-sm">
                                                    Change Photo
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                                                <Camera className="h-5 w-5" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-slate-700">Upload Task Proof</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Required to submit</p>
                                            </div>
                                            <Button asChild variant="outline" className="h-8 px-5 font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm mt-2">
                                                <label htmlFor="task-photo-upload" className="cursor-pointer">Select Photo</label>
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    id="task-photo-upload"
                                    onChange={onFileChange}
                                />

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Remarks / Notes (Optional)</label>
                                    <Textarea
                                        placeholder="Add any observations or notes..."
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        className="resize-none h-20 text-sm shadow-none border-slate-200 focus-visible:ring-primary/20"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between w-full">
                        <Button variant="ghost" onClick={() => setIsUploadOpen(false)} disabled={uploading} className="text-xs font-bold uppercase text-slate-500">Cancel</Button>
                        <Button
                            onClick={submitCompletion}
                            disabled={uploading || !selectedFile}
                            className="text-xs font-bold uppercase px-6 gap-2"
                            style={{ background: 'var(--primary)' }}
                        >
                            <CheckCircle2 className="h-4 w-4" /> Submit Completion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .italic-task {
                  font-style: italic;
                  line-height: 1.6;
                }
            `}</style>
        </div>
    )
}
