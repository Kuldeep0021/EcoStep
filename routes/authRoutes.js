import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Routes for register and login
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
