"use client"

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Plus,
    Edit,
    Eye,
    ImageIcon,
    AlertCircle,
    Settings2,
    Calendar,
    User,
    FileText,
    ExternalLink,
    UserPlus,
    History,
    ShieldCheck,
    ArrowRight,
    Trash,
    List,
    File,
    Image as DownloadImage,
    Edit3,
    Calculator
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { CheckCircle } from "lucide-react"

// Generic Grid & Modal
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { FormModal, FormField } from "@/components/shared/form-modal"
import { CustomerAddModal } from "@/components/shared/customer-add-modal"
import { CustomerHistoryModal } from "@/components/shared/customer-history-modal"
import { CostEstimator } from "@/components/shared/cost-estimator"

// ─── Types & Config ──────────────────────────────────────────────────────────
type Job = {
    id: string
    date: string
    customer: string
    description: string
    hasDesign: boolean
    status: string
    deadline: string
    priority: string
    amount: number
}

const statusConfig: Record<string, { label: string; className: string }> = {
    "Pending": { label: "Pending", className: "bg-slate-500 hover:bg-slate-600 text-white" },
    "Pre-Press": { label: "Pre-Press", className: "bg-cyan-500 hover:bg-cyan-600 text-white" },
    "Printing": { label: "Printing", className: "bg-blue-600 hover:bg-blue-700 text-white" },
    "Post-Press": { label: "Post-Press", className: "bg-amber-500 hover:bg-amber-600 text-white" },
    "Completed": { label: "Completed", className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
}

const initialJobs: Job[] = [
    { id: "JB-0034", date: "11 Feb", customer: "Denesik-Keeling", description: "Print Job • Chromo Paper", hasDesign: true, status: "Pending", deadline: "14 Feb", priority: "High", amount: 1450 },
    { id: "JB-0033", date: "06 Feb", customer: "Harris Group", description: "Wide Format Print", hasDesign: false, status: "Printing", deadline: "09 Feb", priority: "Medium", amount: 25000 },
    { id: "JB-0032", date: "01 Feb", customer: "Kuhlman & Co", description: "Business Cards", hasDesign: true, status: "Completed", deadline: "04 Feb", priority: "Low", amount: 650 },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductionJobsPage() {
    const [jobs, setJobs] = useState<Job[]>(initialJobs)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)


    // ─── Modals ──────────────────────────────────────────────────────────────
    function CreateJobCardModal() {
        const [open, setOpen] = useState(false)
        const [items, setItems] = useState([
            { id: 1, desc: "Sequi quisquam omnis qui.", qty: "395" },
            { id: 2, desc: "Est dolorem aliquid.", qty: "755" },
        ])

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="h-9 px-6 text-white font-medium text-sm rounded-md shadow-sm gap-2"
                        style={{ background: 'var(--primary)' }}>
                        <Plus className="h-4 w-4" /> New Job Card
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[1200px] md:w-[1200px] max-h-[90vh] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white font-sans flex flex-col uppercase font-sans">
                    <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white italic font-sans uppercase">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                                <List className="h-4 w-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">Create Production Ticket</DialogTitle>
                                <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Initialize a new production ticket for the workshop</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                        {/* Job Details Section */}
                        <div className="bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-l-2 border-[#4C1F7A] pl-3">Job Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Job No.</Label>
                                    <Input defaultValue="JB-2026-0037" readOnly className="h-9 bg-slate-50 text-slate-500 border-slate-200 text-sm font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Customer <span className="text-rose-500">*</span></Label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'crona', label: 'Crona Group' },
                                            { value: 'harris', label: 'Harris Group' },
                                            { value: 'denesik', label: 'Denesik-Keeling' }
                                        ]}
                                        value="crona"
                                        onValueChange={(val) => console.log(val)}
                                        placeholder="Select Customer"
                                        className="h-9 border-slate-200 text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Start Date</Label>
                                    <Input type="date" defaultValue="2026-02-26" className="h-9 border-slate-200 text-sm font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-rose-600">Delivery Deadline</Label>
                                    <Input type="date" defaultValue="2026-03-01" className="h-9 border-slate-200 text-sm font-bold text-rose-600" />
                                </div>
                            </div>
                        </div>

                        {/* Production Items Section */}
                        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Production Items</h3>
                                <Button variant="outline" size="sm" className="h-8 text-[#4C1F7A] border-[#EDE9FE] hover:bg-[#F5F3FF] text-[11px] font-bold px-3 transition-all" onClick={() => setItems([...items, { id: Date.now(), desc: "", qty: "1" }])}>
                                    <Plus className="h-3 w-3 mr-1" /> Add New Row
                                </Button>
                            </div>
                            <div className="p-0 overflow-x-auto scrollbar-thin">
                                <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[65%]">Description & Specifications</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[20%]">Qty</th>
                                            <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[15%]">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {items.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="relative group">
                                                        <textarea
                                                            className="w-full min-h-[50px] text-sm p-3 border border-slate-200 rounded-md focus:border-[#4C1F7A] focus:ring-1 focus:ring-[#EDE9FE] outline-none transition-all resize-none pr-10 font-medium"
                                                            defaultValue={item.desc}
                                                            placeholder="Enter job details, paper type, size, etc."
                                                        />
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="absolute right-1.5 bottom-1.5 h-7 w-7 text-[#4C1F7A] hover:bg-[#F5F3FF] bg-white border border-[#EDE9FE] shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-90"
                                                                >
                                                                    <Calculator className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[1200px] md:w-[1200px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-md bg-white">
                                                                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-1.5 rounded-md bg-[#F5F3FF] text-[#4C1F7A] border border-[#EDE9FE]">
                                                                            <Calculator className="h-4 w-4" />
                                                                        </div>
                                                                        <DialogTitle className="text-sm font-semibold tracking-tight text-slate-800">Cost Estimator & Specs Generator</DialogTitle>
                                                                    </div>
                                                                </DialogHeader>
                                                                <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
                                                                    <CostEstimator />
                                                                </div>
                                                                <DialogFooter className="p-4 flex flex-row items-center justify-end gap-2 px-6 border-t border-slate-100 bg-slate-50/50">
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="outline" className="h-8 px-4 rounded-md text-xs font-medium text-slate-500 border-slate-200 bg-white">
                                                                            Close
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogTrigger asChild>
                                                                        <Button className="h-8 px-5 rounded-md bg-[#4C1F7A] hover:bg-[#3d1862] font-semibold text-xs text-white shadow-sm transition-all">
                                                                            Apply to Item
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input type="number" defaultValue={item.qty} className="h-9 border-slate-200 text-sm font-bold w-full max-w-[100px]" />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-rose-500 transition-colors" onClick={() => setItems(items.filter(i => i.id !== item.id))}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Additional Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Design Reference</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 border border-dashed border-slate-200 rounded-md bg-slate-50/50 hover:bg-white transition-all group cursor-pointer relative overflow-hidden">
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                toast.success("Design file selected", { description: e.target.files[0].name });
                                            }
                                        }} />
                                        <div className="p-2 rounded-md bg-white border border-slate-100 text-slate-400 group-hover:text-[#4C1F7A] group-hover:border-[#EDE9FE] transition-all">
                                            <ImageIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">In-house Design Asset</p>
                                            <p className="text-[10px] text-slate-400">Click to upload or drag & drop (JPG, PNG)</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Production Notes</h3>
                                <textarea
                                    className="w-full min-h-[78px] text-sm p-3 border border-slate-200 rounded-md focus:border-[#4C1F7A] outline-none transition-all resize-none font-medium text-slate-600 placeholder:text-slate-300"
                                    placeholder="Enter additional instructions for operators..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-t border-slate-100 p-4 flex justify-end gap-2 px-6 shrink-0">
                        <Button variant="ghost" className="h-9 px-5 text-xs font-medium text-slate-500" onClick={() => setOpen(false)}>
                            Discard
                        </Button>
                        <Button className="h-9 px-6 text-white font-semibold text-xs rounded-md shadow-sm transition-all" style={{ background: 'var(--primary)' }} onClick={() => {
                            toast.success("Job Ticket Created")
                            setOpen(false)
                        }}>
                            Save & Generate Ticket
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    function UpdateStatusModal({ job }: { job: Job }) {
        const [open, setOpen] = useState(false)
        const [status, setStatus] = useState(job.status)

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button className="ml-1.5 p-0.5 rounded-sm hover:bg-slate-100 text-slate-400 inline-flex align-middle">
                        <Edit3 className="h-2.5 w-2.5" />
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden rounded-md border border-slate-200 shadow-xl font-sans">
                    <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-white">
                        <DialogTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Update Status: {job.id}</DialogTitle>
                        <DialogDescription className="sr-only">Change the current status of the job order</DialogDescription>
                    </DialogHeader>
                    <div className="p-5 space-y-4 bg-white">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Select New Status</Label>
                            <SearchableSelect
                                options={[
                                    { value: 'Pending', label: 'Pending' },
                                    { value: 'Pre-Press', label: 'Pre-Press' },
                                    { value: 'Printing', label: 'Printing' },
                                    { value: 'Post-Press', label: 'Post-Press' },
                                    { value: 'Completed', label: 'Completed' }
                                ]}
                                value={status}
                                onValueChange={setStatus}
                                placeholder="Select Status"
                                className="h-9 border-slate-200 text-xs font-medium"
                            />
                        </div>
                    </div>
                    <DialogFooter className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-[11px] font-medium text-slate-500" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" className="h-8 bg-[#4C1F7A] hover:bg-[#3d1862] text-white text-[11px] font-bold px-4" onClick={() => {
                            toast.success(`Status updated to ${status}`)
                            setOpen(false)
                        }}>
                            Update Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }




    const columns: ColumnDef<Job>[] = [
        {
            key: "id",
            label: "Ticket ID",
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val, job) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[#4C1F7A] font-bold text-xs tracking-tight italic">#{val}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{job.date}</span>
                </div>
            )
        },
        {
            key: "hasDesign",
            label: "Files",
            className: "hidden md:table-cell",
            headerClassName: "w-[70px] text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell",
            render: (val) => (
                val ? <div className="p-1 rounded-md bg-blue-50 w-fit border border-blue-100"><DownloadImage className="h-3.5 w-3.5 text-blue-500" /></div> : <span className="text-slate-200">-</span>
            )
        },
        { 
            key: "customer", 
            label: "Client Info", 
            className: "text-xs font-bold text-slate-700 tracking-tight", 
            headerClassName: "text-[10px] font-bold uppercase tracking-wider text-slate-400" 
        },
        { 
            key: "description", 
            label: "Work Specifications", 
            className: "text-[11px] text-slate-500 max-w-[250px] truncate font-medium hidden sm:table-cell", 
            headerClassName: "text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell" 
        },
        {
            key: "status",
            label: "Status",
            headerClassName: "w-[130px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val, job) => {
                let statusClass = "bg-slate-500 text-white"
                if (val === "Completed") statusClass = "bg-emerald-600 text-white"
                const style = val === "Printing" ? { background: 'var(--primary)' } : undefined

                return (
                    <div className="flex items-center gap-1">
                        <Badge className={`${statusClass} text-[10px] font-bold px-2 py-0.5 rounded-sm border-none shadow-sm flex items-center gap-1`} style={style}>
                            {val === "Completed" && <CheckCircle className="h-2.5 w-2.5" />}
                            {val}
                            <UpdateStatusModal job={job} />
                        </Badge>
                    </div>
                )
            }
        },
        {
            key: "deadline",
            label: "Urgency",
            className: "hidden lg:table-cell",
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell",
            render: (val) => (
                <span className="text-rose-600 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap italic">
                    <Calendar className="h-3 w-3" /> {val}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            filterable: false,
            headerClassName: "text-right w-[140px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            className: "text-right px-4",
            render: (_, item) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-bold text-[10px] uppercase tracking-tight rounded-md px-2.5 transition-all" onClick={() => setSelectedJob(item)}>
                        <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> View
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-[#4C1F7A] hover:bg-[#F5F3FF] rounded-md transition-all" title="Print Job Card">
                        <FileText className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    // ─── INLINE JOB CARD VIEW ─────────────────────────────────────────────────
    if (selectedJob) {
        const job = selectedJob
        return (
            <div className="space-y-0 font-sans">
                {/* Top Action Bar */}
                <div className="bg-white border-b px-8 py-4 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-10 shadow-sm gap-4 italic uppercase">
                    <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-black">Job Card</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                        <Button className="gap-2 font-bold h-9 px-4 rounded-md shadow-sm text-xs text-white w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                            <FileText className="h-4 w-4" /> <span className="sm:inline">Print Job Card</span>
                        </Button>
                        <Button size="sm" className="text-white h-9 px-4 gap-2 rounded-md shadow-sm w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                            <Edit className="h-4 w-4" /> <span className="sm:inline">Edit Job Ticket</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-md border-slate-200 w-full sm:w-auto bg-white font-black" onClick={() => setSelectedJob(null)}>
                            Back to List
                        </Button>
                    </div>
                </div>

                <div className="p-4 sm:p-10 bg-white min-h-screen">
                    <div className="max-w-[1100px] mx-auto border border-slate-300 p-4 sm:p-8 rounded-sm space-y-6 sm:space-y-8">
                        {/* Ticket Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 gap-4 italic font-sans uppercase">
                            <div>
                                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">JOB TICKET</h1>
                                <p className="text-base sm:text-lg font-black text-slate-600 mt-1 uppercase tracking-widest leading-none">Ganesha Softwares & Prints</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter leading-none">{job.id}-2026-0037</h2>
                                <Badge className="mt-2 bg-slate-900 text-white font-black px-4 py-1.5 rounded-sm border-none shadow-sm uppercase text-[10px] tracking-widest">{job.status}</Badge>
                            </div>
                        </div>

                        {/* Summary Boxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 rounded-sm">
                            <div className="p-4 sm:p-5 bg-white space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Customer</span>
                                <div className="pl-1">
                                    <p className="text-sm sm:text-base font-black text-slate-800 leading-tight">{job.customer}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Cristina Hermiston | 1-585-837-5878</p>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 bg-white space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Start Date</span>
                                <p className="text-sm sm:text-base font-black text-slate-800 pl-1">{job.date}, 2026</p>
                            </div>
                            <div className="p-4 sm:p-5 bg-white space-y-2">
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest pl-1">Deadline</span>
                                <p className="text-sm sm:text-base font-black text-rose-600 pl-1">{job.deadline}, 2026</p>
                            </div>
                            <div className="p-4 sm:p-5 bg-white space-y-2 text-left sm:text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Design Reference</span>
                                <div className="flex justify-start sm:justify-center mt-2">
                                    {job.hasDesign ? (
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md border border-blue-100 italic font-medium cursor-pointer flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4" /> Design
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 italic text-xs">No Design Attached</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Production Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Production Details</h3>
                            <div className="overflow-x-auto scrollbar-thin">
                                <table className="w-full border-collapse border border-slate-300 min-w-[800px]">
                                    <thead className="bg-slate-50 border-b border-slate-300">
                                        <tr>
                                            <th className="border border-slate-300 p-3 text-left w-[50px] text-[11px] font-bold uppercase text-slate-500">#</th>
                                            <th className="border border-slate-300 p-3 text-left text-[11px] font-bold uppercase text-slate-500">Description</th>
                                            <th className="border border-slate-300 p-3 text-center w-[120px] text-[11px] font-bold uppercase text-slate-500">Quantity</th>
                                            <th className="border border-slate-300 p-3 text-left w-[300px] text-[11px] font-bold uppercase text-slate-500">Specifications / Machine</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-slate-300 p-4 text-center font-bold text-slate-800">1</td>
                                            <td className="border border-slate-300 p-4">
                                                <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                                                    Book Printing • Specs: 8.27*11.69 Size | 50 Pages • Cover: Chromo Paper (170GSM) - ₹7.0400 + Gloss Lamination • Inner: Newsprint (170GSM) - ₹13.3600 (B/W) • Binding: Perfect Binding
                                                </p>
                                            </td>
                                            <td className="border border-slate-300 p-4 text-center">
                                                <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter tabular-nums">1000</span>
                                            </td>
                                            <td className="border border-slate-300 p-4 bg-slate-50/30">
                                                <div className="space-y-1.5 text-[11px] text-slate-500 font-medium">
                                                    <p><span className="font-bold text-slate-400">Size:</span> 8.27*11.69</p>
                                                    <p><span className="font-bold text-slate-400">Cover:</span> Chromo Paper | Machine: Konica Minolta C6085 | Mode: Color</p>
                                                    <p><span className="font-bold text-slate-400">Inner:</span> Newsprint | Machine: Konica Minolta C6085 | Mode: Bw</p>
                                                    <p><span className="font-bold text-slate-400">Unit_price:</span> 273.44</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Digital Progress Tracking */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Digital Progress Tracking</h3>
                            <div className="border border-slate-300 rounded-sm overflow-x-auto scrollbar-thin">
                                <table className="w-full text-sm min-w-[500px]">
                                    <thead className="bg-slate-50 border-b border-slate-300">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest text-slate-400">Stage</th>
                                            <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest text-slate-400">Status</th>
                                            <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest text-slate-400">Action / Approver</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {[
                                            { stage: "Paper Cutting", status: "Pending" },
                                            { stage: "Printing", status: "Pending" },
                                            { stage: "Lamination", status: "Pending" },
                                            { stage: "Creasing", status: "Pending" },
                                            { stage: "Binding", status: "Pending" },
                                            { stage: "Final QA", status: "Pending" },
                                        ].map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700">{item.stage}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-300 text-slate-400 bg-slate-50 shadow-none px-3 py-1">{item.status}</Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button size="sm" variant="outline" className="h-8 gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600 border-teal-200 hover:bg-teal-50 px-4 rounded-md">
                                                        <CheckCircle className="h-3 w-3" /> Mark Done
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Signature Section */}
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-12 gap-8 sm:gap-0">
                            <div className="text-center w-full sm:w-[250px] space-y-3">
                                <div className="border-b-2 border-slate-900 h-8" />
                                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">Operator Signature</p>
                            </div>
                            <div className="text-center w-full sm:w-[250px] space-y-3">
                                <div className="border-b-2 border-slate-900 h-8" />
                                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">Supervisor Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 font-sans bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-2 px-1 gap-4 font-sans italic uppercase">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Production Board</h1>
                </div>

                <div className="flex items-center gap-3">
                    <CreateJobCardModal />
                </div>
            </div>

            <div className="bg-transparent rounded-md border-none px-0 w-full max-w-full">
                <DataGrid
                    data={jobs}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    searchPlaceholder="Filter jobs by ID, customer or status..."
                    enableDateRange={true}
                    dateFilterKey="date"
                    toolbarClassName="border-b px-4 py-3 bg-white"
                />
            </div>
        </div>
    )
}
