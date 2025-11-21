// frontend/src/App.js
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import "./index.css";
import MapView from "./components/MapView";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnection: true,
});

function App() {
  const [cityData, setCityData] = useState({}); // { [cityName]: { ...data, history: [] } }
  const [cities, setCities] = useState([]); // [{ name, lat, lon }, ...] from /api/cities
  const [status, setStatus] = useState("Connecting...");
  const [view, setView] = useState("grid");
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // 👉 Socket connection + live updates
  useEffect(() => {
    socket.on("connected", () => setStatus("🟢 Connected to EcoStep"));
    socket.on("connect_error", () => setStatus("🔴 Connection failed"));
    socket.on("disconnect", () => setStatus("🔴 Disconnected"));

    socket.on("airQualityUpdate", (data) => {
      setCityData((prev) => ({
        ...prev,
        [data.city]: {
          ...data,
          history: [
            // keep last 30 points instead of 10
            ...(prev[data.city]?.history || []).slice(-29),
            {
              time: new Date().toLocaleTimeString(),
              value: data.value,
            },
          ],
        },
      }));
      setLastUpdated(new Date().toLocaleTimeString());
    });

    return () => {
      socket.off("connected");
      socket.off("airQualityUpdate");
      socket.off("disconnect");
    };
  }, []);

  // 👉 Fetch city list from backend (for dropdowns / grid)
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/cities")
      .then((res) => setCities(res.data))
      .catch((err) => console.error("Error fetching cities:", err.message));
  }, []);

  // 👉 Fetch initial latest AQI data to prefill cards/history
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/airquality/latest")
      .then((res) => {
        // res.data is sorted by timestamp desc (newest first)
        const grouped = {};

        const reversed = [...res.data].reverse(); // oldest → newest
        reversed.forEach((item) => {
          const city = item.city;
          const timeLabel = new Date(item.timestamp).toLocaleTimeString();

          if (!grouped[city]) {
            grouped[city] = {
              ...item,
              history: [],
            };
          }

          grouped[city].history = [
            ...(grouped[city].history || []),
            { time: timeLabel, value: item.value },
          ].slice(-30); // keep last 30 points
        });

        setCityData(grouped);
        if (res.data[0]) {
          setLastUpdated(
            new Date(res.data[0].timestamp).toLocaleTimeString()
          );
        }
      })
      .catch((err) => console.error("Error fetching latest AQI:", err.message));
  }, []);

  // ✅ AQI status function (handles "no data" safely)
  const getAQIStatus = (value) => {
    if (value == null) {
      return { label: "No Data", color: "#6b7280", bg: "#e5e7eb" };
    }
    if (value <= 50) return { label: "Good", color: "#16a34a", bg: "#dcfce7" };
    if (value <= 100)
      return { label: "Moderate", color: "#ca8a04", bg: "#fef9c3" };
    if (value <= 150)
      return { label: "Unhealthy", color: "#dc2626", bg: "#fee2e2" };
    return { label: "Hazardous", color: "#7f1d1d", bg: "#fecaca" };
  };

  const bgColor = darkMode ? "#0f172a" : "#f6fff6";
  const textColor = darkMode ? "#f1f5f9" : "#14532d";
  const cardColor = darkMode ? "#1e293b" : "#fff";

  // 👉 Build a consistent list of city names to show
  const cityNamesFromAPI = cities.map((c) => c.name);
  const cityNamesFromData = Object.keys(cityData);
  const allCityNames = Array.from(
    new Set([...cityNamesFromAPI, ...cityNamesFromData])
  );

  // ✅ Summary Bar (Average AQI + Counts)
  const summary = (() => {
    if (allCityNames.length === 0) return null;

    let sum = 0;
    let countWithData = 0;
    const counts = { Good: 0, Moderate: 0, Unhealthy: 0, Hazardous: 0 };

    allCityNames.forEach((city) => {
      const value = cityData[city]?.value;
      if (value == null) return; // skip cities with no data yet
      const { label } = getAQIStatus(value);

      if (label !== "No Data") {
        counts[label] = (counts[label] || 0) + 1;
        sum += value;
        countWithData++;
      }
    });

    if (countWithData === 0) return null;

    const avg = (sum / countWithData).toFixed(1);
    return { avg, counts };
  })();

  // ✅ Apply filter + search
  const filteredCities = allCityNames.filter((city) => {
    const data = cityData[city];
    const value = data?.value;
    const { label } = getAQIStatus(value);

    // Filter by AQI category
    if (filter !== "All" && label !== filter) return false;

    // Filter by search
    if (
      search &&
      !city.toLowerCase().includes(search.trim().toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div
      style={{
        backgroundColor: bgColor,
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
        padding: "28px",
        color: textColor,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* HEADER */}
      <header style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>
          EcoStep — Live Air Quality Dashboard
        </h1>
        <p style={{ color: status.includes("🟢") ? "#22c55e" : "#ef4444" }}>
          {status}
        </p>

        {/* View + Mode Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setView("grid")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              background: view === "grid" ? "#22c55e" : cardColor,
              color: view === "grid" ? "#fff" : textColor,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Grid
          </button>
          <button
            onClick={() => setView("map")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              background: view === "map" ? "#22c55e" : cardColor,
              color: view === "map" ? "#fff" : textColor,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Map
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              background: darkMode ? "#fde68a" : "#1e293b",
              color: darkMode ? "#000" : "#fff",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* ✅ Summary Bar with Timestamp */}
        {summary && (
          <div
            style={{
              background: darkMode ? "#1e293b" : "#ffffff",
              borderRadius: 12,
              padding: "10px 20px",
              marginTop: 20,
              display: "inline-block",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: "1rem" }}>
              🌍 <strong>India Avg AQI:</strong> {summary.avg} |
              <span style={{ color: "#16a34a" }}>
                {" "}
                Good: {summary.counts.Good}
              </span>{" "}
              |{" "}
              <span style={{ color: "#ca8a04" }}>
                Moderate: {summary.counts.Moderate}
              </span>{" "}
              |{" "}
              <span style={{ color: "#dc2626" }}>
                Unhealthy: {summary.counts.Unhealthy}
              </span>{" "}
              |{" "}
              <span style={{ color: "#7f1d1d" }}>
                Hazardous: {summary.counts.Hazardous}
              </span>
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                marginTop: 6,
                color: darkMode ? "#9ca3af" : "#4b5563",
              }}
            >
              🕒 Last Updated:{" "}
              {lastUpdated ? lastUpdated : "Fetching data..."}
            </p>
          </div>
        )}

        {/* AQI Filter Buttons + Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          {["All", "Good", "Moderate", "Unhealthy", "Hazardous"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 15,
                border: "none",
                cursor: "pointer",
                background:
                  filter === f
                    ? darkMode
                      ? "#22c55e"
                      : "#14532d"
                    : cardColor,
                color:
                  filter === f
                    ? "#fff"
                    : darkMode
                    ? "#cbd5e1"
                    : "#14532d",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              {f}
            </button>
          ))}

          {/* Search box */}
          <input
            type="text"
            placeholder="Search city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              minWidth: 180,
              outline: "none",
            }}
          />
        </div>
      </header>

      {/* MAIN SECTION */}
      <main style={{ maxWidth: 1200, margin: "auto" }}>
        {view === "map" ? (
          <MapView citiesData={cityData} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {filteredCities.map((city, idx) => {
              const data = cityData[city] || {};
              const aqi = getAQIStatus(data.value);

              return (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div
                    style={{
                      background: cardColor,
                      borderRadius: 12,
                      borderLeft: `5px solid ${aqi.color}`,
                      padding: 16,
                      boxShadow: darkMode
                        ? "0 2px 6px rgba(255,255,255,0.05)"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <h3 style={{ color: textColor }}>{city}</h3>
                    <p>
                      {data.value != null
                        ? `${data.value} µg/m³ (${aqi.label})`
                        : "No data yet"}
                    </p>
                    <p>
                      🌡{" "}
                      {data.temperature != null
                        ? `${data.temperature}°C`
                        : "—"}{" "}
                      | 💧{" "}
                      {data.humidity != null ? `${data.humidity}%` : "—"}
                    </p>

                    <div style={{ height: 120, marginTop: 10 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.history || []}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={darkMode ? "#475569" : "#e5e5e5"}
                          />
                          <XAxis dataKey="time" hide />
                          <YAxis
                            // 🔥 Dynamic scale so line is not flat
                            domain={["dataMin - 10", "dataMax + 10"]}
                            tick={{
                              fontSize: 10,
                              fill: darkMode ? "#94a3b8" : "#444",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: darkMode
                                ? "#1e293b"
                                : "#f8fafc",
                              borderRadius: 6,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={aqi.color}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <footer
        style={{
          textAlign: "center",
          marginTop: 30,
          color: textColor,
          opacity: 0.8,
        }}
      >
        Made by <strong>Kuldeep</strong>
      </footer>
    </div>
  );
}

export default App;
