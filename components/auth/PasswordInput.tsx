"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showStrength?: boolean
  className?: string
  error?: string
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Enter your password",
  showStrength = false,
  className = "",
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [requirements, setRequirements] = useState<string[]>([])

  useEffect(() => {
    if (showStrength) {
      // Fetch password requirements from API
      fetch("/api/password-requirements")
        .then((res) => res.json())
        .then((data) => {
          if (data.requirements) {
            setRequirements(data.requirements)
          }
        })
        .catch((err) => console.error("Failed to load password requirements:", err))
    }
  }, [showStrength])

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? "border-red-500" : ""
          } ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {showStrength && (
        <PasswordStrengthIndicator password={value} requirements={requirements} />
      )}
    </div>
  )
}
