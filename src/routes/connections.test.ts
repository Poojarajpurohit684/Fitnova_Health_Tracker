import request from 'supertest';
import express, { Express } from 'express';
import connectionsRouter from './connections';
import { Connection } from '../models/Connection';
import { User } from '../models/User';
import { AuthService } from '../services/AuthService';
import mongoose from 'mongoose';

// Mock the models
jest.mock('../models/Connection');
jest.mock('../models/User');

describe('Connection Routes', () => {
  let app: Express;
  let authService: AuthService;
  let validToken: string;
  const userId = new mongoose.Types.ObjectId().toString();
  const connectedUserId = new mongoose.Types.ObjectId().toString();
  const connectionId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/connections', connectionsRouter);
    authService = new AuthService();
    
    // Generate a valid token for testing
    validToken = authService.generateAccessToken({
      _id: new mongoose.Types.ObjectId(userId),
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hash',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date(),
      gender: 'M',
      height: 180,
      currentWeight: 75,
      targetWeight: 75,
      activityLevel: 'moderate',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    jest.clearAllMocks();
  });

  describe('POST /api/v1/connections/request', () => {
    it('should successfully send a connection request', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(connectedUserId),
        email: 'connected@example.com',
        firstName: 'Connected',
        lastName: 'User',
      };

      const mockConnection = {
        _id: new mongoose.Types.ObjectId(connectionId),
        userId: new mongoose.Types.ObjectId(userId),
        connectedUserId: new mongoose.Types.ObjectId(connectedUserId),
        status: 'pending',
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Connection.findOne as jest.Mock).mockResolvedValue(null);
      (Connection as any).mockImplementation(() => mockConnection);

      const response = await request(app)
        .post('/api/v1/connections/request')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ connectedUserId });

      expect(response.status).toBe(201);
      expect(response.body._id).toBe(connectionId);
      expect(response.body.status).toBe('pending');
    });

    it('should reject request without authorization', async () => {
      const response = await request(app)
        .post('/api/v1/connections/request')
        .send({ connectedUserId });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request to non-existent user', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/connections/request')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ connectedUserId });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CONNECTION_ERROR');
      expect(response.body.error.message).toContain('not found');
    });

    it('should reject self-connection request', async () => {
      const response = await request(app)
        .post('/api/v1/connections/request')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ connectedUserId: userId });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CONNECTION_ERROR');
      expect(response.body.error.message).toContain('yourself');
    });

    it('should reject duplicate connection request', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(connectedUserId),
        email: 'connected@example.com',
      };

      const existingConnection = {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(userId),
        connectedUserId: new mongoose.Types.ObjectId(connectedUserId),
        status: 'pending',
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Connection.findOne as jest.Mock).mockResolvedValue(existingConnection);

      const response = await request(app)
        .post('/api/v1/connections/request')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ connectedUserId });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONNECTION_ERROR');
      expect(response.body.error.message).toContain('already exists');
    });

    it('should reject request with missing connectedUserId', async () => {
      const response = await request(app)
        .post('/api/v1/connections/request')
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/connections', () => {
    it('should list all connections for a user', async () => {
      const mockConnections = [
        {
          _id: new mongoose.Types.ObjectId(connectionId),
          userId: new mongoose.Types.ObjectId(userId),
          connectedUserId: new mongoose.Types.ObjectId(connectedUserId),
          status: 'accepted',
          requestedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          populated: jest.fn((field) => {
            if (field === 'connectedUserId') {
              return {
                _id: new mongoose.Types.ObjectId(connectedUserId),
                email: 'connected@example.com',
                firstName: 'Connected',
                lastName: 'User',
                profilePicture: 'pic.jpg',
              };
            }
            return null;
          }),
        },
      ];

      (Connection.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                skip: jest.fn().mockResolvedValue(mockConnections),
              }),
            }),
          }),
        }),
      });

      (Connection.countDocuments as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/connections')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.connections).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.offset).toBe(0);
    });

    it('should filter connections by status', async () => {
      const mockConnections = [
        {
          _id: new mongoose.Types.ObjectId(connectionId),
          userId: new mongoose.Types.ObjectId(userId),
          connectedUserId: new mongoose.Types.ObjectId(connectedUserId),
          status: 'pending',
          requestedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          populated: jest.fn(() => null),
        },
      ];

      (Connection.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                skip: jest.fn().mockResolvedValue(mockConnections),
              }),
            }),
          }),
        }),
      });

      (Connection.countDocuments as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/connections?status=pending')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.connections).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (Connection.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                skip: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      (Connection.countDocuments as jest.Mock).mockResolvedValue(50);

      const response = await request(app)
        .get('/api/v1/connections?limit=20&offset=10')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(20);
      expect(response.body.offset).toBe(10);
    });

    it('should reject request without authorization', async () => {
      const response = await request(app).get('/api/v1/connections');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/v1/connections/:id', () => {
    it('should accept a connection request', async () => {
      const mockConnection = {
        _id: new mongoose.Types.ObjectId(connectionId),
        userId: new mongoose.Types.ObjectId(userId),
        connectedUserId: new mongoose.Types.ObjectId(userId), // The current user is the recipient
        status: 'pending',
        requestedAt: new Date(),
        respondedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (Connection.findById as jest.Mock).mockResolvedValue(mockConnection);

      const response = await request(app)
        .put(`/api/v1/connections/${connectionId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'accepted' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('accepted');
      expect(mockConnection.save).toHaveBeenCalled();
    });

    it('should reject connection request', async () => {
      const mockConnection = {
        _id: new mongoose.Types.ObjectId(connectionId),
        userId: new mongoose.Types.ObjectId(userId),
        connectedUserId: new mongoose.Types.ObjectId(userId), // The current user is the recipient
        status: 'pending',
        requestedAt: new Date(),
        respondedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (Connection.findById as jest.Mock).mockResolvedValue(mockConnection);

      const response = await request(app)
        .put(`/api/v1/connections/${connectionId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'rejected' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('rejected');
    });

    it('should reject update from non-recipient', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      const mockConnection = {
        _id: new mongoose.Types.ObjectId(connectionId),
        userId: new mongoose.Types.ObjectId(userId),
        connectedUserId: new mongoose.Types.ObjectId(otherUserId),
        status: 'pending',
      };

      (Connection.findById as jest.Mock).mockResolvedValue(mockConnection);

      const response = await request(app)
        .put(`/api/v1/connections/${connectionId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'accepted' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('UPDATE_ERROR');
      expect(response.body.error.message).toContain('Unauthorized');
    });

    it('should reject update of non-pending connection', async () => {
      const mockConnection = {
        _id: new mongoose.Types.ObjectId(connectionId),
        userId: new mongoose.Types.ObjectId(userId),
        connectedUserId: new mongoose.Types.ObjectId(userId), // The current user is the recipient
        status: 'accepted',
        requestedAt: new Date(),
        respondedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (Connection.findById as jest.Mock).mockResolvedValue(mockConnection);

      const response = await request(app)
        .put(`/api/v1/connections/${connectionId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'rejected' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('UPDATE_ERROR');
      expect(response.body.error.message).toContain('pending');
    });

    it('should return 404 for non-existent connection', async () => {
      (Connection.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/v1/connections/${connectionId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'accepted' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('UPDATE_ERROR');
    });

    it('should reject request without authorization', async () => {
      const response = await request(app)
        .put(`/api/v1/connections/${connectionId}`)
        .send({ status: 'accepted' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('DELETE /api/v1/connections/:id', () => {
    it('should remove a connection', async () => {
      const mockConnection = {
        _id: new mongoose.Types.ObjectId(connectionId),
        userId: new mongoose.Types.ObjectId(userId),
        connectedUserId: new mongoose.Types.ObjectId(connectedUserId),
        status: 'accepted',
      };

      (Connection.findById as jest.Mock).mockResolvedValue(mockConnection);
      (Connection.findByIdAndDelete as jest.Mock).mockResolvedValue(mockConnection);

      const response = await request(app)
        .delete(`/api/v1/connections/${connectionId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('removed successfully');
      expect(Connection.findByIdAndDelete).toHaveBeenCalledWith(connectionId);
    });

    it('should allow requester to remove connection', async () => {
      const mockConnection = {
        _id: new mongoose.Types.ObjectId(connectionId),
        userId: new mongoose.Types.ObjectId(userId),
        connectedUserId: new mongoose.Types.ObjectId(connectedUserId),
        status: 'accepted',
      };

      (Connection.findById as jest.Mock).mockResolvedValue(mockConnection);
      (Connection.findByIdAndDelete as jest.Mock).mockResolvedValue(mockConnection);

      const response = await request(app)
        .delete(`/api/v1/connections/${connectionId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject removal from unauthorized user', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      const mockConnection = {
        _id: new mongoose.Types.ObjectId(connectionId),
        userId: new mongoose.Types.ObjectId(otherUserId),
        connectedUserId: new mongoose.Types.ObjectId(otherUserId),
        status: 'accepted',
      };

      (Connection.findById as jest.Mock).mockResolvedValue(mockConnection);

      const response = await request(app)
        .delete(`/api/v1/connections/${connectionId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('DELETE_ERROR');
    });

    it('should return 404 for non-existent connection', async () => {
      (Connection.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/v1/connections/${connectionId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('DELETE_ERROR');
    });

    it('should reject request without authorization', async () => {
      const response = await request(app).delete(`/api/v1/connections/${connectionId}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
