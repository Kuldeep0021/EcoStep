import express from "express";
import { addFootprint, getFootprints } from "../controllers/footprintController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add new footprint
router.post("/add", authMiddleware, addFootprint);

// Get user footprints
router.get("/", authMiddleware, getFootprints);

export default router;
