import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

/* ============================= data ============================= */

// 🔥 BACKEND INTEGRATION: 
// Delete this SAMPLE_LOCATIONS and pass your real data from your API
// Example: const { data: locations } = useQuery('locations', fetchLocations)
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

const DEFAULT_TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/* ============================= styles ============================= */

const CSS = `
.jm-map { font-family: inherit; background: #f8fafc; }
.jm-map .leaflet-tile-pane { filter: saturate(.9) contrast(1.05); }

/* pins */
.jm-pin { background: none; border: 0; }
.jm-dot { position: relative; display: flex; align-items: center; justify-content: center;
  width: var(--s); height: var(--s); border-radius: 9999px; color: #fff;
  background: linear-gradient(135deg, #059669, #065f46); /* Emerald 600 to 800 */
  font: 700 12px/1 system-ui, sans-serif; border: 2px solid #fff;
  box-shadow: 0 4px 12px rgba(6,95,70,.35); transition: transform .2s ease; }
.jm-pin:hover .jm-dot, .jm-pin:focus-visible .jm-dot { transform: scale(1.15); z-index: 1000; }
.jm-pin:focus-visible .jm-dot { outline: 3px solid #111827; outline-offset: 3px; }
.jm-ring { position: absolute; inset: -4px; border-radius: 9999px; border: 2px solid rgba(16,185,129,.5); pointer-events: none; }
@keyframes jm-pulse { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(2); opacity: 0; } }
@media (prefers-reduced-motion: no-preference) { .jm-hot .jm-ring { animation: jm-pulse 2.5s ease-out infinite; } }

/* popup */
.jm-popup .leaflet-popup-content-wrapper { border-radius: 16px; padding: 0; box-shadow: 0 10px 30px rgba(15,23,42,.15); border: 1px solid #f1f5f9; }
.jm-popup .leaflet-popup-content { margin: 16px; min-width: 140px; }
.jm-popup .leaflet-popup-tip { box-shadow: none; }
.jm-city { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; }
.jm-count { margin: 4px 0 16px; font-size: 13px; color: #64748b; }
.jm-count strong { color: #059669; font-size: 18px; font-weight: 800; margin-right: 4px; }
.jm-popup a.jm-cta { display: flex; align-items: center; justify-content: center; gap: 6px; background: #0f172a; color: #fff;
  font-size: 13px; font-weight: 600; padding: 8px 12px; border-radius: 8px; text-decoration: none; transition: background 0.2s; }
.jm-popup a.jm-cta:hover { background: #334155; }

/* controls */
.jm-map .leaflet-bar { border: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(15,23,42,.12); margin-top: 12px; margin-right: 12px; }
.jm-map .leaflet-bar a { width: 36px; height: 36px; line-height: 36px; color: #334155; border-bottom: 1px solid #e2e8f0; }
.jm-map .leaflet-bar a:last-child { border-bottom: 0; }
.jm-map .leaflet-bar a:hover { background: #ecfdf5; color: #059669; }
.jm-map .leaflet-control-attribution { background: rgba(255,255,255,.85); backdrop-filter: blur(4px); border-radius: 8px 0 0 0; font-size: 10px; color: #64748b; }
`;

/* ============================= helpers ============================= */

function formatCount(n) {
  return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
}

function pinIcon(count, max, hot) {
  const size = 28 + Math.round(24 * Math.sqrt(count / max));
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
    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 5), { animate: !reduce, duration: 1 });
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
  center = [15, 15], // 🔥 Centered slightly higher to show Europe/Asia/Africa
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
    // 🔥 ADDED min-h TO ENSURE IT ALWAYS RENDERS
    <div className="relative isolate h-full w-full min-h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <style>{CSS}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1}
        scrollWheelZoom={false}
        zoomControl={false}
        className="jm-map h-full w-full"
        aria-label="Map of open roles by city"
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <ZoomControl position="topright" />
        <Pins pins={pins} />
      </MapContainer>

      {/* Floating Summary Card */}
      <div className="pointer-events-none absolute left-4 top-4 z-[1000] rounded-2xl bg-white/90 px-5 py-4 shadow-xl shadow-gray-200/50 backdrop-blur-md border border-white/40">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-emerald-500" />
          <p className="text-2xl font-extrabold leading-none text-gray-900 tracking-tight">
            {total.toLocaleString()}
          </p>
        </div>
        <p className="text-xs font-medium text-gray-600">
          open roles in {locations.length} {locations.length === 1 ? "city" : "cities"}
        </p>
      </div>

      {/* Floating Legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] flex items-center gap-2.5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-gray-700 shadow-lg backdrop-blur-md border border-white/40">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden />
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[8px] text-white font-bold" aria-hidden>10</span>
        Bigger pin = more roles
      </div>
    </div>
  );
}