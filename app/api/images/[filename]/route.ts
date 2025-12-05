import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = params.filename

    // Security check: prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return new NextResponse("Invalid filename", { status: 400 })
    }

    // Define the path to the uploads directory
    // We use the same hardcoded path as in the upload route to ensure consistency
    const uploadDir = "D:\\website\\aiwebsitetools\\public\\uploads"
    const filepath = path.join(uploadDir, filename)

    if (!existsSync(filepath)) {
        return new NextResponse("File not found", { status: 404 })
    }

    try {
        const fileBuffer = await readFile(filepath)

        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase()
        let contentType = "application/octet-stream"

        if (ext === ".png") contentType = "image/png"
        else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
        else if (ext === ".gif") contentType = "image/gif"
        else if (ext === ".svg") contentType = "image/svg+xml"
        else if (ext === ".webp") contentType = "image/webp"
        else if (ext === ".ico") contentType = "image/x-icon"

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        })
    } catch (error) {
        console.error("Error serving image:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
