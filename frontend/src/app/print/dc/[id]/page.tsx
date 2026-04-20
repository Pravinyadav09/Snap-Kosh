"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { API_BASE } from "@/lib/api"
import { Printer as PrinterIcon, Truck, MapPin, Calendar, Clock } from "lucide-react"

type AuditLog = {
    id: number
    entityName: string
    entityId: string
    action: string
    changes: string
    performedBy: string
    timestamp: string
}

type JobCard = {
    id: number
    jobNumber: string
    customerName: string
    jobDescription: string
    quantity: number
    paperSize: string
    paperType: string
}

export default function DeliveryChallanPrintPage() {
    const params = useParams()
    const logId = (params.id as string)?.split('/')[0]
    
    // Support for multiple items in Bulk Dispatch
    const [dispatchItems, setDispatchItems] = useState<{log: AuditLog, job: JobCard}[]>([])
    const [settings, setSettings] = useState<any>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // 1. Fetch Settings
                const setRes = await fetch(`${API_BASE}/api/settings`)
                if (setRes.ok) {
                    const setData = await setRes.json()
                    const map: any = {}
                    setData.forEach((s: any) => {
                        const k = s.key ?? s.Key;
                        if (k) map[k] = s.value ?? s.Value ?? ""
                    })
                    setSettings(map)
                }

                let logs: AuditLog[] = []
                
                // 2. Determine if Bulk or Single
                if (logId.startsWith('BATCH-')) {
                    // Fetch all logs in this batch
                    const searchRes = await fetch(`${API_BASE}/api/audit/search?q=${logId}`)
                    if (searchRes.ok) {
                        logs = await searchRes.json()
                    }
                } else {
                    // Fetch single log
                    const logRes = await fetch(`${API_BASE}/api/audit/${logId}`)
                    if (logRes.ok) {
                        logs = [await logRes.json()]
                    }
                }

                // 3. Fetch Jobs for all logs
                const items: {log: AuditLog, job: JobCard}[] = []
                for (const l of logs) {
                    const jobId = l.entityId || (l as any).EntityId
                    const jobRes = await fetch(`${API_BASE}/api/jobcards/${jobId}`)
                    if (jobRes.ok) {
                        items.push({ log: l, job: await jobRes.json() })
                    }
                }
                setDispatchItems(items)

            } catch (err) {
                console.error("Print fetch error:", err)
            } finally {
                setIsLoading(false)
            }
        }
        if (logId) fetchData()
    }, [logId])

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) return <div className="p-10 text-center font-sans text-slate-500 uppercase tracking-widest text-[10px] font-bold">Generating Delivery Challan...</div>
    if (dispatchItems.length === 0) return <div className="p-10 text-center text-rose-500 font-bold uppercase tracking-widest text-[10px]">Error: Dispatch record not found.</div>

    // Use the first item for common metadata
    const mainLog = dispatchItems[0].log
    const mainJob = dispatchItems[0].job

    const changesStr = (mainLog.changes || (mainLog as any).Changes || "").toString()
    const parts = changesStr.split(',').map((p: string) => p.trim()) || []
    const deliveryMode = parts.find((p: string) => p.startsWith('Mode:'))?.split(':')[1] || 'Standard Delivery'
    const rawRef = parts.find((p: string) => p.startsWith('Tracking:'))?.split(':')[1] || 'Internal'
    // Clean Ref: "Ref [BATCH-123]" -> "Ref"
    const trackingRef = rawRef.split(' [BATCH-')[0]

    return (
        <div className="bg-slate-100 min-h-screen py-8 font-sans print:bg-white print:py-0">
            {/* Action Bar (Hidden in Print) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-4 md:px-0">
                <h1 className="text-xl font-bold text-slate-800">Delivery Challan Preview</h1>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-colors"
                >
                    <PrinterIcon className="h-4 w-4" /> Print Document
                </button>
            </div>

            {/* A4 Sheet */}
            <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none print:m-0 print:p-0 overflow-hidden relative border border-slate-200 print:border-none">
                
                {/* Header Section */}
                <div className="p-10 md:p-12 pb-6 border-b-[8px] border-indigo-600 bg-slate-50/30">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-8">
                            {settings.site_logo && (
                                <img 
                                    src={settings.site_logo.startsWith('http') ? settings.site_logo : `${API_BASE}${settings.site_logo}`} 
                                    alt="Logo" 
                                    className="h-16 w-auto object-contain"
                                />
                            )}
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter text-indigo-900 uppercase leading-none mb-1">
                                    {settings.company_name || "DIGITAL PRINTS & GRAPHICS"}
                                </h1>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Professional Print & Logistics</p>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-slate-500 leading-tight whitespace-pre-line font-medium">
                                        {settings.company_address || "404 Innovation Hub, Tech Park\nIndustrial Area, Phase II"}
                                    </p>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase mt-1">GSTIN: {settings.gst_number || "07AAAAA0000A1Z5"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-black uppercase tracking-widest text-slate-100 mb-2 leading-none">Challan</h2>
                            <div className="inline-block bg-indigo-50 text-indigo-800 px-4 py-1.5 rounded-md font-bold text-sm border border-indigo-100">
                                DC No: #{logId.startsWith('BATCH-') ? logId.replace('BATCH-', '') : logId.padStart(5, '0')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 md:p-12 pt-8">
                    {/* Consignee Info */}
                    <div className="grid grid-cols-2 gap-12 mb-10">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Consignee / Deliver To</h3>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="font-bold text-slate-800 text-base uppercase">{mainJob.customerName}</h4>
                                <p className="text-xs text-slate-500 mt-1 italic">
                                    Multiple Jobs Associated ({dispatchItems.length})
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-500">Dispatch Date:</span>
                                <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {new Date(mainLog.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-500">Delivery Mode:</span>
                                <span className="text-sm font-bold text-indigo-600 uppercase flex items-center gap-1">
                                    <Truck className="h-3.5 w-3.5" />
                                    {deliveryMode}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-500">Reference:</span>
                                <span className="text-sm font-bold text-slate-800">{trackingRef}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="mb-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-800">
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 text-center">#</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Job Details</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center w-32">Qty Shipped</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dispatchItems.map((item, idx) => {
                                    const itemChanges = (item.log.changes || (item.log as any).Changes || "").toString()
                                    const itemQty = itemChanges.split(',').find((p: string) => p.trim().startsWith('Qty:'))?.split(':')[1] || '0'
                                    
                                    return (
                                        <tr key={item.log.id} className="border-b border-slate-200">
                                            <td className="py-4 px-2 text-sm text-slate-400 text-center font-medium">{(idx + 1).toString().padStart(2, '0')}</td>
                                            <td className="py-4 px-2">
                                                <p className="text-sm font-bold text-slate-800 uppercase leading-snug">#{item.job.jobNumber} • {item.job.jobDescription}</p>
                                                <div className="flex gap-4 mt-1">
                                                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Size: {item.job.paperSize || 'N/A'}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium px-1">|</span>
                                                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Type: {item.job.paperType || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-center bg-slate-50/30">
                                                <span className="text-lg font-black text-slate-800 tabular-nums">
                                                    {Number(itemQty).toLocaleString()}
                                                </span>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Units</p>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {dispatchItems.length < 5 && Array.from({ length: 5 - dispatchItems.length }).map((_, i) => (
                                    <tr key={`filler-${i}`} className="h-16 border-b border-slate-50 border-dashed">
                                        <td colSpan={3}></td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-900 text-white">
                                    <td colSpan={2} className="py-3 px-4 text-right text-[10px] font-black uppercase tracking-widest">Total Combined Shipment</td>
                                    <td className="py-3 px-2 text-center">
                                        <span className="text-lg font-black tabular-nums">
                                            {dispatchItems.reduce((acc, item) => {
                                                const c = (item.log.changes || (item.log as any).Changes || "").toString()
                                                const q = c.split(',').find((p: string) => p.trim().startsWith('Qty:'))?.split(':')[1] || '0'
                                                return acc + Number(q)
                                            }, 0).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer Section */}
                    <div className="grid grid-cols-2 gap-12 mt-20">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-800 mb-2">Instructions</h3>
                            <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-medium uppercase leading-tight">
                                <li>Goods dispatched in healthy condition.</li>
                                <li>Shortages must be reported immediately.</li>
                                <li>Recieved material as per order manifest.</li>
                            </ul>
                        </div>
                        <div className="flex flex-col items-center justify-end">
                            <div className="flex flex-col items-center gap-16">
                                <div className="text-center">
                                    <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Receiver's Signature</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-48 border-b-2 border-indigo-300 mb-2"></div>
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Authorized Signatory</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 text-center border-t border-slate-100 pt-8 uppercase tracking-[0.3em] font-bold text-[8px] text-slate-300">
                        Digital ERP • Logistics & Supply Chain Management System
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { size: A4 portrait; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
                    .bg-slate-100 { background: white !important; }
                    .shadow-xl { box-shadow: none !important; }
                    .border { border: none !important; }
                    .max-w-[210mm] { width: 100% !important; max-width: none !important; margin: 0 !important; }
                }
            `}} />
        </div>
    )
}
