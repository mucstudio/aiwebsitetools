"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if user has already accepted/closed the cookie banner
        const cookieConsent = localStorage.getItem("cookie-consent")
        if (!cookieConsent) {
            // Show banner after a short delay
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted")
        setIsVisible(false)
    }

    const handleClose = () => {
        // Even if they just close it, we can consider it acknowledged for this session or store a 'closed' state
        // Usually, strictly compliant sites need explicit accept. 
        // For this request, we'll store 'dismissed' to avoid annoying the user on every reload.
        localStorage.setItem("cookie-consent", "dismissed")
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6",
            "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
            "border-t shadow-lg transition-transform duration-500 ease-in-out transform translate-y-0",
            !isVisible && "translate-y-full"
        )}>
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 text-sm text-muted-foreground pr-8">
                    <p className="font-medium text-foreground mb-1">Cookie Notice</p>
                    <p>
                        We use cookies and similar tracking technologies to track your activity on our Service and store certain information.
                        You can set your browser to refuse all cookies or to indicate when a cookie is being sent.
                        However, if you do not accept cookies, you may not be able to use some portions of our Service (e.g., saving your preferences).
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button variant="outline" size="sm" onClick={handleClose}>
                        Decline
                    </Button>
                    <Button size="sm" onClick={handleAccept}>
                        Accept Cookies
                    </Button>
                </div>
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 md:hidden text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
