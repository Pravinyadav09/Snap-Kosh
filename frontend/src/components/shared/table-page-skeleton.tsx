import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function TablePageSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Page Header Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-4 w-[350px]" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-[120px] rounded-md" />
                    <Skeleton className="h-9 w-[140px] rounded-md" />
                </div>
            </div>

            {/* Stats Row Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-3 w-[90px]" />
                            <Skeleton className="h-6 w-6 rounded" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-[100px] mb-1" />
                            <Skeleton className="h-3 w-[130px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Skeleton */}
            <Card className="shadow-sm">
                <CardHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-[140px]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-[200px] rounded-md" />
                            <Skeleton className="h-8 w-[80px] rounded-md" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Table Header */}
                    <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-muted/30 border-b">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-3 w-full" />
                        ))}
                    </div>
                    {/* Table Rows */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                        <div key={row} className="grid grid-cols-6 gap-4 px-6 py-4 border-b last:border-b-0">
                            {[1, 2, 3, 4, 5, 6].map((col) => (
                                <Skeleton key={col} className="h-4 w-full" />
                            ))}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
