"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Download,
    Share2,
    Copy,
    Twitter,
    Facebook,
    Linkedin,
    Check,
    Loader2
} from "lucide-react"
import html2canvas from "html2canvas"
import { cn } from "@/lib/utils"

interface ShareResultProps {
    /**
     * Ref to the element to be captured as an image
     */
    contentRef: React.RefObject<HTMLElement>
    /**
     * Title for the downloaded file (e.g., "my-result")
     */
    title?: string
    /**
     * Text content to share on social media
     */
    shareText?: string
    /**
     * URL to share (defaults to current page URL)
     */
    shareUrl?: string
    /**
     * Additional class names
     */
    className?: string
}

export function ShareResult({
    contentRef,
    title = "ai-tool-result",
    shareText = "Check out this amazing result I generated with AI Website Tools!",
    shareUrl,
    className
}: ShareResultProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const getShareUrl = () => {
        if (typeof window !== "undefined") {
            return shareUrl || window.location.href
        }
        return ""
    }

    const handleDownload = async () => {
        if (!contentRef.current) return

        try {
            setIsDownloading(true)
            const canvas = await html2canvas(contentRef.current, {
                useCORS: true,
                scale: 2, // Higher quality
                backgroundColor: null, // Transparent background if possible
            })

            const image = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.href = image
            link.download = `${title}-${Date.now()}.png`
            link.click()
        } catch (error) {
            console.error("Failed to download image:", error)
        } finally {
            setIsDownloading(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(getShareUrl())
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (error) {
            console.error("Failed to copy link:", error)
        }
    }

    const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
        const url = encodeURIComponent(getShareUrl())
        const text = encodeURIComponent(shareText)
        let shareLink = ""

        switch (platform) {
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
                break
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`
                break
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
                break
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'width=600,height=400')
        }
    }

    return (
        <Card className={cn("mt-6 border-dashed", className)}>
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Share2 className="h-4 w-4" />
                        <span>Share or Save Result</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Download Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            {isDownloading ? "Saving..." : "Save Image"}
                        </Button>

                        {/* Copy Link Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyLink}
                        >
                            {isCopied ? (
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4 mr-2" />
                            )}
                            {isCopied ? "Copied!" : "Copy Link"}
                        </Button>

                        <div className="h-4 w-px bg-border mx-1 hidden md:block" />

                        {/* Social Share Buttons */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:text-blue-500 hover:bg-blue-50"
                            onClick={() => handleSocialShare('twitter')}
                            title="Share on Twitter"
                        >
                            <Twitter className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleSocialShare('facebook')}
                            title="Share on Facebook"
                        >
                            <Facebook className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() => handleSocialShare('linkedin')}
                            title="Share on LinkedIn"
                        >
                            <Linkedin className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
