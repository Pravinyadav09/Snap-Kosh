"use client"

import React, { useEffect } from "react"
import { AlertCircle, RefreshCcw, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-[450px] overflow-hidden">
                <div className="h-2 bg-destructive" />
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">Something went wrong!</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Don't worry, it's not your fault.
                    </CardDescription>
                </CardHeader>
                <CardContent className="bg-muted/30 p-6 rounded-lg mx-6 mb-6">
                    <p className="text-sm font-mono text-muted-foreground break-all">
                        {error.message || "An unknown error occurred."}
                    </p>
                    {error.digest && (
                        <p className="text-[10px] text-muted-foreground/50 mt-2">
                            Error ID: {error.digest}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="flex gap-3">
                    <Button onClick={() => reset()} className="flex-1 gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Try again
                    </Button>
                    <Button asChild variant="outline" className="flex-1 gap-2">
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
