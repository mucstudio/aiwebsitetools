import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { getCurrentSession } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getCurrentSession()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads")
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (error) {
            // Ignore error if directory exists
        }

        const filepath = path.join(uploadDir, filename)
        await writeFile(filepath, buffer)

        return NextResponse.json({
            url: `/uploads/${filename}`,
            success: true
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        )
    }
}
