"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
    Plus, 
    Eye, 
    CheckCircle, 
    List,
    ArrowRight,
    FileText,
    Trash,
    Search,
    Printer,
    AlertTriangle,
    Calendar,
    Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { UpdateStatusModal } from "@/components/shared/UpdateStatusModal"
import { Can, usePermissions } from "@/components/shared/permission-context"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn, parseJobDescription } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type JobCard = {
    id: number
    jobNumber: string
    customerName: string
    customerId: number
    jobDescription: string
    machineType: string
    quantity: number
    jobStatus: string
    dueDate: string
    createdAt: string
    paperType: string
    paperSize: string
    designFilePath?: string | null
}

const statusStyles = {
    "Pending": "bg-amber-100 text-amber-700 border-amber-200",
    "Designing": "bg-sky-100 text-sky-700 border-sky-200",
    "Printing": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Finishing": "bg-purple-100 text-purple-700 border-purple-200",
    "Completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Dispatched": "bg-slate-100 text-slate-700 border-slate-200",
    "Cancelled": "bg-rose-100 text-rose-700 border-rose-200"
}


export default function ProductionJobsPage() {
    const { hasPermission } = usePermissions()
    const router = useRouter()
    const [jobs, setJobs] = useState<JobCard[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedJob, setSelectedJob] = useState<JobCard | null>(null)

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/jobcards?page=1&size=100`)
            if (res.ok) {
                const data = await res.json()
                setJobs(data.items)
            }
        } catch (err) {
            console.error("Fetch error", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this job card?")) return
        try {
            const res = await fetch(`${API_BASE}/api/jobcards/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Job card deleted successfully")
                fetchJobs()
            } else {
                toast.error("Failed to delete job card")
            }
        } catch (err) {
            toast.error("Error deleting job card")
        }
    }

    const columns: ColumnDef<JobCard>[] = useMemo(() => [
        {
            key: "jobNumber",
            label: "Ticket#",
            headerClassName: "w-[140px] uppercase font-bold text-[10px] tracking-widest text-slate-400",
            className: "font-semibold text-black text-[11px] underline decoration-slate-200",
        },
        {
            key: "customerName",
            label: "Customer Identity",
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400",
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-black text-xs tracking-tight uppercase">{val || "Unknown Client"}</span>
                    <span className="text-[9px] text-slate-800 font-medium tracking-widest mt-1 uppercase">{row.machineType} Unit Production</span>
                </div>
            )
        },
        {
            key: "jobDescription",
            label: "Brief",
            render: (val) => {
                const desc = parseJobDescription(val);
                const main = desc.split('|')[0].trim();
                return <span className="text-[10px] text-black uppercase truncate max-w-[150px] block font-medium">{main || "Standard Job"}</span>
            }
        },
        {
            key: "quantity",
            label: "Output",
            headerClassName: "w-[120px] uppercase font-bold text-[10px] tracking-widest text-slate-400",
            render: (val) => <span className="font-medium text-xs tabular-nums text-black">{val?.toLocaleString()} <span className="text-[9px] text-slate-800">UNITS</span></span>
        },
        {
            key: "jobStatus",
            label: "Factory State",
            headerClassName: "w-[150px] uppercase font-bold text-[10px] tracking-widest text-slate-400",
            render: (val, row) => (
                <div className="flex items-center gap-1">
                    <Badge className={`font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm border-none shadow-sm transition-all duration-300 ${statusStyles[val as keyof typeof statusStyles] || 'bg-slate-100 text-slate-500'}`}>
                        {val === "Completed" && <CheckCircle className="h-2.5 w-2.5 mr-1" />}
                        {val}
                    </Badge>
                    {hasPermission('production', 'edit') && <UpdateStatusModal job={row} onUpdate={fetchJobs} />}
                </div>
            )
        },
        {
            key: "id",
            label: "Actions",
            headerClassName: "text-right px-6 uppercase font-black text-[10px] tracking-widest text-slate-400 italic",
            className: "text-right px-4",
            filterable: false,
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1">
                    <Can I="view" a="production">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#4C1F7A] hover:bg-[#F5F3FF] rounded-xl transition-all" onClick={() => setSelectedJob(row)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Can>
                    <Can I="delete" a="production">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" onClick={() => handleDelete(row.id)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </Can>
                </div>
            )
        }
    ], [])

    // ─── Inline Ticket View ────────────────────────────────
    if (selectedJob) {
        return <JobTicketCard job={selectedJob} onClose={() => setSelectedJob(null)} />
    }



    return (
        <div className="space-y-2 font-sans">
            <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-2 mb-2 px-4 sm:px-1 gap-2 uppercase font-sans">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#F5F3FF] border border-[#EDE9FE]">
                        <List className="h-4 w-4 text-[#4C1F7A]" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-slate-900 leading-none">Production Board</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Can I="create" a="production">
                        <Button 
                            type="button"
                            className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95" 
                            style={{ background: 'var(--primary)' }}
                            onClick={() => router.push("/jobs/new")}
                        >
                            <Plus className="h-4 w-4" /> New Job Card
                        </Button>
                    </Can>
                </div>
            </div>

            <div className="bg-transparent rounded-none border-none px-0 w-full max-w-full">
                <DataGrid
                    data={jobs}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    isLoading={isLoading}
                    searchPlaceholder="Audit factory floor by client, job # or description..."
                    enableDateRange={true}
                    dateFilterKey="createdAt"
                    initialPageSize={10}
                />
            </div>
        </div>
    )
}

