"use client"

import { cn } from "@/lib/utils"

interface AnimatedLogoProps {
  className?: string
  text?: string
}

export function AnimatedLogo({ className, text = "inspoaibox" }: AnimatedLogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center group cursor-default select-none", className)}>
      {/* Background Glow Layer */}
      <div
        className="absolute inset-0 -z-10 blur-2xl opacity-40 dark:opacity-30 transition-opacity duration-500 group-hover:opacity-60"
        style={{
          background: "linear-gradient(135deg, #d946ef 0%, #f43f5e 50%, #f97316 100%)",
          transform: "scale(1.2)",
        }}
      />

      {/* Main Text Layer */}
      <div className="relative font-black text-2xl tracking-tighter">
        {/* Gradient Text */}
        <span
          className="bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] via-[#f43f5e] to-[#f97316] animate-gradient-slow bg-[length:200%_auto]"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          }}
        >
          {text}
        </span>

        {/* Shine Effect Overlay */}
        <div className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
        </div>
      </div>

      <style jsx>{`
                .animate-gradient-slow {
                    animation: gradient-flow 6s linear infinite;
                }
                
                @keyframes gradient-flow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .animate-shine {
                    animation: shine 2s infinite;
                }

                @keyframes shine {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
    </div>
  )
}
