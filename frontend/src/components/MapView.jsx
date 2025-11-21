// src/components/MapView.jsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Approx center of India
const INDIA_CENTER = [23.5937, 80.9629];

// Rough bounds for India (so user can’t drag too far)
const INDIA_BOUNDS = [
  [6.5546, 68.1114],  // South-West
  [35.6745, 97.3956], // North-East
];

// Color & size based on PM2.5 value
function getMarkerStyle(value) {
  if (value == null) return { color: "#6b7280", radius: 6 }; // gray for unknown
  if (value <= 50) return { color: "#16a34a", radius: 8 };   // Good
  if (value <= 100) return { color: "#ca8a04", radius: 9 };  // Moderate
  if (value <= 150) return { color: "#ea580c", radius: 10 }; // Unhealthy
  return { color: "#dc2626", radius: 11 };                   // Hazardous
}

export default function MapView({ citiesData }) {
  // Build an array of city objects from the cityData map
  const cities = useMemo(() => {
    if (!citiesData) return [];
    return Object.values(citiesData).filter(
      (c) =>
        c &&
        typeof c.lat === "number" &&
        typeof c.lon === "number" &&
        c.city
    );
  }, [citiesData]);

  if (!citiesData || Object.keys(citiesData).length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          fontSize: "14px",
        }}
      >
        Waiting for live map data…
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          fontSize: "14px",
        }}
      >
        No city coordinates available yet.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "70vh",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <MapContainer
        center={INDIA_CENTER}
        zoom={6}
        minZoom={4}
        maxZoom={10}
        maxBounds={INDIA_BOUNDS}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {cities.map((cityObj) => {
          const style = getMarkerStyle(cityObj.value);
          return (
            <CircleMarker
              key={cityObj.city}
              center={[cityObj.lat, cityObj.lon]}
              radius={style.radius}
              pathOptions={{
                color: style.color,
                fillColor: style.color,
                fillOpacity: 0.7,
              }}
            >
              <Popup>
                <div style={{ fontSize: "13px" }}>
                  <strong>{cityObj.city}</strong>
                  <br />
                  PM2.5:{" "}
                  <strong>
                    {cityObj.value != null
                      ? cityObj.value.toFixed(1)
                      : "N/A"}{" "}
                    µg/m³
                  </strong>
                  <br />
                  {cityObj.temperature != null && (
                    <>
                      🌡 {cityObj.temperature}°C
                      <br />
                    </>
                  )}
                  {cityObj.humidity != null && (
                    <>
                      💧 {cityObj.humidity}%
                      <br />
                    </>
                  )}
                  <small>
                    {cityObj.timestamp
                      ? new Date(cityObj.timestamp).toLocaleTimeString()
                      : "No time"}
                  </small>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* 🔹 Top-right legend chips (Good / Moderate / Unhealthy / Hazardous) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(15,23,42,0.75)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
          fontSize: 12,
          color: "#f9fafb",
          alignItems: "center",
          flexWrap: "wrap",
          zIndex: 1000,
        }}
      >
        {[
          { label: "Good", color: "#16a34a" },
          { label: "Moderate", color: "#ca8a04" },
          { label: "Unhealthy", color: "#ea580c" },
          { label: "Hazardous", color: "#dc2626" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.9)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
