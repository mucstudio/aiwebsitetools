import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// 更新安全设置
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // 这里可以将安全设置保存到数据库
    // 目前只是返回成功，实际应用中需要保存到用户表或单独的设置表

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update security settings error:", error)
    return NextResponse.json(
      { error: "更新失败" },
      { status: 500 }
    )
  }
}
