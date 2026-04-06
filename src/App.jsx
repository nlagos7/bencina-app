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
  Map,
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
  Eye
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
// 🚧 MEGA PEAJES DB (100% OFFLINE)
// ACTUALIZADO TARIFAS 2026 + DATA EXTRA DE USUARIO
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

  // --- MÁS PEAJES Y LATERALES ZONA SUR ---
  { id: "p_paine", nombre: "Peaje Paine", lat: -33.90762, lon: -70.73124, precio: 3700, tipo: "peaje" },
  { id: "p_rosario", nombre: "Peaje Rosario", lat: -34.34598, lon: -70.84077, precio: 900, tipo: "peaje" },
  { id: "p_rengo", nombre: "Peaje Rengo", lat: -34.39999, lon: -70.87174, precio: 900, tipo: "peaje" },
  { id: "p_sanfernando_lat", nombre: "Peaje San Fernando", lat: -34.60571, lon: -70.98311, precio: 900, tipo: "peaje" },
  { id: "p_chimbarongo_lat", nombre: "Peaje Chimbarongo", lat: -34.71434, lon: -71.03058, precio: 900, tipo: "peaje" },
  { id: "p_teno_sur", nombre: "Peaje Teno", lat: -34.79606, lon: -71.04829, precio: 3700, tipo: "peaje" },
  { id: "p_molina_lat", nombre: "Peaje Molina", lat: -35.09308, lon: -71.3181, precio: 8700, tipo: "peaje" },
  { id: "p_chillan_rc", nombre: "Peaje Chillán - Río Claro", lat: -35.20923, lon: -71.41098, precio: 3100, tipo: "peaje" },
  { id: "p_chillan_lin", nombre: "Peaje Chillán - Linares", lat: -35.83706, lon: -71.63185, precio: 800, tipo: "peaje" },
  { id: "p_chillan_ret", nombre: "Peaje Chillán - Retiro", lat: -36.00965, lon: -71.73294, precio: 3100, tipo: "peaje" },
  { id: "p_chillan_sc", nombre: "Peaje Chillán - San Carlos", lat: -36.41413, lon: -71.94597, precio: 800, tipo: "peaje" },
  { id: "p_pemuco_bosque", nombre: "Peaje Pemuco", lat: -36.9093, lon: -72.34219, precio: 3200, tipo: "peaje" },
  { id: "p_losangeles_lat", nombre: "Peaje Los Ángeles", lat: -37.48156, lon: -72.40525, precio: 800, tipo: "peaje" },
  { id: "p_mulchen_lat", nombre: "Peaje Mulchén", lat: -37.80649, lon: -72.331, precio: 3200, tipo: "peaje" },
  { id: "p_perquenco_lat", nombre: "Peaje Perquenco", lat: -38.36282, lon: -72.3861, precio: 3500, tipo: "peaje" },
  { id: "p_padrelc_lat", nombre: "Peaje Padre Las Casas", lat: -38.77516, lon: -72.58122, precio: 800, tipo: "peaje" },
  { id: "p_freire_ar", nombre: "Peaje Freire (Araucanía)", lat: -38.91553, lon: -72.62422, precio: 3500, tipo: "peaje" },
  { id: "p_lanco_2", nombre: "Peaje Lanco (Los Ríos)", lat: -39.48042, lon: -72.80662, precio: 3500, tipo: "peaje" },
  { id: "p_launion_2", nombre: "Peaje La Unión (Los Ríos)", lat: -40.22809, lon: -72.93889, precio: 3500, tipo: "peaje" },
  { id: "p_osorno", nombre: "Peaje Osorno", lat: -40.5794, lon: -73.09815, precio: 900, tipo: "peaje" },
  { id: "p_purranque_2", nombre: "Peaje Purranque (Los Lagos)", lat: -40.95912, lon: -73.134, precio: 3500, tipo: "peaje" },
  { id: "p_llanquihue", nombre: "Peaje Llanquihue", lat: -41.25465, lon: -73.02331, precio: 900, tipo: "peaje" },
  { id: "p_puertomontt_2", nombre: "Peaje Puerto Montt (Lagos)", lat: -41.4385, lon: -72.95663, precio: 1100, tipo: "peaje" },
  { id: "p_maullin", nombre: "Peaje Maullín", lat: -41.61707, lon: -73.27397, precio: 3000, tipo: "peaje" },

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
function detectTollsInRoute(geometry, isFallback = false) {
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

  const tolerance = isFallback ? 15 : 4; // 4km normal, 15km si es línea de emergencia

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
        <style>body { margin: 0; padding: 0; background: #f8fafc; } #map { width: 100vw; height: 100vh; } .leaflet-control-attribution { display: none !important; }</style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', { zoomControl: false });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            var originCoord = [${origin.lat}, ${origin.lon}];
            var destCoord = [${dest.lat}, ${dest.lon}];
            L.marker(originCoord, {icon: L.divIcon({ className: 'marker-origin', iconSize: [16, 16], html: '<div style="background:#3b82f6;width:16px;height:16px;border:3px solid white;border-radius:50%"></div>' })}).addTo(map);
            L.marker(destCoord, {icon: L.divIcon({ className: 'marker-dest', iconSize: [16, 16], html: '<div style="background:#ef4444;width:16px;height:16px;border:3px solid white;border-radius:50%"></div>' })}).addTo(map);
            var geometry = ${geomStr};
            if (geometry && geometry.coordinates) {
                var coords = geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
                var polyline = L.polyline(coords, {color: '#3b82f6', weight: 5, opacity: 0.8, lineJoin: 'round'}).addTo(map);
                map.fitBounds(polyline.getBounds(), {padding: [30, 30]});
            } else {
                var polyline = L.polyline([originCoord, destCoord], {color: '#94a3b8', weight: 3, dashArray: '8, 12'}).addTo(map);
                map.fitBounds(polyline.getBounds(), {padding: [30, 30]});
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
        <style>body { margin: 0; padding: 0; background: #f8fafc; } #map { width: 100vw; height: 100vh; } .leaflet-control-attribution { display: none !important; }</style>
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

const RouteCityAutocomplete = ({ placeholder, value, onSelect, comunasData }) => {
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
        className="w-full p-3.5 pl-4 pr-10 text-[16px] font-medium text-slate-700 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
      />
      {isLoadingCoords ? (
        <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-blue-500 animate-spin" />
      ) : value && value.mainName === query ? (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(""); onSelect(null); setIsOpen(true); }} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-red-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      ) : (
        <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i} onMouseDown={(e) => { e.preventDefault(); handleSelectCity(r.mainName); }} className="p-3 cursor-pointer flex justify-between items-center hover:bg-slate-50 text-slate-700 border-b last:border-0 border-slate-100">
              <div className="flex flex-col">
                 <span className="text-sm font-semibold">{r.mainName}</span>
                 {r.regionName && <span className="text-[10px] text-slate-400 font-medium">{r.regionName}</span>}
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
        className="w-full p-3.5 pl-10 pr-10 text-[16px] font-medium rounded-xl outline-none border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500"
      />
      <MapPin className="absolute left-3.5 top-4 w-4 h-4 text-slate-400" />
      {value === query && value !== "" ? (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(""); onSelect(""); setIsOpen(true); }} className="absolute right-3.5 top-4 text-blue-500 hover:text-red-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      ) : (
        <Search className="absolute right-3.5 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {results.map((c) => (
            <li key={c.comuna} onMouseDown={(e) => { e.preventDefault(); onSelect(c.comuna); setIsOpen(false); }} className="p-3 cursor-pointer flex justify-between items-center hover:bg-slate-50 border-b last:border-0 border-slate-100 text-sm font-semibold">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700">{c.comuna}</span>
                {c.regionName && <span className="text-[10px] text-slate-400 font-medium">{c.regionName}</span>}
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

  // Estados Peajes y Modales
  const [detectedTolls, setDetectedTolls] = useState({ total: 0, list: [] });
  const [showTollsModal, setShowTollsModal] = useState(false);
  const [apiData, setApiData] = useState(null);

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
        setDistanceKm("0"); setRouteGeometry(null); setDetectedTolls({ total: 0, list: [] }); return;
      }
      if (originCity.lat === destCity.lat && originCity.lon === destCity.lon) {
        setDistanceKm("0"); setRouteGeometry(null); setDetectedTolls({ total: 0, list: [] }); return;
      }

      setIsCalculatingRoute(true);
      
      const endpoints = [
        "https://router.project-osrm.org/route/v1/driving",
        "https://routing.openstreetmap.de/routed-car/route/v1/driving"
      ];
      
      let routeFound = false;

      for (let i = 0; i < endpoints.length; i++) {
        if (routeFound) break;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); 

        try {
          const response = await fetch(
            `${endpoints[i]}/${originCity.lon},${originCity.lat};${destCity.lon},${destCity.lat}?overview=full&geometries=geojson`,
            { signal: controller.signal }
          );
          
          if (!response.ok) throw new Error("Server OSRM saturado");
          
          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
            const exactKm = (data.routes[0].distance / 1000).toFixed(1);
            const geo = data.routes[0].geometry;
            setDistanceKm(exactKm.toString());
            setRouteGeometry(geo);

            // Detección automática de Peajes
            const tolls = detectTollsInRoute(geo, false);
            setDetectedTolls(tolls);
            routeFound = true;
          }
        } catch (err) {
          console.warn(`Servidor de rutas ${i + 1} falló. Intentando servidor de respaldo...`);
        } finally {
          clearTimeout(timeoutId);
        }
      }

      if (!routeFound) {
        setDistanceKm("0");
        setRouteGeometry(null);
        setDetectedTolls({ total: 0, list: [] });
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
    const map = new globalThis.Map();
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

  const fuelOptionsCarga = ["93", "95", "97", "diesel", "parafina"];

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentStationsPage = filteredStationsCarga.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStationsCarga.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Conectando con CNE...</h2>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 flex items-center justify-center font-sans text-slate-800 h-[100dvh] sm:h-screen sm:p-8">
      <div className="w-full max-w-md bg-white sm:rounded-3xl sm:shadow-2xl sm:border border-slate-100 flex flex-col h-full sm:h-[850px] overflow-hidden relative">
        
        {/* HEADER */}
        <div className="shrink-0 bg-blue-600 p-5 sm:p-6 text-white relative shadow-md z-20">
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-medium border ${authStatus === "success" ? "bg-emerald-500/20 border-emerald-400 text-emerald-50" : authStatus === "error" ? "bg-red-500/20 border-red-400 text-red-50" : "bg-blue-700/50 border-blue-400"}`}>
              {authStatus === "success" ? ( <ShieldCheck className="w-3 h-3" /> ) : ( <AlertCircle className="w-3 h-3" /> )}
              <span>{authStatus === "success" ? "Auth CNE OK" : "Auth Falló"}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 mb-2 mt-2">
            <Fuel className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">BencinaApp 🇨🇱</h1>
          </div>
          <p className="text-blue-100 text-sm opacity-90">Planifica tu ruta o consulta precios.</p>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6 relative z-10">
          <div className="sticky top-0 z-50 flex p-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
            <button
              onClick={() => { setCalcMode("viaje"); setInputValue(""); if (fuelType === "parafina") setFuelType("93"); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${calcMode === "viaje" ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Route className="w-4 h-4 inline-block mr-1.5 mb-0.5" /> Viaje
            </button>
            <button
              onClick={() => { setCalcMode("carga"); setInputValue(""); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${calcMode === "carga" ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <MapPin className="w-4 h-4 inline-block mr-1.5 mb-0.5" /> Por Ciudad
            </button>
          </div>

          {calcMode === "carga" ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-slate-700"><Droplets className="w-4 h-4 mr-2 text-blue-500" /> 1. ¿Qué buscas?</label>
                <div className="flex flex-wrap gap-2">
                  {fuelOptionsCarga.map((type) => {
                    const isSelected = fuelType === type;
                    return (
                      <button key={type} onClick={() => setFuelType(type)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${isSelected ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                        {type === "diesel" ? "Diesel" : type === "parafina" ? "Parafina" : type + " Oct"}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3 relative z-40">
                <label className="flex items-center text-sm font-bold text-slate-700"><MapPin className="w-4 h-4 mr-2 text-blue-500" /> 2. ¿En qué comuna?</label>
                <ComunaAutocomplete placeholder="Escribe tu comuna..." value={cargaComuna} onSelect={(c) => { setCargaComuna(c); setCurrentStation(null); }} comunas={availableComunas} />
              </div>

              {cargaComuna && filteredStationsCarga.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-500 relative z-10">
                  <label className="flex items-center text-sm font-bold text-slate-700"><Store className="w-4 h-4 mr-2 text-emerald-500" /> 3. Selecciona tu estación</label>

                  <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm relative bg-slate-200">
                    {stationsMapUrl ? (
                      <iframe src={stationsMapUrl} title="Mapa Estaciones" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
                    )}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm text-slate-600 border border-slate-200">Toca un pin para verla</div>
                  </div>

                  <div className="flex flex-col gap-3 mt-3">
                    {currentStationsPage.map((station, idx) => {
                      const isSelected = currentStation?.id === station.id;
                      const isCheapest = currentPage === 1 && idx === 0 && !station.isOutdated;
                      const pObj = station.precios[fuelType];
                      const bestPrice = getBestPrice(pObj);
                      const hasAuto = pObj?.autoservicio > 0;
                      const hasAsis = pObj?.asistido > 0;

                      return (
                        <div key={station.id} onClick={() => setCurrentStation(station)} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isSelected ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"}`}>
                          <div className="flex flex-col flex-1 overflow-hidden pr-2">
                            <div className="flex items-center space-x-2 mb-1">
                              {station.logo ? (<img src={station.logo} alt={station.distribuidor} className="h-5 w-5 object-contain rounded" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />) : null}
                              <Fuel className="w-4 h-4 text-slate-400" style={{ display: station.logo ? "none" : "block" }} />
                              <span className="font-bold text-slate-700 text-sm truncate">{station.distribuidor}</span>
                              {isCheapest && <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 rounded-full px-1.5 py-0.5 ml-1 border border-emerald-200 shrink-0 flex items-center"><TrendingUp className="w-2.5 h-2.5 mr-0.5" /> Top 1</span>}
                            </div>
                            <span className="text-xs text-slate-500 truncate" title={station.direccion}>{station.direccion}</span>
                            <div className="flex items-center mt-1.5">
                              <span className={`text-[10px] flex items-center ${station.isOutdated ? "text-red-500 font-bold" : "text-slate-400"}`}>
                                {station.isOutdated ? <AlertCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                {station.isOutdated ? "Desactualizado" : station.actualizacion ? station.actualizacion.split(" ")[0] : "--"}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-center shrink-0 pl-3 border-l border-slate-100 min-w-[80px]">
                            <span className={`text-xl font-black ${station.isOutdated ? "text-slate-400" : "text-slate-800"}`}>{formatCLP(bestPrice)}</span>
                            {hasAuto && hasAsis && pObj.autoservicio !== pObj.asistido ? (
                              <div className="text-[9px] font-bold text-slate-400 mt-1 flex flex-col items-end leading-tight">
                                <span className="text-blue-500">Auto: {formatCLP(pObj.autoservicio)}</span>
                                <span>Asis: {formatCLP(pObj.asistido)}</span>
                              </div>
                            ) : hasAuto ? (
                              <span className="text-[9px] font-bold text-blue-500 uppercase mt-1">Autoservicio</span>
                            ) : hasAsis ? (
                              <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Asistido</span>
                            ) : null}
                            {isSelected && <Check className="w-5 h-5 text-blue-600 mt-1" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                      <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center px-3 py-2 bg-white text-slate-600 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition-active active:scale-95"><ChevronLeft className="w-4 h-4 mr-1" /> Ant</button>
                      <span className="text-xs font-bold text-slate-500">Pág {currentPage} de {totalPages}</span>
                      <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center px-3 py-2 bg-white text-slate-600 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition-active active:scale-95">Sig <ChevronRight className="w-4 h-4 ml-1" /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative z-40">
                <div>
                  <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /></div>Punto de inicio
                  </label>
                  <RouteCityAutocomplete placeholder="¿Desde dónde viajas?" value={originCity} onSelect={setOriginCity} comunasData={comunasDataForRouting} />
                </div>

                <div>
                  <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2"><MapPin className="w-3.5 h-3.5 text-red-500" /></div>Punto de destino
                  </label>
                  <RouteCityAutocomplete placeholder="¿Hacia dónde vas?" value={destCity} onSelect={setDestCity} comunasData={comunasDataForRouting} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="flex items-center text-xs font-bold text-slate-700 mb-2"><Gauge className="w-4 h-4 mr-1.5 text-slate-400" /> Rendimiento</label>
                    <div className="relative">
                      <input type="number" min="1" step="0.1" value={efficiencyKml} onChange={(e) => setEfficiencyKml(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[16px] font-bold text-slate-700" />
                      <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">km/L</span>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center text-xs font-bold text-slate-700 mb-2"><Fuel className="w-4 h-4 mr-1.5 text-slate-400" /> Combustible</label>
                    <div className="relative">
                      <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[16px] font-bold text-slate-700 appearance-none cursor-pointer">
                        <option value="93">93 Octanos</option>
                        <option value="95">95 Octanos</option>
                        <option value="97">97 Octanos</option>
                        <option value="diesel">Diesel</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Panel de Autodetección de Peajes CON MODAL */}
                <div className="pt-3 border-t border-slate-100">
                   <div className="flex items-center justify-between mb-2">
                     <label className="flex items-center text-xs font-bold text-slate-700">
                        <Ticket className="w-4 h-4 mr-1.5 text-slate-400" /> Peajes y TAG 
                     </label>
                     <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">AUTOMÁTICO</span>
                   </div>
                   
                   <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center shadow-inner">
                      <span className="text-[16px] font-black text-slate-700">{formatCLP(peajeTotal)}</span>
                      {detectedTolls.list.length > 0 ? (
                        <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-full uppercase">{detectedTolls.list.length} detectados</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Sin peajes</span>
                      )}
                   </div>

                   {/* Botón Pop-up */}
                   {detectedTolls.list.length > 0 && (
                      <button onClick={() => setShowTollsModal(true)} className="mt-3 w-full flex justify-between items-center p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl active:scale-[0.98] transition-all">
                         <span className="text-xs font-bold text-blue-700 flex items-center">
                           <Eye className="w-4 h-4 mr-1.5" /> Ver desglose de peajes
                         </span>
                         <ArrowRight className="w-4 h-4 text-blue-500" />
                      </button>
                   )}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="text-xs text-slate-500 flex items-center">
                    Ref bencina: <strong className="text-slate-700 ml-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{pricePerLiter > 0 ? formatCLP(pricePerLiter) : "--"}</strong>/L
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-2 rounded-lg border border-slate-200">
                    <input type="checkbox" className="rounded text-blue-500 accent-blue-500 w-4 h-4" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} />
                    <span className="text-xs font-bold text-slate-700">Ida y vuelta</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center text-sm font-semibold text-slate-600">
                  <Route className="w-4 h-4 mr-2 text-emerald-500" /> Distancia total:
                </div>
                {isCalculatingRoute ? (
                  <div className="flex items-center text-emerald-600 text-sm font-bold">
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> GPS...
                  </div>
                ) : (
                  <span className="text-sm font-bold text-slate-800 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {displayDistanceKm} km
                  </span>
                )}
              </div>

              {originCity && destCity && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm relative bg-slate-200">
                  {isCalculatingRoute ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mb-2 text-emerald-500" />
                      <span className="text-xs font-medium">Trazando ruta segura...</span>
                    </div>
                  ) : (
                    <iframe key={`map-${originCity.lat}-${destCity.lat}-${isRoundTrip}`} src={mapUrl} title="Mapa de la ruta" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANEL INFERIOR FIJO */}
        <div className="shrink-0 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] p-4 sm:p-6 z-30">
          {calcMode === "carga" && currentStation && (
            <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500">Simulador de Carga</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">{formatCLP(pricePerLiter)}/L</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-[2]">
                  <input type="number" min="0" step={chargeMode === "liters" ? "0.1" : "1000"} value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full p-2.5 pl-3 pr-2 text-[16px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700" placeholder="0" />
                </div>
                <select value={chargeMode} onChange={(e) => { setChargeMode(e.target.value); setInputValue(""); }} className="flex-1 p-2 text-[16px] font-bold bg-white border border-slate-300 rounded-lg outline-none cursor-pointer" >
                  <option value="money">Pesos ($)</option>
                  <option value="liters">Litros (L)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {calcMode === "carga" ? chargeMode === "money" ? "Recibirás aprox." : "Costo total aprox." : isRoundTrip ? "Costo Ida y Vuelta" : "Costo Total Viaje"}
              </span>
              <span className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-1">
                {calcMode === "carga" && chargeMode === "money" ? `${resultValue.toFixed(1)} Lts` : formatCLP(resultValue)}
              </span>
              {calcMode === "viaje" && (
                <div className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-2.5 uppercase tracking-widest">
                  <span className="flex items-center"><Droplets className="w-3 h-3 mr-1 text-slate-300" /> {formatCLP(bencinaTotal)}</span>
                  {peajeTotal > 0 && <span className="flex items-center"><Ticket className="w-3 h-3 mr-1 text-slate-300" /> {formatCLP(peajeTotal)}</span>}
                </div>
              )}
            </div>
            <div className="bg-blue-600 p-4.5 rounded-2xl text-white shadow-xl shadow-blue-200 active:scale-95 transition-all">
              <Calculator className="w-7 h-7" />
            </div>
          </div>
        </div>
        
        {/* ================= MODAL DE PEAJES ================= */}
        {showTollsModal && (
          <div className="absolute inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-200 mb-4 sm:mb-0">
               <div className="flex justify-between items-center mb-5">
                  <h3 className="font-black text-slate-800 flex items-center text-lg">
                     <Ticket className="w-5 h-5 mr-2 text-blue-500"/> Detalle de Peajes
                  </h3>
                  <button onClick={() => setShowTollsModal(false)} className="bg-slate-100 p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                     <X className="w-5 h-5 text-slate-500"/>
                  </button>
               </div>
               
               <div className="max-h-64 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                  {detectedTolls.list.map((t, i) => (
                     <div key={i} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-600">{t.nombre}</span>
                        <span className="text-sm font-black text-slate-800">{formatCLP(t.precio)}</span>
                     </div>
                  ))}
               </div>
               
               <div className="mt-5 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                     <div className="flex flex-col">
                       <span className="text-xs font-bold text-slate-500 uppercase">Total en Ruta</span>
                       {isRoundTrip && <span className="text-[10px] font-black text-blue-500 bg-blue-100 px-2 py-0.5 rounded-md mt-1 w-fit">MULTIPLICADO x2</span>}
                     </div>
                     <span className="text-2xl font-black text-slate-800">{formatCLP(peajeTotal)}</span>
                  </div>
                  <button onClick={() => setShowTollsModal(false)} className="w-full mt-5 bg-blue-600 text-white py-4 rounded-xl font-black text-sm active:scale-95 transition-transform shadow-lg shadow-blue-200">
                     Cerrar Detalle
                  </button>
               </div>
            </div>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
          </div>
        )}

      </div>
    </div>
  );
}