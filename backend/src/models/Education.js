import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String },
    startYear: { type: String },
    endYear: { type: String }
  },
  { timestamps: true }
);

export const Education =
  mongoose.models.Education || mongoose.model("Education", educationSchema);