import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px] pointer-events-none"></div>
      <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500/10 opacity-30 blur-[120px] -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="text-center relative z-10">
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">404</h1>
        <p className="mt-4 text-2xl font-semibold text-foreground">
          Page Not Found
        </p>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button size="lg" className="shadow-lg shadow-primary/25">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
