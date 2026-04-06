import React, { useState, useEffect, useRef } from "react";
import {
  Fuel,
  MapPin,
  DollarSign,
  Droplets,
  Gauge,
  ChevronDown,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Route,
  ArrowRight,
  Map as MapIcon,
  Search,
  RefreshCw,
  Check,
  X,
  Clock,
  TrendingUp,
  Store,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Eye,
  Settings,
  ArrowUpDown,
  Car
} from "lucide-react";

// =====================================================================
// 🛑 CONFIGURACIÓN DE RUTAS Y API
// =====================================================================
const RUTA_ESTACIONES = "/api-cne/api/v4/estaciones";
// =====================================================================

const REGION_MAP = {
  arica: "XV",
  parinacota: "XV",
  tarapacá: "I",
  tarapaca: "I",
  antofagasta: "II",
  atacama: "III",
  coquimbo: "IV",
  valparaíso: "V",
  valparaiso: "V",
  metropolitana: "RM",
  santiago: "RM",
  higgins: "VI",
  libertador: "VI",
  maule: "VII",
  ñuble: "XVI",
  nuble: "XVI",
  biobío: "VIII",
  biobio: "VIII",
  concepción: "VIII",
  araucanía: "IX",
  araucania: "IX",
  "los ríos": "XIV",
  "los rios": "XIV",
  "los lagos": "X",
  aysén: "XI",
  aysen: "XI",
  magallanes: "XII",
};

