"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Pencil, Trash2, GripVertical, ArrowUp, ArrowDown, CornerDownRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MenuItem {
  id: string
  label: string
  url: string
  icon?: string
  order: number
  isActive: boolean
  openInNewTab: boolean
  parentId?: string | null
  children?: MenuItem[]
}

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    label: "",
    url: "",
    icon: "",
    order: 0,
    isActive: true,
    openInNewTab: false,
    parentId: "null" as string,
  })

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/admin/menus")
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data.menuItems)
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingItem
        ? `/api/admin/menus/${editingItem.id}`
        : "/api/admin/menus"

      const payload = {
        ...formData,
        parentId: formData.parentId === "null" ? null : formData.parentId
      }

      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchMenuItems()
        setDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        alert(data.error || "操作失败")
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("保存失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个菜单项吗？")) return

    try {
      const response = await fetch(`/api/admin/menus/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchMenuItems()
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("删除失败，请重试")
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      label: item.label,
      url: item.url,
      icon: item.icon || "",
      order: item.order,
      isActive: item.isActive,
      openInNewTab: item.openInNewTab,
      parentId: item.parentId || "null",
    })
    setDialogOpen(true)
  }

  const handleAddSubmenu = (parentId: string) => {
    resetForm()
    setFormData(prev => ({ ...prev, parentId }))
    setDialogOpen(true)
  }

  const handleMoveUp = async (item: MenuItem, index: number) => {
    if (index === 0) return

    const prevItem = menuItems[index - 1]
    const newOrder = prevItem.order

    try {
      await fetch(`/api/admin/menus/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, order: newOrder }),
      })

      await fetch(`/api/admin/menus/${prevItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prevItem, order: item.order }),
      })

      await fetchMenuItems()
    } catch (error) {
      console.error("Move error:", error)
    }
  }

  const handleMoveDown = async (item: MenuItem, index: number) => {
    if (index === menuItems.length - 1) return

    const nextItem = menuItems[index + 1]
    const newOrder = nextItem.order

    try {
      await fetch(`/api/admin/menus/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, order: newOrder }),
      })

      await fetch(`/api/admin/menus/${nextItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nextItem, order: item.order }),
      })

      await fetchMenuItems()
    } catch (error) {
      console.error("Move error:", error)
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      label: "",
      url: "",
      icon: "",
      order: 0,
      isActive: true,
      openInNewTab: false,
      parentId: "null",
    })
  }

  const openNewDialog = () => {
    resetForm()
    setDialogOpen(true)
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
          <h1 className="text-3xl font-bold">菜单管理</h1>
          <p className="text-muted-foreground">管理网站顶部导航菜单</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              添加菜单
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "编辑菜单" : "添加菜单"}</DialogTitle>
              <DialogDescription>
                配置菜单项的显示文本、链接和其他选项
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentId">父级菜单</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父级菜单（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">无 (顶级菜单)</SelectItem>
                    {menuItems
                      .filter(i => i.id !== editingItem?.id)
                      .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">菜单标签 *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="例如: Tools"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">菜单链接 *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="例如: /tools"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">图标 (可选)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="例如: 🔧"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">排序</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">启用菜单</Label>
                  <p className="text-xs text-muted-foreground">
                    禁用后菜单将不会显示在前端
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="openInNewTab">新标签页打开</Label>
                  <p className="text-xs text-muted-foreground">
                    链接将在新标签页中打开
                  </p>
                </div>
                <Switch
                  id="openInNewTab"
                  checked={formData.openInNewTab}
                  onCheckedChange={(checked) => setFormData({ ...formData, openInNewTab: checked })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingItem ? "保存更改" : "创建菜单"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  取消
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>菜单列表</CardTitle>
          <CardDescription>
            拖动排序或使用箭头按钮调整菜单顺序
          </CardDescription>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>暂无菜单项</p>
              <p className="text-sm mt-2">点击"添加菜单"创建第一个菜单</p>
            </div>
          ) : (
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <div key={item.id} className="space-y-2">
                  <div
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-card"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />

                    {item.icon && <span className="text-xl">{item.icon}</span>}

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {!item.isActive && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                            已禁用
                          </span>
                        )}
                        {item.openInNewTab && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            新标签页
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.url}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddSubmenu(item.id)}
                        title="添加子菜单"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(item, index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(item, index)}
                        disabled={index === menuItems.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Submenus */}
                  {item.children && item.children.length > 0 && (
                    <div className="ml-8 space-y-2 border-l-2 pl-4 border-muted">
                      {item.children.map((child, childIndex) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors bg-muted/20"
                        >
                          <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                          
                          {child.icon && <span className="text-lg">{child.icon}</span>}

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{child.label}</span>
                              {!child.isActive && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                                  已禁用
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{child.url}</p>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(child)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(child.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
