const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Chat = require('../model/Chat');
const User = require('../model/User');
const Profile = require('../model/Profile');

// / Get all chats for the authenticated user
// Get all chats for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user.id] }
    })
    .populate('participants', 'name email isOnline lastSeenAt')
    .populate('messages.sender', 'name email')
    .populate('groupAdmin', 'name email')
    .sort({ lastMessage: -1 });

    // Get all unique participant IDs
    const participantIds = [...new Set(
      chats.flatMap(chat => chat.participants.map(p => p._id.toString()))
    )];

    // Fetch profiles for all participants
    const profiles = await Profile.find({ userId: { $in: participantIds } });
    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.userId.toString(), profile.profileImage);
    });

    // Transform the data to include profileImage
    const transformedChats = chats.map(chat => ({
      ...chat.toObject(),
      participants: chat.participants.map(participant => ({
        _id: participant._id,
        name: participant.name,
        email: participant.email,
        isOnline: participant.isOnline,
        lastSeenAt: participant.lastSeenAt,
        profileImage: profileMap.get(participant._id.toString()) || null
      })),
      messages: chat.messages.map(message => ({
        ...message.toObject(),
        sender: {
          _id: message.sender._id,
          name: message.sender.name,
          email: message.sender.email,
          profileImage: profileMap.get(message.sender._id.toString()) || null
        }
      }))
    }));

    res.json({
      success: true,
      data: transformedChats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats'
    });
  }
});
// Get a specific chat by ID
router.get('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: { $in: [req.user.id] }
    })
    .populate('participants', 'name email isOnline lastSeenAt')
    .populate('messages.sender', 'name email')
    .populate('groupAdmin', 'name email');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat'
    });
  }
});

// Send a message to a chat (REST API endpoint)
router.post('/:chatId/message', authenticate, async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;
    const { chatId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [req.user.id] }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    // Create new message
    const newMessage = {
      sender: req.user.id,
      content: content.trim(),
      messageType,
      timestamp: new Date()
    };

    // Add message to chat
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate sender info
    const populatedChat = await Chat.findById(chatId)
      .populate('messages.sender', 'name email')
      .populate('participants', 'name email isOnline lastSeenAt');

    const messageWithSender = populatedChat.messages[populatedChat.messages.length - 1];

    // If WebSocket is available, emit to other participants
    if (global.socketManager) {
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== req.user.id) {
          global.socketManager.sendToUser(participantId.toString(), 'new_message', {
            chatId,
            message: messageWithSender
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        chatId,
        message: messageWithSender
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Create a new chat (direct message)
router.post('/direct', authenticate, async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      isGroupChat: false
    });

    if (existingChat) {
      const populatedChat = await Chat.findById(existingChat._id)
        .populate('participants', 'name email isOnline lastSeenAt')
        .populate('messages.sender', 'name email');

      return res.json({
        success: true,
        data: populatedChat,
        message: 'Chat already exists'
      });
    }

    // Create new chat
    const newChat = new Chat({
      participants: [req.user.id, participantId],
      messages: [],
      isGroupChat: false
    });

    await newChat.save();

    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email isOnline lastSeenAt')
      .populate('messages.sender', 'name email');

    res.status(201).json({
      success: true,
      data: populatedChat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat'
    });
  }
});

// Create a group chat
router.post('/group', authenticate, async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group name and at least 2 participants are required'
      });
    }

    // Add current user to participants if not already included
    const allParticipants = participants.includes(req.user.id) 
      ? participants 
      : [...participants, req.user.id];

    // Check if all participants exist
    const users = await User.find({ _id: { $in: allParticipants } });
    if (users.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participants not found'
      });
    }

    const newChat = new Chat({
      participants: allParticipants,
      messages: [],
      isGroupChat: true,
      groupName: name,
      groupAdmin: req.user.id
    });

    await newChat.save();

    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email isOnline lastSeenAt')
      .populate('messages.sender', 'name email')
      .populate('groupAdmin', 'name email');

    res.status(201).json({
      success: true,
      data: populatedChat
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group chat'
    });
  }
});

// Mark messages as read
router.put('/:chatId/read', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: { $in: [req.user.id] }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Mark all unread messages as read
    let hasChanges = false;
    chat.messages.forEach(message => {
      if (!message.read && message.sender.toString() !== req.user.id) {
        message.read = true;
        message.readAt = new Date();
        hasChanges = true;
      }
    });

    if (hasChanges) {
      await chat.save();

      // If WebSocket is available, notify other participants
      if (global.socketManager) {
        chat.participants.forEach(participantId => {
          if (participantId.toString() !== req.user.id) {
            global.socketManager.sendToUser(participantId.toString(), 'messages_read', {
              chatId: chat._id,
              readBy: req.user.id,
              readAt: new Date()
            });
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

// Get unread message count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user.id] }
    });

    let totalUnread = 0;
    const unreadByChat = {};

    chats.forEach(chat => {
      const unreadCount = chat.messages.filter(msg => 
        !msg.read && msg.sender.toString() !== req.user.id
      ).length;
      
      totalUnread += unreadCount;
      unreadByChat[chat._id] = unreadCount;
    });

    res.json({
      success: true,
      data: {
        totalUnread,
        unreadByChat
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

// Delete a chat
router.delete('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: { $in: [req.user.id] }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // For group chats, only admin can delete
    if (chat.isGroupChat && chat.groupAdmin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can delete group chat'
      });
    }

    await Chat.findByIdAndDelete(req.params.chatId);

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat'
    });
  }
});

module.exports = router;
