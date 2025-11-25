"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ variant = "default" }) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldDark = stored ? stored === "dark" : prefersDark
    setIsDark(shouldDark)
    document.documentElement.classList.toggle("dark", shouldDark)
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  if (!mounted) return null

  if (variant === "switch") {
    return (
      <button
        onClick={toggle}
        className={cn(
          "relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2",
          isDark
            ? "bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-200 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
            : "bg-slate-200/80 dark:bg-slate-600/40"
        )}
        aria-label="Toggle theme"
        role="switch"
        aria-checked={isDark}
      >
        <span
          className={cn(
            "inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white text-[10px] font-semibold text-slate-500 shadow-md transition-all",
            isDark ? "translate-x-6 text-amber-500" : "translate-x-1 text-emerald-500"
          )}
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </span>
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={toggle}
      className={cn(
        "rounded-full border border-transparent px-2 py-2 transition-all",
        isDark
          ? "bg-gradient-to-r from-emerald-300/40 to-cyan-300/40 text-amber-100 hover:from-emerald-300/60 hover:to-cyan-300/60"
          : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/80"
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}



