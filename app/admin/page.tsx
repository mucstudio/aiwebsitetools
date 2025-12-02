import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">欢迎来到管理后台</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总用户数</CardDescription>
            <CardTitle className="text-3xl">1,234</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+12% 较上月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总工具数</CardDescription>
            <CardTitle className="text-3xl">24</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+3 本月新增</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>付费用户</CardDescription>
            <CardTitle className="text-3xl">156</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">12.6% 转化率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>月收入</CardDescription>
            <CardTitle className="text-3xl">$2,340</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+18% 较上月</p>
          </CardContent>
        </Card>
      </div>

      {/* 详细数据 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近注册用户</CardTitle>
            <CardDescription>最新的 5 位用户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>热门工具</CardTitle>
            <CardDescription>使用次数最多的工具</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularTools.map((tool, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-muted-foreground">{tool.category}</p>
                  </div>
                  <span className="font-semibold">{tool.uses}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const recentUsers = [
  { name: "John Doe", email: "john@example.com", date: "2小时前" },
  { name: "Jane Smith", email: "jane@example.com", date: "5小时前" },
  { name: "Bob Johnson", email: "bob@example.com", date: "1天前" },
  { name: "Alice Brown", email: "alice@example.com", date: "2天前" },
  { name: "Charlie Wilson", email: "charlie@example.com", date: "3天前" },
]

const popularTools = [
  { name: "Word Counter", category: "文本工具", uses: "2,345" },
  { name: "JSON Formatter", category: "开发工具", uses: "1,892" },
  { name: "Image Compressor", category: "图片工具", uses: "1,567" },
  { name: "Base64 Encoder", category: "开发工具", uses: "1,234" },
  { name: "QR Code Generator", category: "实用工具", uses: "987" },
]
