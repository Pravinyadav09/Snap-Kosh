import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl shadow-sm">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[220px]" />
                    <Skeleton className="h-4 w-[340px]" />
                </div>
                <Skeleton className="h-10 w-[200px] rounded-lg" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-3 w-[100px]" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-[120px] mb-2" />
                            <Skeleton className="h-3 w-[150px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <Skeleton className="h-5 w-[200px] mb-1" />
                        <Skeleton className="h-3 w-[280px]" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[250px] w-full rounded-lg" />
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <Skeleton className="h-5 w-[160px] mb-1" />
                        <Skeleton className="h-3 w-[220px]" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3 w-[140px]" />
                                    <Skeleton className="h-5 w-[80px] rounded-full" />
                                </div>
                                <Skeleton className="h-1.5 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section Skeleton */}
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader>
                        <Skeleton className="h-5 w-[140px]" />
                        <Skeleton className="h-3 w-[180px]" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <Skeleton className="h-[200px] w-[200px] rounded-full" />
                        <div className="mt-6 w-full space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-9 w-full rounded-lg" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-[200px]" />
                            <Skeleton className="h-3 w-[260px]" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-[100px] rounded-md" />
                            <Skeleton className="h-8 w-[100px] rounded-md" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-7 w-7 rounded" />
                                        <Skeleton className="h-4 w-[150px]" />
                                    </div>
                                    <Skeleton className="h-5 w-[60px] rounded-full" />
                                </div>
                                <Skeleton className="h-1 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
