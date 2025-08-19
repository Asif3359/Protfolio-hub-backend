const jwt = require('jsonwebtoken');
const User = require('../model/User');
const Chat = require('../model/Chat');

class SocketManager {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // userId -> socket object
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    // Enhanced authentication middleware
    this.io.use(async (socket, next) => {
      try {
        // Try multiple ways to get the token
        let token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization ||
                   socket.handshake.query.token;

        // Remove 'Bearer ' prefix if present
        if (token && token.startsWith('Bearer ')) {
          token = token.substring(7);
        }
        
        if (!token) {
          console.log('Socket authentication failed: No token provided');
          return next(new Error('Authentication error: Token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Support tokens that encode as { user: { id } } or { id }
        const decodedUserId = (decoded && (decoded.user && decoded.user.id)) || decoded.id;
        if (!decodedUserId) {
          console.log('Socket authentication failed: Unable to resolve user id from token');
          return next(new Error('Authentication error: Invalid token payload'));
        }

        const user = await User.findById(decodedUserId).select('-password');
        
        if (!user) {
          console.log('Socket authentication failed: User not found');
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        console.log(`Socket authenticated for user: ${user.name} (${user._id})`);
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.name} (${socket.userId})`);
      
      this.handleConnection(socket);
      this.setupMessageHandlers(socket);
      this.setupTypingHandlers(socket);
      this.setupDisconnectHandler(socket);
    });

    // Handle connection errors
    this.io.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  handleConnection(socket) {
    // Store user connection
    this.connectedUsers.set(socket.userId, socket.id);
    this.userSockets.set(socket.userId, socket);

    // Update user online status
    User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeenAt: new Date()
    }).exec().catch(err => {
      console.error('Failed to update user online status:', err);
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Emit user online status to all connected users
    this.io.emit('user_status_change', {
      userId: socket.userId,
      isOnline: true,
      lastSeenAt: new Date()
    });

    // Send connection confirmation to the user
    socket.emit('connected', {
      userId: socket.userId,
      message: 'Successfully connected to chat server'
    });

    console.log(`User ${socket.user.name} joined room: user_${socket.userId}`);
  }

  setupMessageHandlers(socket) {
    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, messageType = 'text' } = data;

        if (!chatId || !content) {
          socket.emit('error', { message: 'Chat ID and content are required' });
          return;
        }

        console.log(`User ${socket.user.name} sending message to chat ${chatId}`);

        // Verify user is part of the chat
        const chat = await Chat.findOne({
          _id: chatId,
          participants: { $in: [socket.userId] }
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        // Create new message
        const newMessage = {
          sender: socket.userId,
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

        // Emit message to all participants in the chat
        chat.participants.forEach(participantId => {
          const participantSocketId = this.connectedUsers.get(participantId.toString());
          if (participantSocketId) {
            this.io.to(participantSocketId).emit('new_message', {
              chatId,
              message: messageWithSender
            });
          }
        });

        // Emit success to sender
        socket.emit('message_sent', {
          chatId,
          message: messageWithSender
        });

        console.log(`Message sent successfully by ${socket.user.name} to chat ${chatId}`);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read status
    socket.on('mark_as_read', async (data) => {
      try {
        const { chatId } = data;

        const chat = await Chat.findOne({
          _id: chatId,
          participants: { $in: [socket.userId] }
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Mark messages as read
        let hasChanges = false;
        chat.messages.forEach(message => {
          if (!message.read && message.sender.toString() !== socket.userId) {
            message.read = true;
            message.readAt = new Date();
            hasChanges = true;
          }
        });

        if (hasChanges) {
          await chat.save();

          // Notify other participants that messages were read
          chat.participants.forEach(participantId => {
            if (participantId.toString() !== socket.userId) {
              const participantSocketId = this.connectedUsers.get(participantId.toString());
              if (participantSocketId) {
                this.io.to(participantSocketId).emit('messages_read', {
                  chatId,
                  readBy: socket.userId,
                  readAt: new Date()
                });
              }
            }
          });

          console.log(`Messages marked as read by ${socket.user.name} in chat ${chatId}`);
        }

      } catch (error) {
        console.error('Mark as read error:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', async (data) => {
      try {
        const { chatId } = data;

        const chat = await Chat.findOne({
          _id: chatId,
          participants: { $in: [socket.userId] }
        });

        if (!chat) return;

        // Emit typing indicator to other participants
        chat.participants.forEach(participantId => {
          if (participantId.toString() !== socket.userId) {
            const participantSocketId = this.connectedUsers.get(participantId.toString());
            if (participantSocketId) {
              this.io.to(participantSocketId).emit('user_typing', {
                chatId,
                userId: socket.userId,
                userName: socket.user.name
              });
            }
          }
        });

      } catch (error) {
        console.error('Typing start error:', error);
      }
    });

    socket.on('typing_stop', async (data) => {
      try {
        const { chatId } = data;

        const chat = await Chat.findOne({
          _id: chatId,
          participants: { $in: [socket.userId] }
        });

        if (!chat) return;

        // Emit typing stop to other participants
        chat.participants.forEach(participantId => {
          if (participantId.toString() !== socket.userId) {
            const participantSocketId = this.connectedUsers.get(participantId.toString());
            if (participantSocketId) {
              this.io.to(participantSocketId).emit('user_stopped_typing', {
                chatId,
                userId: socket.userId
              });
            }
          }
        });

      } catch (error) {
        console.error('Typing stop error:', error);
      }
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  }

  setupTypingHandlers(socket) {
    // This is now handled in setupMessageHandlers for better organization
  }

  setupDisconnectHandler(socket) {
    socket.on('disconnect', async (reason) => {
      console.log(`User disconnected: ${socket.user.name} (${socket.userId}) - Reason: ${reason}`);
      
      // Remove from connected users
      this.connectedUsers.delete(socket.userId);
      this.userSockets.delete(socket.userId);

      // Update user offline status
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeenAt: new Date()
        });
      } catch (err) {
        console.error('Failed to update user offline status:', err);
      }

      // Emit user offline status to all connected users
      this.io.emit('user_status_change', {
        userId: socket.userId,
        isOnline: false,
        lastSeenAt: new Date()
      });
    });
  }

  // Utility method to send message to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      console.log(`Sent ${event} to user ${userId}`);
    } else {
      console.log(`User ${userId} not connected, cannot send ${event}`);
    }
  }

  // Utility method to send message to multiple users
  sendToUsers(userIds, event, data) {
    userIds.forEach(userId => {
      this.sendToUser(userId, event, data);
    });
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      onlineUsers: this.getOnlineUsers()
    };
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Send to specific room
  sendToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }
}

module.exports = SocketManager;
