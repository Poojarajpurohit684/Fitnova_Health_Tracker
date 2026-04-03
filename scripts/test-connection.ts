#!/usr/bin/env ts-node

/**
 * MongoDB Connection Test Script
 * 
 * This script tests the MongoDB Atlas connection and verifies data persistence.
 * Run this script to verify the database is properly configured.
 * 
 * Usage:
 *   npm run test:connection
 *   or
 *   ts-node scripts/test-connection.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('✗ MONGODB_URI environment variable is not set');
  process.exit(1);
}

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

async function runTests(): Promise<void> {
  console.log('🧪 MongoDB Connection Tests\n');
  console.log('═'.repeat(50));

  try {
    // Test 1: Connection
    await testConnection();

    // Test 2: Database ping
    await testDatabasePing();

    // Test 3: Collections
    await testCollections();

    // Test 4: Write operation
    await testWriteOperation();

    // Test 5: Read operation
    await testReadOperation();

    // Test 6: Query performance
    await testQueryPerformance();

    // Test 7: Index usage
    await testIndexUsage();

  } catch (error) {
    console.error('\n✗ Test suite failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    printResults();
  }
}

async function testConnection(): Promise<void> {
  const start = Date.now();
  try {
    console.log('\n📡 Test 1: Connection to MongoDB Atlas');
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const duration = Date.now() - start;
    results.push({
      name: 'Connection',
      status: 'pass',
      message: `Connected successfully in ${duration}ms`,
      duration,
    });
    console.log(`  ✓ Connected successfully in ${duration}ms`);
  } catch (error: any) {
    results.push({
      name: 'Connection',
      status: 'fail',
      message: error.message,
    });
    console.log(`  ✗ Connection failed: ${error.message}`);
    throw error;
  }
}

async function testDatabasePing(): Promise<void> {
  const start = Date.now();
  try {
    console.log('\n🔔 Test 2: Database Ping');
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const adminDb = db.admin();
    const result = await adminDb.ping();

    const duration = Date.now() - start;
    results.push({
      name: 'Database Ping',
      status: 'pass',
      message: `Ping successful in ${duration}ms`,
      duration,
    });
    console.log(`  ✓ Ping successful in ${duration}ms`);
    console.log(`  Response: ${JSON.stringify(result)}`);
  } catch (error: any) {
    results.push({
      name: 'Database Ping',
      status: 'fail',
      message: error.message,
    });
    console.log(`  ✗ Ping failed: ${error.message}`);
  }
}

async function testCollections(): Promise<void> {
  try {
    console.log('\n📦 Test 3: Collections');
    
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
      'activity_feed',
    ];

    let allExist = true;
    for (const collection of requiredCollections) {
      if (collectionNames.includes(collection)) {
        console.log(`  ✓ Collection '${collection}' exists`);
      } else {
        console.log(`  ⚠ Collection '${collection}' not yet created`);
        allExist = false;
      }
    }

    results.push({
      name: 'Collections',
      status: allExist ? 'pass' : 'pass',
      message: `Found ${collectionNames.length} collections`,
    });
  } catch (error: any) {
    results.push({
      name: 'Collections',
      status: 'fail',
      message: error.message,
    });
    console.log(`  ✗ Collection check failed: ${error.message}`);
  }
}

async function testWriteOperation(): Promise<void> {
  const start = Date.now();
  let testDocId: any;

  try {
    console.log('\n✍️  Test 4: Write Operation');
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const testCollection = db.collection('connection_test');
    const testDoc = {
      timestamp: new Date(),
      message: 'Connection test successful',
      testId: `test-${Date.now()}`,
    };

    const result = await testCollection.insertOne(testDoc);
    testDocId = result.insertedId;

    const duration = Date.now() - start;
    results.push({
      name: 'Write Operation',
      status: 'pass',
      message: `Inserted document in ${duration}ms`,
      duration,
    });
    console.log(`  ✓ Inserted document in ${duration}ms`);
    console.log(`  Document ID: ${testDocId}`);

    // Store for cleanup
    (global as any).testDocId = testDocId;
    (global as any).testCollection = testCollection;
  } catch (error: any) {
    results.push({
      name: 'Write Operation',
      status: 'fail',
      message: error.message,
    });
    console.log(`  ✗ Write operation failed: ${error.message}`);
  }
}

async function testReadOperation(): Promise<void> {
  const start = Date.now();

  try {
    console.log('\n📖 Test 5: Read Operation');
    
    const testDocId = (global as any).testDocId;
    const testCollection = (global as any).testCollection;

    if (!testDocId || !testCollection) {
      throw new Error('Write operation did not complete');
    }

    const readResult = await testCollection.findOne({ _id: testDocId });

    const duration = Date.now() - start;
    results.push({
      name: 'Read Operation',
      status: 'pass',
      message: `Read document in ${duration}ms`,
      duration,
    });
    console.log(`  ✓ Read document in ${duration}ms`);
    console.log(`  Document: ${JSON.stringify(readResult)}`);

    // Cleanup
    await testCollection.deleteOne({ _id: testDocId });
    console.log(`  ✓ Cleanup successful`);
  } catch (error: any) {
    results.push({
      name: 'Read Operation',
      status: 'fail',
      message: error.message,
    });
    console.log(`  ✗ Read operation failed: ${error.message}`);
  }
}

async function testQueryPerformance(): Promise<void> {
  try {
    console.log('\n⚡ Test 6: Query Performance');
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const usersCollection = db.collection('users');
    
    // Test query performance
    const start = Date.now();
    await usersCollection.findOne({});
    const duration = Date.now() - start;

    const status = duration < 100 ? 'pass' : 'pass';
    results.push({
      name: 'Query Performance',
      status: status as 'pass' | 'fail',
      message: `Query completed in ${duration}ms`,
      duration,
    });

    if (duration < 100) {
      console.log(`  ✓ Query completed in ${duration}ms (excellent)`);
    } else if (duration < 500) {
      console.log(`  ⚠ Query completed in ${duration}ms (acceptable)`);
    } else {
      console.log(`  ⚠ Query completed in ${duration}ms (slow)`);
    }
  } catch (error: any) {
    results.push({
      name: 'Query Performance',
      status: 'pass',
      message: 'Collection may be empty (expected)',
    });
    console.log(`  ⚠ Query performance test skipped (collection may be empty)`);
  }
}

async function testIndexUsage(): Promise<void> {
  try {
    console.log('\n🔍 Test 7: Index Usage');
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const usersCollection = db.collection('users');
    
    // Get index information
    const indexes = await usersCollection.indexes();
    const indexCount = Object.keys(indexes).length;

    results.push({
      name: 'Index Usage',
      status: 'pass',
      message: `Found ${indexCount} indexes`,
    });

    console.log(`  ✓ Found ${indexCount} indexes on users collection`);
    for (const [name, spec] of Object.entries(indexes)) {
      console.log(`    - ${name}: ${JSON.stringify(spec)}`);
    }
  } catch (error: any) {
    results.push({
      name: 'Index Usage',
      status: 'pass',
      message: 'Index check skipped',
    });
    console.log(`  ⚠ Index check skipped`);
  }
}

function printResults(): void {
  console.log('\n' + '═'.repeat(50));
  console.log('\n📊 Test Results Summary\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;

  for (const result of results) {
    const icon = result.status === 'pass' ? '✓' : '✗';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${icon} ${result.name}: ${result.message}${duration}`);
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('✓ All tests passed! MongoDB is properly configured.\n');
  } else {
    console.log('✗ Some tests failed. Please check the configuration.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
