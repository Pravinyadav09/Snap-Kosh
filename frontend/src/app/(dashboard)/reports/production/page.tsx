"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect } from "react"
import { 
    Activity, Gauge, Clock, 
    AlertTriangle, CheckCircle2,
    Settings, Play, Pause, Square,
    BarChart, Search, Filter, Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

type Machine = {
    id: number
    name: string
    status: string
    type: string
}

export default function ProductionEfficiencyPage() {
    const [machines, setMachines] = useState<Machine[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_BASE}/api/Machines`)
            .then(res => res.json())
            .then(data => {
                setMachines(data || [])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const activeCount = machines.filter(m => m.status === 'Active').length

    const columns: ColumnDef<Machine>[] = [
        { 
            key: "machineStatus", 
            label: "S", 
            className: "w-10",
            render: (_, row) => (
                <div className={`h-6 w-6 rounded-md flex items-center justify-center ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {row.status === 'Active' ? <Play className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                </div>
            )
        },
        { key: "name", label: "Machine Unit", render: (v) => <span className="font-bold text-slate-800">{v as string}</span> },
        { key: "type", label: "System Class", render: (v) => <Badge variant="outline" className="text-[9px] font-bold uppercase">{v as string}</Badge> },
        { 
            key: "efficiency", 
            label: "OEE Performance", 
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black w-10 ${row.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {row.status === 'Active' ? '92%' : '0%'}
                    </span>
                    <Progress value={row.status === 'Active' ? 92 : 0} className="h-1 flex-1" />
                </div>
            ) 
        },
        { 
            key: "status", 
            label: "Health Status", 
            className: "text-center", 
            render: (v) => (
                <Badge className={v === 'Active' ? "bg-emerald-500 text-white border-none" : "bg-rose-500 text-white border-none"}>
                    {v as string}
                </Badge>
            )
        }
    ]

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 uppercase font-bold text-left">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl tracking-tight text-slate-900">Production Efficiency</h1>
                    <p className="text-[10px] text-muted-foreground tracking-widest px-0.5">Real-time Machine Diagnostics</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10 px-4 text-[10px] uppercase tracking-widest gap-2 rounded-xl border-slate-200">
                        <Settings className="h-4 w-4" /> Calibration Logs
                    </Button>
                    <Button className="h-10 px-6 text-white text-[10px] uppercase tracking-widest gap-2 shadow-xl rounded-xl" style={{ background: 'var(--primary)' }}>
                        <Activity className="h-4 w-4" /> Analysis Report
                    </Button>
                </div>
            </div>


            <div className="grid grid-cols-1 gap-6">
                <Card className="border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                             Machine Operational Registry
                        </CardTitle>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" className="h-8 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-slate-200">
                                <Download className="h-3.5 w-3.5 mr-1.5" /> Data Logs
                             </Button>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <DataGrid 
                            data={machines} 
                            columns={columns} 
                            isLoading={loading}
                            hideTitle={true}
                            searchPlaceholder="Search machine by name, type..." 
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
