/**
 * 安全的 Storage 包装器
 * 处理 localStorage/sessionStorage 访问被拒绝的情况
 */

export const safeStorage = {
  /**
   * 安全地获取 localStorage 项
   */
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      // 静默处理，不输出警告
      return null;
    }
  },

  /**
   * 安全地设置 localStorage 项
   */
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      // 静默处理，不输出警告
      return false;
    }
  },

  /**
   * 安全地移除 localStorage 项
   */
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      // 静默处理，不输出警告
      return false;
    }
  },

  /**
   * 安全地清空 localStorage
   */
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      // 静默处理，不输出警告
      return false;
    }
  },
};

export const safeSessionStorage = {
  /**
   * 安全地获取 sessionStorage 项
   */
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },

  /**
   * 安全地设置 sessionStorage 项
   */
  setItem: (key: string, value: string): boolean => {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * 安全地移除 sessionStorage 项
   */
  removeItem: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * 安全地清空 sessionStorage
   */
  clear: (): boolean => {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  },
};
