import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

/**
 * Setup test database with all required collections and indexes
 */
async function setupTestDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Setting up test database...');
    console.log(`MongoDB URI: ${mongoUri}`);

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      maxPoolSize: 5,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Drop existing test database
    console.log('Dropping existing test database...');
    await db.dropDatabase();
    console.log('✓ Test database dropped');

    // Create collections
    console.log('Creating collections...');
    const collections = [
      'users',
      'workouts',
      'nutrition_entries',
      'goals',
      'connections',
      'activity_feed',
      'notifications'
    ];

    for (const collectionName of collections) {
      await db.createCollection(collectionName);
      console.log(`  ✓ Created collection: ${collectionName}`);
    }

    // Create indexes
    console.log('Creating indexes...');

    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: -1 });
    console.log('  ✓ Users indexes created');

    // Workouts indexes
    await db.collection('workouts').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('workouts').createIndex({ exerciseType: 1 });
    await db.collection('workouts').createIndex({ createdAt: -1 });
    console.log('  ✓ Workouts indexes created');

    // Nutrition entries indexes
    await db.collection('nutrition_entries').createIndex({ userId: 1, loggedAt: -1 });
    await db.collection('nutrition_entries').createIndex({ loggedAt: -1 });
    console.log('  ✓ Nutrition entries indexes created');

    // Goals indexes
    await db.collection('goals').createIndex({ userId: 1, status: 1 });
    await db.collection('goals').createIndex({ targetDate: 1 });
    console.log('  ✓ Goals indexes created');

    // Connections indexes
    await db.collection('connections').createIndex({ userId: 1, status: 1 });
    await db.collection('connections').createIndex({ connectedUserId: 1, status: 1 });
    await db.collection('connections').createIndex({ createdAt: -1 });
    console.log('  ✓ Connections indexes created');

    // Activity feed indexes
    await db.collection('activity_feed').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('activity_feed').createIndex({ createdAt: -1 });
    console.log('  ✓ Activity feed indexes created');

    // Notifications indexes
    await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('notifications').createIndex({ read: 1, createdAt: -1 });
    console.log('  ✓ Notifications indexes created');

    console.log('✓ Test database setup complete');

    // Verify setup
    const collectionList = await db.listCollections().toArray();
    console.log(`\nCollections created: ${collectionList.length}`);
    collectionList.forEach(c => console.log(`  - ${c.name}`));

    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Test database setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupTestDatabase();
