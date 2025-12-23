import mongoose, { Connection, Mongoose } from 'mongoose';

/**
 * Shape of the cached connection object stored on the global scope.
 * We cache both the Mongoose instance (conn) and the connection promise (promise)
 * to prevent creating multiple connections in development when modules are reloaded.
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the Node.js global type to include our mongoose cache.
 * This allows us to store the cache on globalThis without using `any`.
 */
declare global {
   
  var _mongoose: MongooseCache | undefined;
}

// Initialize the cache on the global object if it does not exist yet.
// In serverless / serverful environments that reload modules between requests
// (e.g. Next.js in development), this prevents creating a new connection each time.
const cached: MongooseCache = globalThis._mongoose || {
  conn: null,
  promise: null,
};

if (!globalThis._mongoose) {
  globalThis._mongoose = cached;
}

/**
 * Validate that the MongoDB connection string exists.
 * Throwing early helps fail fast during boot if configuration is missing.
 */
const MONGODB_URI: string = process.env.MONGODB_URI ?? '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in your environment.');
}

// Debug: Log masked URI to help diagnose connection issues
const maskedUri = MONGODB_URI.replace(/:([^@]+)@/, ':***@');
console.log('[MongoDB] Connecting with URI:', maskedUri);

/**
 * Establishes (or reuses) a Mongoose connection to MongoDB.
 *
 * This function is safe to call multiple times; it will return an existing
 * connection if one has already been established.
 */
export async function connectToDatabase(): Promise<Connection> {
  // If we already have an active connection, reuse it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in progress, reuse the same promise.
  if (!cached.promise) {
    const options: Parameters<typeof mongoose.connect>[1] = {
      // Add any shared Mongoose options here.
      // For example, you can set `bufferCommands` if desired:
      // bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, options);
  }

  const mongooseInstance = await cached.promise;

  // Store the resolved connection for future calls.
  cached.conn = mongooseInstance.connection;

  return cached.conn;
}

/**
 * Convenience helper to get the underlying Mongoose instance if needed
 * (for accessing models, schemas, etc.). Most callers should prefer
 * `connectToDatabase` instead.
 */
export function getMongoose(): typeof mongoose {
  return mongoose;
}

export default connectToDatabase;
