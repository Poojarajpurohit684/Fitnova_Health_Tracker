import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityFeed extends Document {
  userId: mongoose.Types.ObjectId;
  activityType: 'workout' | 'goal_achieved' | 'connection_made' | 'milestone';
  relatedEntityId: mongoose.Types.ObjectId;
  relatedEntityType: string;
  description: string;
  visibility: 'public' | 'connections' | 'private';
  createdAt: Date;
}

const activityFeedSchema = new Schema<IActivityFeed>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    activityType: {
      type: String,
      enum: ['workout', 'goal_achieved', 'connection_made', 'milestone'],
      required: true,
    },
    relatedEntityId: { type: Schema.Types.ObjectId, required: true },
    relatedEntityType: { type: String, required: true },
    description: { type: String, required: true },
    visibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'connections',
    },
  },
  { timestamps: true }
);

activityFeedSchema.index({ userId: 1, createdAt: -1 });
activityFeedSchema.index({ createdAt: -1 });

export const ActivityFeed = mongoose.model<IActivityFeed>('ActivityFeed', activityFeedSchema);
