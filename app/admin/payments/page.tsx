"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  status: string
  stripePaymentIntentId: string | null
  metadata: any
  createdAt: string
}

interface PaymentStats {
  todayRevenue: number
  todayCount: number
  monthRevenue: number
  monthCount: number
  totalRevenue: number
  totalCount: number
  refundAmount: number
  refundCount: number
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    todayRevenue: 0,
    todayCount: 0,
    monthRevenue: 0,
    monthCount: 0,
    totalRevenue: 0,
    totalCount: 0,
    refundAmount: 0,
    refundCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error("Failed to load payments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">支付管理</h1>
          <p className="text-muted-foreground">查看所有交易记录和收入统计</p>
        </div>
        <Button variant="outline">导出报表</Button>
      </div>

      {/* 收入统计 */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">今日收入</p>
            <CardTitle className="text-2xl">${stats.todayRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.todayCount} 笔交易</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">本月收入</p>
            <CardTitle className="text-2xl">${stats.monthRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.monthCount} 笔交易</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">总收入</p>
            <CardTitle className="text-2xl">${stats.totalRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.totalCount} 笔交易</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">退款</p>
            <CardTitle className="text-2xl">${stats.refundAmount.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.refundCount} 笔退款</p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选 */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="搜索交易..."
          className="flex-1 px-4 py-2 border rounded-md"
        />
        <select className="px-4 py-2 border rounded-md">
          <option>所有状态</option>
          <option>成功</option>
          <option>失败</option>
          <option>退款</option>
        </select>
        <input
          type="date"
          className="px-4 py-2 border rounded-md"
        />
      </div>

      {/* 交易列表 */}
      <Card>
        <CardHeader>
          <CardTitle>交易记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">交易ID</th>
                  <th className="text-left py-3 px-4">用户</th>
                  <th className="text-left py-3 px-4">计划</th>
                  <th className="text-left py-3 px-4">金额</th>
                  <th className="text-left py-3 px-4">状态</th>
                  <th className="text-left py-3 px-4">支付方式</th>
                  <th className="text-left py-3 px-4">时间</th>
                  <th className="text-right py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      暂无支付记录
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-sm">{payment.stripePaymentIntentId || payment.id.slice(0, 14)}</td>
                      <td className="py-3 px-4">{payment.userId}</td>
                      <td className="py-3 px-4">{payment.metadata?.plan || "-"}</td>
                      <td className="py-3 px-4 font-semibold">${payment.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === "succeeded"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {payment.status === "succeeded" ? "成功" : payment.status === "failed" ? "失败" : payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{payment.metadata?.paymentMethod || "Stripe"}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleString("zh-CN")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">查看详情</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
