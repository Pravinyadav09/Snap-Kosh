"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    Calculator,
    Plus,
    Trash2,
    Save,
    Printer,
    FileText,
    User,
    Calendar,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CostEstimator } from "@/components/shared/cost-estimator"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

type QuoteItem = {
    id: string
    description: string
    qty: number
    rate: number
    amount: number
}

export default function CreateQuotationPage() {
    const router = useRouter()
    const [items, setItems] = useState<QuoteItem[]>([
        { id: "1", description: "Standard Business Cards - 300 GSM Art Card, Front & Back Printing, Matte Lamination", qty: 1000, rate: 2.5, amount: 2500 }
    ])

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: "", qty: 1, rate: 0, amount: 0 }])
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const subtotal = items.reduce((acc, item) => acc + item.amount, 0)
    const taxRate = 0.18
    const taxAmount = subtotal * taxRate
    const grandTotal = subtotal + taxAmount

    return (
        <div className="space-y-6 pb-20">
            {/* Page Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 border bg-background shadow-sm rounded-full"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-800">Create Quotation</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Sales Proposal Generator</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10 font-bold border-2" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button
                        className="h-10 font-bold px-6 shadow-lg gap-2 text-white"
                        style={{ background: 'var(--primary)' }}
                        onClick={() => {
                            toast.success("Quotation Saved", { description: "Quotation QT-2026-0063 has been saved successfully." })
                            router.push("/estimator")
                        }}
                    >
                        <Save className="h-4 w-4" /> Save Quotation
                    </Button>
                </div>
            </div>

            {/* Main Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12">
                    <Card className="shadow-xl border-none ring-1 ring-slate-200 ring-inset">
                        <CardHeader className="bg-slate-50 border-b py-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Quotation No.</Label>
                                    <Input className="h-10 font-bold bg-white" defaultValue="QT-2026-0063" readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Customer <span className="text-rose-500">*</span></Label>
                                    <Select>
                                        <SelectTrigger className="h-10 bg-white font-medium">
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="c1">Bailey-Champlin</SelectItem>
                                            <SelectItem value="c2">Crona Group</SelectItem>
                                            <SelectItem value="c3">Denesik-Keeling</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</Label>
                                    <Input type="date" className="h-10 bg-white" defaultValue="2026-02-26" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Valid Until</Label>
                                    <Input type="date" className="h-10 bg-white" defaultValue="2026-03-13" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-6 bg-slate-50/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Items & Estimation</h3>
                                    <Button size="sm" variant="outline" className="h-9 gap-2 font-bold px-4 bg-white border-2" onClick={addItem}>
                                        <Plus className="h-4 w-4 text-blue-600" /> Add Item
                                    </Button>
                                </div>

                                <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-900 hover:bg-slate-900 border-none">
                                                <TableHead className="text-white font-bold text-xs py-4 px-6">Description</TableHead>
                                                <TableHead className="text-white font-bold text-xs text-center w-[120px]">Qty</TableHead>
                                                <TableHead className="text-white font-bold text-xs text-center w-[150px]">Rate (₹)</TableHead>
                                                <TableHead className="text-white font-bold text-xs text-center w-[180px]">Amount (₹)</TableHead>
                                                <TableHead className="text-white font-bold text-xs text-right px-6 w-[80px]">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={item.id} className="group border-b last:border-0">
                                                    <TableCell className="p-4 px-6 md:min-w-[400px]">
                                                        <div className="relative">
                                                            <Textarea
                                                                placeholder="Item Details, Specs, Sizes..."
                                                                className="min-h-[60px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-sm font-medium pr-10"
                                                                value={item.description}
                                                                onChange={(e) => {
                                                                    const newItems = [...items]
                                                                    newItems[index].description = e.target.value
                                                                    setItems(newItems)
                                                                }}
                                                            />
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute bottom-0 right-0 h-8 w-8 text-blue-600 hover:bg-blue-50 bg-white border border-blue-100 shadow-sm"
                                                                    >
                                                                        <Calculator className="h-4 w-4" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[1200px] md:w-[1200px] p-0 overflow-hidden rounded-lg border border-slate-200 shadow-2xl bg-white">
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
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            className="h-10 text-center font-bold border-none shadow-none focus-visible:ring-1"
                                                            value={item.qty}
                                                            onChange={(e) => {
                                                                const newItems = [...items]
                                                                newItems[index].qty = Number(e.target.value)
                                                                newItems[index].amount = newItems[index].qty * newItems[index].rate
                                                                setItems(newItems)
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            className="h-10 text-center font-medium border-none shadow-none focus-visible:ring-1"
                                                            value={item.rate}
                                                            onChange={(e) => {
                                                                const newItems = [...items]
                                                                newItems[index].rate = Number(e.target.value)
                                                                newItems[index].amount = newItems[index].qty * newItems[index].rate
                                                                setItems(newItems)
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center font-black text-slate-800">
                                                        ₹{item.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right px-6">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-12 border-t">
                            <div className="md:col-span-8 p-6 bg-slate-50/30">
                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Quotations Terms & Notes</Label>
                                <Textarea
                                    placeholder="Enter payment terms, delivery time, etc..."
                                    className="mt-2 min-h-[120px] bg-white border-2 border-slate-100 rounded-xl resize-none"
                                />
                            </div>
                            <div className="md:col-span-4 p-6 space-y-4 border-l bg-slate-50/10">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-500 uppercase tracking-wider">Subtotal:</span>
                                    <span className="font-bold text-slate-800">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500 uppercase tracking-wider">Applicable Tax:</span>
                                        <Select defaultValue="gst-18">
                                            <SelectTrigger className="h-8 w-32 text-[10px] font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gst-18">GST 18%</SelectItem>
                                                <SelectItem value="gst-12">GST 12%</SelectItem>
                                                <SelectItem value="no-tax">No Tax</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500 uppercase tracking-wider">Tax Amount:</span>
                                        <span className="font-bold text-slate-800">₹{taxAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-black text-slate-800 uppercase tracking-widest text-sm">Grand Total:</span>
                                    <span className="font-black text-2xl text-blue-600">₹{grandTotal.toLocaleString()}</span>
                                </div>
                                <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs gap-3">
                                    <Printer className="h-4 w-4" /> Print Quotation
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
