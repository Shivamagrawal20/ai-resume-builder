import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    level: { type: String } // Beginner, Intermediate, Expert
  },
  { timestamps: true }
);

export const Skill =
  mongoose.models.Skill || mongoose.model("Skill", skillSchema);