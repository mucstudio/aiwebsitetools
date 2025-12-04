"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubscriptionActionsProps {
  cancelAtPeriodEnd: boolean
}

export function SubscriptionActions({ cancelAtPeriodEnd }: SubscriptionActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST"
      })

      const data = await response.json()

      if (response.ok) {
        alert("Subscription canceled successfully. You'll have access until the end of your billing period.")
        router.refresh()
      } else {
        alert(data.error || "Failed to cancel subscription")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResume = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/subscription/resume", {
        method: "POST"
      })

      const data = await response.json()

      if (response.ok) {
        alert("Subscription resumed successfully!")
        router.refresh()
      } else {
        alert(data.error || "Failed to resume subscription")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 pt-4">
      {!cancelAtPeriodEnd ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Canceling...
            </>
          ) : (
            "Cancel Subscription"
          )}
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          onClick={handleResume}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Resuming...
            </>
          ) : (
            "Resume Subscription"
          )}
        </Button>
      )}
    </div>
  )
}
