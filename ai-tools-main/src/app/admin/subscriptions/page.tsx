'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { CreditCard, Plus, Edit, Trash2, Users, Crown, Star, Zap, X, TrendingUp, DollarSign, Package, Filter, Download, Copy, CheckCircle } from 'lucide-react'

interface Subscription {
  id: number
  name: string
  tier: string
  price: number
  currency: string
  billingCycle: string
  usageLimit: number
  features: string[]
  isActive: boolean
  usersCount: number
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalSubscriptions: number
  activeSubscriptions: number
  totalUsers: number
  totalRevenue: number
}

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [filterTier, setFilterTier] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<Stats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalUsers: 0,
    totalRevenue: 0
  })
  const [formData, setFormData] = useState({
    name: '',
    tier: 'FREE',
    price: 0,
    currency: 'USD',
    billingCycle: 'MONTHLY',
    usageLimit: 50,
    features: [''],
    isActive: true
  })

  useEffect(() => {
    checkAuth()
    fetchSubscriptions()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      if (!data.authenticated) {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions')

      if (!response.ok) {
        console.error('Failed to fetch subscriptions:', response.status)
        setSubscriptions([])
        return
      }

      const data = await response.json()
      const subs = data.subscriptions || []
      setSubscriptions(subs)
      setFilteredSubscriptions(subs)

      // Calculate stats
      const totalUsers = subs.reduce((sum: number, sub: Subscription) => sum + sub.usersCount, 0)
      const totalRevenue = subs.reduce((sum: number, sub: Subscription) => {
        if (sub.billingCycle === 'MONTHLY') {
          return sum + (sub.price * sub.usersCount * 12) // Annualized
        } else if (sub.billingCycle === 'YEARLY') {
          return sum + (sub.price * sub.usersCount)
        }
        return sum
      }, 0)

      setStats({
        totalSubscriptions: subs.length,
        activeSubscriptions: subs.filter((s: Subscription) => s.isActive).length,
        totalUsers,
        totalRevenue
      })
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  // Filter subscriptions
  useEffect(() => {
    let filtered = subscriptions

    // Filter by tier
    if (filterTier !== 'ALL') {
      filtered = filtered.filter(sub => sub.tier === filterTier)
    }

    // Filter by status
    if (filterStatus === 'ACTIVE') {
      filtered = filtered.filter(sub => sub.isActive)
    } else if (filterStatus === 'INACTIVE') {
      filtered = filtered.filter(sub => !sub.isActive)
    }

    // Search by name
    if (searchQuery.trim()) {
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, filterTier, filterStatus, searchQuery])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return

    try {
      const response = await fetch(`/api/admin/subscriptions?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSubscriptions()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete subscription')
      }
    } catch (error) {
      console.error('Error deleting subscription:', error)
      alert('Failed to delete subscription')
    }
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setFormData({
      name: subscription.name,
      tier: subscription.tier,
      price: subscription.price,
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      usageLimit: subscription.usageLimit,
      features: subscription.features,
      isActive: subscription.isActive
    })
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingSubscription(null)
    setFormData({
      name: '',
      tier: 'FREE',
      price: 0,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      usageLimit: 50,
      features: [''],
      isActive: true
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    // Validate
    if (!formData.name || !formData.tier || !formData.billingCycle) {
      alert('Please fill in all required fields')
      return
    }

    // Filter out empty features
    const features = formData.features.filter(f => f.trim() !== '')
    if (features.length === 0) {
      alert('Please add at least one feature')
      return
    }

    try {
      const url = editingSubscription ? '/api/admin/subscriptions' : '/api/admin/subscriptions'
      const method = editingSubscription ? 'PUT' : 'POST'
      const body = editingSubscription
        ? { id: editingSubscription.id, ...formData, features }
        : { ...formData, features }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        setShowModal(false)
        setEditingSubscription(null)
        fetchSubscriptions()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save subscription')
      }
    } catch (error) {
      console.error('Error saving subscription:', error)
      alert('Failed to save subscription')
    }
  }

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    })
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({
      ...formData,
      features: newFeatures
    })
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return <Star className="w-5 h-5 text-gray-500" />
      case 'PREMIUM':
        return <Crown className="w-5 h-5 text-purple-500" />
      case 'ENTERPRISE':
        return <Zap className="w-5 h-5 text-blue-500" />
      default:
        return <Star className="w-5 h-5 text-gray-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'from-gray-500 to-gray-600'
      case 'PREMIUM':
        return 'from-purple-500 to-pink-500'
      case 'ENTERPRISE':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  // Subscription templates
  const templates = [
    {
      name: 'Free Plan',
      tier: 'FREE',
      price: 0,
      currency: 'USD',
      billingCycle: 'FREE',
      usageLimit: 50,
      features: [
        'Access to basic tools',
        '50 uses per month',
        'Community support',
        'Basic analytics'
      ],
      isActive: true
    },
    {
      name: 'Premium Monthly',
      tier: 'PREMIUM',
      price: 9.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      usageLimit: 500,
      features: [
        'Access to all tools',
        '500 uses per month',
        'Priority support',
        'Advanced analytics',
        'No ads',
        'Export data'
      ],
      isActive: true
    },
    {
      name: 'Premium Yearly',
      tier: 'PREMIUM',
      price: 99.99,
      currency: 'USD',
      billingCycle: 'YEARLY',
      usageLimit: 500,
      features: [
        'Access to all tools',
        '500 uses per month',
        'Priority support',
        'Advanced analytics',
        'No ads',
        'Export data',
        '2 months free (save 17%)'
      ],
      isActive: true
    },
    {
      name: 'Enterprise',
      tier: 'ENTERPRISE',
      price: 299.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      usageLimit: -1,
      features: [
        'Unlimited uses',
        'Access to all tools',
        'Dedicated support',
        'Custom integrations',
        'API access',
        'White-label options',
        'Team management',
        'Advanced security'
      ],
      isActive: true
    }
  ]

  const handleUseTemplate = (template: any) => {
    setFormData(template)
    setShowTemplateModal(false)
    setShowModal(true)
  }

  const handleDuplicate = (subscription: Subscription) => {
    setEditingSubscription(null)
    setFormData({
      name: `${subscription.name} (Copy)`,
      tier: subscription.tier,
      price: subscription.price,
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      usageLimit: subscription.usageLimit,
      features: [...subscription.features],
      isActive: false
    })
    setShowModal(true)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(subscriptions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-8 h-8 text-primary-600" />
                Subscription Management
              </h1>
              <p className="text-gray-600 mt-2">Manage subscription plans and pricing</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="w-5 h-5" />
                <span>Templates</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Plan</span>
              </button>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.activeSubscriptions} active</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">Across all plans</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Annual Revenue</p>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Estimated ARR</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Avg. Revenue</p>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${stats.totalUsers > 0 ? (stats.totalRevenue / stats.totalUsers).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per user/year</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans..."
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />

            {/* Tier Filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All Tiers</option>
              <option value="FREE">Free</option>
              <option value="PREMIUM">Premium</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || filterTier !== 'ALL' || filterStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterTier('ALL')
                  setFilterStatus('ALL')
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            )}

            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredSubscriptions.length} of {subscriptions.length} plans
            </div>
          </div>
        </div>

        {/* Subscriptions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className={`bg-white rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
                  subscription.tier === 'PREMIUM'
                    ? 'border-purple-500'
                    : subscription.isActive
                    ? 'border-gray-200'
                    : 'border-gray-300 opacity-60'
                }`}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${getTierColor(subscription.tier)} text-white p-6`}>
                  <div className="flex items-center justify-center mb-3">
                    {getTierIcon(subscription.tier)}
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">{subscription.name}</h3>
                  <div className="text-center">
                    <span className="text-3xl font-bold">${subscription.price}</span>
                    {subscription.billingCycle !== 'FREE' && (
                      <span className="text-sm opacity-90">
                        /{subscription.billingCycle.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                        subscription.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {subscription.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Usage Limit */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Usage Limit</p>
                    <p className="text-lg font-bold text-gray-900">
                      {subscription.usageLimit === -1 ? 'Unlimited' : `${subscription.usageLimit}/month`}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Features:</p>
                    <ul className="space-y-1">
                      {subscription.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="line-clamp-2">{feature}</span>
                        </li>
                      ))}
                      {subscription.features.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{subscription.features.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Users Count */}
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{subscription.usersCount} users</span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(subscription)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Duplicate plan"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(subscription.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={subscription.usersCount > 0}
                      title={subscription.usersCount > 0 ? 'Cannot delete plan with active users' : 'Delete plan'}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {subscription.tier === 'PREMIUM' && (
                  <div className="bg-purple-50 border-t border-purple-200 px-6 py-2 text-center">
                    <p className="text-xs font-medium text-purple-900">Most Popular</p>
                  </div>
                )}
              </div>
            ))}
        </div>

        {subscriptions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No subscription plans yet</p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Plan
              </button>
            </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingSubscription ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Premium Monthly"
                />
              </div>

              {/* Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier *
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              {/* Price and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle *
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="FREE">Free</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="LIFETIME">Lifetime</option>
                </select>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Limit (per month) *
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter -1 for unlimited"
                />
                <p className="text-xs text-gray-500 mt-1">Enter -1 for unlimited usage</p>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features *
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Access to all tools"
                      />
                      {formData.features.length > 1 && (
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible to users)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {editingSubscription ? 'Save Changes' : 'Create Plan'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingSubscription(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-5xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Start with a pre-configured subscription plan template and customize it to your needs.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                    template.tier === 'PREMIUM'
                      ? 'border-purple-500'
                      : 'border-gray-200 hover:border-primary-500'
                  }`}
                  onClick={() => handleUseTemplate(template)}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${getTierColor(template.tier)} text-white p-6`}>
                    <div className="flex items-center justify-center mb-3">
                      {getTierIcon(template.tier)}
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2">{template.name}</h3>
                    <div className="text-center">
                      <span className="text-3xl font-bold">${template.price}</span>
                      {template.billingCycle !== 'FREE' && (
                        <span className="text-sm opacity-90">
                          /{template.billingCycle.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Usage Limit */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Usage Limit</p>
                      <p className="text-lg font-bold text-gray-900">
                        {template.usageLimit === -1 ? 'Unlimited' : `${template.usageLimit}/month`}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Features:</p>
                      <ul className="space-y-1">
                        {template.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Use Template Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUseTemplate(template)
                      }}
                      className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Use This Template
                    </button>
                  </div>

                  {template.tier === 'PREMIUM' && (
                    <div className="bg-purple-50 border-t border-purple-200 px-6 py-2 text-center">
                      <p className="text-xs font-medium text-purple-900">Recommended</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
