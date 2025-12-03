'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Cancel Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-orange-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
              <p className="text-lg text-gray-600 mb-8">
                Your payment was cancelled. No charges have been made to your account.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Pricing
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Browse Free Tools
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  If you encountered any issues during the payment process, please don't hesitate to contact our support team.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-900 mb-2">Common Issues:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Payment method declined - Try a different card</li>
                    <li>Insufficient funds - Check your account balance</li>
                    <li>Technical error - Refresh and try again</li>
                  </ul>
                </div>
                <p className="text-center pt-4">
                  <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                    Contact Support →
                  </Link>
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