// =========================
// 🚧 MEGA PEAJES DB (CLASIFICADOS TRONCAL/LATERAL)
// =========================
const PEAJES_DB = [
  // --- ZONA NORTE ---
  { id: "p_antofagasta", nombre: "Peaje Antofagasta", lat: -23.45397, lon: -70.12523, precio: 2750, tipo: "peaje" },
  { id: "p_copiapo", nombre: "Peaje Copiapó", lat: -27.99711, lon: -70.56577, precio: 2600, tipo: "peaje" },
  { id: "p_vallenar_alg", nombre: "Peaje Vallenar (Ruta Algarrobo)", lat: -29.08675, lon: -70.91695, precio: 2700, tipo: "peaje" },
  { id: "p_lahiguera", nombre: "Peaje La Higuera", lat: -29.37109, lon: -71.07309, precio: 2700, tipo: "peaje" },
  { id: "p_losvilos", nombre: "Peaje Los Vilos", lat: -32.17496, lon: -71.52069, precio: 4200, tipo: "peaje" },
  
  // --- RUTA 5 NORTE ---
  { id: "p_lampa", nombre: "Peaje Lampa", lat: -33.262, lon: -70.825, precio: 900, tipo: "peaje" },
  { id: "p_lampa_lat", nombre: "Peaje Lampa Lateral", lat: -33.255, lon: -70.82, precio: 0, tipo: "peaje" },
  { id: "p_lasvegas", nombre: "Peaje Las Vegas", lat: -32.812, lon: -70.963, precio: 2900, tipo: "peaje" },
  { id: "p_elmelon", nombre: "Peaje El Melón", lat: -32.617, lon: -71.233, precio: 2900, tipo: "peaje" },
  { id: "p_pichidangui", nombre: "Peaje Pichidangui", lat: -32.138, lon: -71.506, precio: 2900, tipo: "peaje" },
  { id: "p_puertoscuro", nombre: "Peaje Puerto Oscuro", lat: -31.400, lon: -71.600, precio: 4000, tipo: "peaje" },
  { id: "p_tongoy", nombre: 'Peaje Troncal Norte (Tongoy)', lat: -30.250, lon: -71.500, precio: 4250, tipo: 'peaje' },
  { id: "p_punta_colorada", nombre: 'Peaje Punta Colorada', lat: -29.330, lon: -71.050, precio: 3150, tipo: 'peaje' },
  { id: "p_cachiyuyo", nombre: 'Peaje Cachiyuyo', lat: -29.050, lon: -70.900, precio: 3150, tipo: 'peaje' },
  { id: "p_vallenar", nombre: "Peaje Vallenar", lat: -28.600, lon: -70.780, precio: 3000, tipo: "peaje" },
  { id: "p_puerto_viejo", nombre: "Peaje Puerto Viejo", lat: -27.350, lon: -70.900, precio: 3000, tipo: "peaje" },
  { id: "p_totoral", nombre: "Peaje Totoral", lat: -27.850, lon: -71.050, precio: 2900, tipo: "peaje" },
  { id: "p_cerro_blanco", nombre: "Peaje Cerro Blanco", lat: -29.100, lon: -71.150, precio: 3000, tipo: "peaje" },
  
  // --- RUTA 5 SUR ---
  { id: "p_riomaipo", nombre: "Peaje Río Maipo (Acceso Sur)", lat: -33.743, lon: -70.739, precio: 1400, tipo: "peaje" },
  { id: "p_angostura", nombre: "Peaje Angostura", lat: -33.896, lon: -70.735, precio: 3800, tipo: "peaje" },
  { id: "p_angostura_lat_n", nombre: "Angostura Lateral Norte", lat: -33.885, lon: -70.735, precio: 0, tipo: "peaje" },
  { id: "p_angostura_lat_s", nombre: "Angostura Lateral Sur", lat: -33.905, lon: -70.735, precio: 0, tipo: "peaje" },
  { id: "p_quinta", nombre: "Peaje Quinta", lat: -34.981, lon: -71.238, precio: 3800, tipo: "peaje" },
  { id: "p_rioclaro", nombre: "Peaje Río Claro", lat: -35.15, lon: -71.27, precio: 3300, tipo: "peaje" },
  { id: "p_retiro", nombre: "Peaje Retiro", lat: -35.34, lon: -71.6, precio: 3300, tipo: "peaje" },
  { id: "p_perquilauquen", nombre: "Peaje Perquilauquén", lat: -36.05, lon: -71.8, precio: 3500, tipo: "peaje" },
  { id: "p_santaclara", nombre: "Peaje Santa Clara", lat: -36.909, lon: -72.341, precio: 3400, tipo: "peaje" },
  { id: "p_coihue", nombre: "Peaje Coihue", lat: -37.557, lon: -72.58, precio: 3500, tipo: "peaje" },
  { id: "p_renaico", nombre: "Peaje Renaico", lat: -37.674, lon: -72.595, precio: 3500, tipo: "peaje" },
  { id: "p_lasmaicas", nombre: "Peaje Las Maicas", lat: -37.806, lon: -72.331, precio: 3400, tipo: "peaje" },
  { id: "p_pua", nombre: "Peaje Púa", lat: -38.362, lon: -72.386, precio: 3600, tipo: "peaje" },
  { id: "p_quepe", nombre: "Peaje Quepe", lat: -38.915, lon: -72.624, precio: 3600, tipo: "peaje" },
  { id: "p_licanco", nombre: "Peaje Lateral Licanco", lat: -38.782, lon: -72.611, precio: 0, tipo: "peaje" },
  { id: "p_freire", nombre: "Peaje Freire", lat: -38.95, lon: -72.6, precio: 3500, tipo: "peaje" },
  { id: "p_lanco", nombre: "Peaje Lanco", lat: -39.45, lon: -72.75, precio: 3600, tipo: "peaje" },
  { id: "p_launion", nombre: "Peaje La Unión", lat: -40.3, lon: -73.05, precio: 3600, tipo: "peaje" },
  { id: "p_cuatrovientos", nombre: "Peaje Cuatro Vientos", lat: -40.915, lon: -73.155, precio: 3600, tipo: "peaje" },
  { id: "p_purranque", nombre: "Peaje Purranque", lat: -40.85, lon: -73.15, precio: 1200, tipo: "peaje" },
  { id: "p_puertomontt", nombre: "Peaje Bypass Puerto Montt", lat: -41.450, lon: -73.100, precio: 1100, tipo: "peaje" },
  { id: "p_pargua", nombre: "Peaje Troncal P. Montt - Pargua", lat: -41.650, lon: -73.350, precio: 3100, tipo: "peaje" },

  // --- TRANSVERSALES Y OTRAS RUTAS ---
  { id: "p_loprado", nombre: "Peaje Lo Prado (R68)", lat: -33.434, lon: -70.938, precio: 2700, tipo: "peaje" },
  { id: "p_zapata", nombre: "Peaje Zapata (R68)", lat: -33.393, lon: -71.258, precio: 2700, tipo: "peaje" },
  { id: "p_troncalsur", nombre: "Peaje Troncal Sur (R60)", lat: -33.056, lon: -71.405, precio: 4250, tipo: "peaje" },
  { id: "p_quillota", nombre: "Peaje Quillota (R60 CH)", lat: -32.880, lon: -71.250, precio: 5350, tipo: "peaje" },
  { id: "p_nogales", nombre: "Peaje Nogales", lat: -32.730, lon: -71.210, precio: 1950, tipo: "peaje" },
  { id: "p_bypass_puchuncavi", nombre: "Peaje Bypass Puchuncaví", lat: -32.720, lon: -71.400, precio: 500, tipo: "peaje" },
  { id: "p_melipilla", nombre: "Peaje Melipilla I (R78)", lat: -33.645, lon: -71.157, precio: 4008, tipo: "peaje" },
  { id: "p_puangue", nombre: "Peaje Puangue (R78)", lat: -33.620, lon: -71.290, precio: 3500, tipo: "peaje" },
  { id: "p_casablanca", nombre: "Peaje Casablanca", lat: -33.310, lon: -71.400, precio: 1500, tipo: "peaje" },
  { id: "p_lascanteras", nombre: "Peaje Las Canteras (R57)", lat: -33.320, lon: -70.680, precio: 1400, tipo: "peaje" },
  { id: "p_sanjose", nombre: "Peaje San José (R57)", lat: -33.150, lon: -70.680, precio: 1400, tipo: "peaje" },
  { id: "p_chacabuco", nombre: "Peaje Chacabuco (R57)", lat: -33.000, lon: -70.700, precio: 3300, tipo: "peaje" },
  { id: "p_lascardas", nombre: "Peaje Las Cardas (R43)", lat: -30.290, lon: -71.265, precio: 3700, tipo: "peaje" },
  { id: "p_aguamarilla", nombre: "Peaje Agua Amarilla (Itata)", lat: -36.900, lon: -72.400, precio: 4400, tipo: "peaje" },
  { id: "p_huinanco", nombre: "Peaje Huinanco (Cabrero)", lat: -37.050, lon: -72.800, precio: 3900, tipo: "peaje" },
  { id: "p_puentesnegros", nombre: "Peaje Puentes Negros (Cabrero)", lat: -36.950, lon: -72.650, precio: 550, tipo: "peaje" },
  { id: "p_chivilingo", nombre: "Peaje Chivilingo (R160)", lat: -37.200, lon: -73.150, precio: 2500, tipo: "peaje" },
  { id: "p_curanilahue", nombre: "Peaje Curanilahue (R160)", lat: -37.450, lon: -73.350, precio: 2500, tipo: "peaje" },
  { id: "p_pilpilco", nombre: "Peaje Pilpilco (R160)", lat: -37.600, lon: -73.400, precio: 2500, tipo: "peaje" },

  // --- PÓRTICOS TAG URBANOS (Representativos de Santiago) ---
  { id: "p_colina_tag", nombre: "TAG Colina (S-Lampa)", lat: -33.27994, lon: -70.73887, precio: 474, tipo: "tag" },
  { id: "p_chicureo_tag", nombre: "TAG Chicureo (S-Lampa)", lat: -33.31709, lon: -70.72221, precio: 387, tipo: "tag" },
  { id: "p_quilicura_tag", nombre: "TAG Quilicura", lat: -33.38222, lon: -70.69557, precio: 495, tipo: "tag" },
  { id: "t_costanera_oriente", nombre: "TAG Costanera Oriente", lat: -33.400, lon: -70.550, precio: 1500, tipo: "tag" },
  { id: "t_costanera_centro", nombre: "TAG Costanera Centro", lat: -33.420, lon: -70.650, precio: 1800, tipo: "tag" },
  { id: "t_costanera_poniente", nombre: "TAG Costanera Poniente", lat: -33.440, lon: -70.750, precio: 1500, tipo: "tag" },
  { id: "p_est_central_tag", nombre: "TAG Estación Central", lat: -33.4473, lon: -70.69227, precio: 408, tipo: "tag" },
  { id: "t_central_norte", nombre: "TAG Autopista Central N", lat: -33.360, lon: -70.700, precio: 1800, tipo: "tag" },
  { id: "t_central_centro", nombre: "TAG Autopista Central C", lat: -33.450, lon: -70.660, precio: 2500, tipo: "tag" },
  { id: "p_cerrillos_tag", nombre: "TAG Cerrillos", lat: -33.50637, lon: -70.69722, precio: 495, tipo: "tag" },
  { id: "t_central_sur", nombre: "TAG Autopista Central S", lat: -33.560, lon: -70.680, precio: 1800, tipo: "tag"},
  { id: "t_vespucio_sur", nombre: "TAG Vespucio Sur", lat: -33.535, lon: -70.620, precio: 1800, tipo: "tag" },
  { id: "p_buin_tag", nombre: "TAG Buin", lat: -33.69552, lon: -70.72364, precio: 840, tipo: "tag" },
  { id: "t_vespucio_norte", nombre: "TAG Vespucio Norte", lat: -33.370, lon: -70.680, precio: 1800, tipo: "tag" },
  { id: "t_vespucio_oriente", nombre: "TAG Vespucio Oriente", lat: -33.400, lon: -70.580, precio: 2500, tipo: "tag" },
  { id: "t_nororiente", nombre: "TAG Nororiente", lat: -33.320, lon: -70.600, precio: 3000, tipo: "tag" },
  { id: "t_aeropuerto", nombre: "TAG Aeropuerto AMB", lat: -33.400, lon: -70.780, precio: 1200, tipo: "tag" }
];

