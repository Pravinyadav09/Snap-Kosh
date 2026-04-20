"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Plus, BookOpen, Gauge, RefreshCcw, Camera, X, Image as ImageIcon,
    Edit3, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────
type Reading = {
    id: number
    readingDate: string
    machine: string
    opening: number
    closing: number
    impressions: number
    remarks: string
    photoUrl?: string | null
}

type MachineLookup = { value: string; label: string }

function LogReadingDialog({
    onSave, onClose, machines, initialData
}: {
    onSave: (r: any) => Promise<void>
    onClose: () => void
    machines: MachineLookup[]
    initialData?: Reading
}) {
    const [machineName, setMachineName] = useState(initialData?.machine || "")
    const [date, setDate] = useState(initialData?.readingDate ? new Date(initialData.readingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    const [opening, setOpening] = useState(initialData?.opening || 0)
    const [isManualOpening, setIsManualOpening] = useState(!!initialData) // default manual if editing
    const [closing, setClosing] = useState<number | "">(initialData?.closing ?? "")
    const [remarks, setRemarks] = useState(initialData?.remarks || "")
    const [photo, setPhoto] = useState<string | null>(initialData?.photoUrl || null)
    const [isFetchingOpening, setIsFetchingOpening] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        if (!machineName || isManualOpening || initialData) return
        
        const fetchOpening = async () => {
            setIsFetchingOpening(true)
            try {
                const res = await fetch(`${API_BASE}/api/dailyreadings/last/${encodeURIComponent(machineName)}`)
                if (res.ok) {
                    const data = await res.json()
                    setOpening(data.closing)
                } else {
                    setOpening(0)
                }
            } catch (err) {
                setOpening(0)
            } finally {
                setIsFetchingOpening(false)
            }
        }
        fetchOpening()
    }, [machineName, isManualOpening, initialData])

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch(`${API_BASE}/api/uploads?folder=telemetry`, {
                method: "POST",
                body: formData
            })
            if (res.ok) {
                const data = await res.json()
                setPhoto(data.fileUrl)
                toast.success("Photo attached successfully")
            }
        } catch (err) {
            toast.error("Photo upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const impressions = closing !== "" ? (closing as number) - opening : 0

    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-xl bg-white max-h-[92vh] flex flex-col font-sans">
            <DialogHeader className="px-6 py-5 text-left border-b border-slate-100 bg-white relative">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl border-dashed border-2" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                        <Gauge className="h-5 w-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-base font-bold text-slate-800 leading-none tracking-tight">
                            {initialData ? 'Update Meter Record' : 'Production Telemetry Log'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 mt-1.5 font-medium">Record machine meter output and attach visual evidence</DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="px-6 py-6 space-y-8">
                    
                    {/* Section 1: Machine & Context */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Plus className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contextual Parameters</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-600 ml-1">Active Machine Unit <span className="text-rose-500">*</span></Label>
                                <SearchableSelect 
                                    options={machines.map(m => ({ value: m.label, label: m.label }))}
                                    value={machineName}
                                    onValueChange={setMachineName}
                                    placeholder="SELECT PRODUCTION UNIT"
                                    className="h-10 border-slate-200 bg-white font-bold text-sm rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-600 ml-1">Reporting Date <span className="text-rose-500">*</span></Label>
                                <Input 
                                    type="date" 
                                    className="h-10 border-slate-200 bg-white font-bold text-sm rounded-lg" 
                                    value={date} 
                                    onChange={e => setDate(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Meter Readings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <RefreshCcw className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meter Reading Data</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    className={cn(
                                        "text-[9px] font-bold px-2 py-0.5 rounded transition-colors",
                                        isManualOpening ? "bg-amber-100 text-amber-700 font-black" : "bg-slate-100 text-slate-500"
                                    )}
                                    onClick={() => setIsManualOpening(!isManualOpening)}
                                >
                                    {isManualOpening ? "MANUAL MODE" : "SMART FETCH"}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2 relative">
                                <Label className="text-xs font-medium text-slate-600 ml-1">Opening Value</Label>
                                <Input
                                    type="number"
                                    className={cn(
                                        "h-10 font-black text-sm rounded-lg pr-10",
                                        isManualOpening ? "border-amber-200 bg-amber-50/30 text-amber-900" : "border-slate-100 bg-slate-50 text-slate-400"
                                    )}
                                    value={opening}
                                    readOnly={!isManualOpening}
                                    onChange={e => isManualOpening && setOpening(+e.target.value)}
                                />
                                {isFetchingOpening && <RefreshCcw className="absolute right-3 bottom-2.5 h-4 w-4 text-slate-300 animate-spin" />}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-600 ml-1">Closing Value <span className="text-rose-500">*</span></Label>
                                <Input
                                    type="number"
                                    placeholder="ENTER METER READING"
                                    className="h-10 border-indigo-200 bg-indigo-50/10 font-black text-slate-800 text-sm rounded-lg"
                                    value={closing}
                                    onChange={e => setClosing(e.target.value === "" ? "" : +e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-100 relative overflow-hidden group shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-indigo-500/5 opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Net Production Load</p>
                                <p className="text-[10px] font-medium text-emerald-800/60 mt-1 italic leading-none">Computed difference between telemetry sessions</p>
                            </div>
                            <div className="text-right relative z-10 flex items-baseline gap-1">
                                <span className={cn(
                                    "text-3xl font-black tracking-tighter tabular-nums",
                                    impressions >= 0 ? "text-emerald-700" : "text-rose-500"
                                )}>
                                    {impressions.toLocaleString()}
                                </span>
                                <span className="text-[11px] font-black text-emerald-600 uppercase">Impr.</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Photo & Remarks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Camera className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evidence Collection</span>
                            </div>
                            <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group">
                                {photo ? (
                                    <>
                                        <img src={photo.startsWith('http') ? photo : `${API_BASE}/${photo}`} alt="Meter" className="w-full h-full object-cover" />
                                        <button 
                                            className="absolute top-2 right-2 p-1 bg-white/80 rounded-full shadow-sm hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            onClick={() => setPhoto(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {isUploading ? (
                                            <RefreshCcw className="h-8 w-8 text-indigo-200 animate-spin" />
                                        ) : (
                                            <>
                                                <ImageIcon className="h-8 w-8 text-slate-300 mb-2" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Attach Meter Photo</p>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            capture="environment"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handlePhotoUpload}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Protocol Annotations</span>
                            </div>
                            <Textarea
                                className="min-h-[105px] text-sm border-slate-200 bg-white rounded-xl resize-none font-medium p-3 focus-visible:ring-indigo-500"
                                placeholder="Log glitch alerts, maintenance needs or paper wastage causes..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                <Button variant="ghost" onClick={onClose} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500">
                    Abort
                </Button>
                <Button
                    type="button"
                    disabled={!machineName || closing === "" || impressions < 0 || isUploading}
                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all"
                    style={{ background: 'var(--primary)' }}
                    onClick={async () => {
                        await onSave({
                            ...initialData,
                            machine: machineName,
                            readingDate: new Date(date).toISOString(),
                            opening,
                            closing: closing as number,
                            impressions,
                            remarks: remarks || "Meter Logged",
                            photoUrl: photo
                        })
                        onClose()
                    }}
                >
                    {initialData ? 'Commit Update' : 'Commit Protocol'}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DailyReadingsPage() {
    const [readings, setReadings] = useState<Reading[]>([])
    const [machines, setMachines] = useState<MachineLookup[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showLog, setShowLog] = useState(false)
    const [editingReading, setEditingReading] = useState<Reading | null>(null)

    const fetchReadings = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/dailyreadings`)
            if (res.ok) {
                setReadings(await res.json())
            }
        } catch (err) {
            console.error("Backend unavailable", err)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMachines = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/machines/lookup`)
            if (res.ok) {
                setMachines(await res.json())
            }
        } catch (err) {}
    }

    useEffect(() => {
        fetchReadings()
        fetchMachines()
    }, [])

    const handleSave = async (reading: any) => {
        try {
            const isEdit = !!reading.id
            const url = isEdit ? `${API_BASE}/api/dailyreadings/${reading.id}` : `${API_BASE}/api/dailyreadings`
            const res = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reading)
            })
            if (res.ok) {
                toast.success(isEdit ? "Meter log updated successfully" : "Meter log added successfully")
                fetchReadings()
            } else {
                const error = await res.json()
                toast.error(error.error || "Failed to log meter")
            }
        } catch (err) {
            toast.error("Network error")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this meter log? This action cannot be undone.")) {
            return
        }
        try {
            const res = await fetch(`${API_BASE}/api/dailyreadings/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Meter log deleted successfully")
                fetchReadings()
            } else {
                const error = await res.json()
                toast.error(error.error || "Failed to delete meter log")
            }
        } catch (err) {
            toast.error("Network error")
        }
    }

    const columns: ColumnDef<Reading>[] = [
        {
            key: "readingDate",
            label: "Audit Date",
            headerClassName: "w-[130px] uppercase font-black text-[10px] tracking-widest text-slate-400 font-sans",
            render: (val) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-500 tracking-tighter uppercase whitespace-nowrap">
                        {new Date(val).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase mt-0.5">{new Date(val).getFullYear()}</span>
                </div>
            )
        },
        {
            key: "photoUrl",
            label: "Evidence",
            headerClassName: "w-[100px] text-center uppercase font-black text-[10px] tracking-widest text-slate-400 font-sans",
            className: "text-center",
            render: (val) => val ? (
                <div className="flex justify-center">
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="h-10 w-14 rounded-lg border-2 border-indigo-50 bg-slate-50 overflow-hidden shadow-sm group relative cursor-zoom-in">
                                <img 
                                    src={val.startsWith('http') ? val : `${API_BASE}/${val}`} 
                                    alt="Meter Evidence"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <Camera className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl p-2 overflow-hidden border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/20 [&>button]:hover:bg-black/40">
                            <DialogTitle className="sr-only">Meter Reading Evidence Preview</DialogTitle>
                            <div className="relative group">
                                <div className="absolute -top-10 left-0 right-0 flex items-center justify-between text-white drop-shadow-md">
                                    <div className="flex items-center gap-2">
                                        <Camera className="h-4 w-4" />
                                        <span className="text-xs font-black uppercase tracking-widest">Meter Evidence Preview</span>
                                    </div>
                                </div>
                                <img 
                                    src={val.startsWith('http') ? val : `${API_BASE}/${val}`} 
                                    alt="Meter Full Size"
                                    className="w-full h-auto rounded-xl shadow-2xl border-4 border-white/10" 
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                <div className="flex justify-center">
                    <div className="h-10 w-14 rounded-lg border-2 border-dashed border-slate-100 flex items-center justify-center">
                        <ImageIcon className="h-3 w-3 text-slate-200" />
                    </div>
                </div>
            )
        },
        {
            key: "machine",
            label: "Machine Telemetry",
            headerClassName: "uppercase font-black text-[10px] tracking-widest text-slate-400 font-sans",
            render: (val, row) => (
                <div className="flex flex-col py-1">
                    <span className="font-black text-slate-800 text-sm tracking-tight uppercase leading-none">{val}</span>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[9px] font-bold text-slate-400 border-slate-100 px-1.5 py-0 h-4">{row.opening}</Badge>
                        <RefreshCcw className="h-2 w-2 text-indigo-300" />
                        <Badge variant="outline" className="text-[9px] font-black text-indigo-600 bg-indigo-50 border-indigo-100 px-1.5 py-0 h-4">{row.closing}</Badge>
                    </div>
                </div>
            )
        },
        {
            key: "remarks",
            label: "Protocol Notes",
            headerClassName: "uppercase font-black text-[10px] tracking-widest text-slate-400 font-sans",
            render: (val) => (
                <div className="max-w-[180px]">
                    <p className="text-[11px] font-medium text-slate-500 leading-tight line-clamp-2 italic">{val || "Standard Log"}</p>
                </div>
            )
        },
        {
            key: "impressions",
            label: "Meter Actual",
            headerClassName: "w-[130px] text-right uppercase font-black text-[10px] tracking-widest text-slate-400 font-sans px-4",
            className: "text-right px-4",
            render: (val) => (
                <div className="flex flex-col items-end">
                    <span className="font-black text-xs tabular-nums text-indigo-700 tracking-tighter">+{val.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase mt-0.5 tracking-widest">IMPRESSIONS</span>
                </div>
            )
        },
        {
            key: "id",
            label: "Actions",
            headerClassName: "w-[120px] text-center uppercase font-black text-[10px] tracking-widest text-slate-400 font-sans",
            className: "text-center",
            render: (_, row) => (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => setEditingReading(row)}>
                        <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 font-sans mt-2">
            <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-2 mb-2 px-1 gap-2 uppercase font-sans">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#F5F3FF] border border-[#EDE9FE]">
                        <BookOpen className="h-4 w-4 text-[#4C1F7A]" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">Daily Readings</h1>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2 font-bold h-9 px-4 rounded-xl border-slate-200 text-slate-600 py-0 hover:bg-slate-50 transition-all text-[10px] uppercase w-full sm:w-auto"
                        onClick={fetchReadings}
                    >
                        <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Sync Logs
                    </Button>
                    <Dialog open={showLog || !!editingReading} onOpenChange={(open) => { 
                        if (open) setShowLog(true)
                        else { setShowLog(false); setEditingReading(null); } 
                    }}>
                        <DialogTrigger asChild>
                            <Button 
                                type="button" 
                                onClick={() => setShowLog(true)}
                                className="gap-2 font-bold h-9 px-6 rounded-xl shadow-xl shadow-indigo-500/20 text-[10px] uppercase text-white transition-all hover:scale-105 active:scale-95 py-0 w-full sm:w-auto" style={{ background: 'var(--primary)' }}
                            >
                                <Plus className="h-4 w-4" /> Log Reading
                            </Button>
                        </DialogTrigger>
                        {(showLog || editingReading) && (
                            <LogReadingDialog 
                                initialData={editingReading || undefined} 
                                machines={machines} 
                                onSave={handleSave} 
                                onClose={() => { setShowLog(false); setEditingReading(null); }} 
                            />
                        )}
                    </Dialog>
                </div>
            </div>

            <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                <DataGrid
                    data={readings}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    initialPageSize={8}
                    isLoading={isLoading}
                    enableDateRange={true}
                    dateFilterKey="readingDate"
                    searchPlaceholder="Search current logs..."
                />
            </div>
        </div>
    )
}
