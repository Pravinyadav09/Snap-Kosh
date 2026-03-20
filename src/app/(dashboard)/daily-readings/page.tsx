"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Plus, BookOpen, CheckCircle, QrCode, Scan, History as HistoryIcon, TrendingUp, Gauge
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
// Generic Grid
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { SearchableSelect } from "@/components/shared/searchable-select"

// ─── Types ──────────────────────────────────────────────────────────────────
type Reading = {
    id: number
    date: string
    machine: string
    opening: number
    closing: number
    impressions: number
    remarks: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialReadings: Reading[] = [
    { id: 1, date: "24 Jan 2026", machine: "Konica Minolta C6085", opening: 7923, closing: 8000, impressions: 77, remarks: "Auto-generated based on jobs done" },
    { id: 2, date: "24 Jan 2026", machine: "Heidelberg Speedmaster", opening: 5661, closing: 5760, impressions: 99, remarks: "Auto-generated based on jobs done" },
    { id: 3, date: "25 Jan 2026", machine: "Konica Minolta C6085", opening: 8000, closing: 8238, impressions: 238, remarks: "Auto-generated based on jobs done" },
    { id: 4, date: "25 Jan 2026", machine: "Heidelberg Speedmaster", opening: 5760, closing: 5907, impressions: 147, remarks: "Auto-generated based on jobs done" },
    { id: 5, date: "25 Jan 2026", machine: "Epson SureColor S80670", opening: 7026, closing: 7084, impressions: 58, remarks: "Auto-generated based on jobs done" },
    { id: 6, date: "26 Jan 2026", machine: "Konica Minolta C6085", opening: 8238, closing: 8331, impressions: 93, remarks: "Auto-generated based on jobs done" },
    { id: 7, date: "26 Jan 2026", machine: "Heidelberg Speedmaster", opening: 5907, closing: 6050, impressions: 143, remarks: "Auto-generated based on jobs done" },
    { id: 8, date: "27 Jan 2026", machine: "Konica Minolta C6085", opening: 8331, closing: 8520, impressions: 189, remarks: "Auto-generated based on jobs done" },
    { id: 9, date: "27 Jan 2026", machine: "Epson SureColor S80670", opening: 7084, closing: 7142, impressions: 58, remarks: "Auto-generated based on jobs done" },
    { id: 10, date: "28 Jan 2026", machine: "Konica Minolta C6085", opening: 8520, closing: 8700, impressions: 180, remarks: "Auto-generated based on jobs done" },
]

// ─── Log Reading Dialog ───────────────────────────────────────────────────────
function LogReadingDialog({
    onSave, onClose, readings
}: {
    onSave: (r: Reading) => void
    onClose: () => void
    readings: Reading[]
}) {
    const [machine, setMachine] = useState("Konica Minolta C6085")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [opening, setOpening] = useState(0)
    const [closing, setClosing] = useState<number | "">("")
    const [remarks, setRemarks] = useState("")

    React.useEffect(() => {
        const lastReading = [...readings]
            .filter(r => r.machine === machine)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

        if (lastReading) {
            setOpening(lastReading.closing)
        } else {
            setOpening(0)
        }
    }, [machine, readings])

    const impressions = closing !== "" ? (closing as number) - opening : 0

    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[600px] p-0 border border-slate-200 shadow-xl rounded-md bg-white font-sans uppercase">
            <div className="p-4 sm:p-6 border-b border-slate-100 italic">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                        <Gauge className="h-4 w-4" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">New Meter Entry</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Log production output and calculate wastage levels.</DialogDescription>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6 flex-1 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Machine <span className="text-rose-500">*</span></Label>
                        <SearchableSelect 
                            options={[
                                { value: "Konica Minolta C6085", label: "Konica Minolta C6085 (Digital)" },
                                { value: "Heidelberg Speedmaster", label: "Heidelberg Offset" },
                                { value: "Epson SureColor S80670", label: "Epson Wide-Format" }
                            ]}
                            value={machine}
                            onValueChange={setMachine}
                            placeholder="Select Machine"
                            className="h-9 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Date <span className="text-rose-500">*</span></Label>
                        <Input type="date" className="h-9 border-slate-200 bg-white font-medium text-slate-800 text-sm" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Opening Reading <span className="text-rose-500">*</span></Label>
                        <Input
                            type="number"
                            className="h-9 border-slate-200 bg-slate-50 font-medium text-slate-600 text-sm"
                            value={opening}
                            onChange={(e) => setOpening(+e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Closing Reading <span className="text-rose-500">*</span></Label>
                        <Input
                            type="number"
                            className="h-9 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                            value={closing}
                            onChange={e => setClosing(e.target.value === "" ? "" : +e.target.value)}
                        />
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-[-1rem]">Auto-fills from last closing, but can be edited.</p>

                <div className="flex items-center justify-between p-4 rounded-md bg-cyan-50/50 border border-cyan-100/50">
                    <span className="text-sm font-medium text-teal-700">Total Impressions for Day:</span>
                    <span className="text-lg font-bold text-teal-800">
                        {impressions.toLocaleString()}
                    </span>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Remarks (Optional)</Label>
                    <Textarea
                        className="min-h-[80px] text-sm border-slate-200 resize-none"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </div>
            </div>

            <DialogFooter className="p-4 flex flex-row items-center justify-end gap-3 border-t bg-slate-50/30">
                <Button variant="ghost" className="h-9 px-4 text-sm font-medium text-slate-600" onClick={onClose}>Cancel</Button>
                <Button
                    disabled={closing === "" || impressions < 0}
                    className="h-9 px-6 text-white font-medium text-sm shadow-sm"
                    style={{ background: 'var(--primary)' }}
                    onClick={() => {
                        if (closing === "" || impressions < 0) return
                        onSave({
                            id: Date.now(),
                            date: new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                            machine,
                            opening,
                            closing: closing as number,
                            impressions,
                            remarks: remarks || "Meter Entry"
                        })
                        onClose()
                    }}
                >
                    Save Reading
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DailyReadingsPage() {
    const [readings, setReadings] = useState<Reading[]>(initialReadings)
    const [showLog, setShowLog] = useState(false)

    const addReading = (r: Reading) => setReadings(prev => [r, ...prev])

    const columns: ColumnDef<Reading>[] = [
        {
            key: "date",
            label: "Audit Date",
            type: "date",
            className: "hidden md:table-cell",
            headerClassName: "w-[130px] hidden md:table-cell",
            render: (val) => (
                <span className="text-xs font-medium text-slate-500 italic">{val}</span>
            )
        },
        {
            key: "machine",
            label: "Machine Info",
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-sm tracking-tight">{val}</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">Meter: {row.opening} → {row.closing}</span>
                </div>
            )
        },
        {
            key: "impressions",
            label: "Meter Actual",
            headerClassName: "w-[120px] text-right",
            className: "text-right",
            render: (val) => (
                <span className="font-bold text-xs tabular-nums text-slate-900">{val.toLocaleString()}</span>
            )
        },
        {
            key: "remarks",
            label: "Wastage / Loss",
            className: "text-center hidden sm:table-cell",
            headerClassName: "w-[140px] text-center hidden sm:table-cell",
            render: (_, row) => {
                const expected = Math.floor(row.impressions * 0.96)
                const wastage = row.impressions - expected
                const wastagePercent = (wastage / row.impressions) * 100

                return (
                    <div className="flex flex-col items-center">
                        <span className={`font-bold text-xs tabular-nums ${wastage > 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {wastage > 0 ? `+${wastage.toLocaleString()}` : wastage.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-medium text-slate-300">{wastagePercent.toFixed(1)}% Loss</span>
                    </div>
                )
            }
        },
        {
            key: "id",
            label: "Status",
            className: "text-center hidden lg:table-cell",
            headerClassName: "w-[120px] text-center hidden lg:table-cell",
            filterable: false,
            render: (_, row) => {
                const expected = Math.floor(row.impressions * 0.96)
                const wastage = row.impressions - expected
                const wastagePercent = (wastage / row.impressions) * 100

                return (
                    <Badge className={`text-[9px] font-semibold uppercase px-2.5 py-0.5 border-none ${wastagePercent > 5 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {wastagePercent > 5 ? "High Wastage" : "Optimal"}
                    </Badge>
                )
            }
        }
    ]

    return (
        <div className="space-y-4 font-sans bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-2 px-1 gap-4 italic uppercase">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">Daily Machine Readings</h1>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest leading-none mt-1">Meter Logs & Production Efficiency</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <Button 
                        variant="outline" 
                        className="gap-2 font-bold h-9 px-4 rounded-xl border-slate-200 text-slate-600 py-0 hover:bg-slate-50 transition-all text-[10px] uppercase w-full sm:w-auto"
                        onClick={() => {
                            toast.info("Opening QR Scanner...", {
                                description: "Point your camera at the machine's QR code",
                                duration: 3000
                            })
                            // Simulate scanning after 2s
                            setTimeout(() => {
                                setShowLog(true)
                                toast.success("QR Scanned: Konica Minolta C6085", {
                                    icon: <Scan className="size-4 animate-pulse" />
                                })
                            }, 1500)
                        }}
                    >
                        <QrCode className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Scan QR
                    </Button>
                    <Dialog open={showLog} onOpenChange={setShowLog}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 font-bold h-9 px-4 rounded-xl shadow-lg shadow-indigo-500/20 text-[10px] uppercase text-white transition-all hover:scale-105 active:scale-95 py-0 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> Log Reading
                            </Button>
                        </DialogTrigger>
                        <LogReadingDialog onSave={addReading} onClose={() => setShowLog(false)} readings={readings} />
                    </Dialog>
                </div>
            </div>

            {/* Production Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 italic uppercase">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute -bottom-2 -right-2 opacity-20 transform group-hover:rotate-12 transition-transform duration-500">
                        <Gauge className="size-16 sm:size-20" />
                    </div>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Today's Load</p>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter">1,424</h3>
                        <span className="text-[8px] sm:text-[10px] font-bold opacity-70">IMPR.</span>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Average Waste</p>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-rose-500 tracking-tighter">4.2%</h3>
                        <Badge className="bg-rose-50 text-rose-600 border-none text-[7px] sm:text-[8px] font-black h-3.5 sm:h-4 px-1 sm:px-1.5 animate-pulse">REDUCE</Badge>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group font-sans col-span-2 lg:col-span-1">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Active Machines</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter">3/4</h3>
                        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500 tracking-tighter">Running</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                <DataGrid
                    data={readings}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    initialPageSize={8}
                    pageSizeOptions={[8, 16, 32, 64]}
                    enableDateRange={true}
                    dateFilterKey="date"
                    searchPlaceholder="Search current page..."
                    toolbarClassName="border-b px-4 py-3"
                />
            </div>
        </div>
    )
}
