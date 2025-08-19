# Chat API Documentation

## Overview
The chat system provides real-time messaging capabilities using WebSocket for instant communication and REST API for chat management. Users can send direct messages and create group chats with full real-time features.

## Authentication
All endpoints require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

For WebSocket connections, pass the token in the auth object:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  },
  transports: ['websocket', 'polling']
});
```

---

## REST API Endpoints

### 1. Get All Chats
**GET** `/api/chat`

Get all chats for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "chat_id",
      "participants": [
        {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "isOnline": true,
          "lastSeenAt": "2024-01-01T12:00:00.000Z"
        }
      ],
      "messages": [
        {
          "_id": "message_id",
          "sender": {
            "_id": "user_id",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "content": "Hello!",
          "messageType": "text",
          "read": false,
          "readAt": null,
          "timestamp": "2024-01-01T12:00:00.000Z"
        }
      ],
      "lastMessage": "2024-01-01T12:00:00.000Z",
      "isGroupChat": false,
      "groupName": null,
      "groupAdmin": null,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### 2. Get Specific Chat
**GET** `/api/chat/:chatId`

Get a specific chat by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "chat_id",
    "participants": [...],
    "messages": [...],
    "lastMessage": "2024-01-01T12:00:00.000Z",
    "isGroupChat": false,
    "groupName": null,
    "groupAdmin": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Send Message (REST API)
**POST** `/api/chat/:chatId/message`

Send a message to a specific chat via REST API.

**Request Body:**
```json
{
  "content": "Hello, how are you?",
  "messageType": "text"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chatId": "chat_id",
    "message": {
      "_id": "message_id",
      "sender": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "content": "Hello, how are you?",
      "messageType": "text",
      "read": false,
      "readAt": null,
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 4. Create Direct Chat
**POST** `/api/chat/direct`

Create a new direct message chat with another user.

**Request Body:**
```json
{
  "participantId": "user_id_to_chat_with"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_chat_id",
    "participants": [...],
    "messages": [],
    "lastMessage": "2024-01-01T12:00:00.000Z",
    "isGroupChat": false,
    "groupName": null,
    "groupAdmin": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 5. Create Group Chat
**POST** `/api/chat/group`

Create a new group chat.

**Request Body:**
```json
{
  "name": "Group Name",
  "participants": ["user_id_1", "user_id_2", "user_id_3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_group_chat_id",
    "participants": [...],
    "messages": [],
    "lastMessage": "2024-01-01T12:00:00.000Z",
    "isGroupChat": true,
    "groupName": "Group Name",
    "groupAdmin": "creator_user_id",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 6. Mark Messages as Read
**PUT** `/api/chat/:chatId/read`

Mark all unread messages in a chat as read.

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

### 7. Get Unread Message Count
**GET** `/api/chat/unread/count`

Get the total number of unread messages and breakdown by chat.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUnread": 5,
    "unreadByChat": {
      "chat_id_1": 2,
      "chat_id_2": 3
    }
  }
}
```

### 8. Delete Chat
**DELETE** `/api/chat/:chatId`

Delete a chat (only group admin can delete group chats).

**Response:**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

---

## WebSocket Events

### Connection
Connect to WebSocket server with authentication:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  },
  transports: ['websocket', 'polling']
});
```

### Emitted Events (Client → Server)

#### 1. Send Message
**Event:** `send_message`

**Data:**
```json
{
  "chatId": "chat_id",
  "content": "Hello, how are you?",
  "messageType": "text"
}
```

#### 2. Mark Messages as Read
**Event:** `mark_as_read`

**Data:**
```json
{
  "chatId": "chat_id"
}
```

#### 3. Typing Indicator Start
**Event:** `typing_start`

**Data:**
```json
{
  "chatId": "chat_id"
}
```

#### 4. Typing Indicator Stop
**Event:** `typing_stop`

**Data:**
```json
{
  "chatId": "chat_id"
}
```

#### 5. Ping (Connection Health)
**Event:** `ping`

**Data:** None

### Received Events (Server → Client)

#### 1. Connection Confirmation
**Event:** `connected`

**Data:**
```json
{
  "userId": "user_id",
  "message": "Successfully connected to chat server"
}
```

#### 2. New Message
**Event:** `new_message`

**Data:**
```json
{
  "chatId": "chat_id",
  "message": {
    "_id": "message_id",
    "sender": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "content": "Hello!",
    "messageType": "text",
    "read": false,
    "readAt": null,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### 3. Message Sent Confirmation
**Event:** `message_sent`

**Data:**
```json
{
  "chatId": "chat_id",
  "message": {
    "_id": "message_id",
    "sender": {...},
    "content": "Hello!",
    "messageType": "text",
    "read": false,
    "readAt": null,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### 4. Messages Read Notification
**Event:** `messages_read`

**Data:**
```json
{
  "chatId": "chat_id",
  "readBy": "user_id",
  "readAt": "2024-01-01T12:00:00.000Z"
}
```

#### 5. User Typing Indicator
**Event:** `user_typing`

**Data:**
```json
{
  "chatId": "chat_id",
  "userId": "user_id",
  "userName": "John Doe"
}
```

#### 6. User Stopped Typing
**Event:** `user_stopped_typing`

**Data:**
```json
{
  "chatId": "chat_id",
  "userId": "user_id"
}
```

#### 7. User Status Change
**Event:** `user_status_change`

**Data:**
```json
{
  "userId": "user_id",
  "isOnline": true,
  "lastSeenAt": "2024-01-01T12:00:00.000Z"
}
```

#### 8. Pong (Connection Health)
**Event:** `pong`

**Data:** None

#### 9. Error
**Event:** `error`

**Data:**
```json
{
  "message": "Error description"
}
```

---

## Error Responses

### HTTP Errors
```json
{
  "success": false,
  "message": "Error description"
}
```

### WebSocket Errors
```json
{
  "message": "Error description"
}
```

---

## Usage Examples

### JavaScript Client Example
```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('jwt-token')
  },
  transports: ['websocket', 'polling']
});

// Listen for connection confirmation
socket.on('connected', (data) => {
  console.log('Connected to chat server:', data.message);
});

// Listen for new messages
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  // Update UI with new message
});

// Listen for message sent confirmation
socket.on('message_sent', (data) => {
  console.log('Message sent:', data.message);
  // Update UI with sent message
});

// Listen for user status changes
socket.on('user_status_change', (data) => {
  console.log('User status changed:', data);
  // Update user online status in UI
});

// Listen for typing indicators
socket.on('user_typing', (data) => {
  console.log('User typing:', data.userName);
  // Show typing indicator
});

socket.on('user_stopped_typing', (data) => {
  console.log('User stopped typing:', data.userId);
  // Hide typing indicator
});

// Listen for messages read
socket.on('messages_read', (data) => {
  console.log('Messages read by:', data.readBy);
  // Update read status in UI
});

// Send a message
function sendMessage(chatId, content) {
  socket.emit('send_message', {
    chatId: chatId,
    content: content,
    messageType: 'text'
  });
}

// Mark messages as read
function markAsRead(chatId) {
  socket.emit('mark_as_read', {
    chatId: chatId
  });
}

// Show typing indicator
function startTyping(chatId) {
  socket.emit('typing_start', {
    chatId: chatId
  });
}

function stopTyping(chatId) {
  socket.emit('typing_stop', {
    chatId: chatId
  });
}

// Connection health check
function ping() {
  socket.emit('ping');
}

socket.on('pong', () => {
  console.log('Connection is healthy');
});
```

### Fetch API Example
```javascript
// Get all chats
async function getChats() {
  const response = await fetch('/api/chat', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    }
  });
  const data = await response.json();
  return data.data;
}

// Send message via REST API
async function sendMessageViaAPI(chatId, content) {
  const response = await fetch(`/api/chat/${chatId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    },
    body: JSON.stringify({
      content: content,
      messageType: 'text'
    })
  });
  const data = await response.json();
  return data.data;
}

// Create direct chat
async function createDirectChat(participantId) {
  const response = await fetch('/api/chat/direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    },
    body: JSON.stringify({
      participantId: participantId
    })
  });
  const data = await response.json();
  return data.data;
}

