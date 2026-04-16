import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    layout: { type: String },
    color: { type: String },
    font: { type: String },
  },
  { timestamps: true }
);

export const Template = mongoose.models.Template ?? mongoose.model("Template", templateSchema);
