import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    isAdmin: { type: Boolean, default: false },
    /** free | pro | team — enforced for resume & AI limits */
    plan: { type: String, enum: ["free", "pro", "team"], default: "free" },
    /** YYYY-MM for aiUsageCount reset */
    aiUsageMonth: { type: String, default: "" },
    aiUsageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);



