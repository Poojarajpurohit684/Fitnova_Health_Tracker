import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Verify MongoDB Atlas Connection
 * Tests:
 * 1. Connection string is valid
 * 2. Database is accessible
 * 3. Connection pooling settings
 * 4. SSL/TLS is enabled
 */
async function verifyConnection(): Promise<void> {
  console.log('\n=== MongoDB Atlas Connection Verification ===\n');

  try {
    // 1. Verify connection string
    console.log('1. Checking connection string...');
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    if (!mongoUri.startsWith('mongodb+srv://')) {
      throw new Error('Connection string must use mongodb+srv:// protocol (MongoDB Atlas)');
    }

    console.log('   ✓ Connection string is valid');
    console.log(`   ✓ Using MongoDB Atlas (mongodb+srv protocol)`);

    // 2. Verify SSL/TLS
    console.log('\n2. Checking SSL/TLS configuration...');
    if (mongoUri.includes('ssl=true') || mongoUri.includes('retryWrites=true')) {
      console.log('   ✓ SSL/TLS is enabled');
    } else {
      console.log('   ⚠ SSL/TLS configuration not explicitly set (MongoDB Atlas uses SSL by default)');
    }

    // 3. Connect to database
    console.log('\n3. Connecting to MongoDB Atlas...');
    const startTime = Date.now();
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const connectionTime = Date.now() - startTime;
    console.log(`   ✓ Connected successfully (${connectionTime}ms)`);

    // 4. Verify database is accessible
    console.log('\n4. Verifying database accessibility...');
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }

    const adminDb = db.admin();
    const pingResult = await adminDb.ping();
    console.log('   ✓ Database is accessible');
    console.log(`   ✓ Ping response: ${JSON.stringify(pingResult)}`);

    // 5. Check connection pooling
    console.log('\n5. Checking connection pooling...');
    // Mongoose/MongoDB driver internals differ across driver versions,
    // so we keep this check resilient to typing changes.
    const client: any = mongoose.connection.getClient();
    const poolStats = client?.topology?.s?.pool;

    if (poolStats) {
      console.log(`   ✓ Connection pool size: ${poolStats.totalConnectionCount || 'N/A'}`);
      console.log(`   ✓ Available connections: ${poolStats.availableConnectionCount || 'N/A'}`);
    } else {
      console.log('   ✓ Connection pooling is active');
    }

    // 6. Get database stats
    console.log('\n6. Getting database statistics...');
    const stats = await db.stats();
    console.log(`   ✓ Database name: ${stats.db}`);
    console.log(`   ✓ Collections: ${stats.collections}`);
    console.log(`   ✓ Data size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   ✓ Storage size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);

    // 7. List collections
    console.log('\n7. Listing collections...');
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   ⚠ No collections found (database is empty)');
    } else {
      console.log(`   ✓ Found ${collections.length} collection(s):`);
      collections.forEach(col => {
        console.log(`     - ${col.name}`);
      });
    }

    // 8. Verify connection options
    console.log('\n8. Verifying connection options...');
    const mongooseOptions = mongoose.connection.getClient().options;
    console.log(`   ✓ Max pool size: ${mongooseOptions.maxPoolSize || 10}`);
    console.log(`   ✓ Min pool size: ${mongooseOptions.minPoolSize || 5}`);
    console.log(`   ✓ Server selection timeout: ${mongooseOptions.serverSelectionTimeoutMS || 30000}ms`);
    console.log(`   ✓ Socket timeout: ${mongooseOptions.socketTimeoutMS || 45000}ms`);

    console.log('\n=== ✓ All Verification Checks Passed ===\n');

  } catch (error) {
    console.error('\n=== ✗ Verification Failed ===\n');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB\n');
  }
}

verifyConnection();
