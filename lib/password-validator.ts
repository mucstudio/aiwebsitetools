import { getSecuritySettings } from "@/lib/settings"

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate password against security policy
 */
export async function validatePassword(password: string): Promise<PasswordValidationResult> {
  const settings = await getSecuritySettings()
  const errors: string[] = []

  // Check minimum length
  if (password.length < settings.passwordMinLength) {
    errors.push(`Password must be at least ${settings.passwordMinLength} characters`)
  }

  // Check uppercase letters
  if (settings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)")
  }

  // Check lowercase letters
  if (settings.passwordRequireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)")
  }

  // Check numbers
  if (settings.passwordRequireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number (0-9)")
  }

  // Check special characters
  if (settings.passwordRequireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*, etc.)")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get password policy description (for frontend display)
 */
export async function getPasswordRequirements(): Promise<string[]> {
  const settings = await getSecuritySettings()
  const requirements: string[] = []

  requirements.push(`At least ${settings.passwordMinLength} characters`)

  if (settings.passwordRequireUppercase) {
    requirements.push("Contains uppercase letter (A-Z)")
  }

  if (settings.passwordRequireLowercase) {
    requirements.push("Contains lowercase letter (a-z)")
  }

  if (settings.passwordRequireNumbers) {
    requirements.push("Contains number (0-9)")
  }

  if (settings.passwordRequireSpecial) {
    requirements.push("Contains special character (!@#$%^&*, etc.)")
  }

  return requirements
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0

  // Length score (max 40 points)
  strength += Math.min(password.length * 4, 40)

  // Uppercase letters (10 points)
  if (/[A-Z]/.test(password)) {
    strength += 10
  }

  // Lowercase letters (10 points)
  if (/[a-z]/.test(password)) {
    strength += 10
  }

  // Numbers (10 points)
  if (/\d/.test(password)) {
    strength += 10
  }

  // Special characters (20 points)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 20
  }

  // Bonus for mixed character types (10 points)
  const types = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=\[\];':"\\|,.<>\/?]/.test(password),
  ].filter(Boolean).length

  if (types >= 3) {
    strength += 10
  }

  return Math.min(strength, 100)
}

/**
 * Get password strength level
 */
export function getPasswordStrengthLevel(strength: number): {
  level: "weak" | "fair" | "good" | "strong"
  label: string
  color: string
} {
  if (strength < 30) {
    return { level: "weak", label: "Weak", color: "red" }
  } else if (strength < 60) {
    return { level: "fair", label: "Fair", color: "orange" }
  } else if (strength < 80) {
    return { level: "good", label: "Good", color: "yellow" }
  } else {
    return { level: "strong", label: "Strong", color: "green" }
  }
}
