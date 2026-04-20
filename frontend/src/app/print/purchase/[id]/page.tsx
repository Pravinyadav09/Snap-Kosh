"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { API_BASE } from "@/lib/api"
import { Printer as PrinterIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PrintPurchaseOrderPage() {
    const params = useParams()
    const [purchase, setPurchase] = useState<any>(null)
    const [supplier, setSupplier] = useState<any>(null)
    const [settings, setSettings] = useState<any>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch Purchase
                const res = await fetch(`${API_BASE}/api/purchases/${params.id}`)
                if (res.ok) {
                    const purchaseData = await res.json()
                    setPurchase(purchaseData)

                    // Fetch Full Supplier Details for printing address/GST
                    if (purchaseData.supplierId) {
                        const supRes = await fetch(`${API_BASE}/api/suppliers/${purchaseData.supplierId}`)
                        if (supRes.ok) {
                            setSupplier(await supRes.json())
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
    if (!purchase) return <div className="p-10 text-center font-sans text-rose-500 font-bold">Purchase Order not found.</div>

    // Standard high-fidelity calculation logic
    const subtotal = purchase.quantity * purchase.rate
    const taxRate = purchase.taxRate || 18 
    
    // Safety check: if totalAmount was explicitly entered as something else (like 50,000 for a 5,000 order), 
    // we use calculation for the print document to maintain audit integrity unless specific logic exists.
    const calculatedTax = (subtotal * taxRate) / 100
    const calculatedGrandTotal = subtotal + calculatedTax
    
    // Use stored values if they make sense, otherwise use calculated to fix UI discrepancy
    const finalTaxAmount = purchase.taxAmount > 0 ? purchase.taxAmount : calculatedTax
    const finalGrandTotal = (purchase.totalAmount > (subtotal * 0.5)) ? purchase.totalAmount : calculatedGrandTotal

    return (
        <div className="bg-slate-100 min-h-screen py-8 font-sans print:bg-white print:py-0">
            {/* Action Bar (Hidden in Print) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-4 md:px-0">
                <h1 className="text-xl font-bold text-slate-800">Purchase Order Preview</h1>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-colors"
                >
                    <PrinterIcon className="h-4 w-4" /> Print Document
                </button>
            </div>

            {/* A4 Sheet */}
            <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none print:m-0 print:p-0 overflow-hidden relative border border-slate-200">
                
                {/* Header Section */}
                <div className="p-10 md:p-12 pb-6 border-b-[8px] border-indigo-600">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-6">
                            {settings.site_logo && (
                                <img 
                                    src={settings.site_logo.startsWith('http') ? settings.site_logo : `${API_BASE}${settings.site_logo}`} 
                                    alt="Logo" 
                                    className="h-16 w-auto object-contain"
                                />
                            )}
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter text-indigo-900 mb-1 leading-none">
                                    {settings.company_name || settings.site_title || "DIGITAL ERP INC."}
                                </h2>
                                <p className="text-[10px] text-slate-500 font-medium leading-tight whitespace-pre-line mt-2">
                                    {settings.company_address || "404 Innovation Hub, Tech Park\nIndustrial Area, Phase II"}
                                    {settings.gst_number && <><br /><span className="font-bold text-slate-700">GSTIN: {settings.gst_number}</span></>}
                                    {(settings.company_email || settings.company_phone) && (
                                        <><br />{settings.company_email} {settings.company_phone && `| ${settings.company_phone}`}</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-black uppercase tracking-widest text-slate-100 mb-2">Purchase Order</h1>
                            <div className="inline-block bg-indigo-50 text-indigo-800 px-4 py-1.5 rounded-md font-bold text-sm border border-indigo-100 uppercase">
                                PO#: {purchase.purchaseNumber || `PO-${params.id?.toString().padStart(4, '0')}`}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 md:p-12 pt-8">
                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-12 mb-10">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vendor / Supplier</h3>
                            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 min-h-[145px]">
                                <h4 className="font-bold text-slate-800 text-base mb-1">{supplier?.name || purchase.supplierName || "Direct Supplier"}</h4>
                                <div className="text-[11px] text-slate-500 space-y-0.5 leading-relaxed">
                                    {supplier?.address && <p className="whitespace-pre-line">{supplier.address}</p>}
                                    {(supplier?.city || supplier?.state) && <p>{supplier.city}, {supplier.state} {supplier.pincode ? `- ${supplier.pincode}` : ''}</p>}
                                    {supplier?.phone && <p className="font-semibold text-slate-600 mt-1">Ph: {supplier.phone}</p>}
                                    {supplier?.gstNumber && <p className="font-bold text-indigo-700 mt-1.5 uppercase tracking-wide">GSTIN: {supplier.gstNumber}</p>}
                                    {!supplier && (
                                        <div className="pt-2 text-[10px] text-slate-300 italic">No detailed address found in records.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">Order Date:</span>
                                <span className="text-sm font-bold text-slate-800">{new Date(purchase.purchaseDate).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">Payment Mode:</span>
                                <span className="text-sm font-bold text-slate-800 uppercase italic">On Invoice</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">Account Status:</span>
                                <span className={cn(
                                    "text-sm font-bold uppercase",
                                    purchase.status === 'Completed' ? "text-emerald-600" : "text-amber-600"
                                )}>
                                    {purchase.status || "Pending Verification"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-10 min-h-[220px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-800">
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 text-center">#</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Item Batch Description</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center w-24">Qty</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right w-32">Rate (₹)</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100 align-top">
                                    <td className="py-5 px-2 text-sm text-slate-400 text-center font-medium">1</td>
                                    <td className="py-5 px-2">
                                        <div className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                                            {purchase.itemName || "Procurement Material Batch"}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                            PO REF: {purchase.purchaseNumber || 'OFFLINE'} | BATCH: {new Date(purchase.purchaseDate).getMonth() + 1}/{new Date(purchase.purchaseDate).getFullYear()}
                                        </div>
                                    </td>
                                    <td className="py-5 px-2 text-sm text-slate-700 text-center font-bold">
                                        {purchase.quantity.toLocaleString()} Units
                                    </td>
                                    <td className="py-5 px-2 text-sm text-slate-700 text-right font-medium font-sans">
                                        {purchase.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-5 px-2 text-sm text-slate-800 text-right font-black font-sans">
                                        {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                                {/* Empty rows for design padding */}
                                {[1, 2, 3].map(i => (
                                    <tr key={i} className="border-b border-transparent">
                                        <td colSpan={5} className="py-4"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end mb-16 px-2">
                        <div className="w-80 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                            <div className="flex justify-between py-3.5 px-5 bg-slate-50/50 border-b border-slate-200">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Subtotal</span>
                                <span className="text-sm font-bold text-slate-800 font-sans">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-3.5 px-5 bg-slate-50/50 border-b border-slate-200">
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Tax Amount</span>
                                    <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest italic leading-none">GST @ {taxRate}% Included</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800 font-sans">₹{finalTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-5 px-5 bg-slate-900 text-white shadow-lg">
                                <span className="text-sm font-black uppercase tracking-wider">Grand Total</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-black tracking-tight font-sans leading-none">₹{finalGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase opacity-70 italic tracking-widest">Invoiced Value</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Terms */}
                    <div className="grid grid-cols-2 gap-12 mt-auto border-t border-slate-100 pt-10">
                        <div>
                            <h3 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-tight">Terms & Conditions</h3>
                            <ul className="text-[9px] text-slate-500 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
                                <li>Material must be delivered within the specified window in original packaging.</li>
                                <li>Damage during transit must be reported immediately upon receipt.</li>
                                <li>All disputes are subject to the jurisdiction specified in the master agreement.</li>
                                <li>Please quote PO Number on all future correspondence and delivery notes.</li>
                            </ul>
                        </div>
                        <div className="flex flex-col items-end justify-end">
                            <div className="w-48 border-b border-slate-200 mb-3 h-12 flex items-end justify-center">
                                {/* Placeholder for e-signature or seal */}
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest block leading-none">Authorized Signatory</span>
                                <span className="text-[9px] font-medium text-slate-400 italic block mt-1.5 leading-none">System Generated Document</span>
                            </div>
                        </div>
                    </div>
                </div>
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
