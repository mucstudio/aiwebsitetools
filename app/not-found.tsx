import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
          Page Not Found
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-500">
          Sorry, the page you are looking for does not exist.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
