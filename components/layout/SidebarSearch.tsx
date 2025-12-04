"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Tool {
  id: string
  name: string
  slug: string
  description: string
  icon: string | null
}

export function SidebarSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const searchTools = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/tools/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.tools)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchTools, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (slug: string) => {
    setOpen(false)
    router.push(`/tools/${slug}`)
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tools... (⌘K)"
          className="pl-9 bg-muted/50 cursor-pointer"
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                placeholder="Type to search tools..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto p-2">
            {results.length === 0 && query && !loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No tools found.
              </div>
            )}

            {results.length === 0 && !query && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type to search for tools...
              </div>
            )}

            <div className="space-y-1">
              {results.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.slug)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground group-hover:text-primary">
                    {tool.icon ? (
                      <span className="text-lg">{tool.icon}</span>
                    ) : (
                      <Command className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{tool.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {tool.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground flex justify-between">
            <span>Press ESC to close</span>
            <span>{results.length} results</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}