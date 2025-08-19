import express from 'express'
import { auth } from '../middleware/auth.js'
import Chat from '../models/Chat.js'

const router = express.Router()

// Get all chats for a user with preview data
router.get('/', auth, async (req, res) => {
  try {
    console.log('Getting chats for user:', req.user._id)
    
    const chats = await Chat.find({ 
      userId: req.user._id, 
      isActive: true 
    })
    .sort({ updatedAt: -1 })
    .select('chatId title messageCount lastMessage createdAt updatedAt')

    console.log('Found chats:', chats.length)
    
    res.json({
      success: true,
      data: chats
    })
  } catch (error) {
    console.error('Get chats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats'
    })
  }
})

// Get specific chat with all messages
router.get('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params
    
    const chat = await Chat.findOne({
      userId: req.user._id,
      chatId: parseInt(chatId),
      isActive: true
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    res.json({
      success: true,
      data: chat
    })
  } catch (error) {
    console.error('Get chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat'
    })
  }
})

// Create new chat
router.post('/', auth, async (req, res) => {
  try {
    const { title, messages } = req.body
    console.log('Creating new chat for user:', req.user._id, 'with title:', title, 'messages:', messages?.length)

    // Get the next chat ID
    const lastChat = await Chat.findOne({ 
      userId: req.user._id 
    }).sort({ chatId: -1 })
    
    const nextChatId = lastChat ? lastChat.chatId + 1 : 1
    console.log('Next chat ID:', nextChatId)

    const chat = new Chat({
      userId: req.user._id,
      chatId: nextChatId,
      title: title || 'New Chat',
      messages: messages || []
    })

    await chat.save()
    console.log('Chat saved successfully:', chat._id)

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: chat
    })
  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating chat'
    })
  }
})

// Update chat (add messages, update title)
router.put('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params
    const { title, messages, newMessage } = req.body
    console.log('Updating chat:', chatId, 'for user:', req.user._id, 'with messages:', messages?.length)

    const chat = await Chat.findOne({
      userId: req.user._id,
      chatId: parseInt(chatId),
      isActive: true
    })

    if (!chat) {
      console.log('Chat not found:', chatId)
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    console.log('Found chat:', chat._id)

    // Update title if provided
    if (title) {
      chat.title = title
      console.log('Updated title to:', title)
    }

    // Add new message if provided
    if (newMessage) {
      chat.messages.push(newMessage)
      console.log('Added new message')
    }

    // Replace all messages if provided
    if (messages) {
      chat.messages = messages
      console.log('Replaced messages, new count:', messages.length)
    }

    await chat.save()
    console.log('Chat updated successfully')

    res.json({
      success: true,
      message: 'Chat updated successfully',
      data: chat
    })
  } catch (error) {
    console.error('Update chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating chat'
    })
  }
})

// Add message to existing chat
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params
    const { message } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      })
    }

    const chat = await Chat.findOne({
      userId: req.user._id,
      chatId: parseInt(chatId),
      isActive: true
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    // Add the new message
    chat.messages.push(message)
    await chat.save()

    res.json({
      success: true,
      message: 'Message added successfully',
      data: chat
    })
  } catch (error) {
    console.error('Add message error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while adding message'
    })
  }
})

// Delete chat (soft delete)
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params
    console.log('Delete request for chatId:', chatId, 'User:', req.user._id)

    const chat = await Chat.findOneAndUpdate(
      {
        userId: req.user._id,
        chatId: parseInt(chatId),
        isActive: true
      },
      { isActive: false },
      { new: true }
    )

    console.log('Found chat for deletion:', chat ? chat._id : 'Not found')

    if (!chat) {
      console.log('Chat not found for deletion - chatId:', chatId, 'userId:', req.user._id)
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    console.log('✅ Chat deleted successfully:', chat._id)
    res.json({
      success: true,
      message: 'Chat deleted successfully'
    })
  } catch (error) {
    console.error('Delete chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting chat'
    })
  }
})

// Clear all chats for a user
router.delete('/', auth, async (req, res) => {
  try {
    await Chat.updateMany(
      { userId: req.user._id },
      { isActive: false }
    )

    res.json({
      success: true,
      message: 'All chats cleared successfully'
    })
  } catch (error) {
    console.error('Clear chats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while clearing chats'
    })
  }
})

export default router
