/**
 * Enhanced Fingerprint Library v2.1
 * 专注于：跨浏览器识别 + 浏览器环境识别
 */

const FingerprintLib = {
  /**
   * 生成【跨浏览器】设备 ID
   * 只使用硬件特征，忽略浏览器差异
   * 用于：识别同一台设备（即使换了浏览器）
   */
  getDeviceId: function() {
    try {
      // 1. WebGL (最强的硬件特征)
      const webgl = this.getWebGLFingerprint();
      
      // 2. 屏幕特征 (不包含 availWidth/Height，因为那个受浏览器工具栏影响)
      const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
      
      // 3. 核心硬件参数
      const hardware = [
        navigator.hardwareConcurrency || 'unknown', // CPU核数
        navigator.deviceMemory || 'unknown',        // 内存GB
        navigator.platform || 'unknown',            // 操作系统
        new Date().getTimezoneOffset(),             // 时区 (通常不随浏览器变)
        webgl,
        screenInfo
      ].join('|');

      return this.hashString(hardware);
    } catch (e) {
      console.warn('Device ID generation failed:', e);
      return 'dev-' + Math.random().toString(36).substr(2, 9);
    }
  },

  /**
   * 生成【当前浏览器】指纹
   * 包含 UserAgent 和 Canvas，精度最高
   * 用于：区分具体的浏览器环境
   */
  getBrowserFingerprint: function() {
    try {
      const parts = [
        navigator.userAgent,
        navigator.language,
        this.getCanvasFingerprint(), // Canvas 在不同浏览器渲染不同，适合做浏览器指纹
        this.getDeviceId()           // 包含硬件 ID
      ].join('|');

      return this.hashString(parts);
    } catch (e) {
      return this.getPersistentFallbackId();
    }
  },

  // --- 辅助函数 ---

  getWebGLFingerprint: function() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        // 返回如: "Google Inc. (NVIDIA)~ANGLE (NVIDIA, NVIDIA GeForce RTX 3060..."
        return gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + '~' + 
               gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
      return 'webgl-no-debug';
    } catch (e) { return 'webgl-error'; }
  },

  getCanvasFingerprint: function() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#069';
      ctx.fillText('fingerprint', 2, 2);
      return canvas.toDataURL();
    } catch (e) { return 'canvas-error'; }
  },

  hashString: function(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString(36);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  },

  getPersistentFallbackId: function() {
    try {
      const key = '_fp_fallback';
      let id = localStorage.getItem(key);
      if (!id) {
        id = 'fb-' + Math.random().toString(36).substr(2);
        localStorage.setItem(key, id);
      }
      return id;
    } catch (e) { return 'no-storage-' + Math.random(); }
  }
};

// 导出
if (typeof window !== 'undefined') {
  window.FP = FingerprintLib;
}