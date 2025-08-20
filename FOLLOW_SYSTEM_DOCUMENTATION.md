# Follow/Followers System Documentation

## Overview
This document describes the implementation of the follow/followers system in the Portfolio Hub application. The system allows users to follow other users and view their followers/following lists.

## Database Schema Changes

### User Model Updates
The `User` model has been extended with the following fields:

```javascript
// Follow/Followers functionality
followers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}],
following: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}]
```

### Virtual Fields
- `followersCount`: Returns the number of followers
- `followingCount`: Returns the number of users being followed

### Instance Methods
- `follow(userId)`: Follow a user
- `unfollow(userId)`: Unfollow a user
- `isFollowing(userId)`: Check if following a user
- `addFollower(userId)`: Add a follower
- `removeFollower(userId)`: Remove a follower

## API Endpoints

### 1. Follow a User
**POST** `/api/user/follow/:userId`

**Description**: Follow a specific user

**Authentication**: Required

**Parameters**:
- `userId` (path): ID of the user to follow

**Response**:
```json
{
  "success": true,
  "message": "Successfully followed user",
  "data": {
    "following": 5,
    "followers": 12
  }
}
```

**Error Cases**:
- 400: Trying to follow yourself
- 400: Already following the user
- 404: User not found

### 2. Unfollow a User
**DELETE** `/api/user/unfollow/:userId`

**Description**: Unfollow a specific user

**Authentication**: Required

**Parameters**:
- `userId` (path): ID of the user to unfollow

**Response**:
```json
{
  "success": true,
  "message": "Successfully unfollowed user",
  "data": {
    "following": 4,
    "followers": 11
  }
}
```

**Error Cases**:
- 400: Trying to unfollow yourself
- 400: Not following the user
- 404: User not found

### 3. Get User's Followers
**GET** `/api/user/followers/:userId`

**Description**: Get list of users following a specific user

**Authentication**: Required

**Parameters**:
- `userId` (path): ID of the user
- `page` (query): Page number (default: 1)
- `limit` (query): Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "followers": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "profilePicture": "url",
        "verified": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalFollowers": 25,
    "currentPage": 1,
    "totalPages": 3
  }
}
```

### 4. Get User's Following
**GET** `/api/user/following/:userId`

**Description**: Get list of users that a specific user is following

**Authentication**: Required

**Parameters**:
- `userId` (path): ID of the user
- `page` (query): Page number (default: 1)
- `limit` (query): Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "following": [
      {
        "_id": "user_id",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "profilePicture": "url",
        "verified": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalFollowing": 15,
    "currentPage": 1,
    "totalPages": 2
  }
}
```

### 5. Check Follow Status
**GET** `/api/user/follow-status/:userId`

**Description**: Check if current user is following a specific user

**Authentication**: Required

**Parameters**:
- `userId` (path): ID of the user to check

**Response**:
```json
{
  "success": true,
  "data": {
    "isFollowing": true,
    "userId": "user_id"
  }
}
```

### 6. Get User Profile with Follow Info
**GET** `/api/user/:id`

**Description**: Get detailed user information including follow status and counts

**Authentication**: Required

**Parameters**:
- `id` (path): ID of the user

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "url",
      "verified": true,
      "role": "customer",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "isOnline": true,
      "lastSeenAt": "2024-01-15T10:30:00.000Z",
      "followersCount": 25,
      "followingCount": 15,
      "recentFollowers": [...],
      "recentFollowing": [...]
    },
    "profile": {
      // User profile data
    },
    "followStatus": {
      "isFollowing": true,
      "isOwnProfile": false
    }
  }
}
```

## Usage Examples

### Frontend Integration

#### Follow/Unfollow Button
```javascript
// Check follow status
const checkFollowStatus = async (userId) => {
  const response = await fetch(`/api/user/follow-status/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data.isFollowing;
};

// Follow user
const followUser = async (userId) => {
  const response = await fetch(`/api/user/follow/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Unfollow user
const unfollowUser = async (userId) => {
  const response = await fetch(`/api/user/unfollow/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### Followers/Following Lists
```javascript
// Get followers
const getFollowers = async (userId, page = 1, limit = 10) => {
  const response = await fetch(`/api/user/followers/${userId}?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Get following
const getFollowing = async (userId, page = 1, limit = 10) => {
  const response = await fetch(`/api/user/following/${userId}?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## Security Considerations

1. **Authentication Required**: All follow/followers endpoints require authentication
2. **Self-Follow Prevention**: Users cannot follow themselves
3. **Duplicate Prevention**: Users cannot follow the same person twice
4. **Data Validation**: All user IDs are validated before processing
5. **Error Handling**: Comprehensive error handling for all edge cases

## Performance Optimizations

1. **Pagination**: Followers/following lists are paginated to handle large datasets
2. **Selective Population**: Only necessary fields are populated when fetching user lists
3. **Indexing**: Database indexes on user IDs for faster queries
4. **Virtual Fields**: Follower/following counts are calculated using virtual fields

## Future Enhancements

1. **Follow Notifications**: Send notifications when users follow each other
2. **Follow Suggestions**: Suggest users to follow based on mutual connections
3. **Follow Analytics**: Track follow/unfollow patterns
4. **Follow Privacy**: Allow users to make their followers/following lists private
5. **Follow Categories**: Allow users to categorize their follows (e.g., "Friends", "Colleagues", "Influencers")

## Testing

### Test Cases to Implement

1. **Follow Functionality**:
   - Follow a user successfully
   - Try to follow yourself (should fail)
   - Try to follow the same user twice (should fail)
   - Follow a non-existent user (should fail)

2. **Unfollow Functionality**:
   - Unfollow a user successfully
   - Try to unfollow yourself (should fail)
   - Try to unfollow someone you're not following (should fail)

3. **Followers/Following Lists**:
   - Get followers list with pagination
   - Get following list with pagination
   - Handle empty followers/following lists

4. **Follow Status**:
   - Check follow status for followed user
   - Check follow status for non-followed user
   - Check follow status for own profile

## Database Migration

If you have existing users in your database, you may need to run a migration to initialize the followers and following arrays:

```javascript
// Migration script
const User = require('./model/User');

async function migrateFollowSystem() {
  const users = await User.find({});
  
  for (const user of users) {
    if (!user.followers) {
      user.followers = [];
    }
    if (!user.following) {
      user.following = [];
    }
    await user.save();
  }
  
  console.log('Migration completed');
}

migrateFollowSystem();
```
