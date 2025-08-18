const User = require('../model/User');

class UserStatusManager {
  /**
   * Mark user as offline if they haven't been active for more than 5 minutes
   */
  static async markInactiveUsersOffline() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const result = await User.updateMany(
        {
          isOnline: true,
          lastSeenAt: { $lt: fiveMinutesAgo }
        },
        {
          $set: { isOnline: false }
        }
      );

      if (result.modifiedCount > 0) {
        // console.log(`Marked ${result.modifiedCount} users as offline due to inactivity`);
      }

      return result.modifiedCount;
    } catch (err) {
      console.error('Error marking inactive users offline:', err);
      return 0;
    }
  }

  /**
   * Get user's online status with additional context
   */
  static async getUserStatus(userId) {
    try {
      const user = await User.findById(userId).select('isOnline lastSeenAt lastLoginAt name');
      
      if (!user) {
        return null;
      }

      const now = new Date();
      const lastSeenDiff = now - user.lastSeenAt;
      const minutesSinceLastSeen = Math.floor(lastSeenDiff / (1000 * 60));

      let status = 'offline';
      let statusText = 'Offline';

      if (user.isOnline) {
        if (minutesSinceLastSeen < 5) {
          status = 'online';
          statusText = 'Online';
        } else if (minutesSinceLastSeen < 15) {
          status = 'away';
          statusText = 'Away';
        } else {
          // User should be marked as offline
          user.isOnline = false;
          await user.save();
          status = 'offline';
          statusText = 'Offline';
        }
      }

      return {
        id: user._id,
        name: user.name,
        isOnline: user.isOnline,
        status,
        statusText,
        lastSeenAt: user.lastSeenAt,
        lastLoginAt: user.lastLoginAt,
        minutesSinceLastSeen
      };
    } catch (err) {
      console.error('Error getting user status:', err);
      return null;
    }
  }

  /**
   * Get all users with their current status
   */
  static async getAllUsersStatus() {
    try {
      const users = await User.find().select('isOnline lastSeenAt lastLoginAt name email');
      
      const now = new Date();
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          const lastSeenDiff = now - user.lastSeenAt;
          const minutesSinceLastSeen = Math.floor(lastSeenDiff / (1000 * 60));

          let status = 'offline';
          let statusText = 'Offline';

          if (user.isOnline) {
            if (minutesSinceLastSeen < 5) {
              status = 'online';
              statusText = 'Online';
            } else if (minutesSinceLastSeen < 15) {
              status = 'away';
              statusText = 'Away';
            } else {
              // Mark as offline
              user.isOnline = false;
              await user.save();
              status = 'offline';
              statusText = 'Offline';
            }
          }

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            isOnline: user.isOnline,
            status,
            statusText,
            lastSeenAt: user.lastSeenAt,
            lastLoginAt: user.lastLoginAt,
            minutesSinceLastSeen
          };
        })
      );

      return usersWithStatus;
    } catch (err) {
      console.error('Error getting all users status:', err);
      return [];
    }
  }
}

module.exports = UserStatusManager;
