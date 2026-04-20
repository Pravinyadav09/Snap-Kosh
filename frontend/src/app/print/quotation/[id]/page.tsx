"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { API_BASE } from "@/lib/api"
import { Printer as PrinterIcon } from "lucide-react"

export default function PrintQuotationPage() {
    const params = useParams()
    const [quotation, setQuotation] = useState<any>(null)
    const [customer, setCustomer] = useState<any>(null)
    const [settings, setSettings] = useState<any>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch Quotation
                const quotRes = await fetch(`${API_BASE}/api/quotations/${params.id}`)
                if (quotRes.ok) {
                    const quotData = await quotRes.json()
                    setQuotation(quotData)

                    // Fetch Full Customer Details
                    if (quotData.customerId) {
                        const custRes = await fetch(`${API_BASE}/api/customers/${quotData.customerId}`)
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

    useEffect(() => {
        if (!isLoading && quotation) {
            // Increased delay to ensure full rendering and style application
            const timer = setTimeout(() => {
                window.print()
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [isLoading, quotation])

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) return <div className="p-10 text-center font-sans text-slate-500">Loading document...</div>
    if (!quotation) return <div className="p-10 text-center font-sans text-rose-500 font-bold">Quotation not found.</div>

    const grandTotal = quotation.quotedPrice || 0
    const taxRate = 18 // assuming 18% inclusive or exclusive, for now we just show total 
    
    // For presentation, lets assume QuotedPrice is final and reverse calculate subtotal if needed
    // Or just show QuotedPrice directly as subtotal and total. Let's just show standard presentation
    const subtotal = grandTotal / 1.18
    const taxAmount = grandTotal - subtotal

    return (
        <div className="bg-slate-100 min-h-screen py-8 font-sans print:bg-white print:py-0">
            {/* Action Bar (Hidden in Print) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-4 md:px-0">
                <h1 className="text-xl font-bold text-slate-800">Quotation Preview</h1>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-colors"
                >
                    <PrinterIcon className="h-4 w-4" /> Print Document
                </button>
            </div>

            {/* A4 Sheet */}
            <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none print:m-0 print:p-0 overflow-hidden relative">
                
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
                            <h1 className="text-4xl font-black uppercase tracking-widest text-slate-200 mb-2">Quotation</h1>
                            <div className="inline-block bg-indigo-50 text-indigo-800 px-4 py-1.5 rounded-md font-bold text-sm border border-indigo-100">
                                QT#: {quotation.quotationNumber}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 md:p-12 pt-8">
                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-12 mb-10">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To / Client</h3>
                            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 min-h-[120px]">
                                <h4 className="font-bold text-slate-800 text-base mb-1">{customer?.companyName || quotation.customerName || "Walk-in Client"}</h4>
                                <div className="text-[11px] text-slate-500 space-y-0.5 leading-relaxed">
                                    {customer?.addressLine1 && <p>{customer.addressLine1}</p>}
                                    {(customer?.city || customer?.state) && <p>{customer.city}, {customer.state} - {customer.pincode}</p>}
                                    {customer?.phone && <p className="font-semibold text-slate-600">Ph: {customer.phone}</p>}
                                    {customer?.gstNumber && <p className="font-semibold text-indigo-700 mt-1 uppercase">GSTIN: {customer.gstNumber}</p>}
                                    <p className="pt-2 text-[10px] font-medium text-slate-400 uppercase tracking-tighter italic">
                                        Proposal Delivery Date: {new Date(quotation.validTill).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-500">Document Date:</span>
                                <span className="text-sm font-bold text-slate-800">{new Date(quotation.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-500">Document Status:</span>
                                <span className="text-sm font-bold text-amber-600 uppercase">{quotation.status || "Draft"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-500">Prepared By:</span>
                                <span className="text-sm font-bold text-slate-800">Sales Desk</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-10 min-h-[150px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-800">
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 text-center">#</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Description</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center w-24">Quantity</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right w-32">Rate (₹)</th>
                                    <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    let items = [];
                                    try {
                                        items = JSON.parse(quotation.description);
                                        if (!Array.isArray(items)) throw new Error("Not an array");
                                    } catch (e) {
                                        // Fallback for single item (Legacy support)
                                        items = [{
                                            description: quotation.description || "Printing Services & Production",
                                            qty: 1,
                                            rate: subtotal,
                                            amount: subtotal
                                        }];
                                    }

                                    return items.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-b border-slate-100 align-top">
                                            <td className="py-4 px-2 text-sm text-slate-400 text-center font-medium">{idx + 1}</td>
                                            <td className="py-4 px-2">
                                                <div className="text-sm font-bold text-slate-800 break-words max-w-[400px]">
                                                    {item.description}
                                                </div>
                                                {idx === 0 && (quotation.paperSize || quotation.paperType) && (
                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                        Specs: {quotation.paperSize} {quotation.paperType}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-2 text-sm text-slate-700 text-center font-bold">{item.qty}</td>
                                            <td className="py-4 px-2 text-sm text-slate-700 text-right font-medium">
                                                {Number(item.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-2 text-sm text-slate-800 text-right font-black">
                                                {Number(item.amount || (item.qty * item.rate)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end mb-16">
                        <div className="w-80 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                            <div className="flex justify-between py-3 px-4 bg-slate-50 border-b border-slate-200">
                                <span className="text-xs font-bold text-slate-600 uppercase">Subtotal</span>
                                <span className="text-sm font-bold text-slate-800">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-3 px-4 bg-slate-50 border-b border-slate-200">
                                <span className="text-xs font-bold text-slate-600 uppercase">Est Tax (18%)</span>
                                <span className="text-sm font-bold text-slate-800">₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-4 px-4 bg-indigo-600 text-white">
                                <span className="text-sm font-black uppercase tracking-wider">Grand Total</span>
                                <span className="text-lg font-black tracking-tight">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Terms */}
                    <div className="grid grid-cols-2 gap-12 mt-auto">
                        <div>
                            <h3 className="text-xs font-bold text-slate-800 mb-2">Terms & Conditions</h3>
                            {settings.quotation_footer ? (
                                <p className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-line font-medium">
                                    {settings.quotation_footer}
                                </p>
                            ) : (
                                <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-medium">
                                    <li>Quotation is valid for 15 days from the date of issuance.</li>
                                    <li>50% Advance is required with the Purchase Order to initiate.</li>
                                    <li>Final quantity variance of +/- 5% is acceptable in printing.</li>
                                </ul>
                            )}
                        </div>
                        <div className="flex flex-col items-end justify-end">
                            <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized Signatory</span>
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
