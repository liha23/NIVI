import React, { useState } from 'react'
import { X, Download, Share2, Copy, FileText, FileJson, File, Link, Twitter, Facebook, Linkedin } from 'lucide-react'
import { exportUtils } from '../utils/exportUtils'

const ExportModal = ({ isOpen, onClose, messages, chatTitle, chatId }) => {
  const [exportFormat, setExportFormat] = useState('markdown')
  const [isExporting, setIsExporting] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const chatData = {
        title: chatTitle,
        messages,
        exportDate: new Date().toISOString(),
        totalMessages: messages.length
      }

      switch (exportFormat) {
        case 'json':
          exportUtils.exportAsJSON(chatData, `${chatTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`)
          break
        case 'markdown':
          exportUtils.exportAsMarkdown(messages, chatTitle)
          break
        case 'pdf':
          await exportUtils.exportAsPDF(messages, chatTitle)
          break
        default:
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const generateShareLink = () => {
    const link = exportUtils.generateShareLink(chatId, messages)
    setShareLink(link)
    setShowShareOptions(true)
  }

  const copyShareLink = async () => {
    try {
      await exportUtils.copyToClipboard(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareToSocial = (platform) => {
    const text = `Check out this AI chat conversation: ${chatTitle}`
    const url = encodeURIComponent(shareLink)
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    }
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
  }

  const exportFormats = [
    {
      id: 'markdown',
      name: 'Markdown',
      description: 'Formatted text with code blocks',
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Raw data format',
      icon: FileJson,
      color: 'text-green-500'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Printable document',
      icon: File,
      color: 'text-red-500'
    }
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-white">Export Chat</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Chat Info */}
            <div className="bg-dark-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Chat Details</h3>
              <p className="text-white font-medium">{chatTitle}</p>
              <p className="text-sm text-gray-500 mt-1">
                {messages.length} messages • {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Export Format Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Export Format</h3>
              <div className="space-y-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon
                  return (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        exportFormat === format.id
                          ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                          : 'border-dark-600 bg-dark-800 hover:border-dark-500'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${format.color}`} />
                      <div className="text-left">
                        <p className={`text-sm font-medium ${
                          exportFormat === format.id ? 'text-white' : 'text-gray-300'
                        }`}>
                          {format.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              {isExporting ? 'Exporting...' : `Export as ${exportFormats.find(f => f.id === exportFormat)?.name}`}
            </button>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-dark-600"></div>
              <span className="px-3 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-dark-600"></div>
            </div>

            {/* Share Options */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Share Chat</h3>
              
              {!showShareOptions ? (
                <button
                  onClick={generateShareLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  <Share2 size={18} />
                  Generate Share Link
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  
                  {copied && (
                    <p className="text-sm text-green-500 text-center">Link copied to clipboard!</p>
                  )}

                  {/* Social Share Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareToSocial('twitter')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Twitter size={16} />
                      Twitter
                    </button>
                    <button
                      onClick={() => shareToSocial('facebook')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Facebook size={16} />
                      Facebook
                    </button>
                    <button
                      onClick={() => shareToSocial('linkedin')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
                    >
                      <Linkedin size={16} />
                      LinkedIn
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ExportModal
