import mongoose from "mongoose";

const AirQualitySchema = new mongoose.Schema({
  city: { type: String, required: true },
  parameter: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, default: "µg/m³" },
  temperature: { type: Number },
  humidity: { type: Number },
  lat: { type: Number },
  lon: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("AirQuality", AirQualitySchema);
