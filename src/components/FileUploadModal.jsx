import React, { useState, useRef, useCallback } from 'react'
import { X, Upload, File, Image, FileText, AlertCircle, CheckCircle } from 'lucide-react'

const FileUploadModal = ({ isOpen, onClose, onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Supported file types
  const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const supportedDocTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const isFileSupported = (file) => {
    return [...supportedImageTypes, ...supportedDocTypes].includes(file.type)
  }

  const getFileIcon = (file) => {
    if (supportedImageTypes.includes(file.type)) {
      return <Image className="w-6 h-6 text-blue-400" />
    } else if (supportedDocTypes.includes(file.type)) {
      return <FileText className="w-6 h-6 text-green-400" />
    }
    return <File className="w-6 h-6 text-gray-400" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = useCallback((files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      status: 'pending'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => isFileSupported(file) && file.size <= maxFileSize)
    
    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only images (JPEG, PNG, GIF, WebP) and documents (PDF, TXT, DOC, DOCX) up to 10MB are supported.')
    }
    
    if (validFiles.length > 0) {
      handleFileSelect(validFiles)
    }
  }, [handleFileSelect])

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => isFileSupported(file) && file.size <= maxFileSize)
    
    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only images (JPEG, PNG, GIF, WebP) and documents (PDF, TXT, DOC, DOCX) up to 10MB are supported.')
    }
    
    if (validFiles.length > 0) {
      handleFileSelect(validFiles)
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return

    setIsUploading(true)
    
    try {
      // Simulate file upload processing
      const processedFiles = await Promise.all(
        uploadedFiles.map(async (fileData) => {
          // In a real app, you would upload to your server here
          // For now, we'll just process the file locally
          const file = fileData.file
          
          if (file.type.startsWith('image/')) {
            // For images, we can create a data URL
            return new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = () => {
                resolve({
                  ...fileData,
                  dataUrl: reader.result,
                  status: 'uploaded'
                })
              }
              reader.readAsDataURL(file)
            })
                     } else {
             // For documents, we'll read the content
             return new Promise((resolve) => {
               const reader = new FileReader()
               reader.onload = () => {
                 resolve({
                   ...fileData,
                   dataUrl: reader.result,
                   status: 'uploaded'
                 })
               }
               reader.readAsDataURL(file)
             })
           }
        })
      )

      // Call the parent component's upload handler
      onFileUpload(processedFiles)
      
      // Close modal and reset
      onClose()
      setUploadedFiles([])
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    // Clean up any preview URLs
    uploadedFiles.forEach(fileData => {
      if (fileData.preview) {
        URL.revokeObjectURL(fileData.preview)
      }
    })
    setUploadedFiles([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-600">
          <h2 className="text-xl font-semibold text-white">Upload Files</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-neutral-700 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-neutral-600 hover:border-neutral-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-white mb-2">
              {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-gray-400 mb-4">
              or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-brand-500 hover:text-brand-400 underline"
              >
                browse files
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Supported: Images (JPEG, PNG, GIF, WebP) and Documents (PDF, TXT, DOC, DOCX) up to 10MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Selected Files ({uploadedFiles.length})</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadedFiles.map((fileData) => (
                  <div
                    key={fileData.id}
                    className="flex items-center gap-3 p-3 bg-neutral-700 rounded-lg"
                  >
                    {fileData.preview ? (
                      <img
                        src={fileData.preview}
                        alt={fileData.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-600 rounded flex items-center justify-center">
                        {getFileIcon(fileData)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{fileData.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(fileData.size)}</p>
                    </div>
                    
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="p-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-600">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0 || isUploading}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              uploadedFiles.length === 0 || isUploading
                ? 'bg-neutral-600 text-gray-500 cursor-not-allowed'
                : 'bg-brand-500 hover:bg-brand-600 text-white'
            }`}
          >
            {isUploading ? 'Uploading...' : `Upload ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileUploadModal
