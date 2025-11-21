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
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import "./index.css";
import MapView from "./components/MapView";

// const socket = io("http://localhost:5000", {
const socket = io("https://ecostep.onrender.com", {
  transports: ["websocket", "polling"],
  reconnection: true,
});

function App() {
  const [cityData, setCityData] = useState({}); // { [cityName]: { ...data, history: [] } }
  const [cities, setCities] = useState([]); // [{ name, lat, lon }, ...] from /api/cities
  const [status, setStatus] = useState("Connecting...");
  const [view, setView] = useState("grid");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedBg, setSelectedBg] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCitiesState, setSelectedCitiesState] = useState([]); // user-chosen cities to display
  const [locationPromptVisible, setLocationPromptVisible] = useState(true);
  const [graphTypes, setGraphTypes] = useState({}); // { [city]: 'line' | 'bar' | 'area' | 'pie' }
  const [showManualAddInline, setShowManualAddInline] = useState(false);

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
      // .get("http://localhost:5000/api/cities")
      .get("https://ecostep.onrender.com/api/cities")
      .then((res) => setCities(res.data))
      .catch((err) => console.error("Error fetching cities:", err.message));
  }, []);

  // 👉 Fetch initial latest AQI data to prefill cards/history
  useEffect(() => {
    axios
      // .get("http://localhost:5000/api/airquality/latest")
      .get("https://ecostep.onrender.com/api/airquality/latest")
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

  // Helper: haversine distance (km)
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Small helper component for adding a city manually
  function ManualCityAdd({ cities, onAdd }) {
    const [value, setValue] = React.useState("");
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type city name..."
          style={{ padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <button
          onClick={() => {
            onAdd(value.trim());
            setValue("");
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 20,
            border: "none",
            background: "#3b82f6",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ➕ Add
        </button>
      </div>
    );
  }

  const bgColor =
    selectedBg || (darkMode ? "#0f172a" : "#f6fff6");
  const textColor = darkMode ? "#f1f5f9" : "#14532d";
  const cardColor = darkMode ? "#1e293b" : "#fff";

  // 👉 Build a consistent list of city names to show
  const cityNamesFromAPI = cities.map((c) => c.name);
  const cityNamesFromData = Object.keys(cityData);
  const allCityNames = Array.from(
    new Set([...cityNamesFromAPI, ...cityNamesFromData])
  );

  // Decide which cities to display: only show user-selected cities
  const displayCityNames =
    selectedCitiesState && selectedCitiesState.length > 0
      ? selectedCitiesState
      : [];

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

  // ✅ Apply filter + search (operate on the chosen display list)
  const filteredCities = displayCityNames.filter((city) => {
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
        {/* Top-right palette / mode control */}
        <div
          style={{
            position: "fixed",
            right: 18,
            top: 18,
            zIndex: 40,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setShowPalette((s) => !s)}
              title="Theme & Background"
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: cardColor,
                color: textColor,
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              }}
            >
              🎨
            </button>

            <button
              onClick={() => setDarkMode((d) => !d)}
              title="Toggle dark/light"
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: cardColor,
                color: textColor,
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>

          {/** Palette dropdown */}
          {showPalette && (
            <div
              style={{
                background: cardColor,
                padding: 10,
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              {[
                null,
                "#f6fff6",
                "#fffaf0",
                "#f0f9ff",
                "#f8f0ff",
                "#0f172a",
                "#083344",
              ].map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedBg(c)}
                  title={c ? c : "default"}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: c || cardColor,
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <h1 style={{ fontSize: "2rem", marginBottom: 6 }}>EcoStep</h1>
        <p style={{ marginTop: 0, marginBottom: 6, fontSize: "1.05rem", color: darkMode ? "#cbd5e1" : "#065f46" }}>
          Multicity Air Quality Dashboard
        </p>
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

        {/* Location prompt – choose detect or add manually (shown until user picks) */}
        {locationPromptVisible && (
          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "center",
              gap: 10,
              alignItems: "center",
            }}
          >
            <button
              onClick={() => {
                // Try browser geolocation, find nearest city
                if (!navigator.geolocation) {
                  alert("Geolocation not supported in this browser.");
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude } = pos.coords;
                    // find nearest city from `cities`
                    let best = null;
                    let bestDist = Infinity;
                    cities.forEach((c) => {
                      const d = haversineDistance(
                        latitude,
                        longitude,
                        c.lat,
                        c.lon
                      );
                      if (d < bestDist) {
                        bestDist = d;
                        best = c.name;
                      }
                    });
                    if (best) {
                      setSelectedCitiesState((s) => [
                        ...new Set([...(s || []), best]),
                      ]);
                      setLocationPromptVisible(false);
                    }
                  },
                  (err) => {
                    alert("Could not detect location: " + err.message);
                  }
                );
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                border: "none",
                background: "#22c55e",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              📍 Detect my location
            </button>

            <ManualCityAdd
              cities={cities}
              onAdd={(name) => {
                if (!name) return;
                // ensure name is valid city from list; try to find best match
                const match = cities.find(
                  (c) => c.name.toLowerCase() === name.toLowerCase()
                );
                if (match) {
                  setSelectedCitiesState((s) => [
                    ...new Set([...(s || []), match.name]),
                  ]);
                  setLocationPromptVisible(false);
                } else {
                  // fallback: try substring match
                  const suggestion = cities.find((c) =>
                    c.name.toLowerCase().includes(name.toLowerCase())
                  );
                  if (suggestion) {
                    setSelectedCitiesState((s) => [
                      ...new Set([...(s || []), suggestion.name]),
                    ]);
                    setLocationPromptVisible(false);
                  } else {
                    alert("City not found in available list. Try a nearby city name.");
                  }
                }
              }}
            />
          </div>
        )}

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
        {/* If no cities selected, prompt the user to add one */}
        {(!selectedCitiesState || selectedCitiesState.length === 0) && (
          <div style={{ marginTop: 12, color: darkMode ? "#cbd5e1" : "#065f46" }}>
            ➕ Add any city to begin — use <strong>Detect my location</strong> or <strong>Add</strong> above.
          </div>
        )}
        {/* Persistent controls to add more cities */}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 10 }}>
          <button
            onClick={() => {
              if (!navigator.geolocation) {
                alert("Geolocation not supported in this browser.");
                return;
              }
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const { latitude, longitude } = pos.coords;
                  let best = null;
                  let bestDist = Infinity;
                  cities.forEach((c) => {
                    const d = haversineDistance(latitude, longitude, c.lat, c.lon);
                    if (d < bestDist) {
                      bestDist = d;
                      best = c.name;
                    }
                  });
                  if (best) {
                    setSelectedCitiesState((s) => [...new Set([...(s || []), best])]);
                    setShowManualAddInline(false);
                    setLocationPromptVisible(false);
                  }
                },
                (err) => alert("Could not detect location: " + err.message)
              );
            }}
            style={{ padding: "8px 12px", borderRadius: 18, border: "none", background: "#10b981", color: "#fff", cursor: "pointer" }}
          >
            📍 Detect/Add location
          </button>

          <button
            onClick={() => setShowManualAddInline((s) => !s)}
            style={{ padding: "8px 12px", borderRadius: 18, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer" }}
          >
            ➕ Add City
          </button>
        </div>

        {showManualAddInline && (
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
            <ManualCityAdd
              cities={cities}
              onAdd={(name) => {
                if (!name) return;
                const match = cities.find((c) => c.name.toLowerCase() === name.toLowerCase());
                if (match) {
                  setSelectedCitiesState((s) => [...new Set([...(s || []), match.name])]);
                } else {
                  const suggestion = cities.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
                  if (suggestion) {
                    setSelectedCitiesState((s) => [...new Set([...(s || []), suggestion.name])]);
                  } else {
                    alert("City not found in available list. Try a nearby city name.");
                  }
                }
                setShowManualAddInline(false);
                setLocationPromptVisible(false);
              }}
            />
          </div>
        )}
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ color: textColor, margin: 0 }}>{city}</h3>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            // remove city from selected list
                            setSelectedCitiesState((s) => (s || []).filter((c) => c !== city));
                            // clean up graph type
                            setGraphTypes((g) => {
                              const copy = { ...g };
                              delete copy[city];
                              return copy;
                            });
                          }}
                          title="Remove city"
                          style={{
                            padding: "6px 10px",
                            borderRadius: 12,
                            border: "none",
                            background: "#ef4444",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
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

                    {/* Graph selector + chart */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <label style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#475569" }}>Graph:</label>
                          <select
                            value={graphTypes[city] || "line"}
                            onChange={(e) =>
                              setGraphTypes((g) => ({ ...g, [city]: e.target.value }))
                            }
                            style={{ padding: 6, borderRadius: 8 }}
                          >
                            <option value="line">Line</option>
                            <option value="bar">Bar</option>
                            <option value="area">Area</option>
                            <option value="pie">Pie</option>
                          </select>
                        </div>
                        <div style={{ fontSize: 12, color: darkMode ? "#9ca3af" : "#4b5563" }}>
                          Updated: { (data.history && data.history.length>0) ? data.history[data.history.length-1].time : (data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "—") }
                        </div>
                      </div>

                      <div style={{ height: 140, marginTop: 8 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          {(() => {
                            const type = graphTypes[city] || "line";
                            const series = data.history || [];
                            if (type === "bar") {
                              return (
                                <BarChart data={series}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#475569" : "#e5e5e5"} />
                                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#444" }} />
                                  <YAxis tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#444" }} />
                                  <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1e293b" : "#f8fafc", borderRadius: 6 }} />
                                  <Bar dataKey="value" fill={aqi.color} />
                                </BarChart>
                              );
                            }
                            if (type === "area") {
                              return (
                                <AreaChart data={series}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#475569" : "#e5e5e5"} />
                                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#444" }} />
                                  <YAxis tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#444" }} />
                                  <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1e293b" : "#f8fafc", borderRadius: 6 }} />
                                  <Area type="monotone" dataKey="value" stroke={aqi.color} fill={aqi.bg} />
                                </AreaChart>
                              );
                            }
                            if (type === "pie") {
                              const current = data.value || 0;
                              const pieData = [
                                { name: "AQI", value: Number(current) },
                                { name: "Remaining", value: Math.max(0, 250 - Number(current)) },
                              ];
                              return (
                                <PieChart>
                                  <Pie data={pieData} dataKey="value" innerRadius={30} outerRadius={60} paddingAngle={2}>
                                    <Cell key="c1" fill={aqi.color} />
                                    <Cell key="c2" fill={darkMode ? "#334155" : "#e5e7eb"} />
                                  </Pie>
                                  <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1e293b" : "#f8fafc", borderRadius: 6 }} />
                                </PieChart>
                              );
                            }

                            // default: line
                            return (
                              <LineChart data={series}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#475569" : "#e5e5e5"} />
                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#444" }} />
                                <YAxis domain={["dataMin - 10", "dataMax + 10"]} tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#444" }} />
                                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1e293b" : "#f8fafc", borderRadius: 6 }} />
                                <Line type="monotone" dataKey="value" stroke={aqi.color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                              </LineChart>
                            );
                          })()}
                        </ResponsiveContainer>
                      </div>

                      {aqi.label === "Moderate" && (
                        <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: "#fff7ed", color: "#92400e" }}>
                          ⚠️ Moderate air quality — consider limiting prolonged outdoor exertion and sensitive groups should take precautions.
                        </div>
                      )}
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
