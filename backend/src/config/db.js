import mongoose from "mongoose";
import { env } from "./index.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(
      "MongoDB connection failed. Check MONGODB_URI, database user/password, and Atlas → Network Access (add 0.0.0.0/0 for cloud hosts like Render).",
      err?.message || err
    );
    throw err;
  }
}



