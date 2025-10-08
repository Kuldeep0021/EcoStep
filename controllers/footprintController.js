import Footprint from "../models/Footprint.js";

// Add footprint data
export const addFootprint = async (req, res) => {
  try {
    const { transportation, energy, diet, other } = req.body;

    const total = (transportation || 0) + (energy || 0) + (diet || 0) + (other || 0);

    const footprint = await Footprint.create({
      user: req.user.id,
      transportation,
      energy,
      diet,
      other,
      total,
    });

    res.status(201).json({ message: "Footprint added", footprint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get footprints
export const getFootprints = async (req, res) => {
  try {
    const footprints = await Footprint.find({ user: req.user.id }).sort({ date: -1 });
    res.json(footprints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