function extractRegionId(displayName) {
  const lower = (displayName || "").toLowerCase();
  for (const [key, id] of Object.entries(REGION_MAP)) {
    if (lower.includes(key)) return id;
  }
  return "RM";
}

// Distancia lineal pura para detectar los peajes exactos
function getStraightLineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distancia con factor corrector para estimar la ruta general
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3);
}

// =========================
// 🚨 DETECCIÓN OFFLINE ROBUSTA
// =========================
function detectTollsInRoute(geometry) {
  if (!geometry || !geometry.coordinates || geometry.coordinates.length < 2) return { total: 0, list: [] };

  const detected = new Set();
  let total = 0;
  const tolls = [];

  // 🔥 DENSIFICAR RUTA (Asegura que las rectas largas de OSRM no se salten peajes)
  const densePoints = [];
  for (let i = 0; i < geometry.coordinates.length - 1; i++) {
    const [lon1, lat1] = geometry.coordinates[i];
    const [lon2, lat2] = geometry.coordinates[i+1];
    densePoints.push([lon1, lat1]);
    
    const dist = getStraightLineDistance(lat1, lon1, lat2, lon2);
    if (dist > 1) { 
      const steps = Math.floor(dist);
      for (let j = 1; j <= steps; j++) {
        const fraction = j / (steps + 1);
        const ilon = lon1 + (lon2 - lon1) * fraction;
        const ilat = lat1 + (lat2 - lat1) * fraction;
        densePoints.push([ilon, ilat]);
      }
    }
  }
  densePoints.push(geometry.coordinates[geometry.coordinates.length - 1]);

  const tolerance = 4; // 4km normal

  // 🔥 DETECCIÓN
  densePoints.forEach((coord) => {
    const [lon, lat] = coord;

    PEAJES_DB.forEach((p) => {
      if (!detected.has(p.id)) {
        const dist = getStraightLineDistance(lat, lon, p.lat, p.lon);
        if (dist <= tolerance) {
          detected.add(p.id);
          total += p.precio || 0;
          tolls.push(p);
        }
      }
    });
  });

  return { total, list: tolls };
}

// Extrae el mejor precio disponible considerando la nueva estructura
function getBestPrice(pObj) {
  if (!pObj) return 0;
  if (typeof pObj === "number") return pObj;
  const asis = pObj.asistido || 0;
  const auto = pObj.autoservicio || 0;
  if (asis > 0 && auto > 0) return Math.min(asis, auto);
  return asis > 0 ? asis : auto;
}

function generateMapHtml(origin, dest, geometry, isRoundTrip) {
  if (!origin || !dest) return "";
  const geomStr = geometry ? JSON.stringify(geometry) : "null";
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background: transparent; } 
          #map { width: 100vw; height: 100vh; background: transparent; } 
          .leaflet-control-attribution { display: none !important; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', { zoomControl: false });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            var originCoord = [${origin.lat}, ${origin.lon}];
            var destCoord = [${dest.lat}, ${dest.lon}];
            
            L.marker(originCoord, {icon: L.divIcon({ className: 'marker-origin', iconSize: [16, 16], html: '<div style="background:#3b82f6;width:16px;height:16px;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.2)"></div>' })}).addTo(map);
            L.marker(destCoord, {icon: L.divIcon({ className: 'marker-dest', iconSize: [16, 16], html: '<div style="background:#ef4444;width:16px;height:16px;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.2)"></div>' })}).addTo(map);
            
            var geometry = ${geomStr};
            if (geometry && geometry.coordinates) {
                var coords = geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
                var polyline = L.polyline(coords, {color: '#3b82f6', weight: 4, opacity: 0.9, lineJoin: 'round'}).addTo(map);
                map.fitBounds(polyline.getBounds(), {padding: [30, 30]});
            } else {
                var polyline = L.polyline([originCoord, destCoord], {color: '#94a3b8', weight: 3, dashArray: '8, 12'}).addTo(map);
                map.fitBounds(L.latLngBounds([originCoord, destCoord]), {padding: [30, 30]});
            }
        </script>
    </body>
    </html>
  `;
}

function generateStationsMapHtml(stations, selectedId) {
  if (!stations || stations.length === 0) return "";
  const markersJs = stations
    .map((s) => {
      const isSelected = s.id === selectedId;
      const color = isSelected ? "#3b82f6" : s.isOutdated ? "#cbd5e1" : "#94a3b8";
      const zIndex = isSelected ? 1000 : 1;
      const scale = isSelected ? "scale(1.4)" : "scale(1)";
      return `
      var marker_${s.id.replace(/\W/g, "")} = L.marker([${s.lat}, ${s.lon}], {
        icon: L.divIcon({ 
          className: 'cursor-pointer z-50', 
          html: '<div style="background-color: ${color}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.2); transform: ${scale}; transition: all 0.2s ease;"></div>',
          iconSize: [20, 20]
        }),
        zIndexOffset: ${zIndex}
      }).addTo(map);
      marker_${s.id.replace(/\W/g, "")}.on('click', function() {
         window.parent.postMessage({ type: 'STATION_CLICKED', id: '${s.id}' }, '*');
      });
    `;
    })
    .join("\n");

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background: transparent; } 
          #map { width: 100vw; height: 100vh; background: transparent; } 
          .leaflet-control-attribution { display: none !important; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', { zoomControl: false });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            ${markersJs}
            var group = new L.featureGroup([${stations.map((s) => `L.marker([${s.lat}, ${s.lon}])`).join(",")}]);
            map.fitBounds(group.getBounds(), {padding: [20, 20], maxZoom: 15});
        </script>
    </body>
    </html>
  `;
}

