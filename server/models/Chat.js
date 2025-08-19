import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema],
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for faster queries
chatSchema.index({ userId: 1, chatId: 1 })
chatSchema.index({ userId: 1, createdAt: -1 })
chatSchema.index({ userId: 1, updatedAt: -1 })

// Pre-save middleware to update messageCount and lastMessage
chatSchema.pre('save', function(next) {
  this.messageCount = this.messages.length
  if (this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1]
    this.lastMessage = lastMessage.content.substring(0, 100) // Store first 100 chars of last message
  }
  next()
})

export default mongoose.model('Chat', chatSchema)
