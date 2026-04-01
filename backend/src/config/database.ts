import mongoose from 'mongoose';
import { User } from '../models/User';
import { Workout } from '../models/Workout';
import { NutritionEntry } from '../models/NutritionEntry';
import { Goal } from '../models/Goal';
import { Connection } from '../models/Connection';
import { ActivityFeed } from '../models/ActivityFeed';

/**
 * Connect to MongoDB and initialize database
 */
export async function connectDB(): Promise<void> {
  return initializeDatabase();
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB(): Promise<void> {
  return disconnectDatabase();
}

/**
 * Initialize MongoDB connection and ensure all indexes are created
 */
async function initializeDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const isTestEnv = process.env.NODE_ENV === 'test';
    const envLabel = isTestEnv ? 'Test' : 'Production';
    
    console.log(`Connecting to MongoDB ${envLabel}...`);
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: isTestEnv ? 5 : 10,
      minPoolSize: isTestEnv ? 1 : 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✓ Connected to MongoDB ${envLabel}`);

    // Ensure all indexes are created
    await ensureIndexes();

    // Verify collections exist
    await verifyCollections();

    console.log('✓ Database initialization complete');
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Ensure all required indexes are created
 */
async function ensureIndexes(): Promise<void> {
  try {
    console.log('Creating indexes...');

    // Users collection indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Users indexes created');

    // Workouts collection indexes
    await Workout.collection.createIndex({ userId: 1, createdAt: -1 });
    await Workout.collection.createIndex({ exerciseType: 1 });
    await Workout.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Workouts indexes created');

    // Nutrition entries collection indexes
    await NutritionEntry.collection.createIndex({ userId: 1, loggedAt: -1 });
    await NutritionEntry.collection.createIndex({ loggedAt: -1 });
    console.log('  ✓ Nutrition entries indexes created');

    // Goals collection indexes
    await Goal.collection.createIndex({ userId: 1, status: 1 });
    await Goal.collection.createIndex({ targetDate: 1 });
    console.log('  ✓ Goals indexes created');

    // Connections collection indexes
    await Connection.collection.createIndex({ userId: 1, status: 1 });
    await Connection.collection.createIndex({ connectedUserId: 1, status: 1 });
    await Connection.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Connections indexes created');

    // Activity feed collection indexes
    await ActivityFeed.collection.createIndex({ userId: 1, createdAt: -1 });
    await ActivityFeed.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Activity feed indexes created');

    console.log('✓ All indexes created successfully');
  } catch (error) {
    console.error('✗ Index creation failed:', error);
    throw error;
  }
}

/**
 * Verify all required collections exist
 */
async function verifyCollections(): Promise<void> {
  try {
    console.log('Verifying collections...');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const requiredCollections = [
      'users',
      'workouts',
      'nutrition_entries',
      'goals',
      'connections',
      'activity_feed'
    ];

    for (const collection of requiredCollections) {
      if (collectionNames.includes(collection)) {
        console.log(`  ✓ Collection '${collection}' exists`);
      } else {
        console.log(`  ⚠ Collection '${collection}' not yet created (will be created on first insert)`);
      }
    }

    console.log('✓ Collection verification complete');
  } catch (error) {
    console.error('✗ Collection verification failed:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<any> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const stats = await db.stats();
    return stats;
  } catch (error) {
    console.error('✗ Failed to get database stats:', error);
    throw error;
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(collectionName: string): Promise<any> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collection = db.collection(collectionName);
    const stats = await collection.stats();
    return stats;
  } catch (error) {
    console.error(`✗ Failed to get stats for collection '${collectionName}':`, error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Failed to disconnect from MongoDB:', error);
    throw error;
  }
}

/**
 * Clear all test data (for test environment only)
 */
export async function clearTestData(): Promise<void> {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearTestData can only be called in test environment');
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
    }

    console.log('✓ Test data cleared');
  } catch (error) {
    console.error('✗ Failed to clear test data:', error);
    throw error;
  }
}
