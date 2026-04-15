import mongoose from "mongoose";
import { env } from "./index.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
}


