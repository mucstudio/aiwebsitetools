import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    // 获取所有支付记录
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // 限制返回最近100条记录
    })

    // 计算统计数据
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // 今日统计
    const todayPayments = payments.filter(p =>
      new Date(p.createdAt) >= todayStart && p.status === "succeeded"
    )
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0)

    // 本月统计
    const monthPayments = payments.filter(p =>
      new Date(p.createdAt) >= monthStart && p.status === "succeeded"
    )
    const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0)

    // 总统计
    const allSuccessPayments = payments.filter(p => p.status === "succeeded")
    const totalRevenue = allSuccessPayments.reduce((sum, p) => sum + p.amount, 0)

    // 退款统计
    const refundPayments = payments.filter(p => p.status === "refunded")
    const refundAmount = refundPayments.reduce((sum, p) => sum + p.amount, 0)

    const stats = {
      todayRevenue,
      todayCount: todayPayments.length,
      monthRevenue,
      monthCount: monthPayments.length,
      totalRevenue,
      totalCount: allSuccessPayments.length,
      refundAmount,
      refundCount: refundPayments.length,
    }

    return NextResponse.json({ payments, stats })
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json(
      { error: "Failed to get payments" },
      { status: 500 }
    )
  }
}
