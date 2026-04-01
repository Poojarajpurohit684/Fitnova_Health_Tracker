#!/usr/bin/env ts-node

/**
 * MongoDB Setup Script
 * 
 * This script initializes MongoDB collections and indexes for FitNova.
 * Run this script after deploying to a new MongoDB Atlas cluster.
 * 
 * Usage:
 *   npm run setup:mongodb
 *   or
 *   ts-node scripts/setup-mongodb.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Workout } from '../src/models/Workout';
import { NutritionEntry } from '../src/models/NutritionEntry';
import { Goal } from '../src/models/Goal';
import { Connection } from '../src/models/Connection';
import { ActivityFeed } from '../src/models/ActivityFeed';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('✗ MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function setupMongoDB(): Promise<void> {
  try {
    console.log('🔧 Starting MongoDB setup...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connected to MongoDB Atlas\n');

    // Create collections
    await createCollections();

    // Create indexes
    await createIndexes();

    // Verify setup
    await verifySetup();

    console.log('\n✓ MongoDB setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify collections in MongoDB Atlas UI');
    console.log('2. Run connection tests: npm run test:connection');
    console.log('3. Start the application: npm start');

  } catch (error) {
    console.error('\n✗ MongoDB setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

async function createCollections(): Promise<void> {
  console.log('📦 Creating collections...');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const collections = await db.listCollections().toArray();
  const existingCollections = collections.map(c => c.name);

  const requiredCollections = [
    { name: 'users', model: User },
    { name: 'workouts', model: Workout },
    { name: 'nutrition_entries', model: NutritionEntry },
    { name: 'goals', model: Goal },
    { name: 'connections', model: Connection },
    { name: 'activity_feed', model: ActivityFeed },
  ];

  for (const { name, model } of requiredCollections) {
    if (existingCollections.includes(name)) {
      console.log(`  ✓ Collection '${name}' already exists`);
    } else {
      try {
        await db.createCollection(name);
        console.log(`  ✓ Created collection '${name}'`);
      } catch (error: any) {
        if (error.code === 48) {
          // Collection already exists (race condition)
          console.log(`  ✓ Collection '${name}' already exists`);
        } else {
          throw error;
        }
      }
    }
  }

  console.log('✓ Collections ready\n');
}

async function createIndexes(): Promise<void> {
  console.log('🔍 Creating indexes...');

  try {
    // Users collection indexes
    console.log('  Creating indexes for users collection...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: -1 });
    console.log('    ✓ email (unique)');
    console.log('    ✓ username (unique)');
    console.log('    ✓ createdAt');

    // Workouts collection indexes
    console.log('  Creating indexes for workouts collection...');
    await Workout.collection.createIndex({ userId: 1, createdAt: -1 });
    await Workout.collection.createIndex({ exerciseType: 1 });
    await Workout.collection.createIndex({ createdAt: -1 });
    console.log('    ✓ userId + createdAt (compound)');
    console.log('    ✓ exerciseType');
    console.log('    ✓ createdAt');

    // Nutrition entries collection indexes
    console.log('  Creating indexes for nutrition_entries collection...');
    await NutritionEntry.collection.createIndex({ userId: 1, loggedAt: -1 });
    await NutritionEntry.collection.createIndex({ loggedAt: -1 });
    console.log('    ✓ userId + loggedAt (compound)');
    console.log('    ✓ loggedAt');

    // Goals collection indexes
    console.log('  Creating indexes for goals collection...');
    await Goal.collection.createIndex({ userId: 1, status: 1 });
    await Goal.collection.createIndex({ targetDate: 1 });
    console.log('    ✓ userId + status (compound)');
    console.log('    ✓ targetDate');

    // Connections collection indexes
    console.log('  Creating indexes for connections collection...');
    await Connection.collection.createIndex({ userId: 1, status: 1 });
    await Connection.collection.createIndex({ connectedUserId: 1, status: 1 });
    await Connection.collection.createIndex({ createdAt: -1 });
    console.log('    ✓ userId + status (compound)');
    console.log('    ✓ connectedUserId + status (compound)');
    console.log('    ✓ createdAt');

    // Activity feed collection indexes
    console.log('  Creating indexes for activity_feed collection...');
    await ActivityFeed.collection.createIndex({ userId: 1, createdAt: -1 });
    await ActivityFeed.collection.createIndex({ createdAt: -1 });
    console.log('    ✓ userId + createdAt (compound)');
    console.log('    ✓ createdAt');

    console.log('✓ All indexes created successfully\n');
  } catch (error: any) {
    if (error.code === 85) {
      // Index already exists
      console.log('✓ Indexes already exist\n');
    } else {
      throw error;
    }
  }
}

async function verifySetup(): Promise<void> {
  console.log('✅ Verifying setup...');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  // Verify collections
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  const requiredCollections = [
    'users',
    'workouts',
    'nutrition_entries',
    'goals',
    'connections',
    'activity_feed',
  ];

  console.log('\n  Collections:');
  for (const collection of requiredCollections) {
    if (collectionNames.includes(collection)) {
      console.log(`    ✓ ${collection}`);
    } else {
      console.log(`    ✗ ${collection} (missing)`);
    }
  }

  // Verify indexes
  console.log('\n  Indexes:');
  const indexCollections = [
    { name: 'users', model: User },
    { name: 'workouts', model: Workout },
    { name: 'nutrition_entries', model: NutritionEntry },
    { name: 'goals', model: Goal },
    { name: 'connections', model: Connection },
    { name: 'activity_feed', model: ActivityFeed },
  ];

  for (const { name, model } of indexCollections) {
    try {
      const indexes = await model.collection.getIndexes();
      const indexCount = Object.keys(indexes).length - 1; // Exclude _id index
      console.log(`    ✓ ${name} (${indexCount} indexes)`);
    } catch (error) {
      console.log(`    ✗ ${name} (error reading indexes)`);
    }
  }

  console.log('\n✓ Verification complete');
}

// Run setup
setupMongoDB().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
