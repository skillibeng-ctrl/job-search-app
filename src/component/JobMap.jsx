import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom"; // not using React Router? swap <Link to> for <a href>
import { ArrowRight } from "lucide-react";

/* ============================= data ============================= */

// SAMPLE DATA ONLY. Pass your real city counts via the `locations` prop.
export const SAMPLE_LOCATIONS = [
  { city: "Lagos", lat: 6.5244, lng: 3.3792, count: 640 },
  { city: "Abuja", lat: 9.0765, lng: 7.3986, count: 210 },
  { city: "Nairobi", lat: -1.2921, lng: 36.8219, count: 120 },
  { city: "London", lat: 51.5072, lng: -0.1276, count: 310 },
  { city: "Berlin", lat: 52.52, lng: 13.405, count: 140 },
  { city: "Dubai", lat: 25.2048, lng: 55.2708, count: 90 },
  { city: "Singapore", lat: 1.3521, lng: 103.8198, count: 75 },
  { city: "Toronto", lat: 43.6532, lng: -79.3832, count: 160 },
  { city: "New York", lat: 40.7128, lng: -74.006, count: 280 },
  { city: "San Francisco", lat: 37.7749, lng: -122.4194, count: 190 },
];

// Light basemap. Check the provider's terms (or use a keyed provider) for production.
const DEFAULT_TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/* ============================= styles ============================= */

const CSS = `
.jm-map { font-family: inherit; background: #e8f1ee; }
.jm-map .leaflet-tile-pane { filter: saturate(.85) contrast(1.02); }

/* pins */
.jm-pin { background: none; border: 0; }
.jm-dot { position: relative; display: flex; align-items: center; justify-content: center;
  width: var(--s); height: var(--s); border-radius: 9999px; color: #fff;
  background: linear-gradient(135deg, #059669, #065f46);
  font: 700 12px/1 system-ui, sans-serif; border: 3px solid #fff;
  box-shadow: 0 8px 20px rgba(6,95,70,.38); transition: transform .2s ease; }
.jm-pin:hover .jm-dot, .jm-pin:focus-visible .jm-dot { transform: scale(1.12); }
.jm-pin:focus-visible .jm-dot { outline: 3px solid #111827; outline-offset: 3px; }
.jm-ring { position: absolute; inset: -3px; border-radius: 9999px; border: 2px solid rgba(16,185,129,.6); pointer-events: none; }
@keyframes jm-pulse { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(1.9); opacity: 0; } }
@media (prefers-reduced-motion: no-preference) { .jm-hot .jm-ring { animation: jm-pulse 2.4s ease-out infinite; } }

/* popup */
.jm-popup .leaflet-popup-content-wrapper { border-radius: 18px; padding: 0; box-shadow: 0 16px 40px rgba(15,23,42,.2); }
.jm-popup .leaflet-popup-content { margin: 16px 18px; min-width: 150px; }
.jm-popup .leaflet-popup-tip { box-shadow: none; }
.jm-city { margin: 0; font-size: 15px; font-weight: 700; color: #111827; }
.jm-count { margin: 2px 0 12px; font-size: 13px; color: #4b5563; }
.jm-count strong { color: #065f46; font-size: 18px; margin-right: 4px; }
.jm-popup a.jm-cta { display: inline-flex; align-items: center; gap: 6px; background: #047857; color: #fff;
  font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 10px; text-decoration: none; }
.jm-popup a.jm-cta:hover { background: #065f46; }
.jm-popup a.jm-cta:focus-visible { outline: 3px solid #111827; outline-offset: 2px; }

/* controls */
.jm-map .leaflet-bar { border: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(15,23,42,.16); }
.jm-map .leaflet-bar a { width: 36px; height: 36px; line-height: 36px; color: #111827; border-bottom: 1px solid #e5e7eb; }
.jm-map .leaflet-bar a:last-child { border-bottom: 0; }
.jm-map .leaflet-bar a:hover { background: #ecfdf5; color: #047857; }
.jm-map .leaflet-control-attribution { background: rgba(255,255,255,.82); backdrop-filter: blur(4px); border-radius: 8px 0 0 0; font-size: 10px; }
`;

/* ============================= helpers ============================= */

function formatCount(n) {
  return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
}

// Only numbers go into the HTML string, never user-provided text.
function pinIcon(count, max, hot) {
  const size = 26 + Math.round(26 * Math.sqrt(count / max));
  return L.divIcon({
    className: `jm-pin${hot ? " jm-hot" : ""}`,
    html: `<span class="jm-dot" style="--s:${size}px"><i class="jm-ring"></i>${formatCount(count)}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/* ============================= pins layer ============================= */

function Pins({ pins }) {
  const map = useMap();

  const focus = (p) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 4), { animate: !reduce, duration: 0.8 });
  };

  return pins.map((p) => (
    <Marker
      key={p.city}
      position={[p.lat, p.lng]}
      icon={p.icon}
      title={`${p.city}: ${p.count.toLocaleString()} open roles`}
      riseOnHover
      eventHandlers={{ click: () => focus(p) }}
    >
      <Popup className="jm-popup" closeButton={false}>
        <p className="jm-city">{p.city}</p>
        <p className="jm-count">
          <strong>{p.count.toLocaleString()}</strong>open roles
        </p>
        <Link className="jm-cta" to={`/jobs?location=${encodeURIComponent(p.city)}`}>
          View jobs
          <ArrowRight size={14} aria-hidden />
        </Link>
      </Popup>
    </Marker>
  ));
}

/* ============================= component ============================= */

export default function JobMap({
  locations = SAMPLE_LOCATIONS,
  tileUrl = DEFAULT_TILES,
  attribution = DEFAULT_ATTRIBUTION,
  center = [20, 15],
  zoom = 2,
}) {
  const { pins, total } = useMemo(() => {
    const max = Math.max(1, ...locations.map((l) => l.count));
    const sorted = locations.map((l) => l.count).sort((a, b) => b - a);
    const hotCutoff = sorted[Math.min(2, sorted.length - 1)] ?? Infinity; // top 3 pulse
    return {
      pins: locations.map((l) => ({ ...l, icon: pinIcon(l.count, max, l.count >= hotCutoff) })),
      total: locations.reduce((sum, l) => sum + l.count, 0),
    };
  }, [locations]);

  return (
    <div className="relative isolate h-full w-full">
      <style>{CSS}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1}
        scrollWheelZoom={false} // don't hijack page scrolling
        zoomControl={false}
        className="jm-map h-full w-full"
        aria-label="Map of open roles by city"
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <ZoomControl position="topright" />
        <Pins pins={pins} />
      </MapContainer>

      {/* floating summary */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
        <p className="text-xl font-extrabold leading-none text-gray-900">{total.toLocaleString()}</p>
        <p className="mt-1 text-xs font-medium text-gray-600">
          open roles in {locations.length} {locations.length === 1 ? "city" : "cities"}
        </p>
      </div>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow backdrop-blur">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" aria-hidden />
        <span className="h-4 w-4 rounded-full bg-emerald-700" aria-hidden />
        Bigger pin = more roles
      </div>
    </div>
  );
}