"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WordCounterProps {
  toolId: string
  config?: any
}

export default function WordCounter({ toolId, config }: WordCounterProps) {
  const [text, setText] = useState("")
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0
  })
  const [error, setError] = useState("")

  useEffect(() => {
    calculateStats(text)
  }, [text])

  const calculateStats = (input: string) => {
    if (!input.trim()) {
      setStats({
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0
      })
      return
    }

    // 字数统计
    const words = input.trim().split(/\s+/).filter(word => word.length > 0).length

    // 字符统计
    const characters = input.length
    const charactersNoSpaces = input.replace(/\s/g, '').length

    // 句子统计
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0).length

    // 段落统计
    const paragraphs = input.split(/\n\n+/).filter(p => p.trim().length > 0).length

    // 阅读时间（假设每分钟200字）
    const readingTime = Math.ceil(words / 200)

    setStats({
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime
    })
  }

  const handleClear = () => {
    setText("")
    setError("")
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    alert("文本已复制到剪贴板")
  }

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle>输入文本</CardTitle>
          <CardDescription>在下方输入或粘贴您的文本</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入或粘贴您的文本..."
            rows={12}
            className="font-mono"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleClear} variant="outline">
              清除
            </Button>
            <Button onClick={handleCopy} variant="outline" disabled={!text}>
              复制文本
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计结果 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>字数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.words.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>字符数（含空格）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.characters.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>字符数（不含空格）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.charactersNoSpaces.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>句子数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.sentences.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>段落数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.paragraphs.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>阅读时间</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.readingTime} 分钟</div>
          </CardContent>
        </Card>
      </div>

      {/* 使用提示 */}
      <Alert>
        <AlertDescription>
          <strong>使用提示：</strong> 此工具可以帮助您快速统计文本的字数、字符数、句子数和段落数。
          阅读时间基于平均每分钟200字的阅读速度计算。
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
