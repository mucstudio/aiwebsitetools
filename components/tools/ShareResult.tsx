"use client"

import { useState, useEffect } from "react"
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
    contentRef: React.RefObject<any>
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
     * Watermark text to add to the bottom of the image (e.g., "@InspoaiBox.com")
     */
    watermark?: string
    /**
     * Additional class names
     */
    className?: string
}

export function ShareResult({
    contentRef,
    title = "ai-tool-result",
    shareText = "Check out this amazing result I generated with InspoaiBox!",
    shareUrl,
    watermark,
    className
}: ShareResultProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [canShare, setCanShare] = useState(false)

    useEffect(() => {
        if (typeof navigator !== "undefined" && navigator.share) {
            setCanShare(true)
        }
    }, [])

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

            // Generate a unique ID to locate the element in the cloned document
            const originalId = contentRef.current.id
            const uniqueId = `share-content-${Date.now()}`
            if (!originalId) {
                contentRef.current.id = uniqueId
            }

            const canvas = await html2canvas(contentRef.current, {
                useCORS: true,
                scale: 2, // Higher quality
                backgroundColor: null, // Transparent background if possible
                onclone: (clonedDoc) => {
                    const targetId = originalId || uniqueId
                    const clonedElement = clonedDoc.getElementById(targetId)

                    if (clonedElement && watermark) {
                        const watermarkDiv = clonedDoc.createElement("div")
                        // Apply styles directly to ensure they render in canvas
                        watermarkDiv.style.marginTop = "16px"
                        watermarkDiv.style.display = "flex"
                        watermarkDiv.style.justifyContent = "flex-end"
                        watermarkDiv.style.alignItems = "center"
                        watermarkDiv.style.borderTop = "1px solid #e5e7eb" // gray-200
                        watermarkDiv.style.paddingTop = "8px"
                        watermarkDiv.style.fontFamily = "inherit"

                        const textSpan = clonedDoc.createElement("span")
                        textSpan.style.fontSize = "14px"
                        textSpan.style.color = "#9ca3af" // gray-400
                        textSpan.style.fontWeight = "500"
                        textSpan.innerText = watermark

                        watermarkDiv.appendChild(textSpan)
                        clonedElement.appendChild(watermarkDiv)
                    }
                }
            })

            // Restore original ID if we changed it
            if (!originalId) {
                contentRef.current.removeAttribute("id")
            }

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

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title: "InspoaiBox",
                text: shareText,
                url: getShareUrl(),
            })
        } catch (error) {
            console.log("Error sharing:", error)
        }
    }

    const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit' | 'whatsapp') => {
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
            case 'reddit':
                shareLink = `https://www.reddit.com/submit?url=${url}&title=${text}`
                break
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${text}%20${url}`
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

                        {/* Native Share (Mobile/Supported Browsers) */}
                        {canShare && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={handleNativeShare}
                                title="Share via..."
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                        )}

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

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => handleSocialShare('reddit')}
                            title="Share on Reddit"
                        >
                            <svg
                                role="img"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 fill-current"
                            >
                                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                            </svg>
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleSocialShare('whatsapp')}
                            title="Share on WhatsApp"
                        >
                            <svg
                                role="img"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 fill-current"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.304-5.252l.002-.004-.002-.002.002-.002a9.88 9.88 0 0 1 17.069-6.814 9.88 9.88 0 0 1-2.895 16.699m-9.75-9.82a8.568 8.568 0 0 0 8.567 8.567 8.567 8.567 0 0 0 8.567-8.567 8.567 8.567 0 0 0-8.567-8.567 8.567 8.567 0 0 0-8.567 8.567" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
