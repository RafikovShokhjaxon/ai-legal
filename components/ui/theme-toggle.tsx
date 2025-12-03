
"use client"

import React, { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "../../lib/utils"
import { playClickSound } from "../../lib/sound"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn("w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-full", className)} />
  }

  const isDark = resolvedTheme === "dark"

  const handleToggle = () => {
    playClickSound()
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark 
          ? "bg-zinc-950 border border-zinc-800 shadow-inner" 
          : "bg-white border border-zinc-200 shadow-sm",
        className
      )}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="flex justify-between items-center w-full relative overflow-hidden">
        {/* Active Circle */}
        <div
          className={cn(
            "absolute z-10 flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 shadow-sm",
            isDark 
              ? "transform translate-x-0 bg-zinc-800" 
              : "transform translate-x-8 bg-gray-100"
          )}
        >
          {isDark ? (
            <Moon 
              className="w-3.5 h-3.5 text-white" 
              strokeWidth={1.5}
            />
          ) : (
            <Sun 
              className="w-3.5 h-3.5 text-orange-500" 
              strokeWidth={1.5}
            />
          )}
        </div>

        {/* Inactive Icon Backgrounds */}
        <div className="flex w-full justify-between px-1">
             <div className="w-6 flex justify-center">
                 {!isDark && (
                    <Moon className="w-3.5 h-3.5 text-slate-300" strokeWidth={1.5} />
                 )}
             </div>
             <div className="w-6 flex justify-center">
                 {isDark && (
                    <Sun className="w-3.5 h-3.5 text-zinc-700" strokeWidth={1.5} />
                 )}
             </div>
        </div>
      </div>
    </div>
  )
}