// Create group chat
async function createGroupChat(name, participants) {
  const response = await fetch('/api/chat/group', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    },
    body: JSON.stringify({
      name: name,
      participants: participants
    })
  });
  const data = await response.json();
  return data.data;
}
```

---

## Features

### ✅ Implemented Features
- Real-time messaging using WebSocket
- Direct messages between users
- Group chat functionality
- Message read status tracking
- Typing indicators
- User online/offline status
- Message persistence in database
- Authentication and authorization
- Unread message counting
- Chat management (create, delete)
- Connection health monitoring
- Enhanced error handling
- CORS support for multiple origins
- Graceful server shutdown

### 🔄 Real-time Features
- Instant message delivery
- Live typing indicators
- Real-time user status updates
- Message read receipts
- Online/offline status synchronization
- Connection health checks (ping/pong)
- Automatic reconnection handling

### 📱 Message Types
- Text messages (default)
- Image messages (structure ready)
- File messages (structure ready)

### 🔒 Security Features
- JWT authentication for both HTTP and WebSocket
- User authorization for chat access
- Input validation and sanitization
- CORS protection
- Rate limiting ready (can be added)

### 🌐 CORS Support
The server supports connections from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://localhost:4173`
- `https://protfolio-hub.vercel.app`
- `https://portfolio-hub-frontend.vercel.app`
- Custom origins via `CLIENT_URL` environment variable

---

## Database Schema

### Chat Collection
```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // User IDs
  messages: [MessageSchema],
  lastMessage: Date,
  isGroupChat: Boolean,
  groupName: String, // Only for group chats
  groupAdmin: ObjectId, // Only for group chats
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  _id: ObjectId,
  sender: ObjectId, // User ID
  content: String,
  messageType: String, // 'text', 'image', 'file'
  read: Boolean,
  readAt: Date,
  timestamp: Date
}
```

---

## Environment Variables

Make sure to set these environment variables:
```env
JWT_SECRET=your-jwt-secret-key
CLIENT_URL=http://localhost:3000 # For CORS
PORT=3000 # Server port
```

---

## Server Configuration

### Socket.IO Configuration
```javascript
{
  cors: {
    origin: function (origin, callback) {
      // Dynamic CORS origin validation
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: [...]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e6 // 1MB
}
```

### Connection Management
- Automatic reconnection handling
- Connection health monitoring
- Graceful disconnection handling
- User online/offline status tracking
- Room-based message delivery

---

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if token is valid
   - Verify CORS settings
   - Ensure server is running

2. **Messages Not Delivered**
   - Check WebSocket connection status
   - Verify user is part of the chat
   - Check server logs for errors

3. **Authentication Errors**
   - Ensure JWT token is valid
   - Check token format (Bearer prefix)
   - Verify user exists in database

4. **CORS Errors**
   - Add your domain to allowed origins
   - Check environment variables
   - Verify client URL configuration

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=socket.io:*
```

### Health Check
Monitor connection health with ping/pong:
```javascript
setInterval(() => {
  socket.emit('ping');
}, 30000); // Every 30 seconds
```