const RouteCityAutocomplete = ({ placeholder, value, onSelect, comunasData, isOrigin }) => {
  const [query, setQuery] = useState(value ? value.mainName : "");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingCoords, setIsLoadingCoords] = useState(false);

  useEffect(() => { setQuery(value ? value.mainName : ""); }, [value]);

  useEffect(() => {
    if (!isOpen) { setResults([]); return; }
    const safeQuery = (query || "").toLowerCase();
    if (!safeQuery || (value && safeQuery === (value.mainName || "").toLowerCase())) {
      setResults(comunasData.slice(0, 50));
      return;
    }
    const filtered = comunasData.filter((c) => (c.mainName || "").toLowerCase().includes(safeQuery)).slice(0, 50);
    setResults(filtered);
  }, [query, isOpen, comunasData, value]);

  const handleSelectCity = async (cityName) => {
    setQuery(cityName); setIsOpen(false); setIsLoadingCoords(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&city=${encodeURIComponent(cityName)}&limit=1`);
      const data = await res.json();
      const fallbackCity = comunasData.find((c) => c.mainName === cityName);
      if (data && data.length > 0) {
        onSelect({ 
          mainName: cityName, 
          name: cityName, 
          lat: parseFloat(data[0].lat), 
          lon: parseFloat(data[0].lon), 
          regionId: fallbackCity?.regionId || "RM",
          regionName: fallbackCity?.regionName || ""
        });
      } else { onSelect(fallbackCity); }
    } catch (err) { onSelect(comunasData.find((c) => c.mainName === cityName)); } 
    finally { setIsLoadingCoords(false); }
  };

  return (
    <div className="relative w-full">
      <input
        type="text" value={query} onFocus={() => setIsOpen(true)} onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onChange={(e) => {
          setQuery(e.target.value); setIsOpen(true);
          if (value && value.mainName !== e.target.value) onSelect(null);
        }}
        placeholder={placeholder}
        className="w-full py-2 pr-10 text-[18px] font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-400 placeholder:font-medium"
      />
      {isLoadingCoords ? (
        <Loader2 className="absolute right-2 top-2.5 w-4 h-4 text-blue-500 animate-spin" />
      ) : value && value.mainName === query ? (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(""); onSelect(null); setIsOpen(true); }} className="absolute right-2 top-2.5 text-slate-400 hover:text-red-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      ) : (
        <Search className="absolute right-2 top-2.5 w-4 h-4 text-slate-300 pointer-events-none" />
      )}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i} onMouseDown={(e) => { e.preventDefault(); handleSelectCity(r.mainName); }} className="p-3 cursor-pointer flex justify-between items-center hover:bg-slate-50 text-slate-700 border-b last:border-0 border-slate-50">
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-slate-800">{r.mainName}</span>
                 {r.regionName && <span className="text-[10px] text-slate-400 font-semibold uppercase">{r.regionName}</span>}
              </div>
              {value?.mainName === r.mainName && <Check className="w-4 h-4 text-blue-600" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ComunaAutocomplete = ({ placeholder, value, onSelect, comunas }) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    if (!isOpen) { setResults([]); return; }
    const safeQuery = (query || "").toLowerCase();
    if (!safeQuery || safeQuery === (value || "").toLowerCase()) {
      setResults(comunas.slice(0, 50));
      return;
    }
    const filtered = comunas.filter((c) => (c.comuna || "").toLowerCase().includes(safeQuery)).slice(0, 50);
    setResults(filtered);
  }, [query, isOpen, comunas, value]);

  return (
    <div className="relative w-full">
      <input
        type="text" value={query} onFocus={() => setIsOpen(true)} onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onChange={(e) => {
          setQuery(e.target.value); setIsOpen(true);
          if (value && value !== e.target.value) onSelect("");
        }}
        placeholder={placeholder}
        className="w-full py-4 pl-4 pr-10 text-[18px] font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-400 placeholder:font-medium"
      />
      {value === query && value !== "" ? (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(""); onSelect(""); setIsOpen(true); }} className="absolute right-4 top-4 text-blue-500 hover:text-red-500 transition-colors">
          <X className="w-5 h-5" />
        </button>
      ) : (
        <Search className="absolute right-4 top-4 w-5 h-5 text-slate-300 pointer-events-none" />
      )}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {results.map((c) => (
            <li key={c.comuna} onMouseDown={(e) => { e.preventDefault(); onSelect(c.comuna); setIsOpen(false); }} className="p-3 cursor-pointer flex justify-between items-center hover:bg-slate-50 border-b last:border-0 border-slate-50 text-sm font-semibold">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">{c.comuna}</span>
                {c.regionName && <span className="text-[10px] text-slate-400 font-semibold uppercase">{c.regionName}</span>}
              </div>
              {value === c.comuna && <Check className="w-4 h-4 text-blue-600" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function App() {
  const [calcMode, setCalcMode] = useState("viaje");
  const [chargeMode, setChargeMode] = useState("money");
  const [fuelType, setFuelType] = useState("93");

  const [inputValue, setInputValue] = useState("");
  const [distanceKm, setDistanceKm] = useState("0");
  const [efficiencyKml, setEfficiencyKml] = useState("12");
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const [originCity, setOriginCity] = useState(null);
  const [destCity, setDestCity] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [mapUrl, setMapUrl] = useState("");
  const [stationsMapUrl, setStationsMapUrl] = useState("");

  const [cneStations, setCneStations] = useState([]);
  const [cargaComuna, setCargaComuna] = useState("");
  const [currentStation, setCurrentStation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const [isLoading, setIsLoading] = useState(true);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [authStatus, setAuthStatus] = useState("pending");
  const [routeError, setRouteError] = useState(false);

  // Estados Peajes y Modales
  const [detectedTolls, setDetectedTolls] = useState({ total: 0, list: [] });
  const [showTollsModal, setShowTollsModal] = useState(false);

  const filteredStationsCarga = React.useMemo(() => {
    if (!cargaComuna) return [];
    const now = Date.now();
    const OUTDATED_MS = 7 * 24 * 60 * 60 * 1000;
    return cneStations
      .filter((s) => s.comuna === cargaComuna && getBestPrice(s.precios[fuelType]) > 0)
      .map((s) => ({ ...s, isOutdated: s.timestampAct === 0 || now - s.timestampAct > OUTDATED_MS }))
      .sort((a, b) => a.isOutdated === b.isOutdated ? getBestPrice(a.precios[fuelType]) - getBestPrice(b.precios[fuelType]) : a.isOutdated ? 1 : -1 );
  }, [cneStations, cargaComuna, fuelType]);

  // Al cambiar de comuna o combustible en la calculadora, reseteamos la selección.
  useEffect(() => { 
    setCurrentPage(1); 
    setCurrentStation(null);
  }, [cargaComuna, fuelType]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "STATION_CLICKED") {
        const clickedId = event.data.id;
        const clickedStation = filteredStationsCarga.find((s) => s.id === clickedId);
        if (clickedStation) {
          setCurrentStation(clickedStation);
          const stationIndex = filteredStationsCarga.findIndex((s) => s.id === clickedId);
          if (stationIndex !== -1) setCurrentPage(Math.floor(stationIndex / ITEMS_PER_PAGE) + 1);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [filteredStationsCarga]);

  useEffect(() => {
    if (calcMode === "carga" && cargaComuna && filteredStationsCarga.length > 0) {
      const html = generateStationsMapHtml(filteredStationsCarga, currentStation?.id);
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      setStationsMapUrl(url);
      return () => URL.revokeObjectURL(url);
    } else { setStationsMapUrl(""); }
  }, [cargaComuna, fuelType, currentStation?.id, filteredStationsCarga, calcMode]);

  useEffect(() => {
    if (calcMode === "viaje" && originCity && destCity && parseFloat(distanceKm) >= 0) {
      const html = generateMapHtml(originCity, destCity, routeGeometry, isRoundTrip);
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      setMapUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [originCity, destCity, routeGeometry, distanceKm, calcMode, isRoundTrip]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (calcMode !== "viaje") return;

      if (!originCity || !destCity) {
        setDistanceKm("0");
        setRouteGeometry(null);
        setDetectedTolls({ total: 0, list: [] });
        setRouteError(false);
        return;
      }

      setIsCalculatingRoute(true);
      setRouteError(false);

      const endpoints = [
        "https://router.project-osrm.org/route/v1/driving",
        "https://routing.openstreetmap.de/routed-car/route/v1/driving"
      ];

      let routeFound = false;

      for (let i = 0; i < endpoints.length; i++) {
        if (routeFound) break;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); 

        try {
          const response = await fetch(
            `${endpoints[i]}/${originCity.lon},${originCity.lat};${destCity.lon},${destCity.lat}?overview=simplified&geometries=geojson`,
            { signal: controller.signal }
          );
          
          if (!response.ok) throw new Error("Server OSRM saturado");
          
          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
            const exactKm = (data.routes[0].distance / 1000).toFixed(1);
            const geo = data.routes[0].geometry;
            setDistanceKm(exactKm.toString());
            setRouteGeometry(geo);

            const tolls = detectTollsInRoute(geo);
            setDetectedTolls(tolls);
            routeFound = true;
          }
        } catch (err) {
          console.warn(`Servidor de rutas ${i + 1} falló. Intentando siguiente...`);
        } finally {
          clearTimeout(timeoutId);
        }
      }

      // 🔥 FALLBACK DIRECTO (Si falla todo el ruteo)
      if (!routeFound) {
        console.warn("⚠️ Usando fallback de línea directa.");

        const fallbackDist = calculateHaversineDistance(
          originCity.lat,
          originCity.lon,
          destCity.lat,
          destCity.lon
        );

        const fakeGeometry = {
          coordinates: [
            [originCity.lon, originCity.lat],
            [destCity.lon, destCity.lat]
          ]
        };

        setDistanceKm(fallbackDist.toString());
        setRouteGeometry(fakeGeometry);

        const tolls = detectTollsInRoute(fakeGeometry, true);
        setDetectedTolls(tolls);

        setRouteError(true);
      }

      setIsCalculatingRoute(false);
    };
    fetchRoute();
  }, [originCity, destCity, calcMode]);

  useEffect(() => {
    const fetchPrecios = async () => {
      setIsLoading(true);
      try {
        const baseOrigin = window.location.origin === "null" ? "http://localhost" : window.location.origin;
        const loginUrl = new URL("/api-cne/api/login", baseOrigin).toString();
        const estacionesUrl = new URL(RUTA_ESTACIONES, baseOrigin).toString();

        const loginRes = await fetch(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "email=nicolas0645@gmail.com&password=12qwaszxL",
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token || loginData.token;

        if (token) {
          setAuthStatus("success");
          const stRes = await fetch(estacionesUrl, {
            headers: { Token: token, Authorization: `Bearer ${token}`, Accept: "application/json" },
          });

          if (!stRes.ok) throw new Error("Error HTTP al obtener estaciones");
          const stData = await stRes.json();
          const raw = Array.isArray(stData) ? stData : stData.data || stData.estaciones || [];

          const seen = new Set();
          const cleanList = [];

          raw.forEach((s) => {
            const distribuidorStr = s.distribuidor?.marca || s.distribuidor?.nombre || s.distribuidor || s.razon_social || "Independiente";
            const direccionStr = s.ubicacion?.direccion || s.direccion || s.calle || "";
            const key = `${distribuidorStr}-${direccionStr}`.toLowerCase();

            if (!seen.has(key)) {
              seen.add(key);
              let p = {
                93: { asistido: 0, autoservicio: 0 },
                95: { asistido: 0, autoservicio: 0 },
                97: { asistido: 0, autoservicio: 0 },
                diesel: { asistido: 0, autoservicio: 0 },
                parafina: { asistido: 0, autoservicio: 0 },
              };
              let ts = 0, act = "";
              const objPrecios = s.precios || s.combustibles || s.precios_combustibles || s;

              if (objPrecios && typeof objPrecios === "object") {
                Object.entries(objPrecios).forEach(([k, v]) => {
                  if (!v) return;

                  let rawPrice = typeof v === "object" ? v.precio || v.valor || v.monto || 0 : v;
                  let val = parseFloat(String(rawPrice).replace(",", "."));
                  if (isNaN(val)) val = 0;
                  if (val > 0 && val < 10) val = Math.round(val * 1000); else val = Math.round(val);
                  if (val < 500 || val > 3000) return;

                  const n = k.toUpperCase();
                  let matchedKey = null;
                  if (n.includes("93")) matchedKey = "93";
                  else if (n.includes("95")) matchedKey = "95";
                  else if (n.includes("97")) matchedKey = "97";
                  else if (n === "DI" || n === "ADI" || n.includes("DIESEL") || n.includes("PETRO")) matchedKey = "diesel";
                  else if (n === "KE" || n.includes("KERO") || n.includes("PARAFINA")) matchedKey = "parafina";

                  if (matchedKey && val > 0) {
                    let isAuto = false;
                    if (typeof v === "object" && v.tipo_atencion) isAuto = v.tipo_atencion.toLowerCase().includes("auto");
                    else isAuto = n.startsWith("A");

                    if (isAuto) p[matchedKey].autoservicio = val;
                    else p[matchedKey].asistido = val;

                    if (typeof v === "object" && v.fecha_actualizacion) {
                      let f = v.fecha_actualizacion;
                      let h = v.hora_actualizacion || "00:00:00";
                      if (f.includes("-")) {
                        const d = f.split("-");
                        if (d[0].length === 2 && d.length === 3) f = `${d[2]}-${d[1]}-${d[0]}`;
                      }
                      const dt = new Date(`${f}T${h}`);
                      if (!isNaN(dt.getTime()) && dt.getTime() > ts) {
                        ts = dt.getTime();
                        act = `${v.fecha_actualizacion} ${h}`.trim();
                      }
                    }
                  }
                });
              }

              const comunaStr = s.ubicacion?.nombre_comuna || s.nombre_comuna || s.comuna || s.comuna_nombre || "Desconocida";
              const regionNameStr = s.ubicacion?.nombre_region || s.nombre_region || s.region || "";
              const latVal = parseFloat(String(s.ubicacion?.latitud || s.latitud || s.ubicacion?.lat || "0").replace(",", "."));
              const lonVal = parseFloat(String(s.ubicacion?.longitud || s.longitud || s.ubicacion?.lng || "0").replace(",", "."));

              if (p["93"].asistido > 0 || p["93"].autoservicio > 0 || p["diesel"].asistido > 0 || p["diesel"].autoservicio > 0 || p["95"].asistido > 0 || p["95"].autoservicio > 0) {
                cleanList.push({
                  id: s.codigo || s.id || Math.random().toString(),
                  comuna: comunaStr, distribuidor: distribuidorStr, direccion: direccionStr,
                  lat: isNaN(latVal) ? 0 : latVal, lon: isNaN(lonVal) ? 0 : lonVal,
                  precios: p, timestampAct: ts, actualizacion: act, regionId: extractRegionId(regionNameStr), regionName: regionNameStr, logo: s.distribuidor?.logo,
                });
              }
            }
          });
          setCneStations(cleanList.filter((s) => s.lat !== 0 && s.lon !== 0 && s.comuna !== "Desconocida"));
        } else {
          setAuthStatus("error");
        }
      } catch (e) {
        setAuthStatus("error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrecios();
  }, []);

  const comunasDataForRouting = React.useMemo(() => {
    const comunasObj = {};
    cneStations.forEach((s) => {
      if (s.lat !== 0 && s.lon !== 0) {
        if (!comunasObj[s.comuna]) {
          comunasObj[s.comuna] = { mainName: s.comuna, name: s.comuna, regionId: s.regionId, regionName: s.regionName, latSum: 0, lonSum: 0, count: 0 };
        }
        comunasObj[s.comuna].latSum += s.lat;
        comunasObj[s.comuna].lonSum += s.lon;
        comunasObj[s.comuna].count += 1;
      }
    });

    return Object.values(comunasObj).map((c) => ({
        mainName: c.mainName, name: c.name, regionId: c.regionId, regionName: c.regionName, lat: c.latSum / c.count, lon: c.lonSum / c.count,
      })).sort((a, b) => a.mainName.localeCompare(b.mainName));
  }, [cneStations]);

  const availableComunas = React.useMemo(() => {
    const map = new Map();
    cneStations.forEach((s) => {
      if (s.comuna && !map.has(s.comuna)) {
        map.set(s.comuna, s.regionName);
      }
    });
    return Array.from(map.entries())
      .map(([comuna, regionName]) => ({ comuna, regionName }))
      .sort((a, b) => a.comuna.localeCompare(b.comuna));
  }, [cneStations]);

  let pricePerLiter = 0;
  if (calcMode === "carga" && currentStation) {
    pricePerLiter = getBestPrice(currentStation.precios[fuelType]);
  } else if (calcMode === "viaje" && originCity) {
    const regionStations = cneStations.filter((s) => s.regionId === originCity.regionId && getBestPrice(s.precios[fuelType]) > 0);
    if (regionStations.length > 0) {
      const sum = regionStations.reduce((acc, s) => acc + getBestPrice(s.precios[fuelType]), 0);
      pricePerLiter = Math.round(sum / regionStations.length);
    }
  }

  const numInput = parseFloat(inputValue) || 0;
  const baseDist = parseFloat(distanceKm) || 0;
  const displayDistanceKm = isRoundTrip ? (baseDist * 2).toFixed(1) : baseDist.toFixed(1);
  const eff = parseFloat(efficiencyKml) || 1;

  const litersNeeded = eff > 0 ? parseFloat(displayDistanceKm) / eff : 0;
  const bencinaTotal = litersNeeded * pricePerLiter;
  const peajeTotal = detectedTolls.total * (isRoundTrip ? 2 : 1);

  let resultValue = 0;
  if (calcMode === "carga") {
    if (chargeMode === "liters") { resultValue = numInput * pricePerLiter; } 
    else { resultValue = pricePerLiter > 0 ? numInput / pricePerLiter : 0; }
  } else if (calcMode === "viaje") {
    resultValue = bencinaTotal + peajeTotal;
  }

  function formatCLP(value) {
    const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(safeValue);
  }

  const handleSwapCities = () => {
    const temp = originCity;
    setOriginCity(destCity);
    setDestCity(temp);
  };

  const fuelOptionsCarga = ["93", "95", "97", "diesel", "parafina"];

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentStationsPage = filteredStationsCarga.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStationsCarga.length / ITEMS_PER_PAGE);

  // --- COMPONENTES PARA PANELES SEPARADOS EN DESKTOP ---
  
  const CargaMainContent = (
    cargaComuna && filteredStationsCarga.length > 0 && (
      <div className="space-y-4 animate-in fade-in duration-500 mx-6 lg:mx-0 flex flex-col h-full pb-6 lg:pb-0">
        <div className="flex items-center justify-between ml-2 shrink-0">
           <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Estaciones</h3>
           <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{filteredStationsCarga.length} resultados</span>
        </div>

        <div className="w-full h-48 lg:flex-1 lg:min-h-[300px] shrink-0 rounded-[2rem] overflow-hidden shadow-sm border-[6px] border-white relative bg-slate-200">
          {stationsMapUrl ? (
            <iframe src={stationsMapUrl} title="Mapa Estaciones" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm text-slate-700">Toca un pin para verla</div>
        </div>

        <div className="flex flex-col gap-3 flex-1 lg:overflow-y-auto no-scrollbar lg:pr-2">
          {currentStationsPage.map((station, idx) => {
            const isSelected = currentStation?.id === station.id;
            const isCheapest = currentPage === 1 && idx === 0 && !station.isOutdated;
            const pObj = station.precios[fuelType];
            const bestPrice = getBestPrice(pObj);
            const hasAuto = pObj?.autoservicio > 0;
            const hasAsis = pObj?.asistido > 0;

            return (
              <div key={station.id} onClick={() => setCurrentStation(station)} className={`w-full shrink-0 flex items-center justify-between p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 ${isSelected ? "bg-slate-900 shadow-xl scale-[1.02]" : "bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md"}`}>
                <div className="flex flex-col flex-1 overflow-hidden pr-2">
                  <div className="flex items-center space-x-2 mb-1">
                    {station.logo ? (<img src={station.logo} alt={station.distribuidor} className="h-6 w-6 object-contain rounded-full bg-white p-0.5" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />) : null}
                    <Fuel className={`w-5 h-5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`} style={{ display: station.logo ? "none" : "block" }} />
                    <span className={`font-black text-sm truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{station.distribuidor}</span>
                    {isCheapest && <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-400/20 rounded-full px-1.5 py-0.5 ml-1 shrink-0 flex items-center"><TrendingUp className="w-2.5 h-2.5 mr-0.5" /> Top 1</span>}
                  </div>
                  <span className={`text-xs truncate font-medium ${isSelected ? 'text-slate-400' : 'text-slate-500'}`} title={station.direccion}>{station.direccion}</span>
                  <div className="flex items-center mt-2">
                    <span className={`text-[10px] flex items-center font-bold ${station.isOutdated ? "text-red-400" : isSelected ? "text-slate-400" : "text-slate-400"}`}>
                      {station.isOutdated ? <AlertCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {station.isOutdated ? "Desactualizado" : station.actualizacion ? station.actualizacion.split(" ")[0] : "--"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center shrink-0 pl-3 border-l border-white/10 min-w-[80px]">
                  <span className={`text-2xl font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>{formatCLP(bestPrice)}</span>
                  {hasAuto && hasAsis && pObj.autoservicio !== pObj.asistido ? (
                    <div className={`text-[9px] font-bold mt-1 flex flex-col items-end leading-tight ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                      <span className={isSelected ? 'text-blue-300' : 'text-blue-500'}>Auto: {formatCLP(pObj.autoservicio)}</span>
                      <span>Asis: {formatCLP(pObj.asistido)}</span>
                    </div>
                  ) : hasAuto ? (
                    <span className={`text-[9px] font-bold uppercase mt-1 ${isSelected ? 'text-blue-300' : 'text-blue-500'}`}>Autoservicio</span>
                  ) : hasAsis ? (
                    <span className={`text-[9px] font-bold uppercase mt-1 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>Asistido</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-2 shrink-0">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center bg-white text-slate-800 rounded-full shadow-sm disabled:opacity-50 transition-active active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-xs font-bold text-slate-500">Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center bg-white text-slate-800 rounded-full shadow-sm disabled:opacity-50 transition-active active:scale-95"><ChevronRight className="w-5 h-5" /></button>
          </div>
        )}
      </div>
    )
  );

  const ViajeMainContent = (
    originCity && destCity && (
      <div className="mx-6 lg:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full pb-6 lg:pb-0">
        <div className="flex items-center justify-between mb-3 px-2 shrink-0">
          <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Ruta calculada</span>
          {isCalculatingRoute ? (
            <div className="flex items-center text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-lg">
              <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> Procesando...
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-lg">
              {displayDistanceKm} km
            </span>
          )}
        </div>
        
        {routeError && (
          <div className="flex items-center text-[10px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-3 shrink-0">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            Servidores GPS públicos saturados. Mostrando estimación de ruta en línea recta.
          </div>
        )}

        <div className="relative h-48 lg:flex-1 lg:min-h-[400px] shrink-0 rounded-[2rem] overflow-hidden shadow-sm border-[6px] border-white bg-slate-200">
          {isCalculatingRoute ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
              <MapIcon className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-semibold">Trazando ruta...</span>
            </div>
          ) : (
            <>
              <iframe key={`map-${originCity.lat}-${destCity.lat}-${isRoundTrip}`} src={mapUrl} title="Mapa de la ruta" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg flex items-center gap-3 z-20 cursor-pointer" onClick={() => setIsRoundTrip(!isRoundTrip)}>
                 <span className="text-[13px] font-bold text-slate-800 whitespace-nowrap select-none">Ida y vuelta</span>
                 <button className={`w-11 h-6 rounded-full relative transition-colors ${isRoundTrip ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isRoundTrip ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  );

  const FooterContent = (
    <>
      {calcMode === "carga" && currentStation && (
        <div className="bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100 flex gap-2">
          <div className="relative flex-[2]">
            <input type="number" min="0" step={chargeMode === "liters" ? "0.1" : "1000"} value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full p-3 pl-4 pr-2 text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-black text-slate-900 bg-white" placeholder="0" />
          </div>
          <select value={chargeMode} onChange={(e) => { setChargeMode(e.target.value); setInputValue(""); }} className="flex-1 p-3 text-sm font-bold bg-slate-900 text-white rounded-xl outline-none cursor-pointer appearance-none text-center" >
            <option value="money">Pesos ($)</option>
            <option value="liters">Litros (L)</option>
          </select>
        </div>
      )}

      <div className="flex justify-between items-end mb-5">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {calcMode === "carga" ? chargeMode === "money" ? "Recibirás aprox." : "Costo estimado" : "Costo Total Viaje"}
          </span>
          <span className="text-[2.5rem] font-black text-slate-900 tracking-tight leading-none">
            {calcMode === "carga" && chargeMode === "money" ? `${resultValue.toFixed(1)} Lts` : formatCLP(resultValue)}
          </span>
        </div>
        
        {calcMode === "viaje" && resultValue > 0 && (
          <div className="flex flex-col items-end gap-1.5 pb-1">
            <span className="text-[11px] font-bold text-slate-400 flex items-center bg-slate-50 px-2 py-0.5 rounded-md"><Droplets className="w-3 h-3 mr-1 text-slate-400" /> {formatCLP(bencinaTotal)}</span>
            <span className="text-[11px] font-bold text-slate-400 flex items-center bg-slate-50 px-2 py-0.5 rounded-md"><Ticket className="w-3 h-3 mr-1 text-slate-400" /> {formatCLP(peajeTotal)}</span>
          </div>
        )}
      </div>

      {calcMode === "viaje" && (
        <button 
          onClick={() => { if(detectedTolls.list.length > 0) setShowTollsModal(true) }} 
          disabled={detectedTolls.list.length === 0}
          className="w-full bg-slate-900 text-white rounded-[1.25rem] py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          <Ticket className="w-5 h-5" />
          {detectedTolls.list.length > 0 ? 'Ver desglose de peajes' : 'Sin peajes en la ruta'}
        </button>
      )}

      {calcMode === "carga" && !currentStation && (
         <div className="w-full bg-slate-100 text-slate-400 rounded-[1.25rem] py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 text-center">
            Selecciona una estación para simular
         </div>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Conectando con CNE...</h2>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 flex items-center justify-center font-sans text-slate-800 min-h-screen sm:p-6 lg:p-8">
      <div className="w-full max-w-md lg:max-w-5xl bg-[#f8fafc] sm:rounded-[3rem] lg:rounded-[2rem] sm:shadow-2xl flex flex-col lg:flex-row h-[100dvh] sm:h-[850px] lg:h-[80vh] lg:min-h-[700px] overflow-hidden relative">
        
        {/* PANEL IZQUIERDO (CONTROLES) */}
        <div className="flex flex-col w-full lg:w-[420px] h-full relative z-20 bg-[#f8fafc] lg:border-r border-slate-200 shrink-0">
           
          {/* HEADER LIMPIO TIPO APP */}
          <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0 bg-[#f8fafc]">
            <h1 className="text-[22px] font-black tracking-tight text-slate-900">
              {calcMode === 'viaje' ? 'Calculadora de viaje' : 'Buscar Combustible'}
            </h1>
            <div className="flex items-center gap-3">
               {authStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
               <button className="p-2.5 bg-white rounded-full shadow-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Settings className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* SWITCHER DE MODOS */}
          <div className="mx-6 p-1.5 bg-slate-200/60 rounded-[1.25rem] flex shrink-0 mb-2">
            <button
              onClick={() => { setCalcMode("viaje"); setInputValue(""); if (fuelType === "parafina") setFuelType("93"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${calcMode === "viaje" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Route className="w-4 h-4" /> Viaje
            </button>
            <button
              onClick={() => { setCalcMode("carga"); setInputValue(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${calcMode === "carga" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Fuel className="w-4 h-4" /> Carga
            </button>
          </div>

          {/* CONTROLES SCROLLABLES */}
          <div className="flex-1 overflow-y-auto pb-40 lg:pb-0 no-scrollbar">
            {calcMode === "viaje" ? (
              <div className="space-y-6 pb-6 lg:pb-6">
                
                {/* TARJETA ORIGEN/DESTINO */}
                <div className="mx-6 mt-4 bg-white rounded-[2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10">
                    <button onClick={handleSwapCities} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors active:scale-95">
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex relative pr-12">
                     <div className="w-10 flex flex-col items-center justify-center pt-4 pb-4 relative">
                        <div className="w-[14px] h-[14px] rounded-full border-[3px] border-blue-500 bg-white z-10 relative"></div>
                        <div className="absolute top-7 bottom-7 w-[2px] border-l-2 border-dashed border-slate-200 left-1/2 -translate-x-1/2"></div>
                        <MapPin className="w-[18px] h-[18px] text-red-500 z-10 relative fill-red-100 mt-auto" />
                     </div>
                     <div className="flex-1 flex flex-col pl-2">
                        <div className="relative border-b border-slate-100 pb-2">
                           <RouteCityAutocomplete placeholder="¿Desde dónde viajas?" value={originCity} onSelect={setOriginCity} comunasData={comunasDataForRouting} />
                        </div>
                        <div className="relative pt-2">
                           <RouteCityAutocomplete placeholder="¿Hacia dónde vas?" value={destCity} onSelect={setDestCity} comunasData={comunasDataForRouting} />
                        </div>
                     </div>
                  </div>
                </div>

                {/* TARJETA VEHÍCULO / AJUSTES */}
                <div className="mx-6 space-y-3">
                   <h3 className="text-sm font-extrabold text-slate-800 ml-2 uppercase tracking-wide">Vehículo</h3>
                   <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-slate-50">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><Car className="w-5 h-5"/></div>
                            <span className="font-bold text-slate-700">Rendimiento</span>
                         </div>
                         <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                            <input type="number" step="0.1" min="1" className="w-10 bg-transparent outline-none font-black text-right text-slate-900" value={efficiencyKml} onChange={(e)=>setEfficiencyKml(e.target.value)} />
                            <span className="text-sm font-semibold text-slate-500">Km/L</span>
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border-b border-slate-50">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500"><Fuel className="w-5 h-5"/></div>
                            <span className="font-bold text-slate-700">Combustible</span>
                         </div>
                         <div className="relative">
                           <select className="bg-slate-50 pl-3 pr-8 py-2 rounded-xl border border-slate-200 font-black text-slate-900 outline-none cursor-pointer appearance-none" value={fuelType} onChange={(e)=>setFuelType(e.target.value)}>
                              <option value="93">93 oct</option>
                              <option value="95">95 oct</option>
                              <option value="97">97 oct</option>
                              <option value="diesel">Diesel</option>
                           </select>
                           <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Ticket className="w-5 h-5"/></div>
                            <span className="font-bold text-slate-700">Peajes y TAG</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-emerald-600">Automático</span>
                           <div className="w-10 h-6 bg-emerald-500 rounded-full relative flex items-center px-1">
                             <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                           </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* VISTA MAPA MOBILE */}
                <div className="lg:hidden">
                   {ViajeMainContent}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-6 lg:pb-6">
                {/* SECCIÓN CARGA TIPO DE COMBUSTIBLE */}
                <div className="mx-6 mt-4 space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-800 ml-2 uppercase tracking-wide">Tipo de combustible</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {fuelOptionsCarga.map((type) => {
                      const isSelected = fuelType === type;
                      return (
                        <button key={type} onClick={() => setFuelType(type)} className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${isSelected ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-600 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:bg-slate-50"}`}>
                          {type === "diesel" ? "Diesel" : type === "parafina" ? "Parafina" : type + " Octanos"}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* SECCIÓN CARGA UBICACIÓN */}
                <div className="mx-6 space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-800 ml-2 uppercase tracking-wide">Ubicación</h3>
                  <div className="bg-white rounded-[2rem] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <ComunaAutocomplete placeholder="¿En qué comuna buscas?" value={cargaComuna} onSelect={(c) => { setCargaComuna(c); setCurrentStation(null); }} comunas={availableComunas} />
                  </div>
                </div>

                {/* VISTA MAPA/LISTA MOBILE */}
                <div className="lg:hidden">
                   {CargaMainContent}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER INFERIOR (Costo Total y Botón) */}
          <div className="absolute lg:relative bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] lg:rounded-none p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.06)] lg:shadow-none lg:border-t lg:border-slate-200 z-30 pb-8 sm:pb-6 lg:p-6 lg:mt-auto">
            {FooterContent}
          </div>
        </div>
        
        {/* ================= PANEL DERECHO (DESKTOP) ================= */}
        <div className="hidden lg:flex flex-1 bg-slate-50/50 p-8 overflow-y-auto no-scrollbar relative flex-col">
           {calcMode === 'carga' ? (
               (cargaComuna && filteredStationsCarga.length > 0) ? (
                   <div className="w-full h-full">{CargaMainContent}</div>
               ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                      <MapPin className="w-16 h-16 mb-4" />
                      <p className="text-lg font-bold text-center max-w-xs">Selecciona una comuna para ver las estaciones cercanas</p>
                   </div>
               )
           ) : (
               (originCity && destCity) ? (
                   <div className="w-full h-full flex flex-col">{ViajeMainContent}</div>
               ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                      <Route className="w-16 h-16 mb-4" />
                      <p className="text-lg font-bold text-center max-w-xs">Ingresa tu punto de origen y destino para trazar la ruta</p>
                   </div>
               )
           )}
        </div>
        
        {/* ================= MODAL DE PEAJES ================= */}
        {showTollsModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 mb-4 sm:mb-0">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-900 flex items-center text-xl">
                     <Ticket className="w-6 h-6 mr-2 text-slate-900"/> Peajes en ruta
                  </h3>
                  <button onClick={() => setShowTollsModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
                     <X className="w-5 h-5 text-slate-600"/>
                  </button>
               </div>
               
               <div className="max-h-64 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                  {detectedTolls.list.map((t, i) => (
                     <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-700">{t.nombre}</span>
                        <span className="text-[15px] font-black text-slate-900">{formatCLP(t.precio)}</span>
                     </div>
                  ))}
               </div>
               
               <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex justify-between items-end mb-6">
                     <div className="flex flex-col">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Peajes</span>
                       {isRoundTrip && <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md mt-1.5 w-fit">IDA Y VUELTA (x2)</span>}
                     </div>
                     <span className="text-3xl font-black text-slate-900 leading-none">{formatCLP(peajeTotal)}</span>
                  </div>
                  <button onClick={() => setShowTollsModal(false)} className="w-full bg-slate-900 text-white py-4 rounded-[1.25rem] font-bold text-[15px] active:scale-95 transition-transform shadow-xl shadow-slate-900/20">
                     Cerrar
                  </button>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}