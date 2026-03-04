"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Plus, BookOpen, CheckCircle
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
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"

// Generic Grid
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"

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
        <DialogContent className="max-w-[600px] p-0 border-none shadow-xl rounded-md bg-white font-sans sm:max-w-[600px]">
            <div className="p-6 border-b border-slate-100">
                <DialogTitle className="text-lg font-medium text-slate-700">New Meter Entry</DialogTitle>
                <DialogDescription className="sr-only">New Meter Entry Form</DialogDescription>
            </div>

            <div className="p-6 space-y-6 flex-1 font-sans">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Machine <span className="text-rose-500">*</span></Label>
                        <Select value={machine} onValueChange={setMachine}>
                            <SelectTrigger className="h-9 border-slate-200 bg-white font-medium text-slate-800 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Konica Minolta C6085" className="text-sm">Konica Minolta C6085 (Digital)</SelectItem>
                                <SelectItem value="Heidelberg Speedmaster" className="text-sm">Heidelberg Offset</SelectItem>
                                <SelectItem value="Epson SureColor S80670" className="text-sm">Epson Wide-Format</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Date <span className="text-rose-500">*</span></Label>
                        <Input type="date" className="h-9 border-slate-200 bg-white font-medium text-slate-800 text-sm" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
            headerClassName: "w-[130px]",
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
            headerClassName: "w-[120px]",
            className: "text-right",
            render: (val) => (
                <span className="font-bold text-xs tabular-nums text-slate-900">{val.toLocaleString()}</span>
            )
        },
        {
            key: "remarks",
            label: "Wastage / Loss",
            headerClassName: "w-[140px]",
            className: "text-center",
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
            headerClassName: "w-[120px]",
            className: "text-center",
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
        <div className="space-y-4 font-sans bg-slate-50/30 p-4 rounded-xl">
            <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm border border-slate-200 mb-2">
                <div className="flex items-center gap-3 text-slate-800">
                    <BookOpen className="h-5 w-5 text-slate-500" />
                    <h1 className="text-base font-medium tracking-tight">Daily Machine Readings</h1>
                </div>

                <Dialog open={showLog} onOpenChange={setShowLog}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 font-bold h-9 px-4 rounded-md shadow-sm text-xs text-white" style={{ background: 'var(--primary)' }}>
                            <Plus className="h-4 w-4" /> Log Daily Reading
                        </Button>
                    </DialogTrigger>
                    <LogReadingDialog onSave={addReading} onClose={() => setShowLog(false)} readings={readings} />
                </Dialog>
            </div>

            <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                <DataGrid
                    data={readings}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    searchPlaceholder="Search current page..."
                    toolbarClassName="border-b px-4 py-3"
                />
            </div>
        </div>
    )
}
