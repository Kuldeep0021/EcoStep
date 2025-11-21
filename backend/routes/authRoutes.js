import express from "express";
const router = express.Router();

// Temporary placeholder route
router.get("/", (req, res) => {
  res.json({ message: "Auth routes working" });
});

export default router;
