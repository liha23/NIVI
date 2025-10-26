import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const exportUtils = {
  // Export chat as JSON
  exportAsJSON: (chatData, filename = 'chat-export.json') => {
    const dataStr = JSON.stringify(chatData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  // Export chat as Markdown
  exportAsMarkdown: (messages, chatTitle = 'Chat Export') => {
    let markdown = `# ${chatTitle}\n\n`
    markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`
    markdown += `---\n\n`

    messages.forEach((message, index) => {
      const timestamp = new Date(message.timestamp).toLocaleString()
      const role = message.type === 'user' ? '👤 User' : '🤖 AI'
      
      markdown += `## ${role} - ${timestamp}\n\n`
      
      // Handle code blocks in content
      const content = message.content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `\`\`\`${lang || ''}\n${code}\n\`\`\``
      })
      
      markdown += `${content}\n\n`
      
      if (index < messages.length - 1) {
        markdown += `---\n\n`
      }
    })

    const dataBlob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${chatTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  // Export chat as PDF
  exportAsPDF: async (messages, chatTitle = 'Chat Export') => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const lineHeight = 7
    let yPosition = margin

    // Add title
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text(chatTitle, margin, yPosition)
    yPosition += 15

    // Add export date
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Exported on ${new Date().toLocaleString()}`, margin, yPosition)
    yPosition += 20

    // Process messages
    messages.forEach((message, index) => {
      const timestamp = new Date(message.timestamp).toLocaleString()
      const role = message.type === 'user' ? '👤 User' : '🤖 AI'
      
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = margin
      }

      // Add message header
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${role} - ${timestamp}`, margin, yPosition)
      yPosition += 8

      // Add message content
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      const content = message.content
      const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin)
      
      lines.forEach(line => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.text(line, margin, yPosition)
        yPosition += lineHeight
      })

      yPosition += 10

      // Add separator
      if (index < messages.length - 1) {
        pdf.setDrawColor(200, 200, 200)
        pdf.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 15
      }
    })

    // Save the PDF
    pdf.save(`${chatTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`)
  },

  // Generate shareable link
  generateShareLink: (chatId, messages) => {
    // Use the clean URL format: nivii.app/{chatId}
    return `${window.location.origin}/${chatId}`
  },

  // Copy to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  }
}
