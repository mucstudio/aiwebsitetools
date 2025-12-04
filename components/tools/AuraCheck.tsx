'use client'

import { useState, useRef } from 'react'
import { useToolAction } from '@/hooks/useToolAction'
import { marked } from 'marked'
import { ShareResult } from './ShareResult'

interface AuraCheckProps {
  toolId: string
  config?: any
}

interface AuraCheckResult {
  score: string
  body: string
  fullText: string
}

export default function AuraCheck({ toolId }: AuraCheckProps) {
  const [text, setText] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)
  const [showOutput, setShowOutput] = useState(false)
  const [btnText, setBtnText] = useState('Calculate Aura')

  // 使用通用 Hook
  const { execute, result, loading, error, remaining } = useToolAction<AuraCheckResult>('aura-check')

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }

    setBtnText('Reading the stars...')
    setShowOutput(false)

    const longWaitTimer = setTimeout(() => {
      setBtnText('Consulting the oracle...')
    }, 4000)

    try {
      await execute(trimmed)
      setShowOutput(true)
    } finally {
      clearTimeout(longWaitTimer)
      setBtnText('Calculate Aura')
    }
  }

  const reset = () => {
    setText('')
    setShowOutput(false)
    setBtnText('Calculate Aura')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

        .aura-body { font-family: 'Inter', sans-serif; background-color: #0f0f0f; color: #f0f0f0; }
        .aura-serif { font-family: 'Playfair Display', serif; }

        .bg-noise {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 50;
          opacity: 0.07;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          animation: float 10s infinite ease-in-out;
        }
        .orb-1 { top: -10%; left: -10%; width: 50vw; height: 50vw; background: #4f46e5; animation-delay: 0s; }
        .orb-2 { bottom: -10%; right: -10%; width: 60vw; height: 60vw; background: #ec4899; animation-delay: -5s; }
        .orb-3 { top: 40%; left: 40%; width: 40vw; height: 40vw; background: #06b6d4; animation-delay: -2s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .text-gradient {
          background: linear-gradient(to right, #c084fc, #f472b6, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes countUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-score {
          animation: countUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      <div className="aura-body min-h-screen w-full p-4 sm:p-8 relative overflow-x-hidden selection:bg-pink-500 selection:text-white -mx-[50vw] left-1/2 right-1/2 w-screen">

        {/* 噪点遮罩 */}
        <div className="bg-noise"></div>

        {/* 背景光斑 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="max-w-2xl mx-auto relative pt-10" style={{ zIndex: 1 }}>

          <div className="text-center mb-12">
            <div className="inline-block border border-white/20 px-4 py-1 rounded-full backdrop-blur-md mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-300">Vibe Analysis System</span>
            </div>
            <h1 className="text-6xl md:text-7xl aura-serif italic mb-2 text-white drop-shadow-lg">
              Aura Check
            </h1>
            <p className="text-lg text-white/60 font-light max-w-md mx-auto">
              Did you gain aura or lose it? Enter your recent action to calculate your spiritual credit score.
            </p>
          </div>

          <div className="glass rounded-3xl p-8 md:p-10 transition-all duration-500">

            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Energy Credits</span>
              <span className="text-sm font-mono text-white bg-white/10 px-2 py-1 rounded">{remaining}</span>
            </div>

            <div className="mb-8">
              <label className="block text-xl aura-serif italic text-white mb-4">"I just..."</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="e.g. tripped in front of my crush but played it off like a dance move"
                spellCheck={false}
                className="w-full bg-transparent text-2xl md:text-3xl text-white placeholder-white/20 border-b border-white/20 focus:border-white/60 focus:outline-none resize-none font-light leading-snug transition-colors"
              />
              <div className="text-right mt-2">
                <span className="text-xs text-white/30 font-mono">{text.length} chars</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-white text-black font-serif italic text-xl hover:bg-gray-100 transition-transform active:scale-[0.98] shadow-lg flex justify-center items-center gap-3 group disabled:opacity-50"
            >
              <span className="group-hover:tracking-widest transition-all duration-300">{btnText}</span>
              {loading && (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              )}
            </button>

            {showOutput && result && (
              <div className="mt-12 text-center">
                <div ref={resultRef} className="p-6 rounded-2xl bg-black/20 border border-white/5">
                  <div className="mb-2 text-xs uppercase tracking-[0.3em] text-white/50">Total Impact</div>

                  <div className={`text-6xl md:text-8xl aura-serif italic mb-6 animate-score drop-shadow-2xl ${result.score.includes('-') ? 'text-red-400' : 'text-gradient'
                    }`}>
                    {result.score}
                  </div>

                  <div className="h-px w-24 bg-white/20 mx-auto mb-6"></div>

                  <div
                    className="prose prose-invert prose-p:text-xl prose-p:font-light prose-p:leading-relaxed mx-auto"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(result.body) as string
                    }}
                  />
                </div>

                <ShareResult
                  contentRef={resultRef}
                  title="aura-check-result"
                  shareText={`My Aura Score: ${result.score}\n\n${result.body.substring(0, 100)}...`}
                  watermark="@InspoaiBox.com"
                  className="bg-transparent border-white/10 mt-8"
                />

                <div className="mt-8">
                  <button
                    onClick={reset}
                    className="text-xs text-white/40 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white/40 pb-1 transition-all"
                  >
                    Check Another Vibe
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  )
}
