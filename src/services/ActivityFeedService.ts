import { ActivityFeed, IActivityFeed } from '../models/ActivityFeed';
import { Connection } from '../models/Connection';

interface CreateActivityRequest {
  userId: string;
  activityType: 'workout' | 'goal_achieved' | 'connection_made' | 'milestone';
  relatedEntityId: string;
  relatedEntityType: string;
  description: string;
  visibility?: 'public' | 'connections' | 'private';
}

export class ActivityFeedService {
  async createActivity(data: CreateActivityRequest): Promise<IActivityFeed> {
    const activity = new ActivityFeed({
      ...data,
      visibility: data.visibility || 'connections',
    });

    return await activity.save();
  }

  async getActivityFeed(userId: string, limit: number = 20, offset: number = 0): Promise<{
    activities: IActivityFeed[];
    total: number;
  }> {
    // Get user's connections
    const connections = await Connection.find({
      $or: [
        { userId, status: 'accepted' },
        { connectedUserId: userId, status: 'accepted' },
      ],
    });

    const connectedUserIds = connections.map((conn) =>
      conn.userId.toString() === userId ? conn.connectedUserId : conn.userId
    );

    // Get activities from connections and own activities
    const activities = await ActivityFeed.find({
      $or: [
        { userId: { $in: connectedUserIds }, visibility: { $in: ['public', 'connections'] } },
        { userId, visibility: { $ne: 'private' } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('userId', 'firstName lastName profilePicture');

    const total = await ActivityFeed.countDocuments({
      $or: [
        { userId: { $in: connectedUserIds }, visibility: { $in: ['public', 'connections'] } },
        { userId, visibility: { $ne: 'private' } },
      ],
    });

    return { activities, total };
  }

  async deleteActivity(id: string, userId: string): Promise<boolean> {
    const result = await ActivityFeed.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }
}
