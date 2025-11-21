// backend/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import AirQuality from "./models/AirQuality.js";
import fs from "fs";
import PDFDocument from "pdfkit";
import { Parser } from "json2csv";

dotenv.config();

const app = express();

// ✅ CORS config (frontend access)
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// ✅ Create HTTP + Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ List of Indian cities (26 cities)
const cities = [
  { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Surat", lat: 21.1702, lon: 72.8311 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Patna", lat: 25.5941, lon: 85.1376 },
  { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
  { name: "Noida", lat: 28.5355, lon: 77.3910 },
  { name: "Ghaziabad", lat: 28.6692, lon: 77.4538 },
  { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
  { name: "Agra", lat: 27.1767, lon: 78.0081 },
  { name: "Meerut", lat: 28.9845, lon: 77.7064 },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { name: "Ludhiana", lat: 30.9010, lon: 75.8573 },
  { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
];

// ✅ In-memory last PM2.5 value per city (for random walk)
const lastValues = {};

// ✅ Fetch AQI + weather for a city (with random-walk PM2.5)
async function fetchCityData(city) {
  try {
    // Live temperature from Open-Meteo
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`
    );

    const temp =
      weatherRes.data?.current_weather?.temperature !== undefined
        ? weatherRes.data.current_weather.temperature
        : null;

    // ---- PM2.5 as random walk so graph isn't flat ----
    let prev = lastValues[city.name];
    // initial value 20–120 if not present
    if (prev == null) {
      prev = Math.random() * 100 + 20;
    }

    // small random step up/down: -8 to +8
    const delta = (Math.random() - 0.5) * 16;
    let value = prev + delta;

    // clamp 10–200 range
    value = Math.max(10, Math.min(200, value));

    // 1 decimal place
    value = Number(value.toFixed(1));

    // store for next cycle
    lastValues[city.name] = value;

    // Humidity random 40–80 (mock)
    const humidity = Math.floor(Math.random() * 40 + 40);

    const data = {
      city: city.name,
      parameter: "PM2.5",
      value,
      unit: "µg/m³",
      temperature: temp,
      humidity,
      lat: city.lat,
      lon: city.lon,
      timestamp: new Date(),
    };

    // Save latest reading
    await AirQuality.create(data).catch(() => {});

    // Push to all connected clients
    io.emit("airQualityUpdate", data);

    console.log(
      `✅ ${city.name}: PM2.5 ${value} µg/m³ | 🌡 ${temp}°C | 💧 ${humidity}%`
    );
  } catch (err) {
    console.error(`❌ Error fetching data for ${city.name}:`, err.message);
  }
}

// ✅ Run updates every 60 seconds
setInterval(() => cities.forEach(fetchCityData), 60000);
// and one initial fetch on startup
cities.forEach(fetchCityData);

// ✅ Socket.io connection handler
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  socket.emit("connected", {
    status: "ok",
    message: "Connected to EcoStep Backend",
  });

  socket.on("disconnect", () =>
    console.log("🔌 Client disconnected:", socket.id)
  );
});

// ✅ REST API — City list (for dropdowns / filters)
app.get("/api/cities", (req, res) => {
  res.json(cities);
});

// ✅ REST API — Latest AQI (last 50 records)
app.get("/api/airquality/latest", async (req, res) => {
  try {
    const data = await AirQuality.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ REST API — Export CSV
app.get("/api/export/csv", async (req, res) => {
  try {
    const data = await AirQuality.find().sort({ timestamp: -1 }).limit(50);
    const parser = new Parser({
      fields: [
        "city",
        "parameter",
        "value",
        "unit",
        "temperature",
        "humidity",
        "timestamp",
      ],
    });
    const csv = parser.parse(data);
    const filePath = "EcoStep_Report.csv";
    fs.writeFileSync(filePath, csv);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ REST API — Export PDF
app.get("/api/export/pdf", async (req, res) => {
  try {
    const data = await AirQuality.find().sort({ timestamp: -1 }).limit(50);
    const doc = new PDFDocument();
    const filePath = "EcoStep_Report.pdf";
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text("EcoStep Air Quality Report", { align: "center" });
    doc.moveDown();

    data.forEach((d) => {
      doc
        .fontSize(12)
        .text(
          `${d.city} | ${d.parameter}: ${d.value} ${d.unit} | 🌡 ${
            d.temperature
          }°C | 💧 ${d.humidity}% | ${new Date(d.timestamp).toLocaleString()}`
        );
      doc.moveDown(0.5);
    });

    doc.end();
    stream.on("finish", () => res.download(filePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start the backend
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 EcoStep Backend running on port ${PORT}`)
);
