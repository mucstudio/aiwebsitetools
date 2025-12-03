/**
 * 社交媒体分享工具库
 * 用于 HTML 工具中实现社交分享和图片水印功能
 */
(function(window) {
  'use strict';

  const SocialShare = {
    /**
     * 生成图片
     * @param {string} elementId - 要截图的元素ID
     * @returns {Promise<Blob>} - 返回图片 Blob
     */
    async generateImage(elementId) {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found: ' + elementId);
      }

      // 动态加载 html2canvas（如果未加载）
      if (typeof html2canvas === 'undefined') {
        await this.loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      }

      // 将元素转换为 canvas
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高清晰度
        logging: false,
        useCORS: true
      });

      // 转换为 Blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
      });
    },

    /**
     * 下载图片到本地
     * @param {string} elementId - 要截图的元素ID
     * @param {string} filename - 文件名
     */
    async downloadImage(elementId, filename) {
      try {
        const blob = await this.generateImage(elementId);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `result-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed, please try again');
      }
    },

    /**
     * 分享到社交媒体
     * @param {string} platform - 平台名称 (twitter, facebook, instagram, tiktok, linkedin, whatsapp, telegram)
     * @param {string} elementId - 要截图的元素ID
     * @param {string} toolName - 工具名称
     */
    async shareToSocial(platform, elementId, toolName) {
      try {
        const blob = await this.generateImage(elementId);
        const currentUrl = window.location.href;
        const shareText = `Check out my result from ${toolName}! 🎉`;

        const shareUrls = {
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`,
          telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`
        };

        // 尝试使用 Web Share API（移动端）
        if (navigator.share && (platform === 'instagram' || platform === 'tiktok')) {
          try {
            const file = new File([blob], `${toolName}-result.png`, { type: 'image/png' });
            await navigator.share({
              files: [file],
              title: toolName,
              text: shareText
            });
            return;
          } catch (error) {
            console.log('Web Share API not available, using fallback');
          }
        }

        // Instagram/TikTok require manual upload
        if (platform === 'instagram' || platform === 'tiktok') {
          const platformName = platform === 'instagram' ? 'Instagram' : 'TikTok';
          alert(`Please download the image first, then upload it in the ${platformName} app`);
          await this.downloadImage(elementId, `${toolName}-result.png`);
          return;
        }

        // 其他平台直接打开分享链接
        if (shareUrls[platform]) {
          window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        } else {
          throw new Error('Unsupported platform: ' + platform);
        }
      } catch (error) {
        console.error('Share failed:', error);
        alert('Share failed, please try again');
      }
    },

    /**
     * 显示分享弹窗（简单版本）
     * @param {string} elementId - 要截图的元素ID
     * @param {string} toolName - 工具名称
     */
    showShareDialog(elementId, toolName) {
      const dialog = `
        <div id="social-share-dialog" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem;">
          <div style="background: white; border-radius: 0.5rem; max-width: 28rem; width: 100%; padding: 1.5rem; position: relative;">
            <button onclick="document.getElementById('social-share-dialog').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>

            <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Share to Social Media</h3>
            <p style="font-size: 0.875rem; color: #666; margin-bottom: 1.5rem;">Share your result as an image to social platforms</p>

            <button onclick="SocialShare.downloadImage('${elementId}', '${toolName}-result.png')" style="width: 100%; padding: 0.75rem; background: #4b5563; color: white; border: none; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; font-weight: 500;">
              📥 Download Image
            </button>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
              <button onclick="SocialShare.shareToSocial('twitter', '${elementId}', '${toolName}')" style="padding: 0.75rem; background: #000; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">
                𝕏 Twitter
              </button>
              <button onclick="SocialShare.shareToSocial('facebook', '${elementId}', '${toolName}')" style="padding: 0.75rem; background: #1877f2; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">
                f Facebook
              </button>
              <button onclick="SocialShare.shareToSocial('instagram', '${elementId}', '${toolName}')" style="padding: 0.75rem; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">
                📷 Instagram
              </button>
              <button onclick="SocialShare.shareToSocial('tiktok', '${elementId}', '${toolName}')" style="padding: 0.75rem; background: #000; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">
                🎵 TikTok
              </button>
              <button onclick="SocialShare.shareToSocial('linkedin', '${elementId}', '${toolName}')" style="padding: 0.75rem; background: #0077b5; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">
                in LinkedIn
              </button>
              <button onclick="SocialShare.shareToSocial('whatsapp', '${elementId}', '${toolName}')" style="padding: 0.75rem; background: #25d366; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">
                💬 WhatsApp
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', dialog);
    },

    /**
     * 动态加载外部脚本
     * @param {string} src - 脚本URL
     * @returns {Promise}
     */
    loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  };

  // 暴露到全局
  window.SocialShare = SocialShare;
})(window);
