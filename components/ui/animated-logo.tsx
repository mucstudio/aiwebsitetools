"use client"

import { cn } from "@/lib/utils"

interface AnimatedLogoProps {
    className?: string
    text?: string
}

export function AnimatedLogo({ className, text = "inspoaibox" }: AnimatedLogoProps) {
    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <div className="relative font-black text-2xl tracking-tighter">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-gradient-x">
                    {text}
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-lg blur opacity-20 animate-pulse group-hover:opacity-40 transition duration-1000"></div>
            </div>
            <style jsx>{`
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
        </div>
    )
}
