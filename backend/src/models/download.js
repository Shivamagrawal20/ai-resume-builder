import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    fileType: { type: String, enum: ["pdf", "docx"], default: "pdf" },
  },
  { timestamps: true }
);

export const Download =
  mongoose.models.Download ?? mongoose.model("Download", downloadSchema);
