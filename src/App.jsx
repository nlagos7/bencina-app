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
  Car,
  Info,
  Tag,
  Plus,
  ChevronUp
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

// Función global para quitar acentos y normalizar textos
const normalizeString = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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
  { id: "p_lampa_lat", nombre: "Peaje Lampa Lateral", lat: -33.255, lon: -70.82, precio: 0, tipo: "lateral" },
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
  { id: "p_angostura_lat_n", nombre: "Angostura Lateral Norte", lat: -33.885, lon: -70.735, precio: 0, tipo: "lateral" },
  { id: "p_angostura_lat_s", nombre: "Angostura Lateral Sur", lat: -33.905, lon: -70.735, precio: 0, tipo: "lateral" },
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
  { id: "p_licanco", nombre: "Peaje Lateral Licanco", lat: -38.782, lon: -72.611, precio: 0, tipo: "lateral" },
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
  { id: "p_rosario", nombre: "Peaje Rosario", lat: -34.34598, lon: -70.84077, precio: 900, tipo: "lateral" },
  { id: "p_rengo", nombre: "Peaje Rengo", lat: -34.39999, lon: -70.87174, precio: 900, tipo: "lateral" },
  { id: "p_sanfernando_lat", nombre: "Peaje San Fernando", lat: -34.60571, lon: -70.98311, precio: 900, tipo: "lateral" },
  { id: "p_chimbarongo_lat", nombre: "Peaje Chimbarongo", lat: -34.71434, lon: -71.03058, precio: 900, tipo: "lateral" },
  { id: "p_teno_sur", nombre: "Peaje Teno", lat: -34.79606, lon: -71.04829, precio: 3700, tipo: "peaje" },
  { id: "p_molina_lat", nombre: "Peaje Molina", lat: -35.09308, lon: -71.3181, precio: 900, tipo: "lateral" },
  { id: "p_chillan_lin", fixed: true, nombre: "Peaje Chillán - Linares", lat: -35.83706, lon: -71.63185, precio: 800, tipo: "lateral" },
  { id: "p_chillan_sc", nombre: "Peaje San Carlos", lat: -36.41413, lon: -71.94597, precio: 800, tipo: "lateral" },
  { id: "p_losangeles_lat", nombre: "Peaje Los Ángeles", lat: -37.48156, lon: -72.40525, precio: 800, tipo: "lateral" },
  { id: "p_padrelc_lat", nombre: "Peaje Padre Las Casas", lat: -38.77516, lon: -72.58122, precio: 800, tipo: "lateral" },
  { id: "p_lautaro_lat", nombre: "Peaje Lateral Lautaro", lat: -38.536, lon: -72.441, precio: 900, tipo: "lateral" },
  { id: "p_temuco_norte_lat", nombre: "Peaje Lateral Temuco Norte", lat: -38.685, lon: -72.545, precio: 900, tipo: "lateral" },
  { id: "p_osorno", nombre: "Peaje Osorno", lat: -40.5794, lon: -73.09815, precio: 900, tipo: "lateral" },
  { id: "p_llanquihue", nombre: "Peaje Llanquihue", lat: -41.25465, lon: -73.02331, precio: 900, tipo: "lateral" },
  { id: "p_lasraices", nombre: "Peaje Túnel Las Raíces", lat: -38.454, lon: -71.498, precio: 400, tipo: "peaje" },

  // --- PÓRTICOS TAG URBANOS ---
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

// =========================
// 🏷️ DESCUENTOS POR MARCA (Actualizados Abril 2026)
// =========================
const DESCUENTOS_POR_MARCA = {
  "copec": [
    { dia: "Lunes", desc: "$50 a $100/L dcto con Cencosud Scotiabank" },
    { dia: "Lunes", desc: "$100/L dcto con Jumbo Prime" },
    { dia: "Miércoles", desc: "Hasta $100/L dcto con Scotiabank" },
    { dia: "Miércoles", desc: "$50/L dcto para socios Automóvil Club" },
    { dia: "Jueves", desc: "$100/L dcto con Tarjeta de Crédito BCI" },
    { dia: "Jueves", desc: "$100/L dcto con Tarjetas Coopeuch" },
    { dia: "Viernes", desc: "$50 a $300/L dcto con Tenpo" },
    { dia: "Viernes", desc: "$100/L dcto con RUT Pay Banco Estado" },
    { dia: "Domingo", desc: "$100/L dcto con Tarjeta de Crédito BICE" },
    { dia: "Lun-Vie", desc: "$100/L dcto con Santander Consumer" },
    { dia: "Todos los días", desc: "$50/L dcto primera carga App Copec" }
  ],
  "shell": [
    { dia: "Martes", desc: "$100/L dcto con Lider Bci" },
    { dia: "Viernes", desc: "$50 a $300/L dcto con Tenpo" },
    { dia: "Domingo", desc: "$100/L dcto con Tarjeta de Crédito BICE" }
  ],
  "aramco": [
    { dia: "Lunes", desc: "$100 a $150/L dcto con Banco Consorcio" },
    { dia: "Lunes", desc: "$15 a $25/L dcto con Beneficios Municipalidades" },
    { dia: "Martes", desc: "$50/L dcto con Mercado Pago" },
    { dia: "Martes", desc: "$15 a $25/L dcto con Beneficios Municipalidades" },
    { dia: "Miércoles", desc: "$100 a $150/L dcto con Banco Ripley" },
    { dia: "Jueves", desc: "$150/L dcto con Tarjeta ABC" },
    { dia: "Viernes", desc: "$50 a $300/L dcto con Tenpo" },
    { dia: "Sábado", desc: "$100 a $150/L dcto con Sbpay" },
    { dia: "Domingo", desc: "$150/L dcto con Spin Visa de Cruz Verde" },
    { dia: "Todos los días", desc: "$15 a $25/L dcto con Jenabien (FFAA/PDI)" },
    { dia: "Todos los días", desc: "$50/L dcto primera carga App Aramco" }
  ]
};

const getDiscountsForBrand = (brandName) => {
   if(!brandName) return null;
   const b = normalizeString(brandName);
   if (b.includes("copec")) return DESCUENTOS_POR_MARCA["copec"];
   if (b.includes("shell")) return DESCUENTOS_POR_MARCA["shell"];
   if (b.includes("aramco") || b.includes("petrobras")) return DESCUENTOS_POR_MARCA["aramco"];
   return null;
}

function extractRegionId(displayName) {
  const lower = (displayName || "").toLowerCase();
  for (const [key, id] of Object.entries(REGION_MAP)) {
    if (lower.includes(key)) return id;
  }
  return "RM";
}

// Distancia lineal pura (retorna kms como float)
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
  return Math.round(getStraightLineDistance(lat1, lon1, lat2, lon2) * 1.3);
}

// Decodificador de Polyline (Transforma el string raro de ORS en coordenadas legibles)
function decodePolyline(encoded, precision = 5) {
  const factor = Math.pow(10, precision);
  let index = 0, lat = 0, lng = 0, coordinates = [];
  
  while (index < encoded.length) {
    let byte, shift = 0, result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += latitude_change;
    
    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += longitude_change;
    
    coordinates.push([lng / factor, lat / factor]); // Formato [lon, lat] para L.polyline
  }
  return coordinates;
}

// =========================
// 🚨 DETECCIÓN OFFLINE ROBUSTA
// =========================
function detectTollsInRoute(geometry) {
  if (!geometry || !geometry.coordinates || geometry.coordinates.length < 2) return { total: 0, list: [] };

  const ENABLE_LATERAL_TOLLS = false; // Interruptor oculto solicitado para desactivar laterales

  const detected = new Set();
  let total = 0;
  const tolls = [];

  // Puntos de inicio y fin para calcular la intención del usuario
  const startLon = geometry.coordinates[0][0];
  const startLat = geometry.coordinates[0][1];
  const endLon = geometry.coordinates[geometry.coordinates.length - 1][0];
  const endLat = geometry.coordinates[geometry.coordinates.length - 1][1];

  // 🔥 DENSIFICAR RUTA (Alta resolución: 1 punto cada 200m)
  const densePoints = [];
  for (let i = 0; i < geometry.coordinates.length - 1; i++) {
    const [lon1, lat1] = geometry.coordinates[i];
    const [lon2, lat2] = geometry.coordinates[i+1];
    densePoints.push([lon1, lat1]);
    
    const dist = getStraightLineDistance(lat1, lon1, lat2, lon2);
    if (dist > 0.2) { 
      const steps = Math.floor(dist / 0.2);
      for (let j = 1; j <= steps; j++) {
        const fraction = j / (steps + 1);
        const ilon = lon1 + (lon2 - lon1) * fraction;
        const ilat = lat1 + (lat2 - lat1) * fraction;
        densePoints.push([ilon, ilat]);
      }
    }
  }
  densePoints.push(geometry.coordinates[geometry.coordinates.length - 1]);

  // Tolerancia mucho más estricta (400 metros) para evitar falsos positivos en desvíos/bypasses
  const tolerance = 0.4;

  // 🔥 DETECCIÓN
  densePoints.forEach((coord) => {
    const [lon, lat] = coord;

    PEAJES_DB.forEach((p) => {
      // Si el peaje es lateral y están desactivados, lo saltamos
      if (!ENABLE_LATERAL_TOLLS && p.tipo === "lateral") return;

      if (!detected.has(p.id)) {
        const distToRoute = getStraightLineDistance(lat, lon, p.lat, p.lon);
        
        if (p.tipo === "lateral") {
          // Generalmente los peajes laterales se pagan al salir de la carretera hacia la ciudad destino.
          const distToEnd = getStraightLineDistance(p.lat, p.lon, endLat, endLon);
          
          if (distToEnd <= 15 && distToRoute <= tolerance) {
            detected.add(p.id);
            total += p.precio || 0;
            tolls.push(p);
          }
        } else {
          // Troncales o TAGs
          if (distToRoute <= tolerance) {
            detected.add(p.id);
            total += p.precio || 0;
            tolls.push(p);
          }
        }
      }
    });
  });

  return { total, list: tolls };
}

