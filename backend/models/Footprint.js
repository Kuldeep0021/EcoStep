import mongoose from "mongoose";

const footprintSchema = new mongoose.Schema({
  user: { type: String, required: true },
  activityType: { type: String, required: true },
  carbonValue: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Footprint = mongoose.model("Footprint", footprintSchema);
export default Footprint;
