'use client'

import { useState } from 'react'
import { useToolAction } from '@/hooks/useToolAction'
import { marked } from 'marked'

interface DreamStreamProps {
  toolId: string
  config?: any
}

type InterpretationMode = 'mystical' | 'psych' | 'unhinged'

export default function DreamStream({ toolId }: DreamStreamProps) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<InterpretationMode>('mystical')
  const [showOutput, setShowOutput] = useState(false)
  const [btnText, setBtnText] = useState('Decode Dream')
  const [luckyNumbers, setLuckyNumbers] = useState('')

  const { execute, result, loading, error, remaining } = useToolAction<string>('dream-stream')

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }

    if (trimmed.length < 5) {
      return
    }

    setBtnText('ENTERING R.E.M. CYCLE...')
    setShowOutput(false)

    const longWaitTimer = setTimeout(() => {
      setBtnText('CONSULTING FREUD...')
    }, 4000)

    try {
      // Generate lucky numbers
      const nums = Array.from({length: 5}, () => Math.floor(Math.random() * 60) + 1).join(' - ')
      setLuckyNumbers(nums + " - " + (Math.floor(Math.random() * 10) + 1))

      await execute({ dream: trimmed, mode })
      setShowOutput(true)
    } finally {
      clearTimeout(longWaitTimer)
      setBtnText('Decode Dream')
    }
  }

  const reset = () => {
    setText('')
    setShowOutput(false)
    setBtnText('Decode Dream')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Quicksand:wght@300;500;700&display=swap');

        .dream-body {
          font-family: 'Quicksand', sans-serif;
          background: linear-gradient(180deg, #2e0249 0%, #570a57 50%, #a91079 100%);
          color: #f3e8ff;
          min-height: 100vh;
        }
        .dream-font { font-family: 'Dela Gothic One', cursive; }

        .lava-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          background: #ff00cc;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.7;
          animation: float 20s infinite ease-in-out alternate;
        }
        .blob:nth-child(1) { width: 400px; height: 400px; top: -100px; left: -100px; background: #581c87; animation-delay: 0s; }
        .blob:nth-child(2) { width: 300px; height: 300px; top: 40%; right: -50px; background: #a21caf; animation-delay: -5s; }
        .blob:nth-child(3) { width: 350px; height: 350px; bottom: -50px; left: 20%; background: #ec4899; animation-delay: -10s; }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 50px) scale(1.1); }
          100% { transform: translate(-20px, -30px) scale(0.9); }
        }

        .dream-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          border-radius: 24px;
        }

        .dream-input {
          background: rgba(0, 0, 0, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: white;
          transition: all 0.3s;
        }
        .dream-input:focus {
          outline: none;
          background: rgba(0, 0, 0, 0.3);
          border-color: #f0abfc;
          box-shadow: 0 0 20px rgba(240, 171, 252, 0.2);
        }
        .dream-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .btn-dream {
          background: linear-gradient(90deg, #a91079, #ff00cc);
          border: none;
          color: white;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        .btn-dream::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: 0.5s;
        }
        .btn-dream:hover::before {
          left: 100%;
        }
        .btn-dream:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(169, 16, 121, 0.4);
        }

        .filter-btn {
          background: rgba(0, 0, 0, 0.2);
          color: #f3e8ff;
        }
        .filter-btn.active {
          background-color: #f0abfc;
          color: #2e0249;
          font-weight: bold;
        }
      `}</style>

      <div className="dream-body w-screen -ml-[50vw] left-1/2 relative p-4 sm:p-8 overflow-hidden selection:bg-fuchsia-300 selection:text-purple-900">

        {/* 液态背景 */}
        <div className="lava-container">
          <div className="blob"></div>
          <div className="blob"></div>
          <div className="blob"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10 pt-10">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-2 text-2xl animate-bounce">🌙</div>
            <h1 className="dream-font text-5xl md:text-7xl text-white mb-4 tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              DREAM STREAM
            </h1>
            <p className="text-fuchsia-200 text-lg font-medium bg-purple-900/30 inline-block px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
              Unlock the secrets of your subconscious mind.
            </p>
          </div>

          {/* Main Card */}
          <div className="dream-card p-6 md:p-10 relative overflow-hidden">

            {/* 装饰光效 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

            {/* 剩余次数 */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-200">System Awake</span>
              </div>
              <div className="text-xs bg-black/20 px-3 py-1 rounded-full border border-white/10 text-fuchsia-100">
                Visions Left: <span className="font-bold">{remaining}</span>
              </div>
            </div>

            {/* 模式选择 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-fuchsia-100 mb-3 uppercase tracking-wider text-center">
                Select Interpretation Lens
              </label>
              <div className="flex justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setMode('mystical')}
                  className={`filter-btn px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm ${mode === 'mystical' ? 'active' : ''}`}
                >
                  🔮 Mystical
                </button>
                <button
                  onClick={() => setMode('psych')}
                  className={`filter-btn px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm ${mode === 'psych' ? 'active' : ''}`}
                >
                  🧠 Psychological
                </button>
                <button
                  onClick={() => setMode('unhinged')}
                  className={`filter-btn px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm ${mode === 'unhinged' ? 'active' : ''}`}
                >
                  🤪 Unhinged
                </button>
              </div>
            </div>

            {/* 输入区域 */}
            <div className="mb-8">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="I was flying over a city made of cheese, but my teeth started falling out..."
                spellCheck={false}
                className="dream-input w-full p-5 text-lg placeholder-white/30 resize-none"
              />
              <div className="text-right mt-2 text-xs text-white/40">
                Be descriptive. The void listens.
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-red-100 text-sm font-bold text-center backdrop-blur-sm">
                🚫 Nightmare Detected: {error}
              </div>
            )}

            {/* 按钮 */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-dream w-full py-4 rounded-xl font-bold text-xl uppercase tracking-widest shadow-lg flex justify-center items-center gap-3 disabled:opacity-50"
            >
              <span>{btnText}</span>
              {loading && (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              )}
            </button>

            {/* 输出区域 */}
            {showOutput && result && (
              <div className="mt-10">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="h-px bg-white/20 w-16"></div>
                  <span className="text-fuchsia-300 font-bold uppercase text-sm tracking-widest">Interpretation</span>
                  <div className="h-px bg-white/20 w-16"></div>
                </div>

                <div className="bg-black/20 rounded-2xl p-6 border border-white/10 shadow-inner">
                  <div
                    className="prose prose-invert prose-p:text-fuchsia-50 prose-strong:text-fuchsia-300 max-w-none leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(result) as string
                    }}
                  />
                </div>

                {/* 幸运数字 */}
                <div className="mt-6 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Cosmic Lucky Numbers</span>
                  <div className="flex gap-3 font-mono text-lg font-bold text-fuchsia-300">
                    {luckyNumbers}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={reset}
                    className="text-sm text-white/50 hover:text-white transition-colors border-b border-white/20 hover:border-white pb-1"
                  >
                    Wake Up & Dream Again
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="text-center mt-12 opacity-30 text-xs uppercase tracking-[0.3em]">
            Project: Somnium • v3.0
          </div>

        </div>
      </div>
    </>
  )
}
