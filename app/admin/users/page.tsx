"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  emailVerified: Date | null
  createdAt: Date
  subscription: {
    plan: string
    status: string
    currentPeriodEnd: Date
  } | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    emailVerified: false,
  })

  useEffect(() => {
    loadUsers()
  }, [search, roleFilter, page])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search,
        role: roleFilter,
        page: page.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        loadUsers()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("确定要删除这个用户吗？")) return

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name || "",
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerified,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          emailVerified: editForm.emailVerified,
        }),
      })

      if (response.ok) {
        setEditingUser(null)
        loadUsers()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({ name: "", email: "", role: "", emailVerified: false })
  }

  // Logs functionality
  const [viewingLogsUser, setViewingLogsUser] = useState<User | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsPage, setLogsPage] = useState(1)
  const [logsTotalPages, setLogsTotalPages] = useState(1)

  const loadLogs = async (userId: string, page = 1) => {
    try {
      setLogsLoading(true)
      const response = await fetch(`/api/admin/users/${userId}/logs?page=${page}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setLogsTotalPages(data.pagination.totalPages)
        setLogsPage(page)
      }
    } catch (error) {
      console.error("Failed to load logs:", error)
    } finally {
      setLogsLoading(false)
    }
  }

  const handleViewLogs = (user: User) => {
    setViewingLogsUser(user)
    setLogs([])
    loadLogs(user.id, 1)
  }

  const closeLogs = () => {
    setViewingLogsUser(null)
    setLogs([])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground">管理所有注册用户</p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">所有角色</option>
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              没有找到用户
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">用户</th>
                      <th className="text-left py-3 px-4">邮箱</th>
                      <th className="text-left py-3 px-4">角色</th>
                      <th className="text-left py-3 px-4">订阅</th>
                      <th className="text-left py-3 px-4">注册时间</th>
                      <th className="text-left py-3 px-4">邮箱验证</th>
                      <th className="text-right py-3 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{user.name || "未设置"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={`px-2 py-1 text-xs rounded-full border-0 ${user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            <option value="USER">普通用户</option>
                            <option value="ADMIN">管理员</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          {user.subscription ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${user.subscription.plan === "PRO"
                                ? "bg-blue-100 text-blue-700"
                                : user.subscription.plan === "ENTERPRISE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                              {user.subscription.plan}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                              FREE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {format(new Date(user.createdAt), "yyyy-MM-dd")}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${user.emailVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {user.emailVerified ? "已验证" : "未验证"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              删除
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewLogs(user)}
                            >
                              日志
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    第 {page} / {totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 编辑用户对话框 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>编辑用户</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">姓名</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="输入姓名"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">邮箱</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="输入邮箱"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">角色</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="USER">普通用户</option>
                    <option value="ADMIN">管理员</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">邮箱验证状态</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="emailVerified"
                      checked={editForm.emailVerified}
                      onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="emailVerified" className="text-sm">
                      {editForm.emailVerified ? "已验证" : "未验证"}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">用户信息</label>
                  <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-md">
                    <div className="flex justify-between">
                      <span>用户 ID:</span>
                      <span className="font-mono text-xs">{editingUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>注册时间:</span>
                      <span>{format(new Date(editingUser.createdAt), "yyyy-MM-dd HH:mm")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>订阅计划:</span>
                      <span className="font-medium">
                        {editingUser.subscription?.plan || "FREE"}
                      </span>
                    </div>
                    {editingUser.subscription && (
                      <div className="flex justify-between">
                        <span>订阅状态:</span>
                        <span className={`font-medium ${editingUser.subscription.status === "active"
                            ? "text-green-600"
                            : "text-gray-600"
                          }`}>
                          {editingUser.subscription.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    取消
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    保存
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 用户日志对话框 */}
      {viewingLogsUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>用户日志 - {viewingLogsUser.name || viewingLogsUser.email}</CardTitle>
                <Button variant="ghost" size="sm" onClick={closeLogs}>
                  关闭
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {logsLoading ? (
                <div className="text-center py-8">加载日志中...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无日志记录
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">时间</th>
                          <th className="text-left py-2 px-3">动作</th>
                          <th className="text-left py-2 px-3">资源</th>
                          <th className="text-left py-2 px-3">详情</th>
                          <th className="text-left py-2 px-3">IP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-3 whitespace-nowrap">
                              {format(new Date(log.createdAt), "MM-dd HH:mm:ss")}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${log.action === "LOGIN" ? "bg-green-100 text-green-700" :
                                  log.action === "DELETE" ? "bg-red-100 text-red-700" :
                                    log.action === "UPDATE" ? "bg-blue-100 text-blue-700" :
                                      "bg-gray-100 text-gray-700"
                                }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="py-2 px-3">{log.resource}</td>
                            <td className="py-2 px-3 max-w-[200px] truncate" title={JSON.stringify(log.details)}>
                              {log.details ? JSON.stringify(log.details) : "-"}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground text-xs">
                              {log.ipAddress}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {logsTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadLogs(viewingLogsUser.id, logsPage - 1)}
                        disabled={logsPage === 1}
                      >
                        上一页
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {logsPage} / {logsTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadLogs(viewingLogsUser.id, logsPage + 1)}
                        disabled={logsPage === logsTotalPages}
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
