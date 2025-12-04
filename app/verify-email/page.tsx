"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Email verified successfully!")

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setStatus("error")
        setMessage(data.error || "Verification failed, please try again")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Verification failed, please try again")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                <h1 className="text-2xl font-bold mb-2">Verifying...</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Verifying your email address
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2 text-green-600">Verification Successful!</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {message}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Redirecting to login page...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Link href="/login">
                    <Button className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
