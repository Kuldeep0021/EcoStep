import mongoose from "mongoose";

const footprintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    transportation: { type: Number, default: 0 }, // in kg CO2
    energy: { type: Number, default: 0 },         // in kg CO2
    diet: { type: Number, default: 0 },           // in kg CO2
    other: { type: Number, default: 0 },          // in kg CO2
    total: { type: Number, default: 0 },          // sum of all
  },
  { timestamps: true }
);

export default mongoose.model("Footprint", footprintSchema);
