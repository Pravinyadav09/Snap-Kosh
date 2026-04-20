import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="space-y-6 font-sans animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-64 bg-slate-200" />
                    <Skeleton className="h-3 w-48 bg-slate-100 mt-2" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 items-center justify-center">
                        <Skeleton className="h-3 w-16 bg-slate-50" />
                        <Skeleton className="h-8 w-12 bg-slate-100" />
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 flex-1 h-10">
                    <Skeleton className="flex-1 h-8 rounded-xl bg-white mx-0.5" />
                    <Skeleton className="flex-1 h-8 rounded-xl bg-transparent mx-0.5" />
                </div>

                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm h-10 w-20">
                     <Skeleton className="h-8 w-8 rounded-lg bg-slate-50" />
                     <Skeleton className="h-8 w-8 rounded-lg bg-slate-50 ml-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm space-y-4">
                        <div className="flex items-start gap-3">
                            <Skeleton className="p-2 h-10 w-10 rounded-lg bg-slate-50" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4 bg-slate-100" />
                                <Skeleton className="h-3 w-1/2 bg-slate-50" />
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                            <Skeleton className="h-3 w-full bg-slate-200/50" />
                            <Skeleton className="h-3 w-2/3 bg-slate-200/50" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-24 bg-slate-50" />
                            <Skeleton className="h-5 w-16 bg-slate-50 rounded-full" />
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <Skeleton className="h-3 w-20 bg-slate-50" />
                            <Skeleton className="h-8 w-24 bg-slate-100 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
