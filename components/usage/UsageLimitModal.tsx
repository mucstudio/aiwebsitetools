"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

interface UsageLimitModalProps {
  open: boolean
  onClose: () => void
  userType: 'guest' | 'user' | 'subscriber'
  remaining: number
  limit: number
}

export function UsageLimitModal({
  open,
  onClose,
  userType,
  remaining,
  limit,
}: UsageLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle>Usage Limit Reached</DialogTitle>
          </div>
          <DialogDescription>
            {userType === 'guest' && (
              <>
                You've reached your daily limit as a guest user ({limit} uses per day).
                Sign in to get more uses and access premium features.
              </>
            )}
            {userType === 'user' && (
              <>
                You've used all {limit} of your daily uses. Upgrade to Pro for unlimited
                access to all tools.
              </>
            )}
            {userType === 'subscriber' && (
              <>
                You've reached your daily limit for this tool ({limit} uses per day).
                The limit will reset tomorrow.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Today's Usage</span>
              <span className="text-sm font-bold">{limit}/{limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          {userType === 'guest' && (
            <>
              <Button variant="outline" onClick={onClose}>
                Maybe Later
              </Button>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </>
          )}
          {userType === 'user' && (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Link href="/pricing">
                <Button>Upgrade to Pro</Button>
              </Link>
            </>
          )}
          {userType === 'subscriber' && (
            <Button onClick={onClose}>
              OK
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
