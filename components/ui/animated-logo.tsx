"use client"

import { cn } from "@/lib/utils"
import { Box, Sparkles } from "lucide-react"

interface AnimatedLogoProps {
  className?: string
  text?: string
}

export function AnimatedLogo({ className, text = "inspoaibox" }: AnimatedLogoProps) {
  const isDefault = text.toLowerCase() === "inspoaibox"

  return (
    <div className={cn("group flex items-center gap-2.5 select-none", className)}>
      {/* Logo Icon - Tech Cube */}
      <div className="relative flex h-8 w-8 items-center justify-center">
        {/* Glowing Background */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 opacity-80 blur-[2px] transition-all duration-500 group-hover:opacity-100 group-hover:blur-[4px]" />

        {/* Main Icon Container */}
        <div className="relative flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-inner ring-1 ring-white/20">
          <Box className="h-4 w-4 text-white transition-transform duration-500 group-hover:scale-110" strokeWidth={2.5} />
          {/* Tech Sparkle */}
          <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-cyan-300 animate-pulse" fill="currentColor" />
        </div>
      </div>

      {/* Logo Text */}
      <div className="text-xl font-bold tracking-tight flex items-baseline">
        {isDefault ? (
          <>
            <span className="text-foreground transition-colors group-hover:text-violet-600/80">inspo</span>
            <div className="relative mx-[1px] px-1">
              <span className="relative z-10 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 bg-[length:200%_auto] bg-clip-text text-transparent font-black animate-gradient-slow">
                ai
              </span>
              {/* Subtle Glow behind AI */}
              <div className="absolute inset-0 bg-violet-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-foreground transition-colors group-hover:text-indigo-600/80">box</span>
          </>
        ) : (
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent font-extrabold">
            {text}
          </span>
        )}
      </div>

      <style jsx>{`
                .animate-gradient-slow {
                    animation: gradient-flow 3s linear infinite;
                }
                
                @keyframes gradient-flow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
    </div>
  )
}
