"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

interface ReCaptchaProps {
  onVerify: (token: string) => void
  siteKey: string
  action?: string
}

export function ReCaptcha({ onVerify, siteKey, action = "submit" }: ReCaptchaProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!loaded || !siteKey) return

    const executeRecaptcha = async () => {
      try {
        if (typeof window !== "undefined" && (window as any).grecaptcha) {
          const token = await (window as any).grecaptcha.execute(siteKey, { action })
          onVerify(token)
        }
      } catch (error) {
        console.error("reCAPTCHA execution error:", error)
      }
    }

    executeRecaptcha()
  }, [loaded, siteKey, action, onVerify])

  if (!siteKey) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}

interface ReCaptchaV2Props {
  onVerify: (token: string | null) => void
  siteKey: string
}

export function ReCaptchaV2({ onVerify, siteKey }: ReCaptchaV2Props) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!loaded || !siteKey) return

    if (typeof window !== "undefined" && (window as any).grecaptcha) {
      const widgetId = (window as any).grecaptcha.render("recaptcha-container", {
        sitekey: siteKey,
        callback: onVerify,
        "expired-callback": () => onVerify(null),
      })
    }
  }, [loaded, siteKey, onVerify])

  if (!siteKey) {
    return null
  }

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js"
        onLoad={() => setLoaded(true)}
      />
      <div id="recaptcha-container" className="flex justify-center my-4"></div>
    </>
  )
}
