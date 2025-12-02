'use client'

import { useState, useEffect } from 'react'
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

export default function AuraCheck() {
  const [fp, setFp] = useState<string>()
  const [text, setText] = useState('')
  const [remaining, setRemaining] = useState('--')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [scoreText, setScoreText] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [btnText, setBtnText] = useState('Calculate Aura')

  useEffect(() => {
    generateDeviceFingerprint().then(setFp)
  }, [])

  const checkContentRelevance = (input: string) => {
    const lower = input.toLowerCase()
    const blackList = ['rape', 'murder', 'kill', 'suicide', 'bomb', 'terrorist', 'abuse', 'pedophile']

    for (const word of blackList) {
      if (lower.includes(word)) {
        return { allowed: false, reason: "That's -1,000,000 Aura immediately. We don't do that here." }
      }
    }
    if (input.length < 3) {
      return { allowed: false, reason: "The universe needs more context." }
    }
    return { allowed: true }
  }

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setError("Please describe your action first.")
      return
    }

    const check = checkContentRelevance(trimmed)
    if (!check.allowed) {
      setError(check.reason)
      return
    }

    setError('')
    setLoading(true)
    setBtnText('Reading the stars...')
    setShowOutput(false)

    const longWaitTimer = setTimeout(() => {
      setBtnText('Consulting the oracle...')
    }, 4000)

    try {
      const res = await fetch('/api/ai/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fp || ''
        },
        body: JSON.stringify({
          prompt: `You are 'Aura Check', a mystical vibe calculator for Gen Z.

Task: Analyze the user's action and calculate their "Aura Points" (Social Credit/Coolness Score).

Format:
1. First line: The Score (e.g., "+5000 Aura", "-200 Aura", "Infinite Aura").
2. Second part: A brief, mystical, or funny explanation of why.

Tone: Ethereal, Gen Z slang (but make it sound ancient/mystical), slightly judgmental but funny.

Scoring Guide:
- Cool/Confident/Kind = Positive Aura (+)
- Cringe/Embarrassing/Mean = Negative Aura (-)
- Extremely cool = Infinite Aura

User action: ${trimmed}`,
          toolId: 'aura-check'
        })
      })

      if (!res.ok) throw new Error('The spirits are silent. Try again.')
      const data = await res.json()

      const fullContent = data.response
      const splitIndex = fullContent.indexOf('\n')

      let score = ""
      let body = ""

      if (splitIndex !== -1) {
        score = fullContent.substring(0, splitIndex).trim()
        body = fullContent.substring(splitIndex).trim()
      } else {
        score = "??? Aura"
        body = fullContent
      }

      score = score.replace(/\*\*/g, '').replace(/#/g, '')

      setScoreText(score)
      setBodyText(body)
      setShowOutput(true)

      if (data.usage) {
        setRemaining(data.usage.remaining === -1 ? '∞' : data.usage.remaining.toString())
      }

    } catch (e: any) {
      setError(e.message)
    } finally {
      clearTimeout(longWaitTimer)
      setLoading(false)
      setBtnText('Calculate Aura')
    }
  }

  const reset = () => {
    setText('')
    setShowOutput(false)
    setError('')
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

      <div className="aura-body min-h-screen p-4 sm:p-8 relative overflow-x-hidden">
        <div className="bg-noise"></div>

        <div className="fixed inset-0 overflow-hidden -z-10">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10 pt-10">

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

            {showOutput && (
              <div className="mt-12 text-center">
                <div className="mb-2 text-xs uppercase tracking-[0.3em] text-white/50">Total Impact</div>

                <div className={`text-6xl md:text-8xl aura-serif italic mb-6 animate-score drop-shadow-2xl ${
                  scoreText.includes('-') ? 'text-red-400' : 'text-gradient'
                }`}>
                  {scoreText}
                </div>

                <div className="h-px w-24 bg-white/20 mx-auto mb-6"></div>

                <div
                  className="prose prose-invert prose-p:text-xl prose-p:font-light prose-p:leading-relaxed mx-auto"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(marked.parse(bodyText) as string)
                  }}
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
