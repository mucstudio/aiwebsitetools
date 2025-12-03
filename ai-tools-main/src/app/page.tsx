'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Sparkles, Zap, Brain, Rocket, Star, ArrowRight,
  Check, TrendingUp, Users, Shield, Infinity
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [animatedCount, setAnimatedCount] = useState(0)

  useEffect(() => {
    checkAuth()
    // Animate counter
    const interval = setInterval(() => {
      setAnimatedCount(prev => (prev < 1000 ? prev + 50 : 1000))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user/me')
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section - 动态渐变背景 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20 md:py-32">
          {/* 动态背景装饰 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-8 border border-purple-100">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI-Powered Tools Platform
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
                Unleash Your Creativity
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  with AI Magic
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                From savage AI roasts to powerful productivity tools.
                Experience the future of online tools, powered by cutting-edge AI.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link
                  href="/tools"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Explore AI Tools
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {!isAuthenticated && (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300"
                  >
                    <Star className="w-5 h-5" />
                    View Pricing
                  </Link>
                )}
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span><strong className="text-gray-900">{animatedCount}+</strong> Happy Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span><strong className="text-gray-900">4.9/5</strong> Rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Tools Preview */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Trending AI Tools
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our most popular AI-powered tools that users love
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Tool Card 1 */}
              <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                   onClick={() => router.push('/tools')}>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">HOT</span>
                </div>
                <div className="text-5xl mb-4">🔥</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Roaster</h3>
                <p className="text-gray-600 mb-4">Get hilariously roasted by our savage AI. No mercy mode activated!</p>
                <div className="flex items-center gap-2 text-sm text-purple-600 font-semibold">
                  Try it now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Tool Card 2 */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                   onClick={() => router.push('/tools')}>
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Chat Assistant</h3>
                <p className="text-gray-600 mb-4">Your intelligent companion for brainstorming and problem-solving.</p>
                <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                  Start chatting <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Tool Card 3 */}
              <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                   onClick={() => router.push('/tools')}>
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Content Generator</h3>
                <p className="text-gray-600 mb-4">Create engaging content in seconds with AI-powered generation.</p>
                <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                  Generate now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                View all {animatedCount > 0 ? Math.floor(animatedCount / 100) : 10}+ tools
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Why Users Love Us
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built for creators, powered by AI, loved by thousands
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-gray-600">
                  Cutting-edge AI models for intelligent, context-aware results
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Get instant results with our optimized AI infrastructure
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Private</h3>
                <p className="text-gray-600">
                  Your data is encrypted and never shared with third parties
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Always Improving</h3>
                <p className="text-gray-600">
                  New tools and features added regularly based on feedback
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Infinity className="w-5 h-5" />
                <span className="font-semibold">Unlimited Possibilities</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to Unlock Full Power?
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                Join thousands of creators who've upgraded to premium.
                Get unlimited access to all AI tools, priority support, and exclusive features.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Star className="w-5 h-5" />
                  View Plans & Pricing
                </Link>

                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                >
                  Try Free Tools First
                </Link>
              </div>

              {/* Features List */}
              <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Unlimited AI Requests</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Priority Processing</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                Start Creating Magic Today
              </h2>
              <p className="text-xl text-gray-600 mb-10">
                Join our community and experience the power of AI-driven tools
              </p>
              <Link
                href={isAuthenticated ? "/tools" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5" />
                {isAuthenticated ? "Browse Tools" : "Get Started Free"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  )
}
