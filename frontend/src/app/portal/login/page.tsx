"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectToUnifiedLogin() {
    const router = useRouter()
    useEffect(() => {
        router.replace("/login?tab=client")
    }, [router])
    return null
}