// Extrae el mejor precio disponible (usado para listado/orden)
function getBestPrice(pObj) {
  if (!pObj) return 0;
  if (typeof pObj === "number") return pObj;
  const asis = pObj.asistido || 0;
  const auto = pObj.autoservicio || 0;
  if (asis > 0 && auto > 0) return Math.min(asis, auto);
  return asis > 0 ? asis : auto;
}

function generateMapHtml(origin, dest, geometry, isRoundTrip, tolls = [], waypoints = []) {
  if (!origin || !dest) return "";
  const geomStr = geometry ? JSON.stringify(geometry) : "null";
  
  const tollsJs = tolls.map(t => `
    L.marker([${t.lat}, ${t.lon}], {
      icon: L.divIcon({
        className: 'marker-toll',
        iconSize: [20, 20],
        html: '<div style="background:#f59e0b;width:20px;height:20px;border:2px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:11px;font-weight:900;">$</span></div>'
      }),
      zIndexOffset: 500
    }).addTo(map).bindPopup("<b style='color:#334155'>${t.nombre}</b><br><span style='color:#f59e0b;font-weight:bold'>$${t.precio}</span>");
  `).join('\n');

  const waypointsJs = waypoints.map(wp => `
    L.marker([${wp.lat}, ${wp.lon}], {
      icon: L.divIcon({
        className: 'marker-waypoint',
        iconSize: [12, 12],
        html: '<div style="background:#f59e0b;width:12px;height:12px;border:2px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>'
      }),
      zIndexOffset: 600
    }).addTo(map).bindPopup("<b style='color:#334155'>Parada: ${wp.mainName}</b>");
  `).join('\n');

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
            var map = L.map('map', { zoomControl: true });
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            var originCoord = [${origin.lat}, ${origin.lon}];
            var destCoord = [${dest.lat}, ${dest.lon}];
            
            L.marker(originCoord, {icon: L.divIcon({ className: 'marker-origin', iconSize: [16, 16], html: '<div style="background:#3b82f6;width:16px;height:16px;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.2)"></div>' })}).addTo(map);
            L.marker(destCoord, {icon: L.divIcon({ className: 'marker-dest', iconSize: [16, 16], html: '<div style="background:#ef4444;width:16px;height:16px;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.2)"></div>' })}).addTo(map);
            
            ${waypointsJs}

            var geometry = ${geomStr};
            if (geometry && geometry.coordinates) {
                var coords = geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
                var polyline = L.polyline(coords, {color: '#3b82f6', weight: 4, opacity: 0.9, lineJoin: 'round'}).addTo(map);
                map.fitBounds(polyline.getBounds(), {padding: [30, 30]});
            } else {
                var polyline = L.polyline([originCoord, destCoord], {color: '#94a3b8', weight: 3, dashArray: '8, 12'}).addTo(map);
                map.fitBounds(L.latLngBounds([originCoord, destCoord]), {padding: [30, 30]});
            }
            ${tollsJs}
        </script>
    </body>
    </html>
  `;
}

function generateStationsMapHtml(stations, selectedStation, userLoc, showRouteLine) {
  if (!stations || stations.length === 0) return "";
  const selectedId = selectedStation?.id;
  const markersJs = stations
    .map((s) => {
      const isSelected = selectedStation && s.id === selectedId;
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
    
  let userMarkerJs = "";
  if (userLoc) {
      userMarkerJs = `
          L.marker([${userLoc.lat}, ${userLoc.lon}], {
              icon: L.divIcon({
                  className: 'user-marker',
                  html: '<div style="background-color:#2563eb; width:16px; height:16px; border:3px solid white; border-radius:50%; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4);"></div>',
                  iconSize: [22, 22]
              }),
              zIndexOffset: 2000
          }).addTo(map).bindPopup("<b>Tu ubicación</b>");
      `;
  }

  let mapViewJs = "";
  if (showRouteLine && selectedStation && userLoc) {
    mapViewJs = `
      var routeLine = L.polyline([[${userLoc.lat}, ${userLoc.lon}], [${selectedStation.lat}, ${selectedStation.lon}]], {color: '#3b82f6', weight: 3, dashArray: '6, 8', opacity: 0.8}).addTo(map);
      map.fitBounds(routeLine.getBounds(), {padding: [40, 40], maxZoom: 13});
    `;
  } else if (selectedStation) {
    mapViewJs = `map.setView([${selectedStation.lat}, ${selectedStation.lon}], 13);`;
  } else {
    const boundsPoints = stations.map(s => `[${s.lat}, ${s.lon}]`).join(",");
    mapViewJs = `
      var bounds = L.latLngBounds([${boundsPoints}]);
      map.fitBounds(bounds, {padding: [20, 20], maxZoom: 13});
    `;
  }

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
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            ${markersJs}
            ${userMarkerJs}
            ${mapViewJs}
        </script>
    </body>
    </html>
  `;
}

