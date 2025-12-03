/**
 * User API Library
 * 提供给工具使用的用户信息访问接口
 * 可在 iframe 和 React 组件中使用
 */

(function(window) {
  'use strict';

  // 用户数据缓存
  let userDataCache = null;
  let cacheTimestamp = null;
  const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 获取当前登录用户的信息
   * @returns {Promise<Object|null>} 用户信息对象，未登录返回 null
   */
  async function getUserProfile() {
    try {
      // 检查缓存
      if (userDataCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        return userDataCache;
      }

      // 从 API 获取用户信息
      const response = await fetch('/api/user/profile-data');
      const data = await response.json();

      if (data.authenticated && data.user) {
        userDataCache = data.user;
        cacheTimestamp = Date.now();
        return data.user;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  /**
   * 检查用户是否已登录
   * @returns {Promise<boolean>}
   */
  async function isUserLoggedIn() {
    const user = await getUserProfile();
    return user !== null;
  }

  /**
   * 获取用户的基本信息
   * @returns {Promise<Object|null>}
   */
  async function getUserBasicInfo() {
    const user = await getUserProfile();
    if (!user) return null;

    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      country: user.country,
      address: user.address
    };
  }

  /**
   * 获取用户的社交媒体信息
   * @returns {Promise<Object|null>}
   */
  async function getUserSocialMedia() {
    const user = await getUserProfile();
    if (!user) return null;

    return user.socialMedia;
  }

  /**
   * 获取用户的个人简介
   * @returns {Promise<string|null>}
   */
  async function getUserBio() {
    const user = await getUserProfile();
    return user ? user.bio : null;
  }

  /**
   * 获取用户的会员等级
   * @returns {Promise<string|null>} FREE, PREMIUM, ENTERPRISE
   */
  async function getUserMembershipTier() {
    const user = await getUserProfile();
    return user ? user.membershipTier : null;
  }

  /**
   * 清除用户数据缓存（用于登出或更新后）
   */
  function clearUserCache() {
    userDataCache = null;
    cacheTimestamp = null;
  }

  /**
   * 格式化用户信息为 AI 提示词
   * @param {Object} options - 配置选项
   * @param {boolean} options.includeBasicInfo - 包含基本信息
   * @param {boolean} options.includeSocialMedia - 包含社交媒体
   * @param {boolean} options.includeBio - 包含个人简介
   * @returns {Promise<string>} 格式化的用户信息文本
   */
  async function formatUserInfoForAI(options = {}) {
    const {
      includeBasicInfo = true,
      includeSocialMedia = true,
      includeBio = true
    } = options;

    const user = await getUserProfile();
    if (!user) {
      return 'User is not logged in.';
    }

    let info = [];

    if (includeBasicInfo) {
      info.push('User Information:');
      if (user.name) info.push(`- Name: ${user.name}`);
      if (user.email) info.push(`- Email: ${user.email}`);
      if (user.phone) info.push(`- Phone: ${user.phone}`);
      if (user.city || user.country) {
        const location = [user.city, user.country].filter(Boolean).join(', ');
        info.push(`- Location: ${location}`);
      }
      if (user.address) info.push(`- Address: ${user.address}`);
    }

    if (includeSocialMedia && user.socialMedia) {
      const social = user.socialMedia;
      const socialLinks = [];
      if (social.tiktok) socialLinks.push(`TikTok: ${social.tiktok}`);
      if (social.instagram) socialLinks.push(`Instagram: ${social.instagram}`);
      if (social.facebook) socialLinks.push(`Facebook: ${social.facebook}`);
      if (social.twitter) socialLinks.push(`Twitter: ${social.twitter}`);
      if (social.youtube) socialLinks.push(`YouTube: ${social.youtube}`);
      if (social.linkedin) socialLinks.push(`LinkedIn: ${social.linkedin}`);
      if (social.website) socialLinks.push(`Website: ${social.website}`);

      if (socialLinks.length > 0) {
        info.push('\nSocial Media:');
        socialLinks.forEach(link => info.push(`- ${link}`));
      }
    }

    if (includeBio && user.bio) {
      info.push(`\nBio: ${user.bio}`);
    }

    return info.join('\n');
  }

  // 导出到全局对象
  window.UserAPI = {
    getUserProfile,
    isUserLoggedIn,
    getUserBasicInfo,
    getUserSocialMedia,
    getUserBio,
    getUserMembershipTier,
    clearUserCache,
    formatUserInfoForAI
  };

  // 如果是 ES Module 环境
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.UserAPI;
  }

})(typeof window !== 'undefined' ? window : global);
