import mongoose, { type Mongoose } from "mongoose";

/**
 * Cached Mongoose connection.
 *
 * In development, Next.js hot-reloads modules on every change, which would
 * otherwise open a brand-new connection on each reload and eventually exhaust
 * MongoDB's connection pool. In serverless production (Vercel), the module can
 * be re-invoked across warm lambda invocations. In both cases we stash the
 * connection (and the in-flight promise) on `globalThis` so it survives.
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Add it to .env.local (see .env.local.example)."
  );
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Augment the global type so TypeScript knows about our cache.
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis._mongoose ?? {
  conn: null,
  promise: null,
};

globalThis._mongoose = cached;

/**
 * Connect to MongoDB, reusing an existing connection when possible.
 * Call this at the top of any server-side code that touches the database.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      // Fail fast instead of buffering queries when the DB is unreachable.
      bufferCommands: false,
      // Reasonable pool for serverless; tune per workload.
      maxPoolSize: 10,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise so the next call can retry a fresh connection.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
