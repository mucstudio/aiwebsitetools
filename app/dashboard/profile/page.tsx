"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      })
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "更新失败")
      }

      // 更新 session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email,
        },
      })

      setMessage({ type: "success", text: "个人资料更新成功！" })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "更新失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!session?.user?.email) return

    setVerifying(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "验证邮件已发送，请检查您的收件箱！" })
      } else {
        setMessage({ type: "error", text: data.error || "发送验证邮件失败" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "发送失败，请稍后重试" })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <section className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your name and email address</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-sm">{session?.user?.id || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{session?.user?.role === "ADMIN" ? "Administrator" : "User"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Email Verification</span>
              <div className="flex items-center gap-3">
                <span className={session?.user?.emailVerified ? "text-green-600" : "text-yellow-600"}>
                  {session?.user?.emailVerified ? "Verified" : "Not Verified"}
                </span>
                {!session?.user?.emailVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVerifyEmail}
                    disabled={verifying}
                    className="h-8"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Registration Date</span>
              <span>{session?.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString("en-US") : "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
