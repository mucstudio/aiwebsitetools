"use client"

import { useEffect, useState } from "react"
import { calculatePasswordStrength, getPasswordStrengthLevel } from "@/lib/password-validator"

interface PasswordStrengthIndicatorProps {
  password: string
  requirements?: string[]
}

export function PasswordStrengthIndicator({ password, requirements = [] }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0)
  const [strengthLevel, setStrengthLevel] = useState(getPasswordStrengthLevel(0))

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setStrengthLevel(getPasswordStrengthLevel(0))
      return
    }

    const newStrength = calculatePasswordStrength(password)
    setStrength(newStrength)
    setStrengthLevel(getPasswordStrengthLevel(newStrength))
  }, [password])

  if (!password) {
    return null
  }

  const getColorClass = () => {
    switch (strengthLevel.color) {
      case "red":
        return "bg-red-500"
      case "orange":
        return "bg-orange-500"
      case "yellow":
        return "bg-yellow-500"
      case "green":
        return "bg-green-500"
      default:
        return "bg-gray-300"
    }
  }

  const getTextColorClass = () => {
    switch (strengthLevel.color) {
      case "red":
        return "text-red-600"
      case "orange":
        return "text-orange-600"
      case "yellow":
        return "text-yellow-600"
      case "green":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600 dark:text-gray-400">Password Strength</span>
          <span className={`font-medium ${getTextColorClass()}`}>
            {strengthLevel.label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getColorClass()}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Password requirements */}
      {requirements.length > 0 && (
        <div className="text-xs space-y-1">
          <p className="text-gray-600 dark:text-gray-400 font-medium">Password Requirements:</p>
          <ul className="space-y-0.5 text-gray-500 dark:text-gray-500">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-gray-400">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
