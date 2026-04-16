import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String }
  },
  { timestamps: true }
);


export const Experience =
  mongoose.models.Experience || mongoose.model("Experience", experienceSchema);
