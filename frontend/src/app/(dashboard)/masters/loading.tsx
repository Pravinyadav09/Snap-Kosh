import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="space-y-6 pb-12 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg bg-slate-200" />
                        <Skeleton className="h-8 w-48 bg-slate-200" />
                    </div>
                    <Skeleton className="h-3 w-64 bg-slate-100 ml-1" />
                </div>

                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-72 rounded-xl bg-slate-100" />
                </div>
            </div>

            {/* Category Filter Skeleton */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 px-1">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-8 w-24 rounded-lg bg-slate-50 border border-slate-100" />
                ))}
            </div>

            {/* Optimized Compact Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <div key={i} className="h-40 border border-slate-100 rounded-2xl bg-white p-5 sm:p-6 flex flex-col items-center text-center space-y-4 shadow-sm">
                         <Skeleton className="h-14 w-14 rounded-2xl bg-slate-50 shadow-inner" />
                         <div className="w-full space-y-2">
                             <Skeleton className="h-3 w-3/4 mx-auto bg-slate-100" />
                             <Skeleton className="h-2 w-full bg-slate-50" />
                             <Skeleton className="h-2 w-1/2 mx-auto bg-slate-50" />
                         </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
