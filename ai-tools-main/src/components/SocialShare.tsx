'use client'

import { useState } from 'react'
import { Share2, Download, X } from 'lucide-react'
import html2canvas from 'html2canvas'
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  RedditShareButton,
  PinterestShareButton,
  EmailShareButton,
  TumblrShareButton,
  VKShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramIcon,
  RedditIcon,
  PinterestIcon,
  EmailIcon,
  TumblrIcon,
  VKIcon,
} from 'react-share'

interface SocialShareProps {
  resultElementId: string  // 要截图的元素ID
  toolName: string         // 工具名称
}

export default function SocialShare({
  resultElementId,
  toolName
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = `Check out my result from ${toolName}! 🎉`

  // 生成图片
  const generateImage = async (): Promise<Blob | null> => {
    setIsGenerating(true)

    try {
      const element = document.getElementById(resultElementId)
      if (!element) {
        alert('Result content not found')
        return null
      }

      // 使用 html2canvas 将元素转换为 canvas
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高清晰度
        logging: false,
        useCORS: true
      })

      // 转换为 Blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/png', 1.0)
      })
    } catch (error) {
      console.error('Failed to generate image:', error)
      alert('Failed to generate image, please try again')
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  // 下载图片
  const handleDownload = async () => {
    const blob = await generateImage()
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${toolName}-result-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 处理需要图片的平台（Instagram, TikTok）
  const handleImagePlatform = async (platform: string) => {
    const blob = await generateImage()
    if (!blob) return

    // 尝试使用 Web Share API（移动端）
    if (navigator.share) {
      try {
        const file = new File([blob], `${toolName}-result.png`, { type: 'image/png' })
        await navigator.share({
          files: [file],
          title: toolName,
          text: shareTitle
        })
        return
      } catch (error) {
        console.log('Web Share API not available, using fallback')
      }
    }

    // 降级方案：下载图片
    const platformName = platform === 'instagram' ? 'Instagram' : 'TikTok'
    alert(`Please download the image first, then upload it in the ${platformName} app`)
    await handleDownload()
  }

  // 打开弹窗时生成图片URL（用于Pinterest）
  const handleOpenDialog = async () => {
    setIsOpen(true)

    // 为 Pinterest 生成图片 URL
    const blob = await generateImage()
    if (blob) {
      const url = URL.createObjectURL(blob)
      setImageUrl(url)
    }
  }

  return (
    <>
      {/* Share button */}
      <button
        onClick={handleOpenDialog}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Share Result</span>
      </button>

      {/* Share dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                setIsOpen(false)
                if (imageUrl) URL.revokeObjectURL(imageUrl)
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Share to Social Media</h3>
            <p className="text-sm text-gray-600 mb-6">
              Share your result to 15+ social platforms
            </p>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{isGenerating ? 'Generating...' : 'Download Image'}</span>
            </button>

            {/* Social media buttons - 使用 react-share */}
            <div className="space-y-4">
              {/* 主流平台 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Popular Platforms</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  <ShareButtonWrapper>
                    <TwitterShareButton url={shareUrl} title={shareTitle}>
                      <TwitterIcon size={48} round />
                      <span className="text-xs mt-1">Twitter</span>
                    </TwitterShareButton>
                  </ShareButtonWrapper>

                  <ShareButtonWrapper>
                    <FacebookShareButton url={shareUrl}>
                      <FacebookIcon size={48} round />
                      <span className="text-xs mt-1">Facebook</span>
                    </FacebookShareButton>
                  </ShareButtonWrapper>

                  <ShareButtonWrapper>
                    <LinkedinShareButton url={shareUrl} title={shareTitle}>
                      <LinkedinIcon size={48} round />
                      <span className="text-xs mt-1">LinkedIn</span>
                    </LinkedinShareButton>
                  </ShareButtonWrapper>

                  <ShareButtonWrapper>
                    <WhatsappShareButton url={shareUrl} title={shareTitle}>
                      <WhatsappIcon size={48} round />
                      <span className="text-xs mt-1">WhatsApp</span>
                    </WhatsappShareButton>
                  </ShareButtonWrapper>

                  <ShareButtonWrapper>
                    <TelegramShareButton url={shareUrl} title={shareTitle}>
                      <TelegramIcon size={48} round />
                      <span className="text-xs mt-1">Telegram</span>
                    </TelegramShareButton>
                  </ShareButtonWrapper>

                  <ShareButtonWrapper>
                    <RedditShareButton url={shareUrl} title={shareTitle}>
                      <RedditIcon size={48} round />
                      <span className="text-xs mt-1">Reddit</span>
                    </RedditShareButton>
                  </ShareButtonWrapper>

                  <ShareButtonWrapper>
                    <PinterestShareButton
                      url={shareUrl}
                      media={imageUrl || shareUrl}
                      description={shareTitle}
                    >
                      <PinterestIcon size={48} round />
                      <span className="text-xs mt-1">Pinterest</span>
                    </PinterestShareButton>
                  </ShareButtonWrapper>

                  <ShareButtonWrapper>
                    <EmailShareButton url={shareUrl} subject={toolName} body={shareTitle}>
                      <EmailIcon size={48} round />
                      <span className="text-xs mt-1">Email</span>
                    </EmailShareButton>
                  </ShareButtonWrapper>
                </div>
              </div>

              {/* 其他平台 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">More Platforms</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  <ShareButtonWrapper>
                    <TumblrShareButton url={shareUrl} title={shareTitle}>
                      <TumblrIcon size={48} round />
                      <span className="text-xs mt-1">Tumblr</span>
                    </TumblrShareButton>
                  </ShareButtonWrapper>

                  <ShareButtonWrapper>
                    <VKShareButton url={shareUrl} title={shareTitle}>
                      <VKIcon size={48} round />
                      <span className="text-xs mt-1">VK</span>
                    </VKShareButton>
                  </ShareButtonWrapper>

                  {/* Instagram - 需要手动上传 */}
                  <button
                    onClick={() => handleImagePlatform('instagram')}
                    disabled={isGenerating}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                      <span className="text-white text-2xl">📷</span>
                    </div>
                    <span className="text-xs mt-1">Instagram</span>
                  </button>

                  {/* TikTok - 需要手动上传 */}
                  <button
                    onClick={() => handleImagePlatform('tiktok')}
                    disabled={isGenerating}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                      <span className="text-white text-2xl">🎵</span>
                    </div>
                    <span className="text-xs mt-1">TikTok</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>💡 Tip:</strong> Instagram and TikTok require manual upload. Click to download the image first.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// 分享按钮包装器
function ShareButtonWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      {children}
    </div>
  )
}
