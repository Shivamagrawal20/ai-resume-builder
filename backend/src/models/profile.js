import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Profile = mongoose.models.Profile ?? mongoose.model("Profile", profileSchema);
