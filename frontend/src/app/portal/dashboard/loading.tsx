import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* ── 1. Top Performance KPIs Skeleton ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="rounded-2xl border-none shadow-lg h-32 bg-slate-200/50">
                        <CardHeader className="pb-2">
                             <Skeleton className="h-3 w-20 bg-slate-300" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-24 bg-slate-300 mb-2" />
                            <Skeleton className="h-3 w-16 bg-slate-300 rounded-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── 2. Welcome Message Skeleton ── */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-11 w-11 rounded-xl bg-slate-100" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48 bg-slate-100" />
                                <Skeleton className="h-3 w-32 bg-slate-100" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full max-w-xl ml-14 bg-slate-50" />
                        <Skeleton className="h-4 w-3/4 max-w-xl ml-14 bg-slate-50" />
                    </div>
                    <div className="flex shrink-0 items-center gap-6 px-6 border-l border-slate-100">
                         <div className="space-y-2">
                            <Skeleton className="h-3 w-24 bg-slate-100" />
                            <Skeleton className="h-8 w-32 bg-slate-200" />
                            <Skeleton className="h-3 w-28 bg-slate-100" />
                         </div>
                    </div>
                </div>
            </div>

            {/* ── 3. Recent Transactions Skeleton ── */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                    <Skeleton className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <Skeleton className="h-3 w-40 bg-slate-200" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between border-b pb-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="h-4 w-20 bg-slate-100" />
                            ))}
                        </div>
                        {[1, 2, 3, 4, 5].map(row => (
                            <div key={row} className="flex justify-between py-2">
                                {[1, 2, 3, 4, 5].map(col => (
                                    <Skeleton key={col} className="h-4 w-20 bg-slate-50" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