const RouteCityAutocomplete = ({ placeholder, value, onSelect, comunasData, hideClear }) => {
  const [query, setQuery] = useState(value ? value.mainName : "");
  const [localResults, setLocalResults] = useState([]);
  const [externalResults, setExternalResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => { setQuery(value ? value.mainName : ""); }, [value]);

  useEffect(() => {
    if (!isOpen) {
        setLocalResults([]);
        setExternalResults([]);
        return;
    }

    const safeQuery = normalizeString(query);
    if (!safeQuery || (value && normalizeString(value.mainName) === safeQuery)) {
      setLocalResults(comunasData.slice(0, 15));
      setExternalResults([]);
      return;
    }

    // Búsqueda Local Rápida (Comunas)
    const filtered = comunasData.filter((c) => normalizeString(c.mainName).includes(safeQuery));
    filtered.sort((a, b) => {
      const nameA = normalizeString(a.mainName);
      const nameB = normalizeString(b.mainName);
      const startsA = nameA.startsWith(safeQuery);
      const startsB = nameB.startsWith(safeQuery);
      if (startsA && !startsB) return -1;
      if (!startsA && startsB) return 1;
      return nameA.localeCompare(nameB);
    });
    setLocalResults(filtered.slice(0, 5));

    // Búsqueda Global (Lugares, Parques, Negocios) en OpenStreetMap
    if (safeQuery.length >= 3) {
      setIsSearching(true);
      const timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&q=${encodeURIComponent(query)}&limit=5`);
          const data = await res.json();
          const mapped = data.map(d => {
            let nameParts = d.display_name.split(',').map(p => p.trim());
            let mainName = d.name || nameParts[0];
            let details = nameParts.filter(p => p !== mainName).slice(0, 2).join(', ');
            return {
              mainName: mainName,
              name: mainName,
              regionName: details,
              lat: parseFloat(d.lat),
              lon: parseFloat(d.lon),
              isExternal: true
            };
          });

          // Evitar duplicar las comunas locales que ya encontró
          const uniqueExternal = mapped.filter(ex => !filtered.some(loc => normalizeString(loc.mainName) === normalizeString(ex.mainName)));
          setExternalResults(uniqueExternal);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      }, 800);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      setExternalResults([]);
      setIsSearching(false);
    }
  }, [query, isOpen, comunasData, value]);

  const handleSelectItem = (item) => {
    setQuery(item.mainName);
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <div className="relative w-full flex-1">
      <input
        type="text" value={query} onFocus={() => setIsOpen(true)} onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onChange={(e) => {
          setQuery(e.target.value); setIsOpen(true);
          if (value && value.mainName !== e.target.value) onSelect(null);
        }}
        placeholder={placeholder}
        className="w-full py-2 pr-10 text-[18px] font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-400 placeholder:font-medium"
      />
      {isSearching ? (
        <Loader2 className="absolute right-2 top-2.5 w-4 h-4 text-blue-500 animate-spin" />
      ) : value && value.mainName === query && !hideClear ? (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(""); onSelect(null); setIsOpen(true); }} className="absolute right-2 top-2.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      ) : (
        <Search className="absolute right-2 top-2.5 w-4 h-4 text-slate-300 pointer-events-none" />
      )}
      
      {isOpen && (localResults.length > 0 || externalResults.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-64 overflow-y-auto">
          
          {localResults.length > 0 && (
             <div className="px-4 py-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10 border-b border-slate-100">Comunas</div>
          )}
          {localResults.map((r, i) => (
            <div key={`loc-${i}`} onMouseDown={(e) => { e.preventDefault(); handleSelectItem(r); }} className="p-3 px-4 cursor-pointer flex justify-between items-center hover:bg-slate-50 text-slate-700 border-b border-slate-50 last:border-0 transition-colors">
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">{r.mainName}</span>
                 {r.regionName && <span className="text-[10px] text-slate-400 font-semibold uppercase">{r.regionName}</span>}
              </div>
              {value?.mainName === r.mainName && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
            </div>
          ))}

          {externalResults.length > 0 && (
             <div className="px-4 py-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10 border-y border-slate-100">Lugares y Direcciones</div>
          )}
          {externalResults.map((r, i) => (
            <div key={`ext-${i}`} onMouseDown={(e) => { e.preventDefault(); handleSelectItem(r); }} className="p-3 px-4 cursor-pointer flex justify-between items-center hover:bg-slate-50 text-slate-700 border-b border-slate-50 last:border-0 transition-colors">
              <div className="flex flex-col">
                 <span className="text-[13px] font-bold text-slate-800 flex items-start gap-1.5 leading-snug"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5"/> {r.mainName}</span>
                 <span className="text-[10px] text-slate-400 font-medium truncate max-w-[280px] pl-5">{r.regionName}</span>
              </div>
              {value?.mainName === r.mainName && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
            </div>
          ))}
          
        </div>
      )}
      
      {isOpen && isSearching && localResults.length === 0 && (
         <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 flex flex-col items-center justify-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-bold">Buscando lugares...</span>
         </div>
      )}

      {isOpen && query.length > 2 && localResults.length === 0 && externalResults.length === 0 && !isSearching && (
         <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 text-center text-sm text-slate-500 font-medium">
            No se encontraron lugares. Intenta con otro nombre.
         </div>
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
    const safeQuery = normalizeString(query);
    if (!safeQuery || safeQuery === normalizeString(value)) {
      setResults(comunas.slice(0, 50));
      return;
    }
    const filtered = comunas.filter((c) => normalizeString(c.comuna).includes(safeQuery));
    
    filtered.sort((a, b) => {
      const nameA = normalizeString(a.comuna);
      const nameB = normalizeString(b.comuna);
      const startsA = nameA.startsWith(safeQuery);
      const startsB = nameB.startsWith(safeQuery);
      if (startsA && !startsB) return -1;
      if (!startsA && startsB) return 1;
      return nameA.localeCompare(nameB);
    });

    setResults(filtered.slice(0, 50));
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
        <button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(""); onSelect(""); setIsOpen(true); }} className="absolute right-4 top-4 text-blue-500 hover:text-red-500 transition-colors cursor-pointer">
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
  const [calcMode, setCalcMode] = useState("carga");
  
  // ================= ESTADOS CON PERSISTENCIA (LOCALSTORAGE) =================
  const [fuelType, setFuelType] = useState(() => localStorage.getItem('bencinaapp_fuel') || "93");
  const [efficiencyKml, setEfficiencyKml] = useState(() => localStorage.getItem('bencinaapp_eff') || "12");
  const [includeTolls, setIncludeTolls] = useState(() => localStorage.getItem('bencinaapp_tolls') !== "false");
  const [recentComunas, setRecentComunas] = useState(() => JSON.parse(localStorage.getItem('bencinaapp_recent_comunas') || '[]'));

  // Paginación y control Mobile
  const [mobileStep, setMobileStep] = useState(1);
  const cargaListRef = useRef(null);

  // Modales
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempEff, setTempEff] = useState(efficiencyKml);
  const [tempFuel, setTempFuel] = useState(fuelType);
  const [tempTolls, setTempTolls] = useState(includeTolls);
  
  // Estación Detail & Calculadora
  const [showStationModal, setShowStationModal] = useState(false);
  const [serviceMode, setServiceMode] = useState("asistido"); // "asistido" o "autoservicio"
  const [showAllDiscounts, setShowAllDiscounts] = useState(false);
  
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcVal, setCalcVal] = useState("");
  const [calcUnit, setCalcUnit] = useState("money"); // 'money' or 'liters'
  const [calcFuelType, setCalcFuelType] = useState(fuelType); // Aislado para el popup

  const [distanceKm, setDistanceKm] = useState("0");
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const [originCity, setOriginCity] = useState(null);
  const [destCity, setDestCity] = useState(null);
  const [waypoints, setWaypoints] = useState([]); // Arreglo de paradas intermedias

  const [routeGeometry, setRouteGeometry] = useState(null);
  const [mapUrl, setMapUrl] = useState("");
  const [stationsMapUrl, setStationsMapUrl] = useState("");

  const [cneStations, setCneStations] = useState([]);
  const [cargaComuna, setCargaComuna] = useState("");
  const [currentStation, setCurrentStation] = useState(null);
  
  // Ubicacion y Filtros
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('price'); // 'price' | 'distance'
  const [isLocating, setIsLocating] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [authStatus, setAuthStatus] = useState("pending");
  const [routeError, setRouteError] = useState(false);

  // Estados Peajes y Modales
  const [detectedTolls, setDetectedTolls] = useState({ total: 0, list: [] });
  const [showTollsModal, setShowTollsModal] = useState(false);

  // Funciones para manejar Paradas (Waypoints)
  const addWaypoint = () => {
    if (waypoints.length < 3) {
      setWaypoints([...waypoints, null]);
    }
  };

  const updateWaypoint = (index, value) => {
    const newWps = [...waypoints];
    newWps[index] = value;
    setWaypoints(newWps);
  };

  const removeWaypoint = (index) => {
    const newWps = [...waypoints];
    newWps.splice(index, 1);
    setWaypoints(newWps);
  };

  const moveWaypoint = (index, direction) => {
    const newWps = [...waypoints];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newWps.length) {
      const temp = newWps[index];
      newWps[index] = newWps[targetIndex];
      newWps[targetIndex] = temp;
      setWaypoints(newWps);
    }
  };

  // Scrollea la lista al tope y cierra modal seleccionado cuando hay un cambio de búsqueda principal
  useEffect(() => {
    setCurrentStation(null);
    setShowStationModal(false);
    setShowAllDiscounts(false);
    if (cargaListRef.current) {
       cargaListRef.current.scrollTop = 0;
    }
  }, [cargaComuna, fuelType, sortBy]);

  // Al abrir el modal de una estación, determinamos qué servicio mostrar por defecto
  useEffect(() => {
    if (currentStation) {
      const p = currentStation.precios[fuelType];
      if (p && p.autoservicio > 0 && p.asistido > 0) {
        setServiceMode(p.autoservicio < p.asistido ? "autoservicio" : "asistido");
      } else if (p && p.autoservicio > 0) {
        setServiceMode("autoservicio");
      } else {
        setServiceMode("asistido");
      }
    }
  }, [currentStation, fuelType]);

  const handleSelectComuna = (c) => {
    setCargaComuna(c);
    setSortBy('price'); 
    if (c) {
      const updatedRecents = [c, ...recentComunas.filter(rc => rc !== c)].slice(0, 3);
      setRecentComunas(updatedRecents);
      localStorage.setItem('bencinaapp_recent_comunas', JSON.stringify(updatedRecents));
      
      if (window.innerWidth < 1024) {
         setMobileStep(2);
      }
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserLocation({ lat, lon });
          
          let closestComuna = "";
          let minDist = Infinity;
          cneStations.forEach(s => {
             const d = getStraightLineDistance(lat, lon, s.lat, s.lon);
             if(d < minDist) {
                minDist = d;
                closestComuna = s.comuna;
             }
          });
          
          if (closestComuna) {
            handleSelectComuna(closestComuna);
          }
          setIsLocating(false);
        },
        (error) => {
          console.error("Error GPS:", error);
          setIsLocating(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const filteredStationsCarga = React.useMemo(() => {
    if (!cargaComuna) return [];
    const now = Date.now();
    const OUTDATED_MS = 7 * 24 * 60 * 60 * 1000;
    
    let list = cneStations
      .filter((s) => s.comuna === cargaComuna && getBestPrice(s.precios[fuelType]) > 0)
      .map((s) => {
          const distToUser = userLocation ? getStraightLineDistance(userLocation.lat, userLocation.lon, s.lat, s.lon) : null;
          const hasAuto = ["93", "95", "97", "diesel", "parafina"].some(t => s.precios[t]?.autoservicio > 0);
          return { 
            ...s, 
            isOutdated: s.timestampAct === 0 || now - s.timestampAct > OUTDATED_MS,
            distToUser,
            hasAuto
          };
      });

    list.sort((a, b) => {
      if (a.isOutdated !== b.isOutdated) return a.isOutdated ? 1 : -1;
      if (sortBy === 'distance' && a.distToUser !== null && b.distToUser !== null) {
         return a.distToUser - b.distToUser;
      }
      return getBestPrice(a.precios[fuelType]) - getBestPrice(b.precios[fuelType]);
    });
    
    return list;
  }, [cneStations, cargaComuna, fuelType, sortBy, userLocation]);

  const isUserNearCurrentComuna = React.useMemo(() => {
    if (!userLocation || filteredStationsCarga.length === 0) return false;
    return filteredStationsCarga.some(s => s.distToUser !== null && s.distToUser <= 50);
  }, [userLocation, filteredStationsCarga]);

  useEffect(() => {
    if (showSettingsModal) {
      setTempEff(efficiencyKml);
      setTempFuel(fuelType);
      setTempTolls(includeTolls);
    }
  }, [showSettingsModal, efficiencyKml, fuelType, includeTolls]);

  const handleSaveSettings = () => {
    setEfficiencyKml(tempEff);
    setFuelType(tempFuel);
    setIncludeTolls(tempTolls);
    
    localStorage.setItem('bencinaapp_eff', tempEff);
    localStorage.setItem('bencinaapp_fuel', tempFuel);
    localStorage.setItem('bencinaapp_tolls', tempTolls);
    
    setShowSettingsModal(false);
  };

  // Interceptar clicks del mapa interactivo
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "STATION_CLICKED") {
        const clickedId = event.data.id;
        const clickedStation = filteredStationsCarga.find((s) => s.id === clickedId);
        if (clickedStation) {
          setCurrentStation(clickedStation);
          setShowStationModal(true);
          setShowAllDiscounts(false);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [filteredStationsCarga]);

  // Auto-scroll a la tarjeta seleccionada (Solo en layout desktop)
  useEffect(() => {
    if (currentStation && calcMode === 'carga' && !showStationModal && window.innerWidth >= 1024) {
      setTimeout(() => {
        const el = document.getElementById(`station-card-${currentStation.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [currentStation, calcMode, showStationModal]);

  useEffect(() => {
    if (calcMode === "carga" && cargaComuna && filteredStationsCarga.length > 0) {
      const showRouteLine = userLocation && currentStation && currentStation.distToUser !== null && currentStation.distToUser <= 50;
      const html = generateStationsMapHtml(filteredStationsCarga, currentStation, userLocation, showRouteLine);
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      setStationsMapUrl(url);
      return () => URL.revokeObjectURL(url);
    } else { setStationsMapUrl(""); }
  }, [cargaComuna, fuelType, currentStation, filteredStationsCarga, calcMode, userLocation]);

  useEffect(() => {
    if (calcMode === "viaje" && originCity && destCity && parseFloat(distanceKm) >= 0) {
      const validWaypoints = waypoints.filter(w => w !== null);
      const html = generateMapHtml(originCity, destCity, routeGeometry, isRoundTrip, detectedTolls.list, validWaypoints);
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      setMapUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [originCity, destCity, waypoints, routeGeometry, distanceKm, calcMode, isRoundTrip, detectedTolls.list]);

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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const getRouteData = async (points) => {
        const coordsOSRM = points.map(p => `${p.lon},${p.lat}`).join(';');
        const coordsORS = points.map(p => [p.lon, p.lat]);

        const endpoints = [
          { url: `https://router.project-osrm.org/route/v1/driving/${coordsOSRM}?overview=full&geometries=geojson`, type: "osrm" },
          { url: `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsOSRM}?overview=full&geometries=geojson`, type: "osrm" },
          { url: "https://api.openrouteservice.org/v2/directions/driving-car", type: "ors", body: { coordinates: coordsORS } }
        ];

        return await Promise.any(
          endpoints.map(async (ep) => {
            if (ep.type === "ors") {
              const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjM5MDY2ZmJlZDhhNzRkYTZiMmVkOWI5MmI2NDcyM2Q1IiwiaCI6Im11cm11cjY0In0=";
              const res = await fetch(ep.url, {
                method: "POST",
                headers: { "Authorization": API_KEY, "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify(ep.body)
              });
              const contentType = res.headers.get("content-type");
              if (contentType && contentType.includes("text/html")) throw new Error("Recibido HTML en vez de JSON");
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const data = await res.json();
              if (!data.routes || data.routes.length === 0) throw new Error("ORS no devolvió rutas");
              return {
                geo: { coordinates: decodePolyline(data.routes[0].geometry) },
                dist: data.routes[0].summary.distance / 1000
              };
            } else {
              const res = await fetch(ep.url, { signal: controller.signal });
              const contentType = res.headers.get("content-type");
              if (contentType && contentType.includes("text/html")) throw new Error("Recibido HTML en vez de JSON");
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const data = await res.json();
              if (!data.routes || data.routes.length === 0) throw new Error("Sin rutas en la respuesta");
              return {
                geo: data.routes[0].geometry,
                dist: data.routes[0].distance / 1000
              };
            }
          })
        );
      };

      try {
        const validWaypoints = waypoints.filter(w => w !== null);
        const outboundPoints = [originCity, ...validWaypoints, destCity];
        const outboundResult = await getRouteData(outboundPoints);

        let finalDist = outboundResult.dist;
        let finalGeo = outboundResult.geo;
        let tollsOut = detectTollsInRoute(finalGeo);
        let finalTollsTotal = tollsOut.total;
        let finalTollsList = tollsOut.list;

        if (isRoundTrip) {
            // El viaje de vuelta siempre es directo, ignorando las paradas
            const returnPoints = [destCity, originCity];
            const returnResult = await getRouteData(returnPoints);

            finalDist += returnResult.dist;
            finalGeo = {
                type: "LineString",
                coordinates: [...outboundResult.geo.coordinates, ...returnResult.geo.coordinates]
            };
            let tollsRet = detectTollsInRoute(returnResult.geo);
            finalTollsTotal += tollsRet.total;
            let retTollList = tollsRet.list.map(t => ({ ...t, id: t.id + '_vuelta', nombre: t.nombre + " (Vuelta)" }));
            finalTollsList = [...finalTollsList, ...retTollList];
        }

        setDistanceKm(finalDist.toFixed(1));
        setRouteGeometry(finalGeo);
        setDetectedTolls({ total: finalTollsTotal, list: finalTollsList });

      } catch (err) {
        const validWaypoints = waypoints.filter(w => w !== null);
        const outboundPoints = [originCity, ...validWaypoints, destCity];
        
        let fallbackDist = 0;
        for(let i=0; i < outboundPoints.length - 1; i++) {
            fallbackDist += calculateHaversineDistance(outboundPoints[i].lat, outboundPoints[i].lon, outboundPoints[i+1].lat, outboundPoints[i+1].lon);
        }
        let fakeGeoOut = { coordinates: outboundPoints.map(p => [p.lon, p.lat]) };
        let tollsOut = detectTollsInRoute(fakeGeoOut);

        let finalDist = fallbackDist;
        let finalGeo = fakeGeoOut;
        let finalTollsTotal = tollsOut.total;
        let finalTollsList = tollsOut.list;

        if (isRoundTrip) {
            let returnDist = calculateHaversineDistance(destCity.lat, destCity.lon, originCity.lat, originCity.lon);
            finalDist += returnDist;
            let fakeGeoRet = { coordinates: [[destCity.lon, destCity.lat], [originCity.lon, originCity.lat]] };
            finalGeo = {
                 type: "LineString",
                 coordinates: [...fakeGeoOut.coordinates, ...fakeGeoRet.coordinates]
            };
            let tollsRet = detectTollsInRoute(fakeGeoRet);
            finalTollsTotal += tollsRet.total;
            let retTollList = tollsRet.list.map(t => ({ ...t, id: t.id + '_vuelta', nombre: t.nombre + " (Vuelta)" }));
            finalTollsList = [...finalTollsList, ...retTollList];
        }

        setDistanceKm(finalDist.toFixed(1));
        setRouteGeometry(finalGeo);
        setDetectedTolls({ total: finalTollsTotal, list: finalTollsList });
        setRouteError(true);
      } finally {
        clearTimeout(timeoutId);
        setIsCalculatingRoute(false);
      }
    };
    fetchRoute();
  }, [originCity, destCity, waypoints, calcMode, isRoundTrip]);

  useEffect(() => {
    const fetchPrecios = async () => {
      setIsLoading(true);
      try {
        const loginUrl = `/api-cne/api/login`;
        const estacionesUrl = `/api-cne/api/v4/estaciones`;

        const loginRes = await fetch(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "email=nicolas0645@gmail.com&password=12qwaszxL",
        });

        if (!loginRes.ok) throw new Error(`Error en Login.`);
        const contentType = loginRes.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) throw new Error("El servidor devolvió HTML. Proxy ausente.");

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
            let distribuidorStr = s.distribuidor?.marca || s.distribuidor?.nombre || s.distribuidor || s.razon_social || "Independiente";
            
            // Reemplazo de Petrobras a Aramco según la realidad actual
            if (distribuidorStr.toLowerCase().includes("petrobras")) {
               distribuidorStr = "Aramco";
            }

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

          const filteredList = cleanList.filter((s) => s.lat !== 0 && s.lon !== 0 && s.comuna !== "Desconocida");
          setCneStations(filteredList);
        } else {
          setAuthStatus("error");
        }
      } catch (e) {
        setAuthStatus("demo");
        const MOCK_STATIONS = [
          {
            id: "m1", comuna: "Santiago", distribuidor: "Copec", direccion: "Av. Providencia 123",
            lat: -33.4489, lon: -70.6693,
            precios: { 93: { asistido: 1320, autoservicio: 1300 }, 95: { asistido: 1360 }, 97: { asistido: 1400 }, diesel: { asistido: 1050 }, parafina: { asistido: 950 } },
            actualizacion: "Hoy", regionId: "RM", regionName: "Región Metropolitana", timestampAct: Date.now(),
          },
          {
            id: "m2", comuna: "Santiago", distribuidor: "Shell", direccion: "Alameda 456",
            lat: -33.44, lon: -70.65,
            precios: { 93: { asistido: 1310 }, 95: { asistido: 1350 }, 97: { asistido: 1390 }, diesel: { asistido: 1040 }, parafina: { asistido: 940 } },
            actualizacion: "Hoy", regionId: "RM", regionName: "Región Metropolitana", timestampAct: Date.now(),
          },
          {
            id: "m3", comuna: "Viña del Mar", distribuidor: "Aramco", direccion: "Av. Libertad 456",
            lat: -33.0153, lon: -71.5505,
            precios: { 93: { asistido: 1310 }, 95: { asistido: 1350 }, 97: { asistido: 1390 }, diesel: { asistido: 1040 }, parafina: { asistido: 940 } },
            actualizacion: "Hoy", regionId: "V", regionName: "Valparaíso", timestampAct: Date.now(),
          },
          {
            id: "m5", comuna: "Temuco", distribuidor: "Shell", direccion: "Caupolicán 1010",
            lat: -38.7359, lon: -72.5904,
            precios: { 93: { asistido: 1340 }, 95: { asistido: 1380 }, diesel: { asistido: 1070 } },
            actualizacion: "Hoy", regionId: "IX", regionName: "Araucanía", timestampAct: Date.now(),
          }
        ];
        setCneStations(MOCK_STATIONS);
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
  if (calcMode === "viaje" && originCity) {
    const regionStations = cneStations.filter((s) => s.regionId === originCity.regionId && getBestPrice(s.precios[fuelType]) > 0);
    if (regionStations.length > 0) {
      const sum = regionStations.reduce((acc, s) => acc + getBestPrice(s.precios[fuelType]), 0);
      pricePerLiter = Math.round(sum / regionStations.length);
    }
  }

  const baseDist = parseFloat(distanceKm) || 0;
  const displayDistanceKm = baseDist.toFixed(1); // La API ya suma la distancia real de ida y vuelta
  const eff = parseFloat(efficiencyKml) || 1;

  const litersNeeded = eff > 0 ? parseFloat(displayDistanceKm) / eff : 0;
  const bencinaTotal = litersNeeded * pricePerLiter;
  const peajeTotal = includeTolls ? detectedTolls.total : 0; // detectTollsInRoute ya cuenta peajes de vuelta
  const resultValue = bencinaTotal + peajeTotal;

  function formatCLP(value) {
    const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(safeValue);
  }

  const handleSwapCities = () => {
    const temp = originCity;
    setOriginCity(destCity);
    setDestCity(temp);
    setWaypoints([...waypoints].reverse());
  };

  const fuelOptionsCarga = ["93", "95", "97", "diesel", "parafina"];

  // --- COMPONENTES PARA PANELES SEPARADOS EN DESKTOP ---
  
  const CargaMainContent = (
    cargaComuna && filteredStationsCarga.length > 0 && (
      <div className="flex flex-col h-full w-full animate-in fade-in duration-500 overflow-hidden lg:space-y-4">
        
        {/* MAPA HEADER MOBILE (Ocupa todo el ancho superior tipo Uber) */}
        <div className="lg:hidden w-full h-[35vh] min-h-[250px] shrink-0 relative bg-slate-200 z-0">
          {stationsMapUrl ? (
            <iframe key={`carga-map-${stationsMapUrl}-${mobileStep}`} src={stationsMapUrl} title="Mapa Estaciones" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>
          )}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md text-slate-700 pointer-events-none">Toca un pin para ver detalles</div>
        </div>

        {/* MAPA Y HEADER DESKTOP */}
        <div className="hidden lg:flex items-center justify-between shrink-0 pt-2">
           <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Estaciones</h3>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{filteredStationsCarga.length}</span>
           </div>
        </div>
        <div className="hidden lg:block w-full h-[350px] min-h-[350px] shrink-0 rounded-[2rem] overflow-hidden shadow-sm border-[6px] border-white relative bg-slate-200 z-0">
          {stationsMapUrl ? (
            <iframe key={`carga-map-${stationsMapUrl}-${mobileStep}`} src={stationsMapUrl} title="Mapa Estaciones" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm text-slate-700 pointer-events-none">Toca un pin para ver detalles</div>
        </div>

        {/* Toggle (New location) */}
        <div className="px-5 pt-4 lg:px-0 lg:pt-0 shrink-0 flex flex-col gap-3">
           <div className="flex items-center justify-between lg:hidden">
              <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">{filteredStationsCarga.length} Estaciones en Lista</span>
           </div>
           {isUserNearCurrentComuna && (
                <div className="flex bg-slate-200 p-1.5 rounded-[1rem] w-full">
                  <button onClick={() => setSortBy('price')} className={`flex-1 text-[13px] font-bold px-3 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer ${sortBy === 'price' ? 'bg-white text-slate-800' : 'text-slate-500 shadow-none hover:text-slate-700'}`}>Por Precio</button>
                  <button onClick={() => setSortBy('distance')} className={`flex-1 text-[13px] font-bold px-3 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer ${sortBy === 'distance' ? 'bg-white text-slate-800' : 'text-slate-500 shadow-none hover:text-slate-700'}`}>Por Cercanía</button>
                </div>
           )}
        </div>

        {/* LISTA CON SCROLL INTERNO LIMPIA */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 lg:px-0 lg:pt-0 pb-6 lg:pb-0 lg:pr-2 relative z-10" ref={cargaListRef}>
          <div className="flex flex-col gap-3">
            {filteredStationsCarga.map((station, idx) => {
              const isCheapest = idx === 0 && !station.isOutdated && sortBy === 'price';
              const bestPrice = getBestPrice(station.precios[fuelType]);
              
              const brandNormalized = normalizeString(station.distribuidor);
              let stationDiscounts = null;
              if (brandNormalized.includes("copec")) stationDiscounts = DESCUENTOS_POR_MARCA["copec"];
              else if (brandNormalized.includes("shell")) stationDiscounts = DESCUENTOS_POR_MARCA["shell"];
              else if (brandNormalized.includes("aramco")) stationDiscounts = DESCUENTOS_POR_MARCA["aramco"];
              
              // Cálculo del ahorro por autoservicio en esta estación
              const pObjList = station.precios[fuelType];
              const autoPriceList = pObjList?.autoservicio || 0;
              const asisPriceList = pObjList?.asistido || 0;
              let autoLabelList = "Autoservicio";
              if (autoPriceList > 0 && asisPriceList > 0 && autoPriceList < asisPriceList) {
                autoLabelList = `Auto -$${asisPriceList - autoPriceList}`;
              }

              return (
                <div key={station.id} id={`station-card-${station.id}`} 
                     onClick={() => { setCurrentStation(station); setShowStationModal(true); setShowAllDiscounts(false); }} 
                     className="w-full shrink-0 flex flex-col p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 transform-gpu bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-transparent hover:border-slate-200 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col flex-1 overflow-hidden pr-2">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                        {station.logo ? (<img src={station.logo} alt={station.distribuidor} className="h-6 w-6 object-contain rounded-full bg-white p-0.5" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />) : null}
                        <Fuel className="w-5 h-5 text-slate-400" style={{ display: station.logo ? "none" : "block" }} />
                        <span className="font-black text-sm truncate text-slate-800">{station.distribuidor}</span>
                        {isCheapest && (
                          <span className="text-[10px] font-extrabold rounded-full px-1.5 py-0.5 shrink-0 flex items-center transition-colors text-emerald-800 bg-emerald-400/20">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> Top 1
                          </span>
                        )}
                        {station.hasAuto && (
                          <span className="text-[9px] font-black rounded-full px-1.5 py-0.5 shrink-0 uppercase transition-colors text-blue-700 bg-blue-100">
                            {autoLabelList}
                          </span>
                        )}
                        {stationDiscounts && (
                          <span className="text-[9px] font-black rounded-full px-1.5 py-0.5 shrink-0 uppercase transition-colors text-rose-700 bg-rose-100">
                            Descuentos
                          </span>
                        )}
                      </div>
                      <span className="text-xs truncate font-medium text-slate-500" title={station.direccion}>{station.direccion}</span>
                      <div className="flex items-center mt-2">
                        <span className={`text-[10px] flex items-center font-bold ${station.isOutdated ? "text-red-400" : "text-slate-400"}`}>
                          {station.isOutdated ? <AlertCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                          {station.isOutdated ? "Desactualizado" : station.actualizacion ? station.actualizacion.split(" ")[0] : "--"}
                        </span>
                        {station.distToUser !== null && sortBy === 'distance' && (
                          <span className="text-[10px] font-extrabold rounded-full px-2 py-0.5 ml-2 transition-colors text-blue-600 bg-blue-100/80">
                            A {station.distToUser.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center shrink-0 pl-3 border-l border-slate-100 min-w-[80px]">
                      <span className="text-2xl font-black tracking-tight text-slate-900">{formatCLP(bestPrice)}</span>
                      <span className="text-[9px] font-bold mt-1 uppercase text-slate-400">
                        {fuelType === "diesel" ? "Diesel" : fuelType === "parafina" ? "Parafina" : `${fuelType} Octanos`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )
  );

  const ViajeMainContent = (
    originCity && destCity && (
      <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden lg:space-y-4">
        
        {/* MOBILE MAPA FULL WIDHT */}
        <div className="lg:hidden w-full h-[45vh] min-h-[300px] shrink-0 relative bg-slate-200 z-0">
          {isCalculatingRoute ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
              <MapIcon className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-semibold">Trazando ruta...</span>
            </div>
          ) : (
            <>
              <iframe key={`viaje-map-${mapUrl}-${mobileStep}`} src={mapUrl} title="Mapa de la ruta" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg flex items-center gap-3 z-20 cursor-pointer" onClick={() => setIsRoundTrip(!isRoundTrip)}>
                 <span className="text-[13px] font-bold text-slate-800 whitespace-nowrap select-none">Ida y vuelta</span>
                 <button className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${isRoundTrip ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isRoundTrip ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>
            </>
          )}
        </div>

        {/* DESKTOP HEADER & MAP */}
        <div className="hidden lg:flex items-center justify-between shrink-0 pt-2">
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

        <div className="hidden lg:block flex-1 w-full rounded-[2rem] overflow-hidden shadow-sm border-[6px] border-white bg-slate-200 relative z-0">
          {isCalculatingRoute ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
              <MapIcon className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-semibold">Trazando ruta...</span>
            </div>
          ) : (
            <>
              <iframe key={`viaje-map-${mapUrl}-${mobileStep}`} src={mapUrl} title="Mapa de la ruta" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg flex items-center gap-3 z-20 cursor-pointer" onClick={() => setIsRoundTrip(!isRoundTrip)}>
                 <span className="text-[13px] font-bold text-slate-800 whitespace-nowrap select-none">Ida y vuelta</span>
                 <button className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${isRoundTrip ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isRoundTrip ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>
            </>
          )}
        </div>
        
        {/* INFO MOBILE */}
        <div className="lg:hidden px-5 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Resumen del Viaje</span>
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
              <div className="mt-3 flex items-center text-[10px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 shrink-0">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                Servidores GPS públicos saturados. Mostrando estimación de ruta en línea recta.
              </div>
            )}
        </div>
      </div>
    )
  );

  const FooterContentViaje = (
    <>
      <div className="flex justify-between items-end mb-5">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Costo Total Viaje
          </span>
          <span className="text-[2.5rem] font-black text-slate-900 tracking-tight leading-none">
            {formatCLP(resultValue)}
          </span>
        </div>
        
        {resultValue > 0 && (
          <div className="flex flex-col items-end gap-1.5 pb-1">
            <span className="text-[11px] font-bold text-slate-400 flex items-center bg-slate-50 px-2 py-0.5 rounded-md"><DollarSign className="w-3 h-3 mr-0.5 text-slate-400" /> Ref: {formatCLP(pricePerLiter)}/L</span>
            <span className="text-[11px] font-bold text-slate-400 flex items-center bg-slate-50 px-2 py-0.5 rounded-md"><Droplets className="w-3 h-3 mr-1 text-slate-400" /> {formatCLP(bencinaTotal)}</span>
            <span className="text-[11px] font-bold text-slate-400 flex items-center bg-slate-50 px-2 py-0.5 rounded-md"><Ticket className="w-3 h-3 mr-1 text-slate-400" /> {includeTolls ? formatCLP(peajeTotal) : 'Omitidos'}</span>
          </div>
        )}
      </div>

      <button 
        onClick={() => { if(detectedTolls.list.length > 0 && includeTolls) setShowTollsModal(true) }} 
        disabled={detectedTolls.list.length === 0 || !includeTolls}
        className="w-full bg-slate-900 text-white rounded-[1.25rem] py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        <Ticket className="w-5 h-5" />
        {detectedTolls.list.length > 0 ? (includeTolls ? 'Ver desglose de peajes' : 'Peajes omitidos') : 'Sin peajes en la ruta'}
      </button>
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
    <div className="bg-slate-100 sm:flex items-center justify-center font-sans text-slate-800 min-h-screen sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto lg:max-w-5xl bg-[#f8fafc] sm:rounded-[3rem] lg:rounded-[2rem] sm:shadow-2xl flex flex-col lg:flex-row h-[100dvh] sm:h-[850px] lg:h-[80vh] lg:min-h-[700px] overflow-hidden fixed inset-0 sm:relative z-50">
        
        {/* ================= PANEL IZQUIERDO (CONTROLES) ================= */}
        <div className={`flex flex-col w-full lg:w-[420px] h-full relative z-20 bg-[#f8fafc] lg:border-r border-slate-200 shrink-0 ${mobileStep === 2 ? 'hidden lg:flex' : 'flex'}`}>
           
          {/* HEADER LIMPIO TIPO APP */}
          <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0 bg-[#f8fafc]">
            <h1 className="text-[22px] font-black tracking-tight text-slate-900">
              {calcMode === 'viaje' ? 'Calculadora de viaje' : 'Buscar Combustible'}
            </h1>
            <div className="flex items-center gap-3">
               {authStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" title="Error en API" />}
               {authStatus === 'demo' && <Info className="w-5 h-5 text-amber-500" title="Modo Demo" />}
               <button onClick={() => setShowSettingsModal(true)} className="p-2.5 bg-white rounded-full shadow-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                  <Settings className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* SWITCHER DE MODOS */}
          <div className="mx-6 p-1.5 bg-slate-200/60 rounded-[1.25rem] flex shrink-0 mb-2">
            <button
              onClick={() => { setCalcMode("carga"); setMobileStep(1); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ${calcMode === "carga" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Fuel className="w-4 h-4" /> Carga
            </button>
            <button
              onClick={() => { setCalcMode("viaje"); setMobileStep(1); if (fuelType === "parafina") setFuelType("93"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ${calcMode === "viaje" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Route className="w-4 h-4" /> Viaje
            </button>
          </div>

          {/* CONTROLES SCROLLABLES */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-6 lg:pb-0">
            {calcMode === "viaje" ? (
              <div className="space-y-6 pb-6 lg:pb-6">
                
                {/* TARJETA ORIGEN/DESTINO/PARADAS */}
                <div className="mx-6 mt-4 bg-white rounded-[2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10">
                    <button onClick={handleSwapCities} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors active:scale-95 cursor-pointer">
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex relative pr-12">
                     <div className="absolute top-5 bottom-5 left-5 w-[2px] border-l-2 border-dashed border-slate-200 z-0 -translate-x-1/2"></div>
                     <div className="flex-1 flex flex-col w-full z-10">
                        {/* ORIGEN */}
                        <div className="flex items-center w-full">
                           <div className="w-10 flex justify-center shrink-0">
                              <div className="w-[14px] h-[14px] rounded-full border-[3px] border-blue-500 bg-white"></div>
                           </div>
                           <div className="flex-1 border-b border-slate-100 pb-2">
                              <RouteCityAutocomplete placeholder="¿Desde dónde viajas?" value={originCity} onSelect={setOriginCity} comunasData={comunasDataForRouting} />
                           </div>
                        </div>

                        {/* PARADAS (WAYPOINTS) */}
                        {waypoints.map((wp, index) => (
                           <div key={index} className="flex items-center w-full py-2">
                              <div className="w-10 flex justify-center shrink-0">
                                 <div className="w-[12px] h-[12px] rounded-full border-[3px] border-amber-500 bg-white"></div>
                              </div>
                              <div className="flex-1 border-b border-slate-100 flex items-center pr-2">
                                 <div className="flex-1">
                                    <RouteCityAutocomplete hideClear placeholder={`Parada ${index + 1}...`} value={wp} onSelect={(val) => updateWaypoint(index, val)} comunasData={comunasDataForRouting} />
                                 </div>
                                 <div className="flex items-center ml-1">
                                    {waypoints.length > 1 && (
                                      <div className="flex flex-col mx-1">
                                        <button onClick={() => moveWaypoint(index, -1)} disabled={index === 0} className="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-0.5 transition-colors cursor-pointer">
                                           <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => moveWaypoint(index, 1)} disabled={index === waypoints.length - 1} className="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-0.5 transition-colors cursor-pointer">
                                           <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                    <button onClick={() => removeWaypoint(index)} className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer shrink-0 ml-1">
                                       <X className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}

                        {/* DESTINO */}
                        <div className="flex items-center w-full pt-2">
                           <div className="w-10 flex justify-center shrink-0">
                              <MapPin className="w-[18px] h-[18px] text-red-500 fill-red-100" />
                           </div>
                           <div className="flex-1">
                              <RouteCityAutocomplete placeholder="¿Hacia dónde vas?" value={destCity} onSelect={setDestCity} comunasData={comunasDataForRouting} />
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {waypoints.length < 3 && (
                    <button onClick={addWaypoint} className="mt-4 mb-1 text-xs font-bold text-blue-600 bg-blue-50 py-2.5 px-3 rounded-xl w-full flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100/50">
                       <Plus className="w-4 h-4" /> Añadir parada
                    </button>
                  )}
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
                            <input type="number" step="0.1" min="1" className="w-10 bg-transparent outline-none font-black text-right text-slate-900" value={efficiencyKml} onChange={(e) => { setEfficiencyKml(e.target.value); localStorage.setItem('bencinaapp_eff', e.target.value); }} />
                            <span className="text-sm font-semibold text-slate-500">Km/L</span>
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border-b border-slate-50">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500"><Fuel className="w-5 h-5"/></div>
                            <span className="font-bold text-slate-700">Combustible</span>
                         </div>
                         <div className="relative">
                           <select className="bg-slate-50 pl-3 pr-8 py-2 rounded-xl border border-slate-200 font-black text-slate-900 outline-none cursor-pointer appearance-none" value={fuelType} onChange={(e) => { setFuelType(e.target.value); localStorage.setItem('bencinaapp_fuel', e.target.value); }}>
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
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${includeTolls ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><Ticket className="w-5 h-5"/></div>
                            <span className={`font-bold transition-colors ${includeTolls ? 'text-slate-700' : 'text-slate-400'}`}>Peajes y TAG</span>
                         </div>
                         <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => { const newVal = !includeTolls; setIncludeTolls(newVal); localStorage.setItem('bencinaapp_tolls', newVal); }}
                         >
                           <span className={`text-xs font-bold transition-colors ${includeTolls ? 'text-emerald-600' : 'text-slate-400'}`}>
                             {includeTolls ? 'Automático' : 'Omitir'}
                           </span>
                           <div className={`w-10 h-6 rounded-full relative flex items-center px-1 transition-colors duration-300 ${includeTolls ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                             <div className={`w-4 h-4 bg-white rounded-full absolute transition-all duration-300 ${includeTolls ? 'translate-x-4' : 'translate-x-0'}`}></div>
                           </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-6 lg:pb-6">
                {/* SECCIÓN CARGA TIPO DE COMBUSTIBLE */}
                <div className="mx-6 mt-4 space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-800 ml-2 uppercase tracking-wide">Tipo de combustible</h3>
                  <div className="flex flex-wrap gap-2 pb-2">
                    {fuelOptionsCarga.map((type) => {
                      const isSelected = fuelType === type;
                      return (
                        <button key={type} onClick={() => { setFuelType(type); localStorage.setItem('bencinaapp_fuel', type); }} className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex-grow sm:flex-grow-0 text-center cursor-pointer ${isSelected ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-600 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:bg-slate-50"}`}>
                          {type === "diesel" ? "Diesel" : type === "parafina" ? "Parafina" : type + " Oct"}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* SECCIÓN CARGA UBICACIÓN */}
                <div className="mx-6 space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-800 ml-2 uppercase tracking-wide">Ubicación</h3>
                  <div className="bg-white rounded-[2rem] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <ComunaAutocomplete placeholder="¿En qué comuna buscas?" value={cargaComuna} onSelect={handleSelectComuna} comunas={availableComunas} />
                  </div>
                  
                  {/* Búsquedas recientes & GPS */}
                  <div className="flex flex-wrap items-center gap-2 pl-2 pt-1">
                     <button onClick={handleGetLocation} className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full flex items-center transition-colors cursor-pointer">
                        {isLocating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <MapPin className="w-3 h-3 mr-1" />} 
                        Cerca de mí
                     </button>
                     {recentComunas.map(c => (
                       <button key={c} onClick={() => handleSelectComuna(c)} className="text-[11px] font-bold text-slate-500 bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                         {c}
                       </button>
                     ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER PANEL IZQUIERDO (BOTON MOBILE O FOOTER DESKTOP) */}
          <div className="mt-auto shrink-0 w-full bg-white rounded-t-[2.5rem] lg:rounded-none p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.06)] lg:shadow-none lg:border-t lg:border-slate-200 z-30 pb-8 sm:pb-6 lg:p-6">
             <div className="lg:hidden">
                {calcMode === 'viaje' ? (
                   <button 
                     onClick={() => setMobileStep(2)} 
                     disabled={!originCity || !destCity}
                     className="w-full bg-slate-900 text-white rounded-[1.25rem] py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                   >
                     Ver Ruta y Resultados <ArrowRight className="w-5 h-5" />
                   </button>
                ) : (
                   <button 
                     onClick={() => setMobileStep(2)} 
                     disabled={!cargaComuna || filteredStationsCarga.length === 0}
                     className="w-full bg-slate-900 text-white rounded-[1.25rem] py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                   >
                     Ver Estaciones y Mapa <ArrowRight className="w-5 h-5" />
                   </button>
                )}
             </div>
             <div className="hidden lg:block">
                {calcMode === 'viaje' ? FooterContentViaje : (
                   <div className="w-full bg-slate-100 text-slate-400 rounded-[1.25rem] py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 text-center">
                      Selecciona una estación en la lista
                   </div>
                )}
             </div>
          </div>
        </div>
        
        {/* ================= PANEL DERECHO (MAPA Y RESULTADOS) ================= */}
        <div className={`flex-1 bg-slate-50/50 p-0 lg:p-8 overflow-hidden relative flex-col ${mobileStep === 1 ? 'hidden lg:flex' : 'flex'}`}>
           
           {/* HEADER MOBILE PASO 2 */}
           <div className="lg:hidden flex items-center px-4 pt-12 pb-4 bg-white shadow-sm shrink-0 z-20 relative">
              <button onClick={() => setMobileStep(1)} className="p-2 bg-slate-100 rounded-full mr-3 cursor-pointer">
                 <ChevronLeft className="w-5 h-5 text-slate-700"/>
              </button>
              <h2 className="font-black text-[18px] text-slate-800 truncate">
                 {calcMode === 'viaje' ? 'Ruta y Resultados' : `Estaciones en ${cargaComuna || '...'}`}
              </h2>
           </div>

           {/* CONTENEDOR RESTRINGIDO (ESTRUCTURA PRINCIPAL DESKTOP/MOBILE) */}
           <div className={`flex-1 flex flex-col w-full h-full overflow-hidden relative lg:p-0 ${calcMode === 'viaje' ? 'pb-[220px] lg:pb-0' : 'pb-0'}`}>
              {calcMode === 'carga' ? (
                  (cargaComuna && filteredStationsCarga.length > 0) ? (
                      CargaMainContent
                  ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                         <MapPin className="w-16 h-16 mb-4" />
                         <p className="text-lg font-bold text-center max-w-xs">Selecciona una comuna para ver las estaciones cercanas</p>
                      </div>
                  )
              ) : (
                  (originCity && destCity) ? (
                      ViajeMainContent
                  ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                         <Route className="w-16 h-16 mb-4" />
                         <p className="text-lg font-bold text-center max-w-xs">Ingresa tu punto de origen y destino para trazar la ruta</p>
                      </div>
                  )
              )}
           </div>

           {/* FOOTER MOBILE PASO 2 (Solo para Viaje) */}
           {calcMode === 'viaje' && (
             <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.06)] z-30 pb-8 sm:pb-6">
                {FooterContentViaje}
             </div>
           )}
        </div>

        {/* ================= MODAL DETALLE DE ESTACIÓN ================= */}
        {showStationModal && currentStation && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
             <div className="bg-white w-full max-w-sm sm:max-w-lg rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 mb-4 sm:mb-0 max-h-[85vh] flex flex-col">
                
                {/* Header Estación */}
                <div className="flex justify-between items-start mb-4 shrink-0">
                  <div className="flex items-center gap-3 pr-4">
                    {currentStation.logo ? (<img src={currentStation.logo} alt={currentStation.distribuidor} className="h-10 w-10 object-contain rounded-full bg-white border border-slate-100 p-1 shrink-0" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />) : null}
                    <Fuel className="w-8 h-8 text-slate-400 shrink-0" style={{ display: currentStation.logo ? "none" : "block" }} />
                    <div className="flex flex-col">
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{currentStation.distribuidor}</h3>
                      <p className="text-xs font-bold text-slate-500 leading-snug mt-0.5">{currentStation.direccion}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowStationModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer shrink-0">
                     <X className="w-5 h-5 text-slate-600"/>
                  </button>
               </div>

               <div className="overflow-y-auto no-scrollbar flex-1 pb-2">
                 
                 {/* Auto/Asis Toggle si ambos existen */}
                 {(() => {
                    const pBase = currentStation.precios[fuelType];
                    const hasAuto = ["93", "95", "97", "diesel", "parafina"].some(t => currentStation.precios[t]?.autoservicio > 0);
                    const hasAsis = ["93", "95", "97", "diesel", "parafina"].some(t => currentStation.precios[t]?.asistido > 0);
                    
                    if (hasAuto && hasAsis) {
                      const diffBase = (pBase?.autoservicio > 0 && pBase?.asistido > 0 && pBase.autoservicio < pBase.asistido) ? (pBase.asistido - pBase.autoservicio) : 0;
                      return (
                        <div className="mb-4">
                          <div className="flex bg-slate-200/60 p-1.5 rounded-xl">
                            <button onClick={()=>setServiceMode("asistido")} className={`flex-1 text-[13px] font-bold py-2.5 rounded-lg transition-all cursor-pointer ${serviceMode === 'asistido' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>👨‍🔧 Asistido</button>
                            <button onClick={()=>setServiceMode("autoservicio")} className={`flex-1 text-[13px] font-bold py-2.5 rounded-lg transition-all cursor-pointer flex justify-center items-center ${serviceMode === 'autoservicio' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                              ⛽ Auto {diffBase > 0 ? <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md ml-1 text-[10px]">-$ {diffBase}</span> : ''}
                            </button>
                          </div>
                          <div className="mt-2 text-[10px] text-slate-500 flex items-start gap-1 leading-tight px-1">
                              <Info className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                              <span><b>Autoservicio:</b> Tú cargas el combustible (más barato). <b>Asistido:</b> Un atendedor realiza la carga.</span>
                          </div>
                        </div>
                      )
                    }
                    return null;
                 })()}

                 {/* Grilla de Precios puros */}
                 <div className="mb-6">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Todos los precios ({serviceMode})</h4>
                   <div className="grid grid-cols-2 gap-2">
                      {["93", "95", "97", "diesel", "parafina"].map((t) => {
                        const p = currentStation.precios[t];
                        const priceToShow = p?.[serviceMode];
                        if (!priceToShow || priceToShow === 0) return null;
                        const isThisFuelSelected = t === fuelType;
                        
                        return (
                          <div key={t} className={`rounded-xl p-3 flex justify-between items-center border ${isThisFuelSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                            <span className={`text-[11px] font-bold uppercase ${isThisFuelSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                              {t === "diesel" ? "Diesel" : t === "parafina" ? "Paraf" : `${t} Oct`}
                            </span>
                            <span className={`text-[15px] font-black ${isThisFuelSelected ? 'text-blue-700' : 'text-slate-900'}`}>{formatCLP(priceToShow)}</span>
                          </div>
                        );
                      })}
                   </div>
                 </div>

                 {/* Descuentos (Acordeón inteligente) */}
                 {(() => {
                    const brandNormalized = normalizeString(currentStation.distribuidor);
                    let stationDiscounts = null;
                    if (brandNormalized.includes("copec")) stationDiscounts = DESCUENTOS_POR_MARCA["copec"];
                    else if (brandNormalized.includes("shell")) stationDiscounts = DESCUENTOS_POR_MARCA["shell"];
                    else if (brandNormalized.includes("aramco") || brandNormalized.includes("petrobras")) stationDiscounts = DESCUENTOS_POR_MARCA["aramco"];

                    if (!stationDiscounts) return null;

                    const dayIndex = new Date().getDay();
                    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                    const todayStr = days[dayIndex];

                    const isDiscountToday = (diaStr) => {
                       if (diaStr === "Todos los días") return true;
                       if (diaStr === todayStr) return true;
                       if (diaStr === "Lun-Vie" && dayIndex >= 1 && dayIndex <= 5) return true;
                       if (diaStr === "Lun y Mar" && (dayIndex === 1 || dayIndex === 2)) return true;
                       return false;
                    };

                    const todayDiscounts = stationDiscounts.filter(d => isDiscountToday(d.dia));
                    const otherDiscounts = stationDiscounts.filter(d => !isDiscountToday(d.dia));

                    return (
                      <div className="mb-2">
                        <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1 mb-3">
                          <Tag className="w-3.5 h-3.5" /> Promociones vigentes
                        </h4>

                        {todayDiscounts.length > 0 ? (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                             {todayDiscounts.map((d, i) => (
                               <div key={`today-${i}`} className="rounded-[1rem] p-3 flex items-start gap-2.5 shadow-sm border bg-rose-500 border-rose-600">
                                  <div className="p-2 rounded-lg shrink-0 mt-0.5 bg-white/20 text-white">
                                     <Tag className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col w-full">
                                     <div className="flex justify-between items-center mb-0.5 gap-2">
                                         <span className="text-[11px] font-black leading-none text-rose-50">{d.dia}</span>
                                         <span className="text-[9px] font-black bg-white text-rose-600 px-1.5 py-0.5 rounded-full shadow-sm animate-pulse leading-none shrink-0">¡HOY!</span>
                                     </div>
                                     <span className="text-[11px] font-medium leading-snug text-white">{d.desc}</span>
                                  </div>
                               </div>
                             ))}
                           </div>
                        ) : (
                           <p className="text-xs font-medium text-slate-500 mb-4 px-1">No hay promociones aplicables para el día de hoy en esta estación.</p>
                        )}

                        {otherDiscounts.length > 0 && (
                           <div className="flex flex-col gap-2">
                             <button 
                               onClick={() => setShowAllDiscounts(!showAllDiscounts)}
                               className="text-[11px] font-extrabold text-rose-700 hover:text-rose-800 flex items-center justify-center w-full py-2.5 bg-rose-50 rounded-xl transition-colors cursor-pointer"
                             >
                               {showAllDiscounts ? 'Ocultar otros descuentos' : `Ver ${otherDiscounts.length} descuentos de otros días`}
                               <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showAllDiscounts ? 'rotate-180' : ''}`} />
                             </button>

                             {showAllDiscounts && (
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1 animate-in fade-in slide-in-from-top-2">
                                 {otherDiscounts.map((d, i) => (
                                   <div key={`other-${i}`} className="rounded-[1rem] p-3 flex items-start gap-2.5 border bg-rose-50/50 border-rose-100">
                                      <div className="p-2 rounded-lg shrink-0 mt-0.5 bg-rose-100 text-rose-600">
                                         <Tag className="w-4 h-4" />
                                      </div>
                                      <div className="flex flex-col w-full">
                                         <span className="text-[11px] font-black leading-none text-rose-900 mb-1">{d.dia}</span>
                                         <span className="text-[11px] font-medium leading-snug text-slate-600">{d.desc}</span>
                                      </div>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                        )}
                      </div>
                    );
                 })()}
               </div>

               {/* Botones de acción */}
               <div className="flex gap-2 mt-2 shrink-0 border-t border-slate-100 pt-4">
                  <button 
                    onClick={() => { setShowStationModal(false); setCalcFuelType(fuelType); setShowCalcModal(true); }} 
                    className="flex-1 bg-slate-900 text-white rounded-xl py-3.5 text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Calculator className="w-4 h-4" /> Calcular Carga
                  </button>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${currentStation.lat},${currentStation.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white rounded-xl py-3.5 text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" /> Cómo llegar
                  </a>
               </div>

             </div>
          </div>
        )}
        
        {/* ================= MODAL CALCULADORA CARGA ================= */}
        {showCalcModal && currentStation && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
             <div className="bg-white w-full max-w-sm sm:max-w-lg rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 mb-4 sm:mb-0">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-slate-900 flex items-center text-xl">
                     <Calculator className="w-6 h-6 mr-2 text-slate-900"/> Calculadora
                  </h3>
                  <button onClick={() => {setShowCalcModal(false); setCurrentStation(null); setCalcVal("");}} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                     <X className="w-5 h-5 text-slate-600"/>
                  </button>
               </div>
               
               <div className="mb-4">
                 <div className="flex items-center gap-2 mb-0.5">
                   <p className="text-sm font-bold text-slate-700">{currentStation.distribuidor}</p>
                   <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase border border-slate-200">{serviceMode}</span>
                 </div>
                 <p className="text-xs text-slate-500">{currentStation.direccion}</p>
               </div>

               {/* Selector de combustible Aislado (Solo para la calculadora) */}
               <div className="flex flex-wrap gap-1.5 mb-4">
                 {["93", "95", "97", "diesel", "parafina"].map(t => {
                    const priceForT = currentStation.precios[t]?.[serviceMode];
                    if(!priceForT || priceForT === 0) return null;
                    const isSel = t === calcFuelType;
                    return (
                      <button key={t} onClick={() => setCalcFuelType(t)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex-grow text-center cursor-pointer ${isSel ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {t === "diesel" ? "Diesel" : t === "parafina" ? "Parafina" : `${t} Oct`}
                      </button>
                    )
                 })}
               </div>

               {/* Toggle Segmentado Elegante de Pesos vs Litros */}
               <div className="flex flex-col gap-3 mb-4">
                  <div className="flex bg-slate-200/60 p-1.5 rounded-[1rem]">
                     <button onClick={() => { setCalcUnit("money"); setCalcVal(""); }} className={`flex-1 text-[13px] font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer ${calcUnit === 'money' ? 'bg-white text-slate-800 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}>💵 Pesos ($)</button>
                     <button onClick={() => { setCalcUnit("liters"); setCalcVal(""); }} className={`flex-1 text-[13px] font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer ${calcUnit === 'liters' ? 'bg-white text-slate-800 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}>⛽ Litros (L)</button>
                  </div>
                  <div className="relative">
                    <input type="number" min="0" step={calcUnit === "liters" ? "0.1" : "1000"} value={calcVal} onChange={(e) => setCalcVal(e.target.value)} className="w-full p-4 text-center text-xl border border-slate-200 rounded-[1.25rem] focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-900 bg-white shadow-sm" placeholder={calcUnit === "money" ? "Monto en $" : "Cantidad en Lts"} />
                  </div>
               </div>

               <div className="bg-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {calcUnit === "money" ? "Recibirás aprox." : "Costo estimado"}
                  </span>
                  <span className="text-3xl font-black text-slate-900">
                    {(() => {
                       const p = currentStation.precios[calcFuelType]?.[serviceMode];
                       const v = parseFloat(calcVal) || 0;
                       if (!p || p === 0) return "---";
                       if (calcUnit === "money") {
                          return `${(v / p).toFixed(1)} Lts`;
                       } else {
                          return formatCLP(v * p);
                       }
                    })()}
                  </span>
               </div>
               
               <div className="flex gap-2 mt-4">
                  <button onClick={() => {setShowCalcModal(false); setShowStationModal(true); setCalcVal("");}} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-[1.25rem] font-bold text-[14px] active:scale-95 transition-colors cursor-pointer flex items-center justify-center gap-2">
                     <ChevronLeft className="w-4 h-4" /> Volver
                  </button>
                  <button onClick={() => {setShowCalcModal(false); setCurrentStation(null); setCalcVal("");}} className="flex-1 bg-slate-900 text-white py-4 rounded-[1.25rem] font-bold text-[14px] active:scale-95 transition-transform shadow-xl shadow-slate-900/20 cursor-pointer">
                     Cerrar
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* ================= MODAL DE PEAJES ================= */}
        {showTollsModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 mb-4 sm:mb-0">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-slate-900 flex items-center text-xl">
                     <Ticket className="w-6 h-6 mr-2 text-slate-900"/> Peajes en ruta
                  </h3>
                  <button onClick={() => setShowTollsModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                     <X className="w-5 h-5 text-slate-600"/>
                  </button>
               </div>
               
               <div className="flex items-start gap-2.5 bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4">
                 <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                 <p className="text-xs text-amber-800 font-medium leading-relaxed">
                   <strong>Fase Beta:</strong> El cálculo de peajes es una estimación referencial para automóviles. Puede variar por horarios, fines de semana o pórticos no mapeados.
                 </p>
               </div>
               
               <div className="max-h-56 overflow-y-auto space-y-2 pr-2 no-scrollbar">
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
                       {isRoundTrip && <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md mt-1.5 w-fit">IDA Y VUELTA (Ruta Directa)</span>}
                     </div>
                     <span className="text-3xl font-black text-slate-900 leading-none">{formatCLP(peajeTotal)}</span>
                  </div>
                  <button onClick={() => setShowTollsModal(false)} className="w-full bg-slate-900 text-white py-4 rounded-[1.25rem] font-bold text-[15px] active:scale-95 transition-transform shadow-xl shadow-slate-900/20 cursor-pointer">
                     Cerrar
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* ================= MODAL DE CONFIGURACIÓN ================= */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 mb-4 sm:mb-0">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-900 flex items-center text-xl">
                     <Settings className="w-6 h-6 mr-2 text-slate-900"/> Configuración
                  </h3>
                  <button onClick={() => setShowSettingsModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                     <X className="w-5 h-5 text-slate-600"/>
                  </button>
               </div>
               
               <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-2">
                  
                  {/* VEHÍCULO */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center"><Car className="w-3.5 h-3.5 mr-1.5"/> Mi Vehículo (Predeterminado)</h4>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-bold text-slate-700">Rendimiento (Km/L)</span>
                           <input type="number" step="0.1" min="1" className="w-20 p-2 bg-white border border-slate-200 rounded-xl outline-none font-black text-center text-slate-900 shadow-sm" value={tempEff} onChange={(e) => setTempEff(e.target.value)} />
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-bold text-slate-700">Combustible</span>
                           <select className="bg-white px-3 py-2 rounded-xl border border-slate-200 font-black text-slate-900 outline-none cursor-pointer shadow-sm" value={tempFuel} onChange={(e) => setTempFuel(e.target.value)}>
                              <option value="93">93 oct</option>
                              <option value="95">95 oct</option>
                              <option value="97">97 oct</option>
                              <option value="diesel">Diesel</option>
                              <option value="parafina">Parafina</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* PREFERENCIAS */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center"><Ticket className="w-3.5 h-3.5 mr-1.5"/> Preferencias</h4>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-700">Incluir Peajes y TAG</span>
                         <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTempTolls(!tempTolls)}>
                           <div className={`w-12 h-7 rounded-full relative flex items-center px-1 transition-colors duration-300 ${tempTolls ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                             <div className={`w-5 h-5 bg-white rounded-full absolute transition-all duration-300 ${tempTolls ? 'translate-x-5' : 'translate-x-0'}`}></div>
                           </div>
                         </div>
                      </div>
                  </div>

                  {/* INFO */}
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                     <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600 shrink-0"><Info className="w-4 h-4"/></div>
                        <div>
                           <h4 className="text-xs font-black text-blue-900 mb-1">BencinaApp v1.1.0</h4>
                           <p className="text-[10px] font-medium text-blue-700 leading-tight">Precios obtenidos en tiempo real desde la CNE. Base de datos de tarifas de peajes actualizada al año 2026.</p>
                        </div>
                     </div>
                  </div>

               </div>
               
               <div className="mt-4 pt-4 border-t border-slate-100">
                  <button onClick={handleSaveSettings} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-[1.25rem] font-bold text-[15px] active:scale-95 transition-all shadow-xl shadow-slate-900/20 cursor-pointer">
                     Guardar Preferencias
                  </button>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}