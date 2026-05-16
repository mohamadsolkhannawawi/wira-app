import "leaflet/dist/leaflet.css";
import { MapContainer, CircleMarker, TileLayer, Tooltip } from "react-leaflet";
import type { LocationSummary } from "@wira-app/shared";
import { mapConfig } from "../constants/mapConfig";

const clusterColor = (label: LocationSummary["clusterLabel"]): string => {
  switch (label) {
    case "POTENSIAL":
      return "#22c55e";
    case "RAMAI":
      return "#f59e0b";
    case "SEPI":
    default:
      return "#ef4444";
  }
};

interface InteractiveMapProps {
  locations: LocationSummary[];
}

export function InteractiveMap({ locations }: InteractiveMapProps) {
  return (
    <div className="map-shell">
      <MapContainer
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        minZoom={mapConfig.minZoom}
        maxZoom={mapConfig.maxZoom}
        style={{ height: "520px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location) => {
          if (
            location.latitude === undefined ||
            location.longitude === undefined
          ) {
            console.warn("Invalid location data found:", location);
            return null;
          }
          return (
            <CircleMarker
              key={location.id}
              center={[location.latitude, location.longitude]}
              radius={8}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: clusterColor(location.clusterLabel),
                fillOpacity: 0.7,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <strong>{location.kelurahan}</strong>
                <div>Skor: {location.finalScore.toFixed(1)}</div>
                <div>Klaster: {location.clusterLabel}</div>
              </Tooltip>
            </CircleMarker>
          );
        })}{" "}
      </MapContainer>
    </div>
  );
}
