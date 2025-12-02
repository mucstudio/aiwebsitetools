import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPaymentsPage() {
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
            <CardTitle className="text-2xl">$234</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">12 笔交易</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">本月收入</p>
            <CardTitle className="text-2xl">$2,340</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">156 笔交易</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">总收入</p>
            <CardTitle className="text-2xl">$28,450</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">1,234 笔交易</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm text-muted-foreground">退款</p>
            <CardTitle className="text-2xl">$450</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">8 笔退款</p>
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
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-sm">{payment.id}</td>
                    <td className="py-3 px-4">{payment.user}</td>
                    <td className="py-3 px-4">{payment.plan}</td>
                    <td className="py-3 px-4 font-semibold">${payment.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === "成功"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "失败"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{payment.method}</td>
                    <td className="py-3 px-4 text-muted-foreground">{payment.time}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm">查看详情</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const payments = [
  {
    id: "pay_1234567890",
    user: "john@example.com",
    plan: "Pro",
    amount: 9,
    status: "成功",
    method: "Visa •••• 4242",
    time: "2024-01-20 14:30",
  },
  {
    id: "pay_0987654321",
    user: "jane@example.com",
    plan: "Enterprise",
    amount: 29,
    status: "成功",
    method: "Mastercard •••• 5555",
    time: "2024-01-20 12:15",
  },
  {
    id: "pay_1122334455",
    user: "bob@example.com",
    plan: "Pro",
    amount: 9,
    status: "失败",
    method: "Visa •••• 1234",
    time: "2024-01-20 10:45",
  },
  {
    id: "pay_5544332211",
    user: "alice@example.com",
    plan: "Pro",
    amount: 9,
    status: "退款",
    method: "Visa •••• 9876",
    time: "2024-01-19 16:20",
  },
]