function JobTicketCard({ job, onClose }: { job: JobCard; onClose: () => void }) {
    const router = useRouter()
    const [completedSteps, setCompletedSteps] = useState<Record<string, { by: string; at: string; remark?: string }>>({})
    const [stepRemarks, setStepRemarks] = useState<Record<string, string>>({})
    const [showEdit, setShowEdit] = useState(false)
    const [showDesign, setShowDesign] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        jobDescription: job.jobDescription,
        machineType: job.machineType,
        quantity: job.quantity,
        jobStatus: job.jobStatus,
        dueDate: job.dueDate ? job.dueDate.split('T')[0] : '',
        paperType: job.paperType,
        paperSize: job.paperSize,
    })

    const handleSaveEdit = async () => {
        setSaving(true)
        try {
            const res = await fetch(`${API_BASE}/api/jobcards/${job.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...job, ...editForm, quantity: Number(editForm.quantity) }),
            })
            if (res.ok) {
                toast.success('Job updated successfully!')
                setShowEdit(false)
                onClose()
            } else {
                toast.error('Failed to update job.')
            }
        } catch {
            toast.error('Network error while saving.')
        } finally {
            setSaving(false)
        }
    }


    const handlePrint = () => {
        const displayDesc = parseJobDescription(job.jobDescription)
        const allMatches = Array.from(displayDesc?.matchAll(/(?:Processes:|Process:|Finish:)\s*([^|]+)/gi) || []);
        const uniqueSteps = new Set<string>();
        allMatches.forEach((match: any) => {
            if (match[1]) {
                match[1].split(',').forEach((s: string) => {
                    const cleaned = s.trim();
                    if (cleaned && cleaned.length > 1) uniqueSteps.add(cleaned);
                });
            }
        });
        const processes = Array.from(uniqueSteps);
        
        const formatDate = (d: string) => {
            try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
            catch { return d }
        }

        const stepsRows = processes.length > 0
            ? processes.map(p => `
                <tr>
                    <td style="padding:10px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#334155;border-bottom:1px solid #f1f5f9;">${p}</td>
                    <td style="padding:10px 14px;text-align:center;border-bottom:1px solid #f1f5f9;">
                        <span style="display:inline-block;padding:3px 12px;border:1px solid #cbd5e1;border-radius:20px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">PENDING</span>
                    </td>
                    <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;">
                        <div style="border-bottom:1px solid #334155;width:160px;margin-left:auto;height:28px;"></div>
                    </td>
                </tr>`).join('')
            : `<tr><td colspan="3" style="padding:20px;text-align:center;color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">No post-press processes assigned</td></tr>`

        const descParts = displayDesc?.split('|').map((s: string) => s.trim()) ?? []
        const parsedMode = ['COLOR', 'BW'].includes(descParts[0]?.toUpperCase()) ? descParts[0].toUpperCase() : 'CMYK'

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Job Card - ${job.jobNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: white; font-size: 10px; }
  @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  .page { width: 100%; }
  
  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 3px solid #0f172a; margin-bottom: 12px; }
  .company-name { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px; }
  .ticket-title { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; line-height: 1; }
  .ticket-sub { font-size: 11px; font-weight: 700; color: #475569; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.1em; }
  .job-number-block { text-align: right; }
  .job-number { font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; font-family: 'Courier New', monospace; }
  .status-badge { display: inline-block; margin-top: 6px; padding: 4px 12px; background: #0f172a; color: white; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 2px; }
  .date-stamp { font-size: 8px; color: #64748b; margin-top: 4px; }

  /* Info Grid */
  .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid #e2e8f0; margin-bottom: 14px; }
  .info-cell { padding: 10px 12px; border-right: 1px solid #e2e8f0; }
  .info-cell:last-child { border-right: none; }
  .info-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #94a3b8; margin-bottom: 5px; }
  .info-value { font-size: 11px; font-weight: 700; color: #1e293b; }
  .info-sub { font-size: 8px; color: #64748b; margin-top: 2px; font-weight: 600; }
  .deadline { color: #dc2626 !important; }

  /* Section Title */
  .section-title { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #0f172a; margin-bottom: 6px; border-left: 3px solid #0f172a; padding-left: 7px; }

  /* Production Table */
  .prod-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; margin-bottom: 14px; }
  .prod-table th { background: #f8fafc; padding: 7px 10px; text-align: left; font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
  .prod-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .prod-desc { font-size: 10px; font-weight: 700; color: #334155; max-width: 220px; line-height: 1.5; }
  .prod-qty { font-size: 26px; font-weight: 900; color: #0f172a; text-align: center; letter-spacing: -0.02em; }
  .spec-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #6366f1; margin-bottom: 3px; }
  .spec-value { font-size: 8px; font-weight: 700; color: #475569; line-height: 1.6; }
  .unit-badge { display: inline-block; margin-top: 6px; padding: 2px 8px; background: #f1f5f9; color: #475569; font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

  /* Tracking Table */
  .track-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; margin-bottom: 14px; }
  .track-table th { background: #f8fafc; padding: 7px 14px; text-align: left; font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
  .track-table th:nth-child(2) { text-align: center; }
  .track-table th:nth-child(3) { text-align: right; }

  /* Special Instructions */
  .instructions-box { border: 1px solid #e2e8f0; padding: 10px 12px; min-height: 48px; margin-bottom: 14px; }
  .instructions-text { font-size: 9px; color: #334155; font-weight: 600; }

  /* Signatures */
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; margin-top: 16px; border-top: 2px solid #0f172a; padding-top: 16px; }
  .sig-line { border-bottom: 1px solid #334155; height: 35px; margin-bottom: 5px; }
  .sig-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #334155; text-align: center; }

  /* Footer */
  .footer { text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
  .footer-text { font-size: 7px; color: #94a3b8; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="company-name">Digital ERP · Production Management System</div>
      <div class="ticket-title">JOB TICKET</div>
      <div class="ticket-sub">${job.customerName || 'Unknown Client'}</div>
    </div>
    <div class="job-number-block">
      <div class="job-number">${job.jobNumber}</div>
      <div class="status-badge">${job.jobStatus || 'Pending'}</div>
      <div class="date-stamp">Printed: ${formatDate(new Date().toISOString())}</div>
    </div>
  </div>

  <!-- INFO GRID -->
  <div class="info-grid">
    <div class="info-cell">
      <div class="info-label">Client</div>
      <div class="info-value">${job.customerName || '—'}</div>
      <div class="info-sub">Unit #${job.id.toString().padStart(4, '0')}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Machine</div>
      <div class="info-value">${job.machineType || 'Digital'}</div>
      <div class="info-sub">Print Mode: ${parsedMode}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Start Date</div>
      <div class="info-value">${formatDate(job.createdAt)}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Delivery Deadline</div>
      <div class="info-value deadline">${formatDate(job.dueDate)}</div>
    </div>
  </div>

  <!-- PRODUCTION DETAILS -->
  <div class="section-title">Production Details</div>
  <table class="prod-table">
    <thead>
      <tr>
        <th style="width:28px">#</th>
        <th>Description / Specification</th>
        <th style="width:90px;text-align:center">Qty</th>
        <th style="width:160px">Media &amp; Size</th>
      </tr>
    </thead>
    <tbody>
      ${(() => {
        try {
          const items = JSON.parse(job.jobDescription);
          if (Array.isArray(items)) {
            return items.map((item, idx) => `
              <tr style="${idx % 2 === 1 ? 'background:#f8fafc;' : ''}">
                <td style="color:#64748b;font-weight:700;font-size:9px;text-align:center;">${(idx + 1).toString().padStart(2, '0')}</td>
                <td>
                  <div class="prod-desc">
                    ${(item.description || "Standard Item").split('|').map((p: string, i: number) => `
                      <div style="margin-bottom:2px; ${i === 0 ? 'color:#1e293b;font-weight:800;font-size:10px;text-transform:uppercase;' : 'color:#64748b;font-size:8px;font-weight:600;'}">
                        ${p.trim()}
                      </div>
                    `).join('')}
                  </div>
                </td>
                <td style="text-align:center;">
                  <div class="prod-qty" style="font-size:14px;font-weight:900;color:#0f172a;">${(item.qty || job.quantity).toLocaleString()}</div>
                  <div style="font-size:6px;text-transform:uppercase;color:#94a3b8;font-weight:800;letter-spacing:0.05em;">units</div>
                </td>
                <td>
                  <div style="display:flex;flex-direction:column;gap:3px;">
                    ${(() => {
                        const d = item.description || "";
                        const s = d.match(/Size:\s*([^|]+)/i)?.[1] || item.size || job.paperSize || 'Standard';
                        const m = d.match(/Media:\s*([^|]+)/i)?.[1] || item.media || job.paperType || 'Standard';
                        const u = d.match(/Machine:\s*([^|]+)/i)?.[1] || item.machine || job.machineType || 'Digital';
                        return `
                          <div>
                            <span style="font-size:7px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-right:4px;">Size:</span>
                            <span style="font-size:8px;color:#475569;font-weight:700;text-transform:uppercase;">${s}</span>
                          </div>
                          <div>
                            <span style="font-size:7px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-right:4px;">Media:</span>
                            <span style="font-size:8px;color:#475569;font-weight:700;text-transform:uppercase;">${m}</span>
                          </div>
                          <div>
                            <span style="font-size:7px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-right:4px;">Unit:</span>
                            <span style="font-size:8px;color:#475569;font-weight:700;text-transform:uppercase;">${u}</span>
                          </div>
                        `;
                    })()}
                  </div>
                </td>
              </tr>
            `).join('');
          }
        } catch (e) { /* Fallback */ }

        // Fallback for single row
        return `
          <tr>
            <td style="color:#94a3b8;font-weight:700;font-size:9px;">01</td>
            <td>
              <div class="prod-desc">
                ${parseJobDescription(job.jobDescription).split('|').map((p, i) => `
                  <div style="margin-bottom:3px; ${i === 0 ? 'color:#0f172a;font-size:11px;' : 'color:#64748b;font-size:9px;'}">
                    ${p.trim()}
                  </div>
                `).join('') || '<div style="color:#94a3b8">Standard Production Job</div>'}
              </div>
            </td>
            <td>
              <div class="prod-qty">${job.quantity.toLocaleString()}</div>
              <div style="font-size:7px;text-align:center;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">units</div>
            </td>
            <td>
              <div class="spec-label">Paper / Media</div>
              <div class="spec-value">${job.paperType || 'Standard Digital Media'}</div>
              <div class="spec-label" style="margin-top:6px;">Size</div>
              <div class="spec-value">${job.paperSize || 'Standard'}</div>
              <div class="unit-badge">${job.jobStatus === 'Completed' ? 'READY FOR DISPATCH' : 'IN QUEUE'}</div>
            </td>
          </tr>
        `;
      })()}
    </tbody>
  </table>

  <!-- POST-PRESS TRACKING -->
  <div class="section-title">Post-Press Process Tracking</div>
  <table class="track-table">
    <thead>
      <tr>
        <th>Process / Stage</th>
        <th style="text-align:center">Status</th>
        <th style="text-align:right;padding-right:14px;">Operator Sign &amp; Time</th>
      </tr>
    </thead>
    <tbody>
      ${stepsRows}
    </tbody>
  </table>

  <!-- SPECIAL INSTRUCTIONS -->
  <div class="section-title">Special Instructions / Notes</div>
  <div class="instructions-box">
    <div class="instructions-text">&nbsp;</div>
  </div>

  <!-- SIGNATURES -->
  <div class="sig-grid">
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Prepared By</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Production Supervisor</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Client / Dispatch Sign</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-text">Digital ERP · ${job.jobNumber} · Generated ${new Date().toLocaleString('en-IN')} · This is a system-generated document</div>
  </div>

</div>
</body>
</html>`

        const printWindow = window.open('', '_blank', 'width=900,height=700')
        if (printWindow) {
            printWindow.document.write(html)
            printWindow.document.close()
            printWindow.focus()
            printWindow.print()
            printWindow.onafterprint = () => printWindow.close()
        }
    }


    useEffect(() => {
        const saved = localStorage.getItem(`job_${job.id}_steps`)
        if (saved) setCompletedSteps(JSON.parse(saved))
        else setCompletedSteps({})
    }, [job.id])

    const markStepDone = (stepName: string, remark?: string) => {
        const at = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) +
            ' · ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        const by = "Pravin Yadav"
        const newSteps = { ...completedSteps, [stepName]: { by, at, remark } }
        setCompletedSteps(newSteps)
        localStorage.setItem(`job_${job.id}_steps`, JSON.stringify(newSteps))
    }

    // Parse ALL unique processes from all potential line items
    const displayDesc = parseJobDescription(job.jobDescription)
    const allMatches = Array.from(displayDesc?.matchAll(/(?:Processes:|Process:|Finish:)\s*([^|]+)/gi) || []);
    const uniqueSteps = new Set<string>();
    
    allMatches.forEach((match: any) => {
        if (match[1]) {
            match[1].split(',').forEach((s: string) => {
                const cleaned = s.trim();
                if (cleaned && cleaned.length > 1) uniqueSteps.add(cleaned);
            });
        }
    });

    const dynamicSteps: { name: string }[] = Array.from(uniqueSteps).map(name => ({ name }));

    const isDone = job.jobStatus === 'Completed' || job.jobStatus === 'Dispatched'

    // Parse mode & paper
    const descParts = displayDesc?.split('|').map(s => s.trim()) ?? []
    const parsedMode = ['COLOR', 'BW'].includes(descParts[0]?.toUpperCase()) ? descParts[0].toUpperCase() : 'CMYK'
    const qtyPaperPart = descParts.find(p => p.includes('Qty on') || p.includes('Cover:'))
    const dynamicPaperType = qtyPaperPart?.match(/(?:on|Cover:)\s+(.+)$/i)?.[1] ?? (job.paperType || 'Standard Digital Media')

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-2 sm:p-4 font-sans animate-in fade-in duration-300">
            <div className="max-w-[1100px] mx-auto mb-2 flex flex-row items-center justify-between gap-2 bg-white p-2 border border-slate-200 shadow-sm rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-500 pl-1">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:block">JOB CARD</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <Can I="print" a="production">
                        <Button
                            className="h-7 px-3 bg-[#c2410c] hover:bg-[#9a3412] text-white text-[9px] font-bold rounded shadow-none border-none gap-1.5"
                            onClick={handlePrint}
                        >
                            <Printer className="h-3 w-3" /> PRINT
                        </Button>
                    </Can>
                    <Can I="edit" a="production">
                        <Button
                            className="h-7 px-3 bg-[#c2410c] hover:bg-[#9a3412] text-white text-[9px] font-bold rounded shadow-none border-none gap-1.5"
                            onClick={() => router.push(`/jobs/${job.id}/edit`)}
                        >
                            <Settings className="h-3 w-3" /> EDIT
                        </Button>
                    </Can>
                    <Button 
                        variant="outline" 
                        className="h-7 px-3 bg-white border-slate-200 text-slate-600 text-[9px] font-bold rounded hover:bg-slate-50 shadow-none" 
                        onClick={onClose}
                    >
                        EX LIST
                    </Button>
                </div>
            </div>

            {/* Design File Popup */}
            {showDesign && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 backdrop-blur-sm" onClick={() => setShowDesign(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Design File</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded" onClick={() => setShowDesign(false)}>
                                <span className="text-sm text-slate-500">✕</span>
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-slate-100/50">
                            {job.designFilePath ? (
                                <>
                                    {/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(job.designFilePath) ? (
                                        <img
                                            src={job.designFilePath.startsWith('http') ? job.designFilePath : (job.designFilePath.startsWith('/') ? `${API_BASE}${job.designFilePath}` : `${API_BASE}/${job.designFilePath}`)}
                                            alt="Design Reference"
                                            className="max-w-full max-h-[60vh] mx-auto rounded border border-slate-200 shadow-none"
                                        />
                                    ) : /\.pdf$/i.test(job.designFilePath) ? (
                                        <iframe
                                            src={job.designFilePath.startsWith('http') ? job.designFilePath : (job.designFilePath.startsWith('/') ? `${API_BASE}${job.designFilePath}` : `${API_BASE}/${job.designFilePath}`)}
                                            className="w-full h-[60vh] rounded border border-slate-200 bg-white"
                                            title="Design PDF"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                                            <div className="p-4 rounded-full bg-[#F5F3FF] border border-indigo-100">
                                                <FileText className="h-8 w-8 text-[#4C1F7A]" />
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-700">{job.designFilePath.split('/').pop() || job.designFilePath.split('\\').pop()}</p>
                                            <a
                                                href={job.designFilePath.startsWith('http') ? job.designFilePath : (job.designFilePath.startsWith('/') ? `${API_BASE}${job.designFilePath}` : `${API_BASE}/${job.designFilePath}`)}
                                                download
                                                className="inline-flex items-center gap-1.5 h-8 px-4 bg-[#4C1F7A] hover:bg-[#3b185f] text-white font-bold text-[10px] uppercase tracking-widest rounded-md"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                    <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                                        <FileText className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">No file attached</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div id="printable-job-card" className="max-w-[1100px] mx-auto bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-5 pb-8">
                <div className="flex flex-row justify-between items-start mb-3">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">JOB TICKET</h1>
                        <h2 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate w-[140px] sm:w-[250px]">{job.customerName}</h2>
                    </div>
                    <div className="text-right">
                        <h3 className="text-sm font-black text-slate-800 tracking-tighter leading-none mb-1">{job.jobNumber}</h3>
                        <Badge className={`text-[8px] px-2 py-0 rounded shadow-none font-bold uppercase ${statusStyles[job.jobStatus as keyof typeof statusStyles] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {job.jobStatus || 'Pending'}
                        </Badge>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-slate-200 mb-3" />

                {/* Info Grid - Very Compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-4 border-y border-slate-100 bg-slate-50/50">
                    <div className="p-2 border-b md:border-b-0 border-r border-slate-100 flex flex-col justify-center">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Customer</span>
                        <span className="block text-[10px] font-bold text-slate-800 leading-none truncate uppercase">{job.customerName}</span>
                    </div>
                    <div className="p-2 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Start Date</span>
                        <span className="block text-[10px] font-bold text-slate-800 leading-none">{new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="p-2 border-r border-slate-100 flex flex-col justify-center">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Deadline</span>
                        <span className="block text-[10px] font-bold text-rose-600 leading-none">{new Date(job.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="p-2 flex items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-6 flex-1 border-[#E0E7FF] bg-[#EEF2FF] text-[#4338CA] hover:bg-[#E0E7FF] hover:text-[#3730A3] font-bold text-[9px] gap-1 rounded shadow-none"
                            onClick={() => setShowDesign(true)}
                        >
                            <FileText className="h-3 w-3" /> Design
                        </Button>
                    </div>
                </div>

                {/* Production Details */}
                <div className="mb-4">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Production Details</h3>
                    <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-50/30">
                        <Table className="[&_td]:p-2 [&_td]:py-2.5 [&_th]:p-2 text-[10px]">
                            <TableHeader className="bg-slate-100">
                                <TableRow className="hover:bg-transparent border-b border-slate-200">
                                    <TableHead className="font-bold text-slate-500 uppercase">Brief</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-center w-12">Qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(() => {
                                    try {
                                        const items = JSON.parse(job.jobDescription);
                                        if (Array.isArray(items)) {
                                            return items.map((item, idx) => {
                                                const d = item.description || "";
                                                const s = d.match(/Size:\s*([^|]+)/i)?.[1] || item.size || job.paperSize;
                                                const m = d.match(/Media:\s*([^|]+)/i)?.[1] || item.media || job.paperType;
                                                const u = d.match(/Machine:\s*([^|]+)/i)?.[1] || item.machine || job.machineType;
                                                return (
                                                    <TableRow key={idx} className="hover:bg-transparent border-b border-slate-100 last:border-0">
                                                        <TableCell className="align-top">
                                                            <div className="flex flex-col gap-0.5">
                                                                <p className="font-black text-primary text-[10px] uppercase truncate">{d.split('|')[0]}</p>
                                                                {d.split('|').slice(1).map((part: string, i: number) => (
                                                                    <p key={i} className="text-[8px] font-semibold text-slate-500 uppercase truncate">{part.trim()}</p>
                                                                ))}
                                                                <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-1 border-t border-slate-100 pt-1">
                                                                    {s && <span className="text-[7.5px] font-bold text-slate-500 uppercase bg-slate-100 px-1 rounded">SZ: {s}</span>}
                                                                    {m && <span className="text-[7.5px] font-bold text-slate-500 uppercase bg-slate-100 px-1 rounded">MD: {m}</span>}
                                                                    {u && <span className="text-[7.5px] font-bold text-slate-500 uppercase bg-slate-100 px-1 rounded">MC: {u}</span>}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center align-middle bg-slate-50/50 border-l border-slate-100">
                                                            <span className="text-[12px] font-black text-slate-900 tracking-tighter block leading-none">{(item.qty || job.quantity).toLocaleString()}</span>
                                                            <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">UNITS</span>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            });
                                        }
                                    } catch (e) { /* Fallback below */ }

                                    return (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell className="align-top">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="font-black text-primary text-[10px] uppercase truncate">{parseJobDescription(job.jobDescription).split('|')[0] || 'Standard Production Job'}</p>
                                                    {parseJobDescription(job.jobDescription).split('|').slice(1).map((part, i) => (
                                                        <p key={i} className="text-[8px] font-semibold text-slate-500 uppercase truncate">{part.trim()}</p>
                                                    ))}
                                                    <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-1 border-t border-slate-100 pt-1">
                                                        <span className="text-[7.5px] font-bold text-slate-500 uppercase bg-slate-100 px-1 rounded">SZ: {job.paperSize || 'Standard'}</span>
                                                        <span className="text-[7.5px] font-bold text-slate-500 uppercase bg-slate-100 px-1 rounded">MD: {dynamicPaperType}</span>
                                                        <span className="text-[7.5px] font-bold text-slate-500 uppercase bg-slate-100 px-1 rounded">MC: {job.machineType || 'Digital'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center align-middle bg-slate-50/50 border-l border-slate-100">
                                                <span className="text-[12px] font-black text-slate-900 tracking-tighter block leading-none">{job.quantity.toLocaleString()}</span>
                                                <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">UNITS</span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })()}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Digital Progress Tracking */}
                <div className="mb-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Progress Tracking</h3>
                    <div className="flex flex-col gap-1.5">
                        {dynamicSteps.length === 0 ? (
                            <div className="text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest p-3 bg-slate-50 rounded-md border border-slate-100">
                                No processes added
                            </div>
                        ) : dynamicSteps.map((step, idx) => {
                            const done = completedSteps[step.name] ?? (isDone ? { by: 'System', at: 'Auto' } : null)
                            return (
                                <div key={idx} className="flex items-center justify-between p-3 pl-4 bg-white border border-slate-200 shadow-sm rounded-lg hover:border-slate-300 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${done ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'}`} />
                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{step.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {done ? (
                                            <div className="text-right">
                                                <span className="block text-[10px] font-bold text-slate-900 uppercase leading-none">{done.by}</span>
                                                <span className="block text-[9px] text-slate-400 font-semibold mt-1 uppercase tracking-tighter">{done.at}</span>
                                                {done.remark && <span className="block text-[10px] text-indigo-600 font-black uppercase mt-1 italic tracking-tight bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">→ {done.remark}</span>}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input 
                                                    className="h-8 w-40 text-[10px] uppercase font-bold border-slate-200 focus:border-[#0D9488] focus:ring-0 bg-slate-50 shadow-none" 
                                                    placeholder="Add shift/next step note..."
                                                    value={stepRemarks[step.name] || ''}
                                                    onChange={(e) => setStepRemarks({...stepRemarks, [step.name]: e.target.value})}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => markStepDone(step.name, stepRemarks[step.name])}
                                                    className="h-8 text-[9px] font-extrabold uppercase tracking-widest text-[#0D9488] border-[#CCFBF1] bg-[#F0FDFA] hover:bg-[#99F6E4] gap-1.5 shadow-none rounded-md flex items-center px-4 transition-all active:scale-95"
                                                >
                                                    <CheckCircle className="h-3 w-3" /> DONE
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
