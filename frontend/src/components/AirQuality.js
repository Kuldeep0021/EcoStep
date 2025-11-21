import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import moment from "moment"; // ✅ Import moment for safe timestamp handling

const socket = io("http://localhost:5000"); // ✅ Connect to your backend

function AirQuality() {
  const [airData, setAirData] = useState({});
  const [status, setStatus] = useState("Connecting to live air data...");

  // ✅ Connect to socket.io backend
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to EcoStep backend");
      setStatus("✅ Connected to EcoStep Live Data 🌿");
    });

    socket.on("message", (msg) => console.log("📡 Message:", msg));

    socket.on("airQualityUpdate", (data) => {
      console.log("🌿 Live Data Received:", data);
      setAirData((prev) => ({
        ...prev,
        [data.city]: data, // store each city’s data
      }));
    });

    return () => {
      socket.off("message");
      socket.off("airQualityUpdate");
    };
  }, []);

  // ✅ AQI Level Status Helper
  const getAQIStatus = (value) => {
    if (value <= 30) return { text: "Good 🌿", color: "green" };
    if (value <= 60) return { text: "Moderate 🙂", color: "yellowgreen" };
    if (value <= 90) return { text: "Poor 😷", color: "orange" };
    if (value <= 120) return { text: "Very Poor ☠️", color: "red" };
    return { text: "Hazardous 💀", color: "darkred" };
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        background: "#f9fff9",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "green", fontSize: "2rem", fontWeight: "bold" }}>
        🌿 EcoStep Live Air Quality Dashboard
      </h1>
      <p style={{ marginBottom: "30px", color: "#555" }}>{status}</p>

      {/* ✅ Check if data is empty */}
      {Object.keys(airData).length === 0 ? (
        <p>Fetching live data...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            maxWidth: "1000px",
            margin: "auto",
          }}
        >
          {Object.entries(airData).map(([city, info]) => (
            <div
              key={city}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <h2 style={{ color: "green", fontSize: "1.5rem" }}>{city}</h2>

              {/* ✅ Value and Status */}
              <h3
                style={{
                  color: getAQIStatus(info.value).color,
                  fontWeight: "bold",
                  fontSize: "1.3rem",
                }}
              >
                {info.value?.toFixed(1)} µg/m³
              </h3>
              <p style={{ color: "#555" }}>{getAQIStatus(info.value).text}</p>

              {/* ✅ Parameter */}
              <p style={{ fontSize: "0.9rem", color: "#777" }}>
                Parameter: {info.parameter || "N/A"}
              </p>

              {/* ✅ Timestamp with moment.js */}
              <p style={{ fontSize: "0.9rem", color: "#777" }}>
                Updated:{" "}
                {info.timestamp
                  ? moment(info.timestamp).utc().format("HH:mm:ss, DD MMM YYYY")
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AirQuality;
