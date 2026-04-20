"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { API_BASE } from "@/lib/api"
import { Printer as PrinterIcon, FileText } from "lucide-react"

export default function PrintInvoicePage() {
    const params = useParams()
    const [invoice, setInvoice] = useState<any>(null)
    const [settings, setSettings] = useState<any>({})
    const [customer, setCustomer] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch Invoice
                const invRes = await fetch(`${API_BASE}/api/invoices/${params.id}`)
                if (invRes.ok) {
                    const invData = await invRes.json()
                    setInvoice(invData)
                    
                    // Fetch Customer
                    if (invData.customerId) {
                        const custRes = await fetch(`${API_BASE}/api/customers/${invData.customerId}`)
                        if (custRes.ok) {
                            setCustomer(await custRes.json())
                        }
                    }
                }

                // Fetch Settings
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
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setIsLoading(false)
            }
        }
        
        if (params.id) {
            fetchData()
        }
    }, [params.id])

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) return <div className="p-10 text-center font-sans text-slate-500">Loading document...</div>
    if (!invoice) return <div className="p-10 text-center font-sans text-rose-500 font-bold">Invoice not found.</div>

    const subtotal = (invoice.items || []).reduce((s: number, i: any) => s + (i.quantity * i.rate), 0)
    const taxAmount = invoice.taxAmount || 0
    const grandTotal = invoice.grandTotal || 0

    return (
        <div className="bg-slate-100 min-h-screen py-8 font-sans print:bg-white print:py-0">
            {/* Action Bar (Hidden in Print) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-4 md:px-0">
                <h1 className="text-xl font-bold text-slate-800">Invoice Preview</h1>
                <div className="flex gap-3">
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-all"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-colors"
                    >
                        <PrinterIcon className="h-4 w-4" /> Print Invoice
                    </button>
                </div>
            </div>

            {/* A4 Sheet */}
            <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none print:m-0 print:p-0 overflow-hidden relative border-t-[12px] border-indigo-600">
                
                {/* Header Section */}
                <div className="p-10 md:p-12 pb-8 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-6">
                            {settings.site_logo ? (
                                <img 
                                    src={settings.site_logo.startsWith('http') ? settings.site_logo : `${API_BASE}${settings.site_logo}`} 
                                    alt="Logo" 
                                    className="h-20 w-auto object-contain"
                                />
                            ) : (
                                <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                                    <FileText className="h-8 w-8" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter text-indigo-900 mb-1">
                                    {settings.company_name || settings.site_title || "DIGITAL ERP INC."}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium leading-tight whitespace-pre-line">
                                    {settings.company_address || "404 Innovation Hub, Tech Park\nIndustrial Area, Phase II"}
                                    {settings.gst_number && <><br />GSTIN: {settings.gst_number}</>}
                                    {(settings.company_email || settings.company_phone) && (
                                        <><br />{settings.company_email} {settings.company_phone && `| ${settings.company_phone}`}</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-5xl font-black uppercase tracking-widest text-slate-100 mb-2 leading-none">INVOICE</h1>
                            <div className="space-y-1">
                                <div className="text-sm font-black text-slate-400">#{invoice.invoiceNumber || `INV-${invoice.id}`}</div>
                                <div className="inline-block bg-emerald-50 text-emerald-800 px-3 py-1 rounded font-bold text-[10px] uppercase border border-emerald-100">
                                    {invoice.paymentStatus || "Unpaid"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 md:p-12 pt-8">
                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-12 mb-10">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To / Recipient</h3>
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{invoice.customerName || "Walk-in Client"}</h4>
                                {customer ? (
                                    <div className="text-xs text-slate-500 mt-2 space-y-1 font-medium italic">
                                        <p>{customer.addressLine1}</p>
                                        <p>{customer.city}, {customer.state} - {customer.pincode}</p>
                                        {customer.gstNumber && <p className="text-slate-900 not-italic font-bold mt-2">GSTIN: {customer.gstNumber}</p>}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-2">Customer ID: #{invoice.customerId}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col justify-start pt-6 space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Issue</span>
                                <span className="text-sm font-bold text-slate-800">{new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</span>
                                <span className="text-sm font-bold text-slate-800">Upon Receipt</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference</span>
                                <span className="text-sm font-bold text-indigo-600">DIRECT SALES</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-10 min-h-[250px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-900 bg-slate-50">
                                    <th className="py-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 text-center">#</th>
                                    <th className="py-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Item Description</th>
                                    <th className="py-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center w-24">Qty</th>
                                    <th className="py-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right w-32">Rate (₹)</th>
                                    <th className="py-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(invoice.items || []).map((item: any, idx: number) => (
                                    <tr key={item.id}>
                                        <td className="py-4 px-3 text-sm text-slate-400 text-center font-bold">{String(idx + 1).padStart(2, '0')}</td>
                                        <td className="py-4 px-3 text-sm font-bold text-slate-800">
                                            {item.description}
                                        </td>
                                        <td className="py-4 px-3 text-sm text-slate-700 text-center font-bold">{item.quantity}</td>
                                        <td className="py-4 px-3 text-sm text-slate-600 text-right font-medium">
                                            {item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-4 px-3 text-sm text-slate-900 text-right font-black">
                                            {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end mb-16">
                        <div className="w-80 space-y-1">
                            <div className="flex justify-between items-center py-2 px-4 bg-slate-50/50 rounded-t-lg">
                                <span className="text-xs font-bold text-slate-500 uppercase">Subtotal</span>
                                <span className="text-sm font-bold text-slate-800">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-4 bg-slate-50/50">
                                <span className="text-xs font-bold text-slate-500 uppercase">Tax (GST {invoice.taxRate}%)</span>
                                <span className="text-sm font-bold text-slate-800">₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 px-4 bg-indigo-600 text-white rounded-b-lg shadow-lg shadow-indigo-100">
                                <span className="text-sm font-black uppercase tracking-wider">Grand Total</span>
                                <span className="text-2xl font-black tracking-tight underline decoration-indigo-400 underline-offset-4">
                                    ₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Terms */}
                    <div className="grid grid-cols-2 gap-12 mt-auto">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Bank Details & Terms</h3>
                            <div className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-line font-medium p-4 bg-slate-50 rounded-lg border border-slate-100 italic">
                                {settings.invoice_footer || "Please make checks payable to our company name.\nPayment is due within 15 days.\nThank you for your business!"}
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-end pb-4">
                            <div className="w-48 border-b-2 border-indigo-900 mb-2"></div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Authorized Signature</span>
                            <span className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Computer Generated Invoice</span>
                        </div>
                    </div>
                </div>
                
                {/* Side Marking */}
                <div className="absolute top-0 right-0 h-full w-2 bg-indigo-50/50 print:hidden"></div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { size: A4 portrait; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}} />
        </div>
    )
}
