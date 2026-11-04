import mongoose from "mongoose";

let cache = global.mongoose;
if (!cache) {
  cache = global.mongoose = { connection: null, promise: null };
}

const connectDB = async () => {
  if (cache.connection) return cache.connection;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      dbName: "quickcart",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    }).then((connection) => {
      cache.connection = connection;
      return connection;
    }).catch((error) => {
      // A rejected promise must not poison every subsequent request.
      cache.promise = null;
      cache.connection = null;
      throw error;
    });
  }
  return cache.promise;
};

export default connectDB;
