import { Connection, IConnection } from '../models/Connection';
import { User } from '../models/User';
import mongoose from 'mongoose';

interface ConnectionResponse {
  _id: string;
  userId: string;
  connectedUserId: string;
  connectedUser?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  requestedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ListConnectionsResponse {
  connections: ConnectionResponse[];
  total: number;
  limit: number;
  offset: number;
}

export class ConnectionService {
  async sendConnectionRequest(userId: string, connectedUserId: string): Promise<ConnectionResponse> {
    // Validate that users are different
    if (userId === connectedUserId) {
      throw new Error('Cannot send connection request to yourself');
    }

    // Validate that connected user exists
    const connectedUser = await User.findById(connectedUserId);
    if (!connectedUser) {
      throw new Error('User not found');
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { userId: new mongoose.Types.ObjectId(userId), connectedUserId: new mongoose.Types.ObjectId(connectedUserId) },
        { userId: new mongoose.Types.ObjectId(connectedUserId), connectedUserId: new mongoose.Types.ObjectId(userId) },
      ],
    });

    if (existingConnection) {
      throw new Error('Connection already exists');
    }

    // Create connection request
    const connection = new Connection({
      userId: new mongoose.Types.ObjectId(userId),
      connectedUserId: new mongoose.Types.ObjectId(connectedUserId),
      status: 'pending',
      requestedAt: new Date(),
    });

    await connection.save();

    return this.formatConnectionResponse(connection);
  }

  async listConnections(
    userId: string,
    status?: 'pending' | 'accepted' | 'rejected' | 'blocked',
    limit: number = 10,
    offset: number = 0
  ): Promise<ListConnectionsResponse> {
    const query: any = {
      $or: [
        { userId: new mongoose.Types.ObjectId(userId) },
        { connectedUserId: new mongoose.Types.ObjectId(userId) },
      ],
    };

    if (status) {
      query.status = status;
    }

    const total = await Connection.countDocuments(query);
    const connections = await Connection.find(query)
      .populate('connectedUserId', 'email firstName lastName profilePicture')
      .populate('userId', 'email firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    return {
      connections: connections.map(conn => this.formatConnectionResponse(conn)),
      total,
      limit,
      offset,
    };
  }

  async updateConnectionStatus(
    connectionId: string,
    userId: string,
    newStatus: 'accepted' | 'rejected' | 'blocked'
  ): Promise<ConnectionResponse> {
    const connection = await Connection.findById(connectionId);

    if (!connection) {
      throw new Error('Connection not found');
    }

    // Verify that the user is the recipient of the request
    if (connection.connectedUserId.toString() !== userId) {
      throw new Error('Unauthorized to update this connection');
    }

    // Can only update pending connections
    if (connection.status !== 'pending') {
      throw new Error('Can only update pending connections');
    }

    connection.status = newStatus;
    connection.respondedAt = new Date();

    await connection.save();

    return this.formatConnectionResponse(connection);
  }

  async removeConnection(connectionId: string, userId: string): Promise<void> {
    const connection = await Connection.findById(connectionId);

    if (!connection) {
      throw new Error('Connection not found');
    }

    // Verify that the user is either the requester or recipient
    const isRequester = connection.userId.toString() === userId;
    const isRecipient = connection.connectedUserId.toString() === userId;

    if (!isRequester && !isRecipient) {
      throw new Error('Unauthorized to remove this connection');
    }

    await Connection.findByIdAndDelete(connectionId);
  }

  private formatConnectionResponse(connection: IConnection): ConnectionResponse {
    // Get the populated connectedUser if it exists
    const connectedUserData = (connection as any).connectedUserId;
    const connectedUser = typeof connectedUserData === 'object' && connectedUserData._id ? connectedUserData : null;

    return {
      _id: connection._id.toString(),
      userId: connection.userId.toString(),
      connectedUserId: connection.connectedUserId.toString(),
      connectedUser: connectedUser
        ? {
            _id: connectedUser._id.toString(),
            email: connectedUser.email,
            firstName: connectedUser.firstName,
            lastName: connectedUser.lastName,
            profilePicture: connectedUser.profilePicture,
          }
        : undefined,
      status: connection.status,
      requestedAt: connection.requestedAt,
      respondedAt: connection.respondedAt,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }
}
