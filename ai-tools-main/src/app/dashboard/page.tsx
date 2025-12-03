'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { User, CreditCard, Heart, TrendingUp, Calendar, Crown, Zap, Edit2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  id: number
  email: string
  name?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  tiktok?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  linkedin?: string
  website?: string
  bio?: string
  membershipTier: string
  usageCount: number
  usageLimit: number
  usageResetDate: string
  subscription: {
    name: string
    tier: string
    price: number
    billingCycle: string
    features: string[]
  } | null
  favorites: Array<{
    id: number
    name: string
    slug: string
    icon?: string
    description?: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    tiktok: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    website: '',
    bio: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [countrySearchQuery, setCountrySearchQuery] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  // 世界主要国家列表
  const countries = [
    'United States', 'China', 'Japan', 'Germany', 'United Kingdom', 'France', 'India', 'Italy', 'Brazil', 'Canada',
    'South Korea', 'Russia', 'Spain', 'Australia', 'Mexico', 'Indonesia', 'Netherlands', 'Saudi Arabia', 'Turkey', 'Switzerland',
    'Poland', 'Belgium', 'Sweden', 'Ireland', 'Austria', 'Norway', 'Israel', 'United Arab Emirates', 'Singapore', 'Denmark',
    'Malaysia', 'Hong Kong', 'Philippines', 'Bangladesh', 'Egypt', 'Pakistan', 'Vietnam', 'Chile', 'Czech Republic', 'Romania',
    'Portugal', 'Peru', 'New Zealand', 'Greece', 'Qatar', 'Finland', 'Iraq', 'Algeria', 'Kazakhstan', 'Hungary',
    'Kuwait', 'Morocco', 'Slovakia', 'Ecuador', 'Puerto Rico', 'Kenya', 'Ethiopia', 'Dominican Republic', 'Guatemala', 'Oman',
    'Luxembourg', 'Panama', 'Bulgaria', 'Ghana', 'Croatia', 'Belarus', 'Costa Rica', 'Uruguay', 'Lebanon', 'Slovenia',
    'Lithuania', 'Serbia', 'Azerbaijan', 'Myanmar', 'Ivory Coast', 'Jordan', 'Bolivia', 'Cameroon', 'Bahrain', 'Latvia',
    'Paraguay', 'Uganda', 'Estonia', 'Nepal', 'El Salvador', 'Honduras', 'Cyprus', 'Senegal', 'Cambodia', 'Iceland',
    'Trinidad and Tobago', 'Zimbabwe', 'Bosnia and Herzegovina', 'Libya', 'Afghanistan', 'Zambia', 'Georgia', 'Albania', 'Malta', 'Mauritius',
    'Mongolia', 'Armenia', 'Jamaica', 'Burkina Faso', 'Namibia', 'Nicaragua', 'Macedonia', 'Botswana', 'Mali', 'Madagascar',
    'Mozambique', 'Brunei', 'Gabon', 'Bahamas', 'Benin', 'Niger', 'Rwanda', 'Guinea', 'Barbados', 'Tajikistan',
    'Haiti', 'Congo', 'Malawi', 'Mauritania', 'Kyrgyzstan', 'Togo', 'Fiji', 'Montenegro', 'Suriname', 'Liberia',
    'Sierra Leone', 'Andorra', 'Burundi', 'Maldives', 'Belize', 'Lesotho', 'Guyana', 'Somalia', 'Timor-Leste', 'Cape Verde'
  ]

  // 过滤国家列表
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearchQuery.toLowerCase())
  )

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user/me')
      const data = await response.json()

      if (!data.authenticated) {
        router.push('/login')
        return
      }

      setUser(data.user)
      setEditForm({
        name: data.user.name || '',
        email: data.user.email,
        phone: data.user.phone || '',
        address: data.user.address || '',
        city: data.user.city || '',
        country: data.user.country || 'United States',
        tiktok: data.user.tiktok || '',
        instagram: data.user.instagram || '',
        facebook: data.user.facebook || '',
        twitter: data.user.twitter || '',
        youtube: data.user.youtube || '',
        linkedin: data.user.linkedin || '',
        website: data.user.website || '',
        bio: data.user.bio || ''
      })
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/user/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setError('')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setError('')
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'United States',
        tiktok: user.tiktok || '',
        instagram: user.instagram || '',
        facebook: user.facebook || '',
        twitter: user.twitter || '',
        youtube: user.youtube || '',
        linkedin: user.linkedin || '',
        website: user.website || '',
        bio: user.bio || ''
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      setError('Name cannot be empty')
      return
    }

    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
          address: editForm.address.trim(),
          city: editForm.city.trim(),
          country: editForm.country.trim(),
          tiktok: editForm.tiktok.trim(),
          instagram: editForm.instagram.trim(),
          facebook: editForm.facebook.trim(),
          twitter: editForm.twitter.trim(),
          youtube: editForm.youtube.trim(),
          linkedin: editForm.linkedin.trim(),
          website: editForm.website.trim(),
          bio: editForm.bio.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Refresh user data
      await checkAuth()
      setIsEditing(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const removeFavorite = async (toolId: number) => {
    try {
      const response = await fetch(`/api/user/favorites?toolId=${toolId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh user data
        checkAuth()
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <LoadingSpinner />
        </main>
        <Footer />
      </>
    )
  }

  if (!user) {
    return null
  }

  const usagePercentage = user.usageLimit === -1 ? 0 : (user.usageCount / user.usageLimit) * 100
  const remainingUses = user.usageLimit === -1 ? 'Unlimited' : user.usageLimit - user.usageCount

  return (
    <>
      <Header />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage your account and view your activity</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>

                    {isEditing ? (
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Basic Info */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="your@email.com"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="+1 234 567 8900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                            <input
                              type="text"
                              value={editForm.city}
                              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="New York"
                            />
                          </div>
                          <div className="relative">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
                            <input
                              type="text"
                              value={editForm.country}
                              onChange={(e) => {
                                setEditForm({ ...editForm, country: e.target.value })
                                setCountrySearchQuery(e.target.value)
                                setShowCountryDropdown(true)
                              }}
                              onFocus={() => {
                                setCountrySearchQuery(editForm.country)
                                setShowCountryDropdown(true)
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Search country..."
                            />
                            {showCountryDropdown && filteredCountries.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredCountries.map((country) => (
                                  <button
                                    key={country}
                                    type="button"
                                    onClick={() => {
                                      setEditForm({ ...editForm, country })
                                      setShowCountryDropdown(false)
                                      setCountrySearchQuery('')
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors ${
                                      editForm.country === country ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-700'
                                    }`}
                                  >
                                    {country}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                            <input
                              type="text"
                              value={editForm.address}
                              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="123 Main Street"
                            />
                          </div>

                          {/* Social Media */}
                          <div className="md:col-span-2 mt-2">
                            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                              <span className="text-purple-600">🌐</span> Social Media
                            </h4>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">TikTok</label>
                            <input
                              type="text"
                              value={editForm.tiktok}
                              onChange={(e) => setEditForm({ ...editForm, tiktok: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="@username or URL"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Instagram</label>
                            <input
                              type="text"
                              value={editForm.instagram}
                              onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="@username or URL"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Facebook</label>
                            <input
                              type="text"
                              value={editForm.facebook}
                              onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Profile URL"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Twitter/X</label>
                            <input
                              type="text"
                              value={editForm.twitter}
                              onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="@username or URL"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">YouTube</label>
                            <input
                              type="text"
                              value={editForm.youtube}
                              onChange={(e) => setEditForm({ ...editForm, youtube: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Channel URL"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn</label>
                            <input
                              type="text"
                              value={editForm.linkedin}
                              onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Profile URL"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Website</label>
                            <input
                              type="url"
                              value={editForm.website}
                              onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
                            <textarea
                              value={editForm.bio}
                              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Tell us about yourself..."
                              rows={3}
                            />
                          </div>
                        </div>
                        {error && (
                          <p className="text-sm text-red-600 mt-3">{error}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {user.name || 'User'}
                        </h2>
                        <p className="text-gray-600">{user.email}</p>
                        {user.city && user.country && (
                          <p className="text-sm text-gray-500 mt-1">📍 {user.city}, {user.country}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleEditClick}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Membership Badge */}
                <div className="flex items-center gap-2">
                  {user.membershipTier === 'FREE' && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      Free Member
                    </span>
                  )}
                  {user.membershipTier === 'PREMIUM' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold flex items-center gap-1 shadow-md">
                      <Crown className="w-4 h-4" />
                      Premium Member
                    </span>
                  )}
                  {user.membershipTier === 'ENTERPRISE' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-bold flex items-center gap-1 shadow-md">
                      <Zap className="w-4 h-4" />
                      Enterprise Member
                    </span>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Usage Statistics
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Monthly Usage</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {user.usageCount} / {user.usageLimit === -1 ? '∞' : user.usageLimit}
                      </span>
                    </div>
                    {user.usageLimit !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            usagePercentage > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            usagePercentage > 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Remaining Uses</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {remainingUses}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Resets On</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.usageResetDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {user.membershipTier === 'FREE' && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                    <p className="text-sm text-purple-900 mb-2">
                      <strong>Upgrade to Premium</strong> for 10x more uses!
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-bold"
                    >
                      View Plans →
                    </Link>
                  </div>
                )}
              </div>

              {/* Favorites */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Favorite Tools ({user.favorites.length})
                </h3>

                {user.favorites.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {user.favorites.map((tool) => (
                      <div
                        key={tool.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {tool.icon && <span className="text-xl">{tool.icon}</span>}
                            <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                          </div>
                          <button
                            onClick={() => removeFavorite(tool.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove from favorites"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        {tool.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {tool.description}
                          </p>
                        )}
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                        >
                          Open Tool →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No favorite tools yet</p>
                    <Link
                      href="/tools"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      Browse Tools
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Subscription */}
            <div className="space-y-6">
              {/* Subscription Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Subscription
                </h3>

                {user.subscription ? (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        {user.subscription.name}
                      </h4>
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ${user.subscription.price}
                        <span className="text-sm text-gray-600 font-normal">
                          /{user.subscription.billingCycle.toLowerCase()}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-2 mb-6">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Features:</p>
                      {user.subscription.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {user.membershipTier !== 'ENTERPRISE' && (
                      <Link
                        href="/pricing"
                        className="block w-full text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                      >
                        Upgrade Plan
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">No active subscription</p>
                    <Link
                      href="/pricing"
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      View Plans
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/tools"
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 rounded-xl transition-all font-medium"
                  >
                    Browse Tools
                  </Link>
                  <Link
                    href="/pricing"
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 rounded-xl transition-all font-medium"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
