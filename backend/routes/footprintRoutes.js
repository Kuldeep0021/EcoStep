import express from "express";
import Footprint from "../models/Footprint.js";

const router = express.Router();

// ✅ POST: Add new carbon footprint data
router.post("/", async (req, res) => {
  try {
    const { user, activityType, carbonValue, date } = req.body;

    const newFootprint = new Footprint({
      user,
      activityType,
      carbonValue,
      date,
    });

    await newFootprint.save();
    res.status(201).json({ message: "Footprint data added successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET: Fetch all footprint data
router.get("/", async (req, res) => {
  try {
    const footprints = await Footprint.find();
    res.status(200).json(footprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
