"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    onRemove: () => void
    label?: string
    className?: string
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    label = "Upload Image",
    className
}: ImageUploadProps) {
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const data = await response.json()
            onChange(data.url)
        } catch (error) {
            console.error("Upload error:", error)
            alert("Upload failed, please try again.")
        } finally {
            setLoading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    return (
        <div className={className}>
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-40 h-40 border rounded-md overflow-hidden bg-muted/50 flex items-center justify-center">
                        <Image
                            src={value}
                            alt="Uploaded image"
                            fill
                            className="object-contain"
                        />
                        <button
                            onClick={onRemove}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="w-40 h-40 border-2 border-dashed rounded-md flex flex-col items-center justify-center bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-colors">
                        <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-xs">No image</span>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleUpload}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                Uploading...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                {label}
                            </span>
                        )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Recommended: PNG, JPG, or SVG. Max 2MB.
                    </p>
                </div>
            </div>
        </div>
    )
}
