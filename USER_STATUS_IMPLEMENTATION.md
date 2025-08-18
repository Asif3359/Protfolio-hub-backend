# User Status Implementation

This document describes the comprehensive user login status system implemented in the Portfolio Hub application.

## Features

### 1. Real-time User Status Tracking
- **Online Status**: Users are marked as online when they log in
- **Away Status**: Users are marked as away after 5 minutes of inactivity
- **Offline Status**: Users are automatically marked as offline after 15 minutes of inactivity
- **Last Seen Tracking**: Records when users were last active

### 2. Database Schema Updates

The User model has been enhanced with new fields:

```javascript
{
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  }
}
```

### 3. API Endpoints

#### Authentication Status Management
- `POST /api/auth/update-status` - Update user's last seen timestamp
- `GET /api/auth/user-status/me` - Get current user's status
- `GET /api/auth/user-status/:userId` - Get specific user's status
- `GET /api/auth/online-users` - Get all online users (Admin only)
- `GET /api/auth/all-users-status` - Get all users with status (Admin only)

#### Enhanced Login/Logout
- Login automatically sets user as online
- Logout automatically sets user as offline
- Automatic status updates during session

### 4. Backend Components

#### UserStatusManager Utility (`utils/userStatusManager.js`)
- `markInactiveUsersOffline()` - Marks users offline after inactivity
- `getUserStatus(userId)` - Gets detailed user status with context
- `getAllUsersStatus()` - Gets all users with their current status

#### Status Update Middleware (`middleware/updateUserStatus.js`)
- Automatically updates `lastSeenAt` on each authenticated request
- Non-blocking implementation (doesn't affect request flow)

#### Scheduled Tasks
- Automatic cleanup of inactive users every 5 minutes
- Runs in the background via `setInterval`

### 5. Frontend Integration

#### UserStatusManager Class (`public/javascripts/userStatus.js`)
```javascript
const statusManager = new UserStatusManager();

// Get user status
const status = await statusManager.getMyStatus();

// Start automatic updates
statusManager.startStatusUpdates(30000); // 30 seconds

// Get online users
const onlineUsers = await statusManager.getOnlineUsers();
```

#### Key Methods
- `getMyStatus()` - Get current user's status
- `getUserStatus(userId)` - Get another user's status
- `updateStatus()` - Send heartbeat to server
- `startStatusUpdates()` - Begin automatic status updates
- `getOnlineUsers()` - Get all online users (admin)
- `getAllUsersStatus()` - Get all users with status (admin)

### 6. Status Indicators

The system provides three status levels:
- **Online** (Green ●): User active within last 5 minutes
- **Away** (Yellow ●): User active within last 15 minutes
- **Offline** (Gray ●): User inactive for more than 15 minutes

### 7. Demo Page

A demonstration page is available at `/user-status-demo.html` that showcases:
- Real-time status updates
- User status display
- Online users list
- Admin functionality

## Usage Examples

### Backend Usage

```javascript
const UserStatusManager = require('./utils/userStatusManager');

// Get user status
const status = await UserStatusManager.getUserStatus(userId);

// Mark inactive users offline
const count = await UserStatusManager.markInactiveUsersOffline();
```

### Frontend Usage

```javascript
// Initialize
const statusManager = new UserStatusManager();

// Start automatic updates
statusManager.startStatusUpdates(30000);

// Get current status
const myStatus = await statusManager.getMyStatus();
console.log(`Status: ${myStatus.statusText}`);

// Display status indicator
const indicator = statusManager.getStatusIndicator(myStatus.status);
```

### API Usage

```bash
# Get current user status
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/auth/user-status/me

# Get online users (admin only)
curl -H "Authorization: Bearer ADMIN_TOKEN" \
     http://localhost:3000/api/auth/online-users

# Update status (heartbeat)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/auth/update-status
```

## Configuration

### Timeouts
- **Away threshold**: 5 minutes
- **Offline threshold**: 15 minutes
- **Status update interval**: 30 seconds (frontend)
- **Cleanup interval**: 5 minutes (backend)

### Environment Variables
No additional environment variables are required. The system uses existing JWT configuration.

## Security Considerations

1. **Authentication Required**: All status endpoints require valid JWT tokens
2. **Admin Only Access**: Some endpoints are restricted to admin users
3. **Rate Limiting**: Consider implementing rate limiting for status update endpoints
4. **Data Privacy**: Status information is only available to authenticated users

## Performance Considerations

1. **Database Indexes**: Consider adding indexes on `isOnline` and `lastSeenAt` fields
2. **Caching**: Implement Redis caching for frequently accessed status data
3. **Batch Updates**: The cleanup process uses batch database operations
4. **Non-blocking**: Status updates don't block main application flow

## Future Enhancements

1. **WebSocket Integration**: Real-time status updates via WebSockets
2. **Status Messages**: Allow users to set custom status messages
3. **Status History**: Track status changes over time
4. **Push Notifications**: Notify when users come online/offline
5. **Status Groups**: Group users by status for better organization

## Troubleshooting

### Common Issues

1. **Users not going offline**: Check if the scheduled task is running
2. **Status not updating**: Verify JWT token is valid and middleware is applied
3. **Admin access denied**: Ensure user has admin role in database

### Debug Logs

The system logs important events:
- User login/logout
- Status changes
- Inactive user cleanup
- API errors

Check server logs for debugging information.
