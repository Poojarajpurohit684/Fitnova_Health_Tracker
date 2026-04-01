// Jest setup file for test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fit-nova-test';

// Set test timeout to 30 seconds for integration tests
jest.setTimeout(30000);
