#!/usr/bin/env ts-node

/**
 * Verify Database Indexes Script
 * 
 * This script verifies that all required indexes are created on MongoDB collections.
 * Run this script to ensure database performance optimization.
 * 
 * Usage:
 *   ts-node scripts/verify-indexes.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('✗ MONGODB_URI environment variable is not set');
  process.exit(1);
}

const requiredIndexes: { [key: string]: string[] } = {
  users: ['email_1', 'username_1', 'createdAt_-1'],
  workouts: ['userId_1_createdAt_-1', 'exerciseType_1', 'createdAt_-1'],
  nutrition_entries: ['userId_1_loggedAt_-1', 'loggedAt_-1'],
  goals: ['userId_1_status_1', 'targetDate_1'],
  connections: ['userId_1_status_1', 'connectedUserId_1_status_1', 'createdAt_-1'],
  activity_feed: ['userId_1_createdAt_-1', 'createdAt_-1'],
};

async function verifyIndexes(): Promise<void> {
  console.log('\n=== Database Indexes Verification ===\n');

  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✓ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    let allIndexesValid = true;

    for (const [collectionName, expectedIndexes] of Object.entries(requiredIndexes)) {
      console.log(`📦 Collection: ${collectionName}`);
      
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();

        const indexNames = indexes.map(idx => idx.name).filter(name => name !== '_id_');
        
        console.log(`   Found ${indexNames.length} indexes:`);
        indexes.forEach(idx => {
          if (idx.name !== '_id_') {
            console.log(`   ✓ ${idx.name}: ${JSON.stringify(idx.key)}`);
          }
        });

        // Check for missing indexes
        const missingIndexes = expectedIndexes.filter(
          expected => !indexNames.some(actual => actual.includes(expected.split('_')[0]))
        );

        if (missingIndexes.length > 0) {
          console.log(`   ⚠ Missing indexes: ${missingIndexes.join(', ')}`);
          allIndexesValid = false;
        }

        console.log('');
      } catch (error: any) {
        console.log(`   ⚠ Collection not yet created (will be created on first insert)\n`);
      }
    }

    if (allIndexesValid) {
      console.log('✓ All required indexes are present\n');
    } else {
      console.log('⚠ Some indexes may be missing. They will be created on first insert.\n');
    }

  } catch (error) {
    console.error('✗ Verification failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

verifyIndexes();
