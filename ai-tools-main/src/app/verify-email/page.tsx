'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Please check your email and try again.')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/user/verify-email?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to verify email. The link may have expired.')
      }
    } catch (error) {
      console.error('Error verifying email:', error)
      setStatus('error')
      setMessage('An error occurred while verifying your email. Please try again.')
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              {status === 'loading' && (
                <>
                  <div className="mb-6">
                    <LoadingSpinner />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Verifying Your Email
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we verify your email address...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Email Verified!
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {message}
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting you to your dashboard...
                  </p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Verification Failed
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {message}
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/register"
                      className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Register Again
                    </Link>
                    <Link
                      href="/login"
                      className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back to Login
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Need Help?</h3>
                </div>
                <p className="text-sm text-blue-800">
                  If you're having trouble verifying your email, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="mb-6">
                  <LoadingSpinner />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Loading...
                </h1>
                <p className="text-gray-600">
                  Please wait...
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
