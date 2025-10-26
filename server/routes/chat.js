import express from 'express'
import { auth } from '../middleware/auth.js'
import Chat from '../models/Chat.js'

const router = express.Router()

// Get all chats for a user with preview data
router.get('/', auth, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!req.mongoConnected) {
      console.log('MongoDB not connected, returning empty chat list')
      return res.json({
        success: true,
        data: [],
        warning: 'Database connection unavailable. Using local storage.'
      })
    }
    
    console.log('Getting chats for user:', req.user._id)
    
    const chats = await Chat.find({ 
      userId: req.user._id, 
      isActive: true 
    })
    .sort({ updatedAt: -1 })
    .select('chatId title messageCount lastMessage createdAt updatedAt')

    console.log('Found chats:', chats.length)
    
    // Remove duplicates based on chatId (keep the most recent one)
    const uniqueChats = []
    const seenChatIds = new Set()
    
    for (const chat of chats) {
      if (!seenChatIds.has(chat.chatId)) {
        seenChatIds.add(chat.chatId)
        uniqueChats.push(chat)
      } else {
        console.log('Duplicate chatId found:', chat.chatId, 'Skipping...')
      }
    }
    
    console.log('Unique chats after deduplication:', uniqueChats.length)
    
    res.json({
      success: true,
      data: uniqueChats
    })
  } catch (error) {
    console.error('Get chats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats',
      error: error.message
    })
  }
})

// Get specific chat with all messages
router.get('/:chatId', auth, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!req.mongoConnected) {
      console.log('MongoDB not connected, returning 404')
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
        warning: 'Database connection unavailable. Using local storage.'
      })
    }
    
    const { chatId } = req.params
    console.log('Fetching chat:', chatId, 'for user:', req.user._id)
    
    const chat = await Chat.findOne({
      userId: req.user._id,
      chatId: chatId,
      isActive: true
    })

    if (!chat) {
      console.log('Chat not found:', chatId)
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    console.log('Chat found with', chat.messages.length, 'messages')
    res.json({
      success: true,
      data: chat
    })
  } catch (error) {
    console.error('Get chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat',
      error: error.message
    })
  }
})

// Create new chat
router.post('/', auth, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!req.mongoConnected) {
      console.log('MongoDB not connected, cannot create chat')
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
        warning: 'Please use local storage for now'
      })
    }
    
    const { title, messages, chatId } = req.body
    console.log('Creating new chat for user:', req.user._id, 'with title:', title, 'messages:', messages?.length, 'chatId:', chatId)

    const chat = new Chat({
      userId: req.user._id,
      chatId: chatId, // Use provided chatId or let model generate one via default
      title: title || 'New Chat',
      messages: messages || []
    })

    try {
      await chat.save()
      console.log('Chat saved successfully:', chat._id, 'with chatId:', chat.chatId)
    } catch (saveError) {
      // Handle duplicate key error
      if (saveError.code === 11000) {
        console.error('Duplicate chatId detected, generating new ID...')
        // Generate a new chatId and retry
        chat.chatId = undefined // Let the model generate a new one
        await chat.save()
        console.log('Chat saved with new ID:', chat.chatId)
      } else {
        throw saveError
      }
    }

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: chat
    })
  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating chat',
      error: error.message
    })
  }
})

// Update chat (add messages, update title)
router.put('/:chatId', auth, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!req.mongoConnected) {
      console.log('MongoDB not connected, cannot update chat')
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
        warning: 'Please use local storage for now'
      })
    }
    
    const { chatId } = req.params
    const { title, messages, newMessage } = req.body
    console.log('Updating chat:', chatId, 'for user:', req.user._id)
    console.log('Update data:', { 
      hasTitle: !!title, 
      messagesCount: messages?.length, 
      hasNewMessage: !!newMessage 
    })

    // Prepare update object
    const updateData = {}
    
    // Handle message updates
    if (messages && Array.isArray(messages)) {
      // Deduplicate messages based on id, content, and timestamp
      const uniqueMessages = []
      const seenMessages = new Set()
      
      for (const msg of messages) {
        const msgKey = `${msg.id}-${msg.content}-${msg.timestamp}`
        if (!seenMessages.has(msgKey)) {
          seenMessages.add(msgKey)
          uniqueMessages.push(msg)
        } else {
          console.log('Duplicate message detected, skipping:', msg.id)
        }
      }
      
      updateData.messages = uniqueMessages
      console.log('Will replace messages, new count:', uniqueMessages.length, '(original:', messages.length, ')')
      
      // Handle title update when replacing messages
      if (title) {
        updateData.title = title
        console.log('Will update title to:', title)
      }
    } else if (newMessage) {
      // If only adding a new message, use $push operator
      updateData.$push = { messages: newMessage }
      console.log('Will add new message')
      
      // When using $push, we need to use $set for other fields
      if (title) {
        updateData.$set = { title: title }
        console.log('Will update title to:', title)
      }
    } else if (title) {
      // Only updating title
      updateData.title = title
      console.log('Will update title to:', title)
    }


    // Use findOneAndUpdate for atomic operation to avoid version conflicts
    let chat = await Chat.findOneAndUpdate(
      {
        userId: req.user._id,
        chatId: chatId,
        isActive: true
      },
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    )

    if (!chat) {
      console.log('Chat not found:', chatId, '- attempting to create it')
      // If chat doesn't exist, create it instead of returning 404
      const newChat = new Chat({
        userId: req.user._id,
        chatId: chatId,
        title: title || 'New Chat',
        messages: messages || []
      })
      
      try {
        await newChat.save()
        console.log('Chat created with ID:', newChat.chatId)
        chat = newChat
      } catch (saveError) {
        // Handle duplicate key error
        if (saveError.code === 11000) {
          console.error('Duplicate chatId detected during update, retrying with findOneAndUpdate...')
          // Race condition: chat was created between our findOneAndUpdate and save
          // Retry the update operation
          chat = await Chat.findOneAndUpdate(
            {
              userId: req.user._id,
              chatId: chatId
            },
            updateData,
            { 
              new: true,
              runValidators: true
            }
          )
          
          if (chat) {
            console.log('Successfully updated chat after duplicate key error')
            return res.json({
              success: true,
              message: 'Chat updated successfully',
              data: chat
            })
          }
        }
        throw saveError
      }
    }

    console.log('✅ Chat updated successfully, final message count:', chat.messages.length)

    res.json({
      success: true,
      message: 'Chat updated successfully',
      data: chat
    })
  } catch (error) {
    console.error('Update chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating chat',
      error: error.message
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

    // Use findOneAndUpdate with $push for atomic operation to avoid version conflicts
    const chat = await Chat.findOneAndUpdate(
      {
        userId: req.user._id,
        chatId: chatId,
        isActive: true
      },
      {
        $push: { messages: message }
      },
      {
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    )

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

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
        chatId: chatId,
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
    // Hard delete all chats for the user (as per requirement)
    const result = await Chat.deleteMany(
      { userId: req.user._id }
    )

    console.log(`✅ Deleted ${result.deletedCount} chats for user:`, req.user._id)

    res.json({
      success: true,
      message: `All chats cleared successfully (${result.deletedCount} chats deleted)`
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
