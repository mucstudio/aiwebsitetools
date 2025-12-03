'use client'

import { useState } from 'react'
import { useToolAction } from '@/hooks/useToolAction'

interface CorporateClapbackProps {
  toolName?: string
  toolDescription?: string
  toolIcon?: string | null
}

export function CorporateClapback({ 
  toolName, 
  toolDescription,
  toolIcon
}: CorporateClapbackProps) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'rage' | 'decode'>('rage')
  const [aggressionLevel, setAggressionLevel] = useState(2)
  const [btnText, setBtnText] = useState('TRANSLATE >>')

  const { execute, result, loading, error, remaining } = useToolAction<string>('corporate-clapback')

  const handleSubmit = async () => {
    if (!text.trim()) return

    setBtnText('PROCESSING...')
    const longWaitTimer = setTimeout(() => {
      setBtnText('CIRCLE BACK...')
    }, 4000)

    try {
      await execute({ text, mode, aggressionLevel })
    } finally {
      clearTimeout(longWaitTimer)
      setBtnText('TRANSLATE >>')
    }
  }

  const getAggressionLabel = () => {
    if (aggressionLevel === 1) return "Polite & Professional"
    if (aggressionLevel === 2) return "Passive Aggressive (Medium)"
    return "Gaslight / HR Violation (Extreme)"
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      alert("Copied to clipboard! Now send it before you regret it.")
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

        .clapback-container { font-family: 'VT323', monospace; background-color: #008080; }
        .clapback-container h1, .win-title { font-family: 'Press Start 2P', cursive; }

        .win98-window {
          background-color: #c0c0c0;
          border-top: 2px solid #dfdfdf;
          border-left: 2px solid #dfdfdf;
          border-right: 2px solid #000000;
          border-bottom: 2px solid #000000;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.5);
        }

        .win98-title-bar {
          background: linear-gradient(90deg, #000080, #1084d0);
          padding: 4px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .win98-btn {
          background-color: #c0c0c0;
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          border-right: 2px solid #000000;
          border-bottom: 2px solid #000000;
          color: black;
          cursor: pointer;
        }
        .win98-btn:active {
          border-top: 2px solid #000000;
          border-left: 2px solid #000000;
          border-right: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
          transform: translate(1px, 1px);
        }

        .win98-input {
          background-color: white;
          border-top: 2px solid #000000;
          border-left: 2px solid #000000;
          border-right: 2px solid #dfdfdf;
          border-bottom: 2px solid #dfdfdf;
          font-family: 'VT323', monospace;
          font-size: 1.25rem;
        }
      `}</style>

      <div className="clapback-container flex-1 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden">

        {/* 桌面图标装饰 */}
        <div className="absolute top-4 left-4 flex flex-col gap-6 pointer-events-none opacity-80">
          <div className="flex flex-col items-center gap-1 w-20">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-xl">🗑️</div>
            <span className="text-white text-xs bg-[#008080] px-1 font-sans">Recycle Bin</span>
          </div>
          <div className="flex flex-col items-center gap-1 w-20">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-xl">💼</div>
            <span className="text-white text-xs bg-[#008080] px-1 font-sans">My Career</span>
          </div>
        </div>

        <div className="w-full max-w-3xl relative z-10">

          {/* 主窗口 */}
          <div className="win98-window p-1">
            <div className="win98-title-bar mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs">📧</span>
                <span className="text-xs font-bold tracking-widest win-title uppercase pt-1">Corporate_Clapback.exe</span>
              </div>
              <div className="flex gap-1">
                <button className="win98-btn w-5 h-5 flex items-center justify-center text-xs font-bold leading-none pb-1">_</button>
                <button className="win98-btn w-5 h-5 flex items-center justify-center text-xs font-bold leading-none pb-1">□</button>
                <button className="win98-btn w-5 h-5 flex items-center justify-center text-xs font-bold leading-none pb-1">×</button>
              </div>
            </div>

            {/* 菜单栏 */}
            <div className="flex gap-4 px-2 mb-4 text-sm border-b border-gray-400 pb-1">
              <span className="underline cursor-pointer">F</span>ile
              <span className="underline cursor-pointer">E</span>dit
              <span className="underline cursor-pointer">V</span>iew
              <span className="underline cursor-pointer">H</span>elp
            </div>

            <div className="p-2 sm:p-4">
              {/* 
                  REMOVED: Internal Title/Description with 'Press Start 2P' font.
                  Now it relies on the page.tsx header for consistency.
              */}

              {/* 模式选择 (Tabs) */}
              <div className="flex gap-1 mb-[-2px] relative z-10 px-2">
                <button
                  onClick={() => setMode('rage')}
                  className={`win98-btn px-4 py-2 relative top-[2px] ${
                    mode === 'rage' ? 'font-bold z-20 border-b-0 bg-[#c0c0c0]' : 'text-gray-600'
                  }`}
                >
                  Rage -&gt; Pro
                </button>
                <button
                  onClick={() => setMode('decode')}
                  className={`win98-btn px-4 py-2 relative top-[2px] ${
                    mode === 'decode' ? 'font-bold z-20 border-b-0 bg-[#c0c0c0]' : 'text-gray-600'
                  }`}
                >
                  BS Decoder
                </button>
              </div>

              {/* 内容区域 */}
              <div className="border-2 border-white border-r-gray-500 border-b-gray-500 p-6 bg-[#c0c0c0] shadow-inner">

                {/* 剩余次数 */}
                <div className="flex justify-end mb-2">
                  <span className="text-sm bg-black text-[#39ff14] px-2 py-1 font-mono border border-gray-500">
                    CREDITS: {remaining ?? '--'}
                  </span>
                </div>

                {/* 输入框 */}
                <div className="mb-4">
                  <label className="block text-lg mb-2 font-bold">
                    {mode === 'rage' ? 'What do you REALLY want to say?' : 'Paste the Corporate BS here:'}
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    placeholder={
                      mode === 'rage'
                        ? "e.g. 'Stop emailing me at 3am you psychopath.'"
                        : "e.g. 'We are rightsizing the organization to optimize synergy.'"
                    }
                    spellCheck={false}
                    className="win98-input w-full p-3 focus:outline-none resize-none text-black"
                  />
                </div>

                {/* 调节滑块 (仅在 Rage 模式显示) */}
                {mode === 'rage' && (
                  <div className="mb-6 px-1">
                    <label className="block text-sm mb-1 flex justify-between">
                      <span>Aggression Level:</span>
                      <span className="font-bold text-red-800">{getAggressionLabel()}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      value={aggressionLevel}
                      onChange={(e) => setAggressionLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border border-black"
                    />
                    <div className="flex justify-between text-xs mt-1 font-mono">
                      <span>Polite</span>
                      <span>Passive Aggressive</span>
                      <span>Gaslight Gatekeep</span>
                    </div>
                  </div>
                )}

                {/* 错误提示 */}
                {error && (
                  <div className="mb-4 bg-red-100 border-2 border-red-500 p-2 text-red-700 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* 按钮 */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setText('')
                      window.location.reload()
                    }}
                    className="win98-btn px-6 py-2"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="win98-btn px-6 py-2 font-bold flex items-center gap-2 active:bg-gray-400 disabled:opacity-50"
                  >
                    <span>{btnText}</span>
                    {loading && (
                      <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </button>
                </div>

                {/* 输出区域 */}
                {result && (
                  <div className="mt-6">
                    <div className="win98-title-bar text-sm mb-1">
                      <span>Message_Preview.txt</span>
                      <button className="win98-btn w-4 h-4 flex items-center justify-center text-[10px] leading-none text-black">×</button>
                    </div>
                    <div className="bg-white border-2 border-black border-r-gray-200 border-b-gray-200 p-4 text-black text-xl font-medium leading-relaxed relative">
                      <div>{result}</div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={copyToClipboard}
                          className="win98-btn px-3 py-1 text-sm flex gap-1 items-center"
                        >
                          <span>📋</span> Copy to Clipboard
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* 底部状态栏 */}
              <div className="mt-2 border-t border-gray-400 pt-1 flex justify-between text-xs text-gray-600">
                <span>Ready</span>
                <span>Ln 1, Col 1</span>
              </div>
            </div>
          </div>

          {/* 弹窗彩蛋 (装饰用) */}
          <div className="absolute -right-12 top-20 w-48 win98-window p-1 hidden lg:block transform rotate-6 opacity-80 pointer-events-none">
            <div className="win98-title-bar bg-red-800 text-[10px] py-0.5">
              <span>Alert</span>
              <button className="win98-btn w-3 h-3 text-[8px] flex items-center justify-center pb-1">×</button>
            </div>
            <div className="p-2 text-xs text-center">
              <p className="mb-2">Meeting starting in 5 min</p>
              <button className="win98-btn px-2 text-[10px]">Ignore</button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}