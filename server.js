import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import footprintRoutes from "./routes/footprintRoutes.js";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Normal REST routes
app.use("/api/auth", authRoutes);
app.use("/api/footprints", footprintRoutes);

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Function to fetch live air quality data from OpenAQ
const fetchAirQuality = async () => {
  try {
    const response = await axios.get("https://api.openaq.org/v2/latest?limit=1&sort=desc");
    const data = response.data;
    io.emit("airQualityUpdate", data); // Send data to all connected clients
  } catch (error) {
    console.error("Error fetching air quality data:", error.message);
  }
};

// Handle socket connections
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Send initial data immediately
  fetchAirQuality();

  // Send updated data every 30 seconds
  const interval = setInterval(fetchAirQuality, 30000);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    clearInterval(interval);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